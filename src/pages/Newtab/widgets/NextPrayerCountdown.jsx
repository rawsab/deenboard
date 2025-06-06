import React, { useState, useEffect } from 'react';
import AlarmIcon from '../../../assets/img/icons/alarm-icon.svg';

const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function getNextPrayer(prayerTimes, now) {
  if (!prayerTimes)
    return { name: '...', time: new Date(now.getTime() + 3600000) };
  const today = new Date(now);
  for (let i = 0; i < PRAYER_ORDER.length; i++) {
    const name = PRAYER_ORDER[i];
    const [h, m] = prayerTimes[name]?.split(':').map(Number) || [0, 0];
    const t = new Date(today);
    t.setHours(h, m, 0, 0);
    if (t > now) return { name, time: t };
  }
  // If all passed, next is tomorrow's Fajr
  const [h, m] = prayerTimes['Fajr']?.split(':').map(Number) || [0, 0];
  const t = new Date(today);
  t.setDate(t.getDate() + 1);
  t.setHours(h, m, 0, 0);
  return { name: 'Fajr', time: t };
}

function pad(n) {
  return n.toString().padStart(2, '0');
}

// Helper to build cache key for prayer times
function getPrayerTimesCacheKey(lat, lon, dateStr) {
  return `prayerTimes_${lat}_${lon}_${dateStr}`;
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

const NextPrayerCountdown = () => {
  const [alarmEnabled, setAlarmEnabled] = useState(() => {
    const saved = localStorage.getItem('nextPrayerAlarmEnabled');
    return saved === null ? true : saved === 'true';
  });
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Persist alarmEnabled
  useEffect(() => {
    localStorage.setItem('nextPrayerAlarmEnabled', alarmEnabled);
  }, [alarmEnabled]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const today = new Date();
        const dateStr = `${today.getDate()}-${
          today.getMonth() + 1
        }-${today.getFullYear()}`;
        const cacheKey = getPrayerTimesCacheKey(latitude, longitude, dateStr);
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const { timings, timestamp } = JSON.parse(cached);
            // Check if cache is for today
            const cacheDate = new Date(timestamp);
            if (
              cacheDate.getDate() === today.getDate() &&
              cacheDate.getMonth() === today.getMonth() &&
              cacheDate.getFullYear() === today.getFullYear()
            ) {
              setPrayerTimes(timings);
              setLoading(false);
              return;
            }
          } catch {}
        }
        try {
          const apiUrl = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=2`;
          const res = await fetch(apiUrl);
          const data = await res.json();
          if (data.code === 200 && data.data && data.data.timings) {
            setPrayerTimes(data.data.timings);
            localStorage.setItem(
              cacheKey,
              JSON.stringify({
                timings: data.data.timings,
                timestamp: Date.now(),
              })
            );
          } else {
            setError('Could not fetch prayer times');
          }
        } catch {
          setError('Could not fetch prayer times');
        }
        setLoading(false);
      },
      (err) => {
        setLoading(false);
      }
    );
  }, []);

  const { name: nextName, time: nextTime } = getNextPrayer(prayerTimes, now);
  const diffMs = nextTime - now;
  const totalMins = Math.max(0, Math.floor(diffMs / 60000));
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  return (
    <div
      className="relative w-full h-full rounded-[25px] bg-white overflow-hidden flex flex-col justify-between px-9 pt-7 pb-0"
      style={{ fontFamily: 'Wix Madefor Display' }}
    >
      {/* Top left: Until next prayer */}
      <div className="absolute top-4 left-5 text-[#2B2B2B] text-lg font-regular -tracking-[0.025em]">
        Until{' '}
        <span className="font-semibold">
          {nextName.charAt(0).toUpperCase() + nextName.slice(1)}
        </span>
      </div>
      {/* Top right: Alarm icon */}
      <button
        className="absolute top-4 right-4 transition-opacity duration-300"
        onClick={() => setAlarmEnabled((v) => !v)}
        style={{
          opacity: alarmEnabled ? 1 : 0.4,
          filter: alarmEnabled ? 'grayscale(0%)' : 'grayscale(80%)',
          transition: 'opacity 0.3s, filter 0.3s',
        }}
        title={alarmEnabled ? 'Alarm enabled' : 'Alarm disabled'}
      >
        <img src={AlarmIcon} alt="Alarm" className="w-7 h-7" />
      </button>
      {/* Bottom left: Countdown */}
      <div className="absolute bottom-5 left-5 flex flex-col gap-1">
        <div className="flex items-end gap-2">
          <span className="text-[#2B2B2B] text-5xl font-regular leading-none -tracking-[0.025em]">
            {loading ? '...' : hours}
          </span>
          <span className="text-[#7E8884] text-xl font-regular mb-0 -tracking-[0.025em]">
            {hours === 1 ? 'hour' : 'hours'}
          </span>
        </div>
        <div className="flex items-end gap-2">
          <span
            className="text-[#2B2B2B] text-5xl font-regular leading-none -tracking-[0.025em] transition-opacity duration-500"
            style={{ opacity: loading ? 0 : 1 }}
          >
            {loading ? <AnimatedDots /> : mins}
          </span>
          <span className="text-[#7E8884] text-xl font-regular mb-0 -tracking-[0.025em]">
            mins
          </span>
        </div>
        {error && null}
      </div>
    </div>
  );
};

export default NextPrayerCountdown;
