"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Compass, 
  MapPin, 
  RefreshCw, 
  Info,
  Navigation,
  CheckCircle,
  AlertCircle,
  ChevronDown
} from "lucide-react";

// Fallback coordinates for Malaysian states (approximate central coordinates or capitals)
const STATE_COORDINATES: Record<string, { lat: number; lon: number; name: string }> = {
  "Wilayah Persekutuan": { lat: 3.1390, lon: 101.6869, name: "Kuala Lumpur" },
  "Selangor": { lat: 3.0738, lon: 101.5183, name: "Shah Alam" },
  "Johor": { lat: 1.4927, lon: 103.7414, name: "Johor Bahru" },
  "Kedah": { lat: 6.1210, lon: 100.3601, name: "Alor Setar" },
  "Kelantan": { lat: 6.1254, lon: 102.2386, name: "Kota Bharu" },
  "Melaka": { lat: 2.1896, lon: 102.2501, name: "Melaka" },
  "Negeri Sembilan": { lat: 2.7258, lon: 101.9424, name: "Seremban" },
  "Pahang": { lat: 3.8077, lon: 103.3260, name: "Kuantan" },
  "Perlis": { lat: 6.4449, lon: 100.1986, name: "Kangar" },
  "Pulau Pinang": { lat: 5.4141, lon: 100.3288, name: "George Town" },
  "Perak": { lat: 4.5921, lon: 101.0901, name: "Ipoh" },
  "Sabah": { lat: 5.9804, lon: 116.0735, name: "Kota Kinabalu" },
  "Sarawak": { lat: 1.5533, lon: 110.3592, name: "Kuching" },
  "Terengganu": { lat: 5.3302, lon: 103.1408, name: "Kuala Terengganu" }
};

interface LocationState {
  lat: number;
  lon: number;
  source: "Zon Waktu" | "GPS Peranti";
  name: string;
}

