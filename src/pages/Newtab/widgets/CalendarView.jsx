import React, { useState, useEffect } from 'react';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_COLOR = '#BDC8C2';
const SQUARE_BG = '#EBEEED';
const SQUARE_TEXT = '#6D8579';
const TODAY_BG = '#14452D';
const TODAY_TEXT = '#fff';
const EVENT_DOT_COLOR = '#13452D';

function getMonthName(monthIdx) {
  return new Date(2000, monthIdx, 1).toLocaleString('default', {
    month: 'long',
  });
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

function getDayKey(year, month, day) {
  // YYYY-MM-DD
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(
    2,
    '0'
  )}`;
}

const CalendarView = () => {
  const today = new Date();
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [eventDays, setEventDays] = useState({}); // { 'YYYY-MM-DD': true }
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [signedIn, setSignedIn] = useState(true);

  const daysInMonth = getDaysInMonth(view.year, view.month);
  const firstDay = getFirstDayOfWeek(view.year, view.month);
  const isToday = (d) =>
    d === today.getDate() &&
    view.month === today.getMonth() &&
    view.year === today.getFullYear();

  // Build calendar grid: pad with empty slots before first day
  const squares = [];
  for (let i = 0; i < firstDay; i++) squares.push(null);
  for (let d = 1; d <= daysInMonth; d++) squares.push(d);
  while (squares.length % 7 !== 0) squares.push(null);

  // Fetch Google Calendar events for the visible month
  useEffect(() => {
    let cancelled = false;
    async function fetchEvents() {
      setLoadingEvents(true);
      setEventDays({});
      setSignedIn(true);
      if (!window.chrome?.identity) {
        setSignedIn(false);
        setLoadingEvents(false);
        return;
      }
      window.chrome.identity.getAuthToken(
        { interactive: false },
        async (token) => {
          if (!token) {
            setSignedIn(false);
            setLoadingEvents(false);
            return;
          }
          try {
            // Get all events for the visible month
            const start = new Date(
              view.year,
              view.month,
              1,
              0,
              0,
              0,
              0
            ).toISOString();
            const end = new Date(
              view.year,
              view.month,
              daysInMonth,
              23,
              59,
              59,
              999
            ).toISOString();
            const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=250&orderBy=startTime&singleEvents=true&timeMin=${encodeURIComponent(
              start
            )}&timeMax=${encodeURIComponent(end)}`;
            const res = await fetch(url, {
              headers: { Authorization: 'Bearer ' + token },
            });
            if (!res.ok) throw new Error('Failed to fetch events');
            const data = await res.json();
            if (!cancelled && data.items) {
              // Mark days with at least one event
              const daysWithEvents = {};
              for (const ev of data.items) {
                const startDate = ev.start?.dateTime || ev.start?.date;
                if (!startDate) continue;
                const dateObj = new Date(startDate);
                if (
                  dateObj.getFullYear() === view.year &&
                  dateObj.getMonth() === view.month
                ) {
                  const key = getDayKey(
                    view.year,
                    view.month,
                    dateObj.getDate()
                  );
                  daysWithEvents[key] = true;
                }
              }
              setEventDays(daysWithEvents);
            }
          } catch {
            if (!cancelled) setEventDays({});
          } finally {
            if (!cancelled) setLoadingEvents(false);
          }
        }
      );
    }
    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, [view.year, view.month]);

  return (
    <div
      className="widget-card w-full h-full rounded-[25px] bg-white/80 flex flex-col p-6"
      style={{ fontFamily: 'Wix Madefor Display', minHeight: 0, minWidth: 0 }}
    >
      {/* Month and year with chevrons */}
      <div className="flex items-center justify-between mb-4 px-12">
        <button
          className="p-2 rounded-full hover:bg-[rgba(0,0,0,0.05)]"
          style={{ transition: 'background 0.5s' }}
          onClick={() =>
            setView((v) => {
              let m = v.month - 1,
                y = v.year;
              if (m < 0) {
                m = 11;
                y--;
              }
              return { year: y, month: m };
            })
          }
          aria-label="Previous month"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path
              d="M15 19l-7-7 7-7"
              stroke="#B2BDB8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="flex flex-col items-center flex-1">
          <a
            href={`https://calendar.google.com/calendar/r/month/${
              view.year
            }/${String(view.month + 1).padStart(2, '0')}/01`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-semibold -tracking-[0.03em] cursor-pointer"
            style={{ color: '#2B2B2B' }}
          >
            {getMonthName(view.month)}
          </a>
          <div
            className="text-sm font-medium -tracking-[0.02em]"
            style={{ color: '#7E8884' }}
          >
            {view.year}
          </div>
        </div>
        <button
          className="p-2 rounded-full hover:bg-[rgba(0,0,0,0.05)]"
          style={{ transition: 'background 0.5s' }}
          onClick={() =>
            setView((v) => {
              let m = v.month + 1,
                y = v.year;
              if (m > 11) {
                m = 0;
                y++;
              }
              return { year: y, month: m };
            })
          }
          aria-label="Next month"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path
              d="M9 5l7 7-7 7"
              stroke="#B2BDB8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      {/* Days of week */}
      <div className="grid grid-cols-7 gap-[2px] mb-3">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold"
            style={{ color: DAY_COLOR, letterSpacing: '0.05em' }}
          >
            {d}
          </div>
        ))}
      </div>
      {/* Dates grid */}
      <div className="grid grid-cols-7 gap-[2px] flex-1 items-start justify-items-center pb-0">
        {squares.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = getDayKey(view.year, view.month, d);
          const hasEvent = !!eventDays[key];
          // Google Calendar URL for this date
          const gcalUrl = `https://calendar.google.com/calendar/r/day/${
            view.year
          }/${String(view.month + 1).padStart(2, '0')}/${String(d).padStart(
            2,
            '0'
          )}`;
          const isCurrent = isToday(d);
          return (
            <div key={i} className="flex flex-col items-center">
              <a
                href={gcalUrl}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={0}
                className={
                  `flex items-center justify-center rounded-[8px] text-sm font-semibold select-none transition-colors duration-200 focus:outline-none` +
                  (isCurrent
                    ? ' bg-[#14452D] text-white hover:bg-[#0e2e1d]'
                    : ' bg-[#EBEEED] text-[#6D8579] hover:bg-[#E0E5E3]')
                }
                style={{
                  minHeight: 0,
                  aspectRatio: '1/1',
                  height: 28,
                  cursor: 'pointer',
                }}
                title="Open Google Calendar for this date"
              >
                {d}
              </a>
              {/* Always reserve space for the dot */}
              <span
                style={{
                  display: 'block',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: hasEvent ? EVENT_DOT_COLOR : 'transparent',
                  marginTop: 3,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default CalendarView;
