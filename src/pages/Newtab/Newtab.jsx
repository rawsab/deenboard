import React, { useEffect, useState, useRef } from 'react';
import VantaBackground from '../../VantaBackground';
import topRadial from '../../assets/img/bg/top_radial.png';
import bottomRadial from '../../assets/img/bg/bottom_radial.png';
import HijriDate from './widgets/HijriDate';
import PrayerTimes from './widgets/PrayerTimes';
import NextPrayerCountdown from './widgets/NextPrayerCountdown';
import TodoList from './widgets/TodoList';
import QiblaDirection from './widgets/QiblaDirection';
import UpcomingEvents from './widgets/UpcomingEvents';
import CalendarView from './widgets/CalendarView';
import QuranVerse from './widgets/QuranVerse';
import HadithOfTheDay from './widgets/HadithOfTheDay';
import magnifyingIcon from '../../assets/img/icons/magnifying-icon.svg';

const CELL_SIZE = 170;

const Widget = ({ name, className }) => (
  <div
    className={`rounded-[25px] bg-white/80 flex items-center justify-center text-center font-semibold text-gray-700 ${className}`}
    style={{ minWidth: 0, minHeight: 0 }}
  >
    {name}
  </div>
);

const Newtab = () => {
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeWelcome, setFadeWelcome] = useState(false);
  const [fadeSearch, setFadeSearch] = useState(false);
  const searchInputRef = useRef(null);
  useEffect(() => {
    setTimeout(() => setFadeIn(true), 50);
    setTimeout(() => setFadeWelcome(true), 100);
    setTimeout(() => setFadeSearch(true), 200);
  }, []);
  // Command+F shortcut to focus search bar
  useEffect(() => {
    const handler = (e) => {
      // Mac: metaKey, Windows: ctrlKey
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        if (searchInputRef.current) {
          e.preventDefault();
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  // Helper for fade-in classes
  const fadeClass = (idx) =>
    `${fadeIn ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`;
  const fadeStyle = (idx) => ({
    transitionDelay: `${idx * 40}ms`,
  });
  return (
    <>
      <VantaBackground />
      <div
        className="fixed inset-0 flex items-center justify-center no-scrollbar"
        style={{ height: '100vh', width: '100vw' }}
      >
        <div className="scale-outer">
          <div className="relative p-6 flex flex-col items-center justify-center gap-6 overflow-hidden">
            {/* Top radial background */}
            <img
              src={topRadial}
              alt="top radial"
              className="pointer-events-none select-none absolute top-0 left-0 w-full h-auto z-0"
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
            {/* Bottom radial background */}
            <img
              src={bottomRadial}
              alt="bottom radial"
              className="pointer-events-none select-none absolute bottom-0 left-0 w-full h-auto z-0"
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
            {/* Main content */}
            <div className="relative z-10">
              {/* Welcome message and Google search bar */}
              <div
                className="mb-4 pb-4 flex flex-row items-end justify-between max-w-screen-xl w-full mx-auto"
                style={{ width: 6 * CELL_SIZE + 5 * 12 }}
              >
                {/* Left: Welcome message */}
                <div className="flex flex-col items-start">
                  <div
                    className={`text-xl md:text-2xl font-semibold mb-2 transition-opacity duration-700 ${
                      fadeIn ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      color: '#7E8884',
                      fontFamily: 'Cairo',
                      lineHeight: 1.1,
                    }}
                  >
                    السلام عليكم
                  </div>
                  <div
                    className={`text-6xl font-450 mb-0 bg-gradient-to-r from-black to-[#1A593A] bg-clip-text text-transparent -tracking-[0.05em] transition-opacity duration-700 ${
                      fadeWelcome ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      fontFamily: 'Wix Madefor Display',
                      lineHeight: 1.1,
                    }}
                  >
                    Welcome, Rawsab
                  </div>
                </div>
                {/* Right: Google search bar */}
                <form
                  action="https://www.google.com/search"
                  method="GET"
                  target="_blank"
                  className={`flex items-center flex-shrink-0 transition-opacity duration-700 ${
                    fadeSearch ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ width: 340, maxWidth: 400 }}
                >
                  <div className="relative w-full">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ADADAD] -tracking-[0.025em] text-md">
                      <img
                        src={magnifyingIcon}
                        alt="Search"
                        className="w-5 h-5"
                      />
                    </span>
                    <input
                      ref={searchInputRef}
                      type="text"
                      name="q"
                      placeholder="Search Google..."
                      className="w-full pl-12 pr-14 py-3 rounded-[25px] focus:outline-none focus:ring-2 focus:ring-[#1A593A] text-base bg-white"
                      style={{
                        fontFamily: 'Wix Madefor Display',
                        color: '#2B2B2B',
                        tracking: '-0.025em',
                        fontSize: '1rem',
                      }}
                    />
                    {/* Command+F shortcut hint */}
                    <span
                      className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center bg-[#F2F4F3] border border-[#F2F4F3] rounded-lg px-2 py-1 text-xs font-semibold text-[#7E8884] select-none"
                      style={{
                        fontFamily: 'Wix Madefor Display',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      <span className="mr-1" style={{ fontSize: '1.1em' }}>
                        ⌘
                      </span>
                      F
                    </span>
                  </div>
                  {/* No button, just enter to search */}
                </form>
              </div>
              {/* Bento grid */}
              <div
                className="grid grid-cols-6 grid-rows-3 gap-3 w-max mx-auto mb-8 overflow-x-auto"
                style={{
                  gridTemplateColumns: `repeat(6, ${CELL_SIZE}px)`,
                  gridTemplateRows: `repeat(3, ${CELL_SIZE}px)`,
                }}
              >
                <div
                  className={`col-span-2 row-span-1 col-start-1 row-start-1 ${fadeClass(
                    0
                  )}`}
                  style={fadeStyle(0)}
                >
                  <HijriDate />
                </div>
                <div
                  className={`col-span-1 row-span-1 col-start-3 row-start-1 ${fadeClass(
                    1
                  )}`}
                  style={fadeStyle(1)}
                >
                  <NextPrayerCountdown />
                </div>
                <div
                  className={`col-span-3 row-span-1 col-start-4 row-start-1 ${fadeClass(
                    2
                  )}`}
                  style={fadeStyle(2)}
                >
                  <PrayerTimes />
                </div>
                <div
                  className={`col-span-1 row-span-2 col-start-1 row-start-2 ${fadeClass(
                    2
                  )}`}
                  style={fadeStyle(2)}
                >
                  <TodoList />
                </div>
                <div
                  className={`col-span-1 row-span-1 col-start-2 row-start-2 ${fadeClass(
                    3
                  )}`}
                  style={fadeStyle(3)}
                >
                  <QiblaDirection />
                </div>
                <div
                  className={`col-span-1 row-span-1 col-start-2 row-start-3 ${fadeClass(
                    4
                  )} bg-white rounded-[25px]`}
                  style={fadeStyle(4)}
                />
                <div
                  className={`col-span-2 row-span-2 col-start-3 row-start-2 ${fadeClass(
                    4
                  )}`}
                  style={fadeStyle(4)}
                >
                  <CalendarView />
                </div>
                <div
                  className={`col-span-2 row-span-1 col-start-5 row-start-2 ${fadeClass(
                    5
                  )} bg-white rounded-[25px]`}
                  style={fadeStyle(5)}
                />
                <div
                  className={`col-span-2 row-span-1 col-start-5 row-start-3 ${fadeClass(
                    6
                  )} bg-white rounded-[25px]`}
                  style={fadeStyle(6)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Newtab;
