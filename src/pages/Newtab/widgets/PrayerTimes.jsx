import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import LocationIcon from '../../../assets/img/icons/location-icon.svg';
import masjidSvg from '../../../assets/img/widget_bg/masjid.svg';

const MADHABS = [
  { label: 'Hanafi', value: 'hanafi' },
  { label: "Shafi'i", value: 'shafii' },
  { label: 'Hanbali', value: 'hanbali' },
  { label: 'Maliki', value: 'maliki' },
];

const PRAYER_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const MARKER_OFFSETS = [0.06, 0.26, 0.48, 0.7, 0.94]; // [Fajr, Dhuhr, Asr, Maghrib, Isha]

// Helper to format 24h time to 12h with AM/PM
function formatTime24to12(time24) {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function getMadhabId(madhab) {
  // Aladhan API: 0 = Shafi, Maliki, Hanbali; 1 = Hanafi
  if (madhab.value === 'hanafi') return 1;
  return 0;
}

// Helper to build cache key for prayer times
function getPrayerTimesCacheKey(lat, lon, dateStr, madhab) {
  return `prayerTimes_${lat}_${lon}_${dateStr}_madhab${madhab}`;
}

// Animated loading dots component
function AnimatedDots() {
  const [step, setStep] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => setStep((s) => (s + 1) % 3), 400);
    return () => clearInterval(interval);
  }, []);
  return (
    <span className="inline-block w-6 text-center" aria-label="Loading">
      {'.'.repeat(step + 1)}
    </span>
  );
}

