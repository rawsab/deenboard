import React from 'react';
import topRadial from '../../assets/img/bg/top_radial.png';
import bottomRadial from '../../assets/img/bg/bottom_radial.png';
import HijriDate from './widgets/HijriDate';

const CELL_SIZE = 250; // px, adjust as needed

const Widget = ({ name, className }) => (
  <div
    className={`rounded-[40px] bg-white/80 flex items-center justify-center text-center font-semibold text-gray-700 ${className}`}
    style={{ minWidth: 0, minHeight: 0 }}
  >
    {name}
  </div>
);

const Newtab = () => (
  <div className="relative min-h-screen bg-gradient-to-br from-[#E2E5E4] to-[#E2E5E4] p-6 flex flex-col justify-end gap-6 overflow-hidden">
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
      <div className="mb-[50px]">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Assalamu Alaikum!
        </h1>
        <form
          action="https://www.google.com/search"
          method="GET"
          target="_blank"
          className="flex gap-2"
        >
          <input
            type="text"
            name="q"
            placeholder="Search Google..."
            className="flex-1 rounded-l-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="rounded-r-lg bg-blue-500 text-white px-4 py-2 font-semibold hover:bg-blue-600"
          >
            Search
          </button>
        </form>
      </div>
      {/* Bento grid */}
      <div
        className="grid grid-cols-6 grid-rows-3 gap-5 w-max mx-auto mb-[80px] overflow-x-auto"
        style={{
          gridTemplateColumns: `repeat(6, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(3, ${CELL_SIZE}px)`,
        }}
      >
        <div className="col-span-2 row-span-1 col-start-1 row-start-1">
          <HijriDate />
        </div>
        <Widget
          name="Next Prayer Countdown"
          className="col-span-1 row-span-1 col-start-3 row-start-1"
        />
        <Widget
          name="Prayer Times"
          className="col-span-3 row-span-1 col-start-4 row-start-1"
        />
        {/* Row 2 & 3 */}
        <Widget
          name="Todo List"
          className="col-span-1 row-span-2 col-start-1 row-start-2"
        />
        <Widget
          name="Qibla Direction"
          className="col-span-1 row-span-1 col-start-2 row-start-2"
        />
        <Widget
          name="Upcoming Events"
          className="col-span-1 row-span-1 col-start-2 row-start-3"
        />
        <Widget
          name="Calendar View"
          className="col-span-2 row-span-2 col-start-3 row-start-2"
        />
        <Widget
          name="Quran Verse"
          className="col-span-2 row-span-1 col-start-5 row-start-2"
        />
        <Widget
          name="Hadith of the Day"
          className="col-span-2 row-span-1 col-start-5 row-start-3"
        />
      </div>
    </div>
  </div>
);

export default Newtab;
