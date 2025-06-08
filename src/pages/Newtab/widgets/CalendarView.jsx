import React, { useState } from 'react';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_COLOR = '#BDC8C2';
const SQUARE_BG = '#EBEEED';
const SQUARE_TEXT = '#6D8579';
const TODAY_BG = '#14452D';
const TODAY_TEXT = '#fff';

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

const CalendarView = () => {
  const today = new Date();
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
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
  // Pad to fill last week
  while (squares.length % 7 !== 0) squares.push(null);

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
          <div
            className="text-xl font-semibold -tracking-[0.03em]"
            style={{ color: '#2B2B2B' }}
          >
            {getMonthName(view.month)}
          </div>
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
      <div className="grid grid-cols-7 gap-[2px] mb-2">
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
      <div className="grid grid-cols-7 gap-[2px] flex-1 items-center justify-items-center pb-0">
        {squares.map((d, i) =>
          d ? (
            <div
              key={i}
              className="flex items-center justify-center rounded-[8px] text-sm font-semibold select-none"
              style={{
                background: isToday(d) ? TODAY_BG : SQUARE_BG,
                color: isToday(d) ? TODAY_TEXT : SQUARE_TEXT,
                minHeight: 0,
                aspectRatio: '1/1',
                height: 28,
                transition: 'background 0.5s, color 0.5s',
              }}
            >
              {d}
            </div>
          ) : (
            <div key={i} />
          )
        )}
      </div>
    </div>
  );
};
export default CalendarView;
