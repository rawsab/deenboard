import React, { useEffect, useState } from 'react';

const CalendarIcon = () => (
  <svg
    width="38"
    height="38"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <rect width="24" height="24" fill="none" />
      <path
        d="M3 8.26667V19C3 19.5523 3.44772 20 4 20H20C20.5523 20 21 19.5523 21 19V8.26667M3 8.26667V5C3 4.44772 3.44772 4 4 4H20C20.5523 4 21 4.44772 21 5V8.26667M3 8.26667H21"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7 2V5"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 2V5"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 11H16"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 17H16"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 11H11"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 17H11"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 11H6"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 17H6"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 14H16"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 14H11"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 14H6"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

function daysUntilRamadan(hijriDay, hijriMonth, hijriYear) {
  // Ramadan is the 9th month
  const ramadanMonth = 9;
  const ramadanDay = 1;
  let days = 0;
  if (
    hijriMonth < ramadanMonth ||
    (hijriMonth === ramadanMonth && hijriDay < ramadanDay)
  ) {
    // Count days until Ramadan this year
    days = (ramadanMonth - hijriMonth) * 30 + (ramadanDay - hijriDay);
  } else {
    // If after Ramadan, count days until next year's Ramadan
    days = (12 - hijriMonth + ramadanMonth) * 30 + (ramadanDay - hijriDay);
  }
  return days;
}

// Helper to build cache key for hijri date
function getHijriDateCacheKey(dateStr) {
  return `hijriDate_${dateStr}`;
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

const HijriDate = () => {
  const [hijri, setHijri] = useState({
    day: 12,
    month: { en: 'Shaʿbān', ar: 'شعبان' },
    year: 1445,
    weekday: { ar: 'الخميس' },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const dateStr = `${today.getDate()}-${
      today.getMonth() + 1
    }-${today.getFullYear()}`;
    const cacheKey = getHijriDateCacheKey(dateStr);
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { hijri, timestamp } = JSON.parse(cached);
        const cacheDate = new Date(timestamp);
        if (
          cacheDate.getDate() === today.getDate() &&
          cacheDate.getMonth() === today.getMonth() &&
          cacheDate.getFullYear() === today.getFullYear()
        ) {
          setHijri(hijri);
          setLoading(false);
          return;
        }
      } catch {}
    }
    fetch(`https://api.aladhan.com/v1/gToH?date=${dateStr}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data && data.data.hijri) {
          setHijri(data.data.hijri);
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ hijri: data.data.hijri, timestamp: Date.now() })
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hijriDay = parseInt(hijri.day, 10);
  const hijriMonth = hijri.month.en;
  const hijriMonthAr = hijri.month.ar;
  const hijriYear = hijri.year;
  const arabicDayOfWeek = hijri.weekday.ar;
  const daysToRamadan = daysUntilRamadan(
    hijriDay,
    parseInt(hijri.month.number || 8, 10),
    hijriYear
  );

  return (
    <div
      className="relative w-full h-full rounded-[25px] overflow-hidden flex"
      style={{
        background: 'linear-gradient(30deg, #134830 0%, #246F47 100%)',
      }}
    >
      {/* Top left: Arabic day of week */}
      <div
        className="absolute top-4 left-6 text-white text-xl font-[400] transition-opacity duration-500"
        style={{ fontFamily: 'Cairo', opacity: loading ? 0 : 1 }}
      >
        {loading ? <AnimatedDots /> : arabicDayOfWeek}
      </div>

      {/* Top right: Days until Ramadan */}
      <div className="absolute top-4 right-6 text-right -tracking-[0.025em]">
        <div
          className="text-white text-[1.0rem] font-regular opacity-80 transition-opacity duration-500"
          style={{
            fontFamily: 'Wix Madefor Display',
            opacity: loading ? 0 : 1,
          }}
        >
          <span className="font-extrabold">
            {loading ? <AnimatedDots /> : daysToRamadan}
          </span>{' '}
          days until
        </div>
        <div
          className="text-white text-[1.0rem] font-regular -tracking-[0.025em] -mt-1"
          style={{ fontFamily: 'Wix Madefor Display' }}
        >
          Ramadan
        </div>
      </div>

      {/* Bottom left: Big day, month, year */}
      <div className="absolute bottom-6 left-6 flex items-end gap-3">
        <span
          className="text-white text-6xl md:text-7xl font-medium leading-none drop-shadow-lg -tracking-[0.05em] transition-opacity duration-500"
          style={{
            fontFamily: 'Wix Madefor Display',
            opacity: loading ? 0 : 1,
          }}
        >
          {loading ? <AnimatedDots /> : hijriDay}
        </span>
        <div className="flex flex-col mb-1">
          <span
            className="text-white text-lg md:text-2xl font-semibold leading-tight -tracking-[0.025em] transition-opacity duration-500"
            style={{
              fontFamily: 'Wix Madefor Display',
              opacity: loading ? 0 : 1,
            }}
          >
            {loading ? <AnimatedDots /> : hijriMonth}
          </span>
          <span
            className="text-white text-base md:text-xl font-regular opacity-80 -tracking-[0.025em] transition-opacity duration-500"
            style={{
              fontFamily: 'Wix Madefor Display',
              opacity: loading ? 0 : 1,
            }}
          >
            {loading ? <AnimatedDots /> : `${hijriYear} AH`}
          </span>
        </div>
      </div>

      {/* Bottom right: Calendar icon */}
      <a
        href="https://www.islamicreliefcanada.org/resources/islamic-calendar"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-6 right-6 cursor-pointer"
        title="Open Islamic Calendar"
      >
        <CalendarIcon />
      </a>
    </div>
  );
};

export default HijriDate;
