"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Compass, 
  MapPin, 
  RefreshCw, 
  Info,
  Navigation,
  CheckCircle,
  AlertCircle
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

      // Check if browser supports device orientation
      if (typeof window !== "undefined") {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
        if (isIOS && typeof DeviceOrientationEvent !== "undefined" && "requestPermission" in DeviceOrientationEvent) {
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
  const requestGps = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError("Pencari GPS tidak disokong oleh pelayar anda.");
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
        setGpsLoading(false);
      },
      (err) => {
        let msg = "Ralat Geolocation tidak diketahui.";
        if (err.code === 1) msg = "Akses GPS ditolak oleh pengguna.";
        else if (err.code === 2) msg = "Kedudukan GPS tidak tersedia.";
        else if (err.code === 3) msg = "Rangkaian tamat masa ketika mencari lokasi.";
        setGpsError(msg);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };



  // Compass card styling based on alignment
  const compassBg = isAligned 
    ? "border-amber-400 shadow-amber-500/20 bg-gradient-to-b from-emerald-950/70 to-teal-950/70"
    : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-lg";

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Visual Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 p-6 md:p-8 text-white shadow-2xl mb-8 border border-amber-500/20">
        <div className="absolute inset-0 opacity-5 mix-blend-overlay" 
             style={{ 
               backgroundImage: 'radial-gradient(circle_at_center, rgba(212,175,55,0.25) 2px, transparent 2px)', 
               backgroundSize: '24px 24px' 
             }} 
        />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-amber-400 font-semibold tracking-wide text-xs md:text-sm flex items-center gap-1">
              <Navigation className="w-4 h-4 animate-pulse" />
              Arah Kiblat
            </span>
            <h1 className="text-2xl md:text-3xl font-serif text-white font-bold mt-1">
              Pencari Arah Kiblat
            </h1>
            <p className="text-stone-300 text-xs md:text-sm mt-2 max-w-xl">
              Cari arah Kaabah dengan mudah. Pegang telefon secara mendatar dan pusing sehingga penunjuk Kiblat berada di garisan atas kompas.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Compass vs Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Compass Panel */}
        <div className={`md:col-span-7 rounded-3xl p-6 md:p-8 border flex flex-col items-center justify-center transition-all duration-500 ${compassBg}`}>
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

          {/* SVG Compass */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 select-none">
            {/* Compass Dial Outer Ring */}
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
              <text x="100" y="24" textAnchor="middle" className="font-bold text-[14px] fill-red-600 dark:fill-red-500 font-mono">U</text> {/* Utara */}
              <text x="178" y="105" textAnchor="middle" className="font-bold text-[13px] fill-stone-500 dark:fill-stone-400 font-mono">T</text> {/* Timur */}
              <text x="100" y="188" textAnchor="middle" className="font-bold text-[13px] fill-stone-500 dark:fill-stone-400 font-mono">S</text> {/* Selatan */}
              <text x="24" y="105" textAnchor="middle" className="font-bold text-[13px] fill-stone-500 dark:fill-stone-400 font-mono">B</text> {/* Barat */}

              {/* Qibla Destination Needle Indicator */}
              <g transform={`rotate(${qiblaResult.bearing} 100 100)`}>
                {/* Dotted Golden Line to Qibla */}
                <line x1="100" y1="100" x2="100" y2="28" className="stroke-amber-500/50" strokeDasharray="3,3" strokeWidth="1.5" />
                
                {/* Golden Arrow Pointer */}
                <path d="M 100,16 L 105,28 L 95,28 Z" className="fill-amber-400 stroke-amber-500" strokeWidth="0.5" />

                {/* Kaaba Pseudo-3D Silhouette inside Arrow path */}
                <g transform="translate(100 42) scale(0.9)">
                  {/* Isometric Cube (Kaaba) */}
                  {/* Right Face */}
                  <path d="M 0,-6 L 6,-3 L 6,6 L 0,3 Z" fill="#262626" />
                  {/* Left Face */}
                  <path d="M 0,-6 L -6,-3 L -6,6 L 0,3 Z" fill="#0f0f0f" />
                  {/* Top Face */}
                  <path d="M 0,-6 L 6,-3 L 0,0 L -6,-3 Z" fill="#3a3a3a" />
                  {/* Kiswah Gold Band */}
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

            {/* Static Overlay Arrow at the top of the compass display, showing true forward heading of the device */}
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

        {/* Info & Settings Panel */}
        <div className="md:col-span-5 flex flex-col gap-6">
          
          {/* Coordinates Location Info */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-md flex-1">
            <h3 className="text-sm font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Rujukan Koordinat
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">Lokasi Dipilih</span>
                <div className="text-stone-800 dark:text-stone-100 font-bold leading-tight mt-1">{location.name}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-stone-100 dark:border-stone-800 pt-3">
                <div>
                  <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">Lat / Long</span>
                  <div className="text-stone-800 dark:text-stone-100 font-mono font-semibold text-xs mt-1">
                    {location.lat.toFixed(5)} &deg;N
                    <br />
                    {location.lon.toFixed(5)} &deg;E
                  </div>
                </div>
                <div>
                  <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">Sumber Lokasi</span>
                  <div className="mt-1 font-semibold text-xs inline-flex px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20">
                    {location.source}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-stone-100 dark:border-stone-800 pt-3">
                <div>
                  <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">Arah Kiblat</span>
                  <div className="text-amber-600 dark:text-amber-400 font-mono font-bold text-base mt-0.5">
                    {qiblaResult.bearing.toFixed(2)}&deg; Utara
                  </div>
                </div>
                <div>
                  <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">Jarak ke Kaaba</span>
                  <div className="text-stone-800 dark:text-stone-100 font-mono font-bold text-sm mt-0.5">
                    {Math.round(qiblaResult.distance).toLocaleString()} km
                  </div>
                </div>
              </div>
            </div>

            {/* GPS Trigger Button */}
            <div className="mt-6 space-y-2">
              <button
                onClick={requestGps}
                disabled={gpsLoading}
                className="w-full bg-emerald-900 hover:bg-emerald-850 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-emerald-900/50"
              >
                {gpsLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                {gpsLoading ? "Mengesan Geolocation..." : "Kesan Kedudukan GPS Saya"}
              </button>
              
              {gpsError && (
                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs font-semibold p-2 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{gpsError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Compass Sensor Control Card */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-md">
            <h3 className="text-sm font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Kawalan Kompas
            </h3>

            {compassPermissionNeeded ? (
              <div className="space-y-3">
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  Peranti iOS (Safari) memerlukan kebenaran penderia gerakan untuk menggunakan kompas automatik. Sila tekan butang di bawah untuk membenarkannya.
                </p>
                <button
                  onClick={requestCompassPermission}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wide transition-all shadow-sm"
                >
                  Aktifkan Kompas Automatik
                </button>
              </div>
            ) : hasCompass ? (
              <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                  Penderia Kompas Aktif (Auto-Orientasi)
                </span>
              </div>
            ) : (
              // Desktop Slider Calibration
              <div className="space-y-4">
                <div className="flex items-start gap-2 text-stone-500 dark:text-stone-400 text-xs">
                  <Info className="w-4 h-4 shrink-0 text-amber-500" />
                  <p className="leading-normal">
                    Tiada penderia orientasi dikesan (Komputer Desktop). Sila gunakan penggelongsor di bawah untuk memusingkan kompas secara manual agar sejajar dengan arah Utara fizikal anda.
                  </p>
                </div>
                
                <div className="space-y-2 border-t border-stone-100 dark:border-stone-800 pt-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-stone-400 dark:text-stone-500">Pusing Kompas</span>
                    <span className="text-stone-700 dark:text-stone-300 font-mono">{manualRotation}&deg; U</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="359"
                    value={manualRotation}
                    onChange={(e) => setManualRotation(Number(e.target.value))}
                    className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-800"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                    <span>Utara</span>
                    <span>Timur</span>
                    <span>Selatan</span>
                    <span>Barat</span>
                    <span>Utara</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