const PrayerTimes = () => {
  // Persist madhab selection in localStorage
  const [madhab, setMadhab] = useState(() => {
    const saved = localStorage.getItem('selectedMadhab');
    return saved
      ? MADHABS.find((m) => m.value === saved) || MADHABS[0]
      : MADHABS[0];
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [location, setLocation] = useState('...');
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());
  const dropdownBtnRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // When opening dropdown, calculate position
  useEffect(() => {
    if (dropdownOpen && dropdownBtnRef.current) {
      const rect = dropdownBtnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [dropdownOpen]);

  // Persist madhab selection
  useEffect(() => {
    localStorage.setItem('selectedMadhab', madhab.value);
  }, [madhab]);

  // Fetch location and prayer times
  useEffect(() => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Get city/region using reverse geocoding
        let locText = '';
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const geoData = await geoRes.json();
          locText =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.village ||
            geoData.address?.county ||
            '';
          if (geoData.address?.state)
            locText += (locText ? ', ' : '') + geoData.address.state;
        } catch {
          locText = 'Your Location';
        }
        setLocation(locText || 'Your Location');
        // Get prayer times from Aladhan (with cache for both madhabs)
        const today = new Date();
        const dateStr = `${today.getDate()}-${
          today.getMonth() + 1
        }-${today.getFullYear()}`;
        const cacheKey0 = getPrayerTimesCacheKey(
          latitude,
          longitude,
          dateStr,
          0
        );
        const cacheKey1 = getPrayerTimesCacheKey(
          latitude,
          longitude,
          dateStr,
          1
        );
        // Show most recent cached timings instantly (regardless of date)
        let timings0 = null,
          timings1 = null;
        let lastCached0 = null,
          lastCached1 = null;
        const cached0 = localStorage.getItem(cacheKey0);
        if (cached0) {
          try {
            const { timings } = JSON.parse(cached0);
            timings0 = timings;
            lastCached0 = timings;
          } catch {}
        }
        const cached1 = localStorage.getItem(cacheKey1);
        if (cached1) {
          try {
            const { timings } = JSON.parse(cached1);
            timings1 = timings;
            lastCached1 = timings;
          } catch {}
        }
        // Show selected madhab timings instantly if cached
        let selectedMadhabId = getMadhabId(madhab);
        let selectedTimings = selectedMadhabId === 1 ? timings1 : timings0;
        if (selectedTimings) {
          setPrayerTimes(selectedTimings);
          setLoading(false);
        } else if (selectedMadhabId === 1 && lastCached1) {
          setPrayerTimes(lastCached1);
          setLoading(false);
        } else if (selectedMadhabId === 0 && lastCached0) {
          setPrayerTimes(lastCached0);
          setLoading(false);
        }
        // Always fetch and cache new data in the background
        const fetchAndCache = async (madhabId, cacheKey) => {
          try {
            const apiUrl = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=2&madhab=${madhabId}`;
            const res = await fetch(apiUrl);
            const data = await res.json();
            if (data.code === 200 && data.data && data.data.timings) {
              localStorage.setItem(
                cacheKey,
                JSON.stringify({
                  timings: data.data.timings,
                  timestamp: Date.now(),
                })
              );
              if (getMadhabId(madhab) === madhabId) {
                setPrayerTimes(data.data.timings);
                setLoading(false);
              }
            }
          } catch {}
        };
        fetchAndCache(0, cacheKey0);
        fetchAndCache(1, cacheKey1);
      },
      (err) => {
        setLoading(false);
      }
    );
  }, [madhab]);

  // Debug log for Asr time and madhab
  useEffect(() => {
    if (prayerTimes) {
      console.log('Asr time:', prayerTimes.Asr, 'Madhab:', madhab.label);
    }
  }, [prayerTimes, madhab]);

  // Calculate segmented progress bar between 12AM and 11:59PM
  let progress = 0;
  let prayerOffsets = [];
  let currentPrayerIdx = 0;
  if (prayerTimes) {
    const getTime = (t) => {
      const [h, m] = prayerTimes[t].split(':').map(Number);
      return h * 60 + m;
    };
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const totalMinutes = 24 * 60 - 1; // 0 to 1439 (11:59PM)
    // Progress as fraction of the day
    progress = Math.max(0, Math.min(1, nowMinutes / totalMinutes));
    // Prayer marker offsets as fraction of the day
    prayerOffsets = PRAYER_ORDER.map((name) => {
      const t = getTime(name);
      return Math.max(0, Math.min(1, t / totalMinutes));
    });
    // Find current interval
    for (let i = 0; i < PRAYER_ORDER.length - 1; i++) {
      const t1 = getTime(PRAYER_ORDER[i]);
      const t2 = getTime(PRAYER_ORDER[i + 1]);
      if (nowMinutes >= t1 && nowMinutes < t2) {
        currentPrayerIdx = i;
        break;
      }
      if (nowMinutes >= t2) currentPrayerIdx = i + 1;
    }
  }

  return (
    <div
      className="relative w-full h-full rounded-[25px] bg-white overflow-hidden flex flex-col justify-between px-6 pt-4 pb-0"
      style={{ position: 'relative' }}
    >
      {/* Masjid background image as a pseudo-element */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{
          backgroundImage: `url(${masjidSvg})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '75% 75%',
          opacity: 0.5,
        }}
      />
      {/* Top row */}
      <div className="flex justify-between items-start z-10">
        {/* Left: Title and location */}
        <div>
          <div
            className="text-[#2B2B2B] text-[1.1rem] font-semibold -tracking-[0.03em]"
            style={{ fontFamily: 'Wix Madefor Display' }}
          >
            Prayer Times
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <img src={LocationIcon} alt="Location" className="w-3.5 h-3.5" />
            <span
              className="text-[#7E8884] text-sm font-regular -tracking-[0.025em] transition-opacity duration-500"
              style={{
                fontFamily: 'Wix Madefor Display',
                opacity: loading ? 0 : 1,
              }}
            >
              {loading ? <AnimatedDots /> : location}
            </span>
          </div>
        </div>
        {/* Right: Madhab dropdown */}
        <div className="relative">
          <button
            ref={dropdownBtnRef}
            className="flex items-center justify-center px-3 py-1 bg-white rounded-full text-black text-sm font-semibold shadow-sm border border-black hover:bg-gray-100 transition-colors duration-200 cursor-pointer select-none -tracking-[0.025em]"
            onClick={() => setDropdownOpen((v) => !v)}
            tabIndex={0}
            style={{ fontFamily: 'Wix Madefor Display', minWidth: 90 }}
          >
            {madhab.label}
            <svg
              className="ml-2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {dropdownOpen &&
            ReactDOM.createPortal(
              <div
                className="w-[100px] bg-white rounded-xl shadow-lg z-[1000] transition-opacity duration-200"
                style={{
                  position: 'absolute',
                  top: dropdownPos.top,
                  left: dropdownPos.left + dropdownPos.width - 100,
                  opacity: dropdownOpen ? 1 : 0,
                  pointerEvents: dropdownOpen ? 'auto' : 'none',
                }}
              >
                {MADHABS.filter((m) => m.value !== madhab.value).map((m) => (
                  <div
                    key={m.value}
                    className="px-4 py-2 text-gray-900 text-sm font-medium cursor-pointer hover:bg-gray-100 rounded-xl -tracking-[0.025em] transition-colors duration-200"
                    style={{ fontFamily: 'Wix Madefor Display' }}
                    onClick={() => {
                      setMadhab(m);
                      setDropdownOpen(false);
                    }}
                  >
                    {m.label}
                  </div>
                ))}
              </div>,
              document.body
            )}
        </div>
      </div>
      {/* Spacer for background image */}
      <div className="flex-1" />
      {/* Loading bar: progress between 12AM and 11:59PM */}
      <div className="px-0 pb-1 pt-7 z-10">
        {/* Continuous progress bar with manual marker offsets */}
        <div
          className="w-full relative flex items-center"
          style={{ minHeight: 24 }}
        >
          {/* Bar background */}
          <div
            className="w-full h-1.5 bg-[#EBEEED] rounded-full"
            style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }}
          />
          {/* Progress fill */}
          {prayerTimes && (
            <>
              {/* Progress fill */}
              <div
                className="h-1.5 bg-[#237D54] rounded-full transition-all duration-500"
                style={{
                  width: `${progress * 100}%`,
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  zIndex: 1,
                }}
              />
              {/* Markers */}
              {prayerOffsets.map((offset, idx) => (
                <div
                  key={PRAYER_ORDER[idx]}
                  className={`absolute top-0 h-0 flex flex-col items-center ${
                    idx === currentPrayerIdx ? 'z-10' : 'z-5'
                  }`}
                  style={{ left: `calc(${offset * 100}% - 1px)` }}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      idx === currentPrayerIdx
                        ? 'bg-transparent'
                        : 'bg-transparent'
                    } border-2 border-transparent`}
                    style={{ marginBottom: 0, marginTop: 0 }}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      {/* Bottom: Prayer times */}
      <div className="flex justify-between items-end pb-10 z-10">
        {PRAYER_ORDER.map((name) => (
          <div key={name} className="flex flex-col items-center min-w-[60px]">
            <span
              className="text-[#2B2B2B] text-[1.0rem] font-medium -mt-3 mb-1 -tracking-[0.025em] transition-opacity duration-500"
              style={{ fontFamily: 'Wix Madefor Display', opacity: 1 }}
            >
              {name}
            </span>
            <span className="h-4 flex items-center justify-center">
              {loading && <AnimatedDots />}
              <span
                className="text-[#7E8884] text-sm font-regular -tracking-[0.025em] transition-opacity duration-500 ml-0"
                style={{
                  fontFamily: 'Wix Madefor Display',
                  opacity: loading ? 0 : 1,
                }}
              >
                {prayerTimes ? formatTime24to12(prayerTimes[name]) : ''}
              </span>
            </span>
          </div>
        ))}
      </div>
      {error && null}
    </div>
  );
};

export default PrayerTimes;
