"use client";

import { useState, useEffect } from "react";
import { 
  Clock, 
  MapPin, 
  Calendar, 
  ChevronDown, 
  RefreshCw,
  Info
} from "lucide-react";
import zonesDataRaw from "../data/zones.json";

// Cast JSON data to typed dictionary
const zonesData = zonesDataRaw as Record<string, Record<string, string>>;

interface PrayerTimeRow {
  day: number;
  hijri: string;
  imsak: number;
  fajr: number;
  syuruk: number;
  dhuha: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

interface ApiResponse {
  zone: string;
  year: number;
  month: string;
  month_number: number;
  prayers: PrayerTimeRow[];
}

export default function PrayerTimes() {
  const [mounted, setMounted] = useState(false);
  const [statesList] = useState<string[]>(() => Object.keys(zonesData).sort());
  
  // Selections
  const [selectedState, setSelectedState] = useState("Wilayah Persekutuan");
  const [selectedZone, setSelectedZone] = useState("WLY01");

  // Derive zone label from state and zone selection
  const zoneLabel = zonesData[selectedState]?.[selectedZone] || "";

  // API Data
  const [prayerData, setPrayerData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Time & View
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"today" | "month">("today");

  // Load initial settings from localStorage on mount
  useEffect(() => {
    const handleMount = () => {
      const savedState = localStorage.getItem("solat-state");
      const savedZone = localStorage.getItem("solat-zone");

      if (savedState && zonesData[savedState]) {
        setSelectedState(savedState);
        if (savedZone && zonesData[savedState][savedZone]) {
          setSelectedZone(savedZone);
        } else {
          const defaultZone = Object.keys(zonesData[savedState])[0];
          setSelectedZone(defaultZone);
        }
      }
      setMounted(true);
      setCurrentTime(new Date());
    };

    const timerId = setTimeout(handleMount, 0);
    return () => clearTimeout(timerId);
  }, []);

  // Update clock every second
  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [mounted]);

  // Fetch prayer times whenever selectedZone changes
  useEffect(() => {
    if (!mounted) return;
    
    // Save to localStorage
    localStorage.setItem("solat-state", selectedState);
    localStorage.setItem("solat-zone", selectedZone);

    const currentYear = new Date().getFullYear();
    const currentMonthNum = new Date().getMonth() + 1; // 1-12
    const cacheKey = `solat-times-${selectedZone}-${currentYear}-${currentMonthNum}`;
    
    let isSubscribed = true;

    async function loadData() {
      // Try to load from cache first
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (isSubscribed) {
            setPrayerData(parsed);
            setError(null);
          }
          return;
        } catch {
          // Corrupt cache, clear it
          localStorage.removeItem(cacheKey);
        }
      }

      // Fetch from endpoint
      if (isSubscribed) {
        setLoading(true);
        setError(null);
      }
      try {
        const res = await fetch(`https://api.waktusolat.app/v2/solat/${selectedZone}`);
        if (!res.ok) {
          throw new Error("Gagal mengambil data dari pelayan JAKIM.");
        }
        const data = await res.json();
        
        if (isSubscribed) {
          // Cache response
          localStorage.setItem(cacheKey, JSON.stringify(data));
          setPrayerData(data);
        }
      } catch (err: unknown) {
        if (isSubscribed) {
          const errorMsg = err instanceof Error ? err.message : "Ralat rangkaian berlaku.";
          setError(errorMsg);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    const timerId = setTimeout(loadData, 0);

    return () => {
      isSubscribed = false;
      clearTimeout(timerId);
    };
  }, [selectedZone, selectedState, mounted]);

  // Update selectedZone if selectedState changes
  const handleStateChange = (state: string) => {
    setSelectedState(state);
    const zones = zonesData[state];
    if (zones) {
      const firstZone = Object.keys(zones)[0];
      setSelectedZone(firstZone);
    }
  };

  // Helper to format date
  const formatGregorianDate = (date: Date) => {
    return date.toLocaleDateString("ms-MY", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortTime = (timestampSeconds: number) => {
    const d = new Date(timestampSeconds * 1000);
    return d.toLocaleTimeString("ms-MY", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!mounted || !currentTime) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="mt-4 text-zinc-500 font-medium">Memuatkan aplikasi...</span>
      </div>
    );
  }

  // Get current day's prayer times
  const todayDay = currentTime.getDate();
  const todayPrayers = prayerData?.prayers.find((p) => p.day === todayDay);
  
  // Names mapping
  const prayerNamesMap = {
    imsak: "Imsak",
    fajr: "Subuh",
    syuruk: "Syuruk",
    dhuha: "Dhuha",
    dhuhr: "Zohor",
    asr: "Asar",
    maghrib: "Maghrib",
    isha: "Isyak",
  };

  type PrayerKey = keyof typeof prayerNamesMap;
  const orderedPrayerKeys: PrayerKey[] = ["imsak", "fajr", "syuruk", "dhuha", "dhuhr", "asr", "maghrib", "isha"];

  // Helper to get active and next prayer
  const getPrayerStatus = () => {
    if (!todayPrayers || !prayerData) return null;

    const t = Math.floor(currentTime.getTime() / 1000);
    
    // Find where the current time fits
    // Subuh (fajr) is obligatory, imsak is pre-subuh. Let's trace it carefully.
    let current: PrayerKey = "isha";
    let next: PrayerKey = "imsak";
    let nextTime = 0;
    let isNextDay = false;

    // Check loops
    for (let i = 0; i < orderedPrayerKeys.length; i++) {
      const key = orderedPrayerKeys[i];
      const nextKey = orderedPrayerKeys[(i + 1) % orderedPrayerKeys.length];
      const currentVal = todayPrayers[key];
      const nextVal = todayPrayers[nextKey];

      if (i < orderedPrayerKeys.length - 1) {
        if (t >= currentVal && t < nextVal) {
          current = key;
          next = nextKey;
          nextTime = nextVal;
          break;
        }
      } else {
        // It's after Isha
        if (t >= currentVal) {
          current = "isha";
          next = "imsak";
          isNextDay = true;
          break;
        }
      }
    }

    // Special case: before today's Imsak (very early morning)
    if (t < todayPrayers.imsak) {
      current = "isha"; // still technically in isha/qiyam period from night
      next = "imsak";
      nextTime = todayPrayers.imsak;
      isNextDay = false;
    }

    // If next prayer is tomorrow
    if (isNextDay || nextTime === 0) {
      // Find tomorrow's prayers
      const tomorrowDay = todayDay + 1;
      const tomorrowPrayers = prayerData.prayers.find((p) => p.day === tomorrowDay);
      if (tomorrowPrayers) {
        nextTime = tomorrowPrayers.imsak;
      } else {
        // End of month, find next month's 1st day (approximate with 24 hours add)
        nextTime = todayPrayers.isha + 24 * 3600; // rough fallback
      }
    }

    const diffSeconds = nextTime - t;
    const diffHours = Math.floor(diffSeconds / 3600);
    const diffMins = Math.floor((diffSeconds % 3600) / 60);
    const diffSecs = diffSeconds % 60;

    return {
      currentPrayer: current,
      nextPrayer: next,
      timeRemaining: {
        hours: diffHours,
        minutes: diffMins,
        seconds: diffSecs,
      },
      rawTimeRemaining: diffSeconds
    };
  };

  const status = getPrayerStatus();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Decorative Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 p-6 md:p-8 text-white shadow-2xl mb-8 border border-amber-500/20">
        {/* Subtle Islamic Geometric Art Overlay */}
        <div className="absolute inset-0 opacity-5 mix-blend-overlay bg-repeat bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-200 via-emerald-800 to-emerald-950" 
             style={{ 
               backgroundImage: 'radial-gradient(circle_at_center, rgba(212,175,55,0.25) 2px, transparent 2px)', 
               backgroundSize: '24px 24px' 
             }} 
        />
        
        {/* Top bar with Hijri & Gregorian date */}
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold tracking-wide text-sm md:text-base">
              <Calendar className="w-4 h-4" />
              <span>{todayPrayers ? `Hijri: ${todayPrayers.hijri}` : "Hijriah"}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-serif text-amber-500/10 font-bold mt-1 text-white">
              {formatGregorianDate(currentTime)}
            </h1>
          </div>
          <div className="flex flex-col md:items-end">
            <span className="text-stone-300 text-xs md:text-sm tracking-wider uppercase font-medium">Masa Semasa</span>
            <div className="text-3xl md:text-4xl font-mono font-bold text-amber-400 mt-1 flex items-center gap-2">
              <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
              {currentTime.toLocaleTimeString("ms-MY", { hour12: false })}
            </div>
          </div>
        </div>

        {/* Hero Prayer Countdown Card */}
        <div className="relative flex flex-col md:flex-row justify-between items-stretch gap-6">
          <div className="flex-1 flex flex-col justify-center">
            {status && (
              <>
                <span className="text-stone-300 text-sm font-medium tracking-wide">
                  Seterusnya: <span className="text-amber-400 font-semibold">{prayerNamesMap[status.nextPrayer]}</span>
                </span>
                <div className="text-4xl md:text-5xl font-bold font-serif text-white tracking-tight mt-2 flex items-baseline gap-2">
                  {String(status.timeRemaining.hours).padStart(2, "0")}
                  <span className="text-2xl md:text-3xl font-normal text-stone-400">:</span>
                  {String(status.timeRemaining.minutes).padStart(2, "0")}
                  <span className="text-2xl md:text-3xl font-normal text-stone-400">:</span>
                  {String(status.timeRemaining.seconds).padStart(2, "0")}
                  <span className="text-xs md:text-sm font-normal text-stone-400 ml-2 uppercase font-sans tracking-widest">Tinggal</span>
                </div>
                <p className="text-stone-300 text-xs mt-3 max-w-md">
                  Sedang berada dalam waktu <strong className="text-amber-300 font-semibold">{prayerNamesMap[status.currentPrayer]}</strong>. Pastikan anda bersedia sebelum azan berkumandang.
                </p>
              </>
            )}
          </div>

          {/* Quick Stats or Decoration Card */}
          <div className="flex md:w-80 flex-col justify-between p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-stone-300 text-sm font-medium">Zon Anda</span>
              <MapPin className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-amber-400 font-mono font-bold text-lg">{selectedZone}</div>
              <div className="text-white text-sm font-medium line-clamp-2 mt-1 leading-snug">{zoneLabel}</div>
              <div className="text-stone-400 text-xs mt-2">{selectedState}</div>
            </div>
          </div>
        </div>
      </div>

      {/* State & Zone Selectors */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-lg mb-8 flex flex-col md:flex-row gap-5 items-stretch">
        <div className="flex-1 flex flex-col">
          <label className="text-xs text-stone-500 dark:text-stone-400 font-semibold mb-2 uppercase tracking-wider flex items-center gap-1.5">
            Negeri
          </label>
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-stone-800 dark:text-stone-100 font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none appearance-none cursor-pointer pr-10"
            >
              {statesList.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex-[1.5] flex flex-col">
          <label className="text-xs text-stone-500 dark:text-stone-400 font-semibold mb-2 uppercase tracking-wider flex items-center gap-1.5">
            Zon Waktu Solat
          </label>
          <div className="relative">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-stone-800 dark:text-stone-100 font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none appearance-none cursor-pointer pr-10"
            >
              {Object.entries(zonesData[selectedState] || {}).map(([code, desc]) => (
                <option key={code} value={code}>
                  {code} - {desc}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Action Toggle Views */}
        <div className="flex items-end gap-2 md:w-auto">
          <button
            onClick={() => setViewMode("today")}
            className={`flex-1 md:flex-none px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
              viewMode === "today"
                ? "bg-emerald-900 text-white shadow-md dark:bg-emerald-800"
                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
            }`}
          >
            Harian
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`flex-1 md:flex-none px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
              viewMode === "month"
                ? "bg-emerald-900 text-white shadow-md dark:bg-emerald-800"
                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
            }`}
          >
            Bulanan
          </button>
        </div>
      </div>

      {/* Main View Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8">
          <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="mt-4 text-stone-500 font-medium">Sedang memuat turun jadual waktu solat dari JAKIM...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
          <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-red-900 dark:text-red-200 font-bold text-lg">Gagal Mengambil Data</h3>
            <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
            <button
              onClick={() => {
                // Clear state to trigger effect refresh
                const temp = selectedZone;
                setSelectedZone("");
                setTimeout(() => setSelectedZone(temp), 50);
              }}
              className="mt-3 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Cuba Semula
            </button>
          </div>
        </div>
      ) : viewMode === "today" ? (
        /* Daily View Grid */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {todayPrayers &&
            orderedPrayerKeys.map((key) => {
              const isActive = status?.currentPrayer === key;
              const isFuture = status && orderedPrayerKeys.indexOf(key) > orderedPrayerKeys.indexOf(status.currentPrayer);
              
              return (
                <div
                  key={key}
                  className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between min-h-[140px] hover:shadow-md ${
                    isActive
                      ? "bg-gradient-to-br from-emerald-800/10 via-emerald-800/5 to-transparent border-emerald-500/60 dark:border-emerald-400 shadow-lg dark:bg-emerald-950/20"
                      : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800"
                  }`}
                >
                  {/* Decorative glowing green ring for active prayer */}
                  {isActive && (
                    <div className="absolute top-0 right-0 w-3 h-3 m-4 rounded-full bg-emerald-500 animate-ping" />
                  )}
                  {isActive && (
                    <div className="absolute top-0 right-0 w-3 h-3 m-4 rounded-full bg-emerald-500 border border-white dark:border-stone-900" />
                  )}
                  
                  <div>
                    <span
                      className={`text-xs uppercase font-bold tracking-widest ${
                        isActive
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-stone-400 dark:text-stone-500"
                      }`}
                    >
                      {prayerNamesMap[key]}
                    </span>
                    <div className="text-xl md:text-2xl font-mono font-bold text-stone-800 dark:text-stone-100 mt-2">
                      {formatShortTime(todayPrayers[key])}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive
                          ? "bg-emerald-500/20 text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-300"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
                      }`}
                    >
                      {isActive ? "Sekarang" : isFuture ? "Seterusnya" : "Telah Lepas"}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        /* Monthly View Table */
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold font-serif text-stone-800 dark:text-stone-100">
                Jadual Bulanan
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Bagi bulan {prayerData?.month} {prayerData?.year}
              </p>
            </div>
            <div className="text-xs bg-amber-500/10 text-amber-800 dark:text-amber-400 px-3 py-1.5 rounded-lg border border-amber-500/20 font-medium">
              Zon Waktu: {selectedZone}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 text-stone-500 dark:text-stone-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Hari</th>
                  <th className="py-4 px-4">Hijri</th>
                  <th className="py-4 px-4">Imsak</th>
                  <th className="py-4 px-4 text-emerald-700 dark:text-emerald-400">Subuh</th>
                  <th className="py-4 px-4">Syuruk</th>
                  <th className="py-4 px-4 text-emerald-700 dark:text-emerald-400">Zohor</th>
                  <th className="py-4 px-4 text-emerald-700 dark:text-emerald-400">Asar</th>
                  <th className="py-4 px-4 text-emerald-700 dark:text-emerald-400">Maghrib</th>
                  <th className="py-4 px-4 text-emerald-700 dark:text-emerald-400">Isyak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/50 text-sm font-medium">
                {prayerData?.prayers.map((prayer) => {
                  const isToday = prayer.day === todayDay;
                  return (
                    <tr
                      key={prayer.day}
                      className={`transition-colors hover:bg-stone-50/50 dark:hover:bg-stone-800/40 ${
                        isToday
                          ? "bg-amber-500/5 font-bold border-l-4 border-l-amber-500"
                          : "text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      <td className="py-3.5 px-5 font-mono">
                        {isToday ? (
                          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                            {prayer.day} <span className="text-[10px] font-sans bg-amber-500 text-white dark:text-stone-950 px-1.5 py-0.5 rounded">Kini</span>
                          </span>
                        ) : (
                          prayer.day
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-stone-400 dark:text-stone-500">
                        {prayer.hijri.split("-").slice(1).join("-") /* Show MM-DD */}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-stone-400 dark:text-stone-500">
                        {formatShortTime(prayer.imsak)}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {formatShortTime(prayer.fajr)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-stone-400 dark:text-stone-500">
                        {formatShortTime(prayer.syuruk)}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {formatShortTime(prayer.dhuhr)}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {formatShortTime(prayer.asr)}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {formatShortTime(prayer.maghrib)}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {formatShortTime(prayer.isha)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Decorative Footer info */}
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-400 dark:text-stone-500 border-t border-stone-200 dark:border-stone-800 pt-6">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Waktu solat dikemaskini dari pangkalan data JAKIM.</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Muslim Companion &copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}