export default function KiblatFinder() {
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState<LocationState>({
    lat: 3.1390,
    lon: 101.6869,
    source: "Zon Waktu",
    name: "Kuala Lumpur (Wilayah Persekutuan)"
  });

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsPermissionPromptNeeded, setGpsPermissionPromptNeeded] = useState(false);

  // Compass States
  const [hasCompass, setHasCompass] = useState(false);
  const [deviceHeading, setDeviceHeading] = useState(0); // Heading in degrees clockwise from North
  const [manualRotation, setManualRotation] = useState(0); // Slider fallback for desktop
  const [compassPermissionNeeded, setCompassPermissionNeeded] = useState(false);

  const lastVibratedRef = useRef<number>(0);

  // Kaaba calculation formula constants
  const latKaaba = 21.4225241 * Math.PI / 180;
  const lonKaaba = 39.826206 * Math.PI / 180;

  // Calculate bearing and distance
  const calculateQibla = (latitude: number, longitude: number) => {
    const latUser = latitude * Math.PI / 180;
    const lonUser = longitude * Math.PI / 180;
    const dLon = lonKaaba - lonUser;

    const y = Math.sin(dLon);
    const x = Math.cos(latUser) * Math.tan(latKaaba) - Math.sin(latUser) * Math.cos(dLon);

    const qiblaRad = Math.atan2(y, x);
    const qiblaDeg = (qiblaRad * 180 / Math.PI + 360) % 360;

    // Distance calculation (Haversine formula)
    const R = 6371; // Earth radius in km
    const dLat = latKaaba - latUser;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(latUser) * Math.cos(latKaaba) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return {
      bearing: qiblaDeg,
      distance: distance
    };
  };

  const qiblaResult = calculateQibla(location.lat, location.lon);

  // Compass Heading Logic
  // If compass is active, heading comes from device. Else, manual rotation slider.
  const activeHeading = hasCompass && !compassPermissionNeeded ? deviceHeading : manualRotation;

  // Qibla direction relative to the top of the user's phone / compass:
  // bearing - heading. (If user points phone directly at Qibla, this goes to 0/360)
  const qiblaRelativeAngle = (qiblaResult.bearing - activeHeading + 360) % 360;

  // Aligned check: within 3 degrees of target
  const isAligned = Math.abs(qiblaRelativeAngle) < 3.5 || Math.abs(qiblaRelativeAngle - 360) < 3.5;

  // Trigger haptic vibration on mobile devices when aligned
  useEffect(() => {
    if (isAligned && typeof navigator !== "undefined" && navigator.vibrate) {
      const now = Date.now();
      // Throttle vibration to once every 1.5 seconds to avoid endless buzzing
      if (now - lastVibratedRef.current > 1500) {
        navigator.vibrate(100);
        lastVibratedRef.current = now;
      }
    }
  }, [isAligned]);


  // Initial load
  useEffect(() => {
    const handleMount = () => {
      // Look up previous selected state from localStorage
      const savedState = localStorage.getItem("solat-state");
      if (savedState && STATE_COORDINATES[savedState]) {
        const coords = STATE_COORDINATES[savedState];
        setLocation({
          lat: coords.lat,
          lon: coords.lon,
          source: "Zon Waktu",
          name: `${coords.name} (${savedState})`
        });
      }
      setMounted(true);

      // Check if browser supports device orientation permission (e.g. iOS Safari)
      if (typeof window !== "undefined") {
        if (typeof DeviceOrientationEvent !== "undefined" && 
            typeof (DeviceOrientationEvent as any).requestPermission === "function") {
          setCompassPermissionNeeded(true);
        }
      }
    };

    const timerId = setTimeout(handleMount, 0);
    return () => clearTimeout(timerId);
  }, []);

  // Set up device orientation listeners
  useEffect(() => {
    if (!mounted || compassPermissionNeeded) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading = 0;
      let hasSensor = false;
      
      // iOS check
      if ("webkitCompassHeading" in e) {
        heading = e.webkitCompassHeading as number;
        hasSensor = true;
      } 
      // Android / absolute orientation check
      else if (e.alpha !== null) {
        // e.alpha represents rotation around the z-axis (0-360 deg) counter-clockwise.
        // We convert to clockwise heading from North:
        heading = (360 - e.alpha) % 360;
        hasSensor = true;
      }

      if (hasSensor) {
        setHasCompass(true);
        setDeviceHeading(heading);
      }
    };

    // Use absolute orientation if available for higher accuracy/true North
    const hasAbsolute = "ondeviceorientationabsolute" in window;

    if (hasAbsolute) {
      window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    } else {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }

    return () => {
      if (hasAbsolute) {
        window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
      } else {
        window.removeEventListener("deviceorientation", handleOrientation, true);
      }
    };
  }, [mounted, compassPermissionNeeded]);

  // Auto-detect location on mount if GPS is enabled/not set yet
  useEffect(() => {
    if (!mounted) return;
    const gpsEnabledSetting = localStorage.getItem("solat-gps-enabled");
    if (gpsEnabledSetting === "true") {
      requestGps(true);
    } else if (gpsEnabledSetting === null) {
      setGpsPermissionPromptNeeded(true);
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="mt-4 text-zinc-500 font-medium">Memuatkan Kiblat Finder...</span>
      </div>
    );
  }



  // iOS Compass permission request
  const requestCompassPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      "requestPermission" in DeviceOrientationEvent
    ) {
      try {
        const reqPermission = (DeviceOrientationEvent as unknown as {
          requestPermission: () => Promise<string>;
        }).requestPermission;
        const permission = await reqPermission();
        if (permission === "granted") {
          setCompassPermissionNeeded(false);
          setHasCompass(true);
        } else {
          alert("Kebenaran sensor orientasi diperlukan untuk kompas automatik.");
        }
      } catch (err) {
        console.error("Sensor permission request error:", err);
        alert("Gagal mengakses penderia orientasi peranti.");
      }
    }
  };

  // Get current high accuracy Geolocation
  function requestGps(silent = false) {
    setGpsLoading(true);
    if (!silent) setGpsError(null);

    const isInsecureContext = typeof window !== "undefined" && 
      window.location.protocol === "http:" && 
      window.location.hostname !== "localhost" && 
      window.location.hostname !== "127.0.0.1";

    if (isInsecureContext) {
      if (!silent) {
        setGpsError("Akses GPS memerlukan sambungan selamat (HTTPS) pada peranti mudah alih. Sila tukar ke HTTPS untuk menguji.");
      }
      setGpsLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      if (!silent) setGpsError("Pencari GPS tidak disokong oleh pelayar anda.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          source: "GPS Peranti",
          name: "Lokasi GPS Anda"
        });
        localStorage.setItem("solat-gps-enabled", "true");
        setGpsLoading(false);
      },
      (err) => {
        let msg = "Ralat Geolocation tidak diketahui.";
        if (err.code === 1) {
          msg = "Akses GPS disekat. Sila ke Tetapan > Privasi > Perkhidmatan Lokasi > Tapak Web Safari (Pilih 'Semasa Menggunakan'), atau ketuk 'aA' > Tetapan Tapak Web > Kebenarkan Lokasi.";
          localStorage.setItem("solat-gps-enabled", "false");
        } else if (err.code === 2) {
          msg = "Kedudukan GPS tidak tersedia.";
        } else if (err.code === 3) {
          msg = "Rangkaian tamat masa ketika mencari lokasi.";
        }
        
        if (!silent) {
          setGpsError(msg);
        }
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Handle manual state coordinate selection
  const handleStateChange = (stateName: string) => {
    if (STATE_COORDINATES[stateName]) {
      const coords = STATE_COORDINATES[stateName];
      setLocation({
        lat: coords.lat,
        lon: coords.lon,
        source: "Zon Waktu",
        name: `${coords.name} (${stateName})`
      });
      localStorage.setItem("solat-state", stateName);
      localStorage.setItem("solat-gps-enabled", "false");
    }
  };





  // Compass card styling based on alignment
  const compassBg = isAligned 
    ? "border-amber-400 shadow-amber-500/20 bg-gradient-to-b from-emerald-950/70 to-teal-950/70"
    : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-lg";

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 flex flex-col items-stretch">
      {/* GPS Permission Banner Prompt */}
      {gpsPermissionPromptNeeded && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm shadow-md border-amber-500/20">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-amber-500 shrink-0 animate-bounce" />
            <div>
              <h4 className="text-white text-sm font-semibold">Aktifkan Lokasi Automatik</h4>
              <p className="text-stone-300 text-xs mt-0.5 leading-relaxed">
                Muslim Companion ingin mengesan lokasi anda secara automatik menggunakan GPS untuk kompas kiblat yang tepat.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                setGpsPermissionPromptNeeded(false);
                localStorage.setItem("solat-gps-enabled", "false");
              }}
              className="text-stone-400 hover:text-white text-xs font-bold py-2 px-3 rounded-lg transition-all cursor-pointer"
            >
              Manual
            </button>
            <button
              onClick={() => {
                setGpsPermissionPromptNeeded(false);
                requestGps(false);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold py-2 px-4 rounded-lg transition-all active:scale-[0.97] cursor-pointer"
            >
              Aktifkan GPS
            </button>
          </div>
        </div>
      )}

      {/* Title Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-serif text-stone-850 dark:text-stone-100 font-bold">
          Pencari Arah Kiblat
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-xs md:text-sm mt-2 max-w-md mx-auto leading-relaxed">
          Baringkan telefon secara mendatar dan pusing sehingga penunjuk Kaabah emas berada di garisan atas kompas.
        </p>
      </div>

      {/* Compass Panel */}
      <div className={`rounded-3xl p-6 md:p-8 border flex flex-col items-center justify-center transition-all duration-500 ${compassBg}`}>
        {/* Alignment Alert Banner */}
        <div className="h-10 mb-4 flex items-center justify-center">
          {isAligned ? (
            <span className="inline-flex items-center gap-1.5 bg-amber-400 text-stone-950 font-bold px-4 py-1.5 rounded-full text-xs animate-bounce tracking-wide shadow-md shadow-amber-500/20 uppercase">
              <CheckCircle className="w-4 h-4 fill-stone-950 text-amber-400" />
              Sejajar dengan Kiblat
            </span>
          ) : (
            <span className="text-stone-400 dark:text-stone-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              Pusing untuk Jajarkan
            </span>
          )}
        </div>

        {/* SVG Compass container */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 select-none">
          {/* Compass Permission Overlay for iOS */}
          {compassPermissionNeeded && (
            <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm rounded-full flex flex-col items-center justify-center p-6 text-center z-10 border border-amber-500/30">
              <Compass className="w-8 h-8 text-amber-400 animate-pulse mb-3" />
              <p className="text-[11px] text-white font-medium mb-4 leading-relaxed max-w-[180px]">
                Kompas automatik memerlukan akses penderia gerakan peranti anda.
              </p>
              <button
                onClick={requestCompassPermission}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-2 px-4 rounded-lg text-[10px] uppercase tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Aktifkan Kompas
              </button>
            </div>
          )}

          {/* SVG Compass */}
          <svg 
            viewBox="0 0 200 200" 
            className="w-full h-full transition-transform duration-100 ease-out"
            style={{ transform: `rotate(${-activeHeading}deg)` }}
          >
            {/* Dial Background */}
            <circle cx="100" cy="100" r="92" className="fill-stone-100 dark:fill-stone-950/40 stroke-stone-200 dark:stroke-stone-800" strokeWidth="1.5" />
            
            {/* Golden Outer Highlights for Aligned state */}
            <circle cx="100" cy="100" r="92" className={`fill-none transition-opacity duration-300 ${isAligned ? "stroke-amber-400 opacity-100" : "stroke-transparent opacity-0"}`} strokeWidth="3" />

            {/* Ticks & Degree Markings */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = i * 30;
              const radians = (angle * Math.PI) / 180;
              const x1 = 100 + 82 * Math.sin(radians);
              const y1 = 100 - 82 * Math.cos(radians);
              const x2 = 100 + 90 * Math.sin(radians);
              const y2 = 100 - 90 * Math.cos(radians);
              return (
                <line 
                  key={i} 
                  x1={x1} 
                  y1={y1} 
                  x2={x2} 
                  y2={y2} 
                  className="stroke-stone-400 dark:stroke-stone-600" 
                  strokeWidth={i % 3 === 0 ? "2" : "1"} 
                />
              );
            })}

            {/* Cardinal Text Labels */}
            <text x="100" y="24" textAnchor="middle" className="font-bold text-[14px] fill-red-600 dark:fill-red-500 font-mono">U</text>
            <text x="178" y="105" textAnchor="middle" className="font-bold text-[13px] fill-stone-500 dark:fill-stone-400 font-mono">T</text>
            <text x="100" y="188" textAnchor="middle" className="font-bold text-[13px] fill-stone-500 dark:fill-stone-400 font-mono">S</text>
            <text x="24" y="105" textAnchor="middle" className="font-bold text-[13px] fill-stone-500 dark:fill-stone-400 font-mono">B</text>

            {/* Qibla Destination Needle Indicator */}
            <g transform={`rotate(${qiblaResult.bearing} 100 100)`}>
              <line x1="100" y1="100" x2="100" y2="28" className="stroke-amber-500/50" strokeDasharray="3,3" strokeWidth="1.5" />
              <path d="M 100,16 L 105,28 L 95,28 Z" className="fill-amber-400 stroke-amber-500" strokeWidth="0.5" />

              <g transform="translate(100 42) scale(0.9)">
                <path d="M 0,-6 L 6,-3 L 6,6 L 0,3 Z" fill="#262626" />
                <path d="M 0,-6 L -6,-3 L -6,6 L 0,3 Z" fill="#0f0f0f" />
                <path d="M 0,-6 L 6,-3 L 0,0 L -6,-3 Z" fill="#3a3a3a" />
                <path d="M 0,-3.5 L 6,-0.5 L 6,0.5 L 0,-2.5 Z" fill="#d4af37" />
                <path d="M 0,-3.5 L -6,-0.5 L -6,0.5 L 0,-2.5 Z" fill="#d4af37" />
              </g>
            </g>

            {/* North Pointer Needle */}
            <polygon points="100,100 96,100 100,32" className="fill-red-500 opacity-90" />
            <polygon points="100,100 104,100 100,32" className="fill-red-600 opacity-90" />
            {/* South Needle */}
            <polygon points="100,100 96,100 100,168" className="fill-stone-300 dark:fill-stone-700" />
            <polygon points="100,100 104,100 100,168" className="fill-stone-400 dark:fill-stone-600" />

            {/* Center Pin */}
            <circle cx="100" cy="100" r="5" className="fill-amber-500 stroke-white dark:stroke-stone-900" strokeWidth="1.5" />
          </svg>

          {/* Static Forward Arrow */}
          <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center select-none pointer-events-none">
            <div className="w-3 h-3 border-l-2 border-t-2 border-emerald-500 rotate-45" />
          </div>
        </div>

        {/* Compass Info Footer */}
        <div className="mt-6 text-center">
          <span className="text-xl font-mono font-bold text-stone-800 dark:text-stone-100">
            {qiblaRelativeAngle.toFixed(0)}&deg;
          </span>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 uppercase tracking-wider font-semibold">
            Sudut Penjajaran Kiblat
          </div>
        </div>
      </div>

      {/* GPS Error Message */}
      {gpsError && (
        <div className="mt-6 flex flex-col gap-1 text-red-600 dark:text-red-400 text-xs p-4 bg-red-500/5 border border-red-500/20 rounded-2xl max-w-md mx-auto">
          <div className="flex items-center justify-center gap-1.5 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Akses Lokasi Disekat / Ralat</span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed text-center mt-1">
            {gpsError}
          </p>
        </div>
      )}
    </div>
  );
}
