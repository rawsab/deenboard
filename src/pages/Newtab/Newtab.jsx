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
import pencilIcon from '../../assets/img/icons/pencil-icon.svg';
import ColorChanger from './widgets/ColorChanger';

const CELL_SIZE = 170;
const MIN_WIDTH = 1200;
const MAX_WIDTH = 1500;
const MIN_HEIGHT = 800;

const Widget = ({ name, className }) => (
  <div
    className={`rounded-[25px] bg-white/60 flex items-center justify-center text-center font-semibold text-gray-700 ${className}`}
    style={{ minWidth: 0, minHeight: 0 }}
  >
    {name}
  </div>
);

const NAME_KEY = 'deenboard_user_name';
const HUE_KEY = 'deenboard_hue_percent';

const Newtab = () => {
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeWelcome, setFadeWelcome] = useState(false);
  const [fadeSearch, setFadeSearch] = useState(false);
  const [fadePencil, setFadePencil] = useState(false);
  const searchInputRef = useRef(null);
  const [name, setName] = useState(
    () => localStorage.getItem(NAME_KEY) || 'Rawsab'
  );
  const [editing, setEditing] = useState(false);
  const [lastSavedName, setLastSavedName] = useState(name);
  const nameInputRef = useRef(null);
  const [huePercent, setHuePercent] = useState(() => {
    const saved = localStorage.getItem(HUE_KEY);
    return saved !== null ? parseFloat(saved) : 0.16;
  });
  const [scale, setScale] = useState(1);

  // Map percent to hue-rotate (red=0deg, green=120deg, blue=240deg, violet=270deg)
  function percentToHue(percent) {
    // Our stops: 0=red(0), 0.2=yellow(60), 0.4=green(120), 0.6=blue(240), 0.8=indigo(275), 1=violet(290)
    if (percent <= 0.2) return percent * 300; // 0-60
    if (percent <= 0.4) return 60 + (percent - 0.2) * 300; // 60-120
    if (percent <= 0.6) return 120 + (percent - 0.4) * 600; // 120-240
    if (percent <= 0.8) return 240 + (percent - 0.6) * 175; // 240-275
    return 275 + (percent - 0.8) * 75; // 275-290
  }
  const hue = percentToHue(huePercent);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 50);
    setTimeout(() => setFadeWelcome(true), 100);
    setTimeout(() => setFadeSearch(true), 200);
    setTimeout(() => setFadePencil(true), 350);
  }, []);

  useEffect(() => {
    if (editing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    localStorage.setItem(NAME_KEY, name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem(HUE_KEY, huePercent);
  }, [huePercent]);

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

  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      let sW = 1;
      let sH = 1;
      if (w < MIN_WIDTH) sW = w / MIN_WIDTH;
      else if (w > MAX_WIDTH) sW = w / (MIN_WIDTH + 300);
      if (h < MIN_HEIGHT) sH = h / MIN_HEIGHT;
      // You can add an upper bound for height if desired, but usually not needed
      let s = Math.min(sW, sH);
      if (s < 0.8) s = 0.8;
      if (s > 1.5) s = 1.5;
      setScale(s);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper for fade-in classes
  const fadeClass = (idx) =>
    `${fadeIn ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`;
  const fadeStyle = (idx) => ({
    transitionDelay: `${idx * 40}ms`,
  });

  // Calculate font size for name (shrink if long)
  const baseFontSize = 64;
  const minFontSize = 32;
  const shrinkStart = 10;
  const shrinkEnd = 30; // max chars
  let fontSize = baseFontSize;
  if (name.length > shrinkStart) {
    const shrinkRange = shrinkEnd - shrinkStart;
    const shrinkAmount = Math.min(name.length - shrinkStart, shrinkRange);
    fontSize = Math.max(
      minFontSize,
      baseFontSize - ((baseFontSize - minFontSize) * shrinkAmount) / shrinkRange
    );
  }
  const nameMaxWidth = 750;

  // When entering edit mode, save the last name
  const handleEditClick = () => {
    setLastSavedName(name);
    setEditing(true);
  };

  // When leaving edit mode, if name is empty, revert to last saved name
  const handleEditEnd = () => {
    if (!name.trim()) {
      setName(lastSavedName);
    }
    setEditing(false);
  };

  return (
    <>
      {/* ColorChanger widget, always top right, outside main content */}
      <ColorChanger onColorChange={setHuePercent} initialPercent={huePercent} />
      <div style={{ filter: `hue-rotate(${hue}deg)` }}>
        <VantaBackground />
      </div>
      <div
        className="fixed inset-0 flex items-center justify-center no-scrollbar" //bg-[#E2E5E4]
        style={{
          height: '100vh',
          width: '100vw',
        }}
      >
        {/* Top radial background */}
        <img
          src={topRadial}
          alt="top radial"
          className="pointer-events-none select-none absolute top-0 left-0 w-full h-auto z-0"
          style={{ maxHeight: '400px', objectFit: 'cover' }}
        />
        {/* Bottom radial background */}
        {/* <img
        src={bottomRadial}
        alt="bottom radial"
        className="pointer-events-none select-none absolute bottom-0 left-0 w-full h-auto z-0"
          style={{
            maxHeight: '400px',
            objectFit: 'cover',
            filter: `hue-rotate(${hue}deg)`,
          }} 
        /> */}
        <div
          className="scale-outer"
          style={{
            filter: `hue-rotate(${hue}deg)`,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          <div className="relative p-6 flex flex-col items-center justify-center gap-6 overflow-hidden">
            {/* Main content */}
            <div className="relative z-10">
              {/* Welcome message and Google search bar */}
              <div
                className="mb-4 pb-3 pt-4 flex flex-row items-end justify-between max-w-screen-xl w-full mx-auto"
                style={{ width: 6 * CELL_SIZE + 5 * 12 }}
              >
                {/* Left: Welcome message */}
                <div className="flex flex-col items-start flex-1 min-w-0">
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
                    className={`transition-opacity duration-700 -mb-2 ${
                      fadeWelcome ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      fontFamily: 'Wix Madefor Display',
                      lineHeight: 1.1,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        maxWidth: nameMaxWidth,
                        minWidth: 0,
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          minWidth: 0,
                          width: '100%',
                        }}
                      >
                        {editing ? (
                          <input
                            ref={nameInputRef}
                            type="text"
                            value={name}
                            maxLength={18}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={handleEditEnd}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditEnd();
                            }}
                            placeholder="Type name..."
                            style={{
                              fontFamily: 'Wix Madefor Display',
                              letterSpacing: '-0.05em',
                              fontWeight: 450,
                              fontSize: fontSize,
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              color: '#1A593A',
                              minWidth: 40,
                              marginLeft: 2,
                              display: 'inline-block',
                              lineHeight: 1.25,
                              verticalAlign: 'bottom',
                              height: fontSize * 1.25,
                              padding: 0,
                              textAlign: 'left',
                            }}
                          />
                        ) : (
                          <span
                            className="text-6xl font-450 mb-0 -tracking-[0.05em]"
                            style={{
                              display: 'inline-block',
                              whiteSpace: 'nowrap',
                              verticalAlign: 'bottom',
                              width: '100%',
                              minWidth: 0,
                              textAlign: 'left',
                              fontSize: fontSize,
                              height: fontSize * 1.25,
                              lineHeight: 1.25,
                              background:
                                'linear-gradient(to right, #000, #1A593A)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                            }}
                          >
                            Welcome,{' '}
                            <span
                              style={{ marginLeft: 2, cursor: 'pointer' }}
                              onClick={handleEditClick}
                            >
                              {name}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Pencil icon: always at the end of the row, before the search bar */}
                <img
                  src={pencilIcon}
                  alt="Edit name"
                  className={`mb-1 cursor-pointer select-none flex-shrink-0 transition-opacity duration-700 ${
                    fadePencil ? 'opacity-50' : 'opacity-0'
                  }`}
                  style={{
                    width: 28,
                    height: 28,
                    transition:
                      'opacity 0.2s, margin-left 0.4s cubic-bezier(0.4,0,0.2,1)',
                    alignSelf: 'flex-end',
                    minWidth: 28,
                    minHeight: 28,
                    zIndex: 1,
                    marginLeft: 12,
                    marginRight: 12,
                    transitionDelay: fadePencil ? '0ms' : '0ms',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.5)}
                  onClick={handleEditClick}
                />
                {/* Right: Google search bar */}
                <div className="search-bar">
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
              </div>
              {/* Bento grid */}
              <div
                className="grid grid-cols-6 grid-rows-3 gap-3 w-max mx-auto mb-2 overflow-x-auto"
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
                  )}`}
                  style={fadeStyle(4)}
                >
                  <UpcomingEvents />
                </div>
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
                  )}`}
                  style={fadeStyle(5)}
                >
                  <QuranVerse />
                </div>
                <div
                  className={`col-span-2 row-span-1 col-start-5 row-start-3 ${fadeClass(
                    6
                  )}`}
                  style={fadeStyle(6)}
                >
                  <HadithOfTheDay />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Newtab;
