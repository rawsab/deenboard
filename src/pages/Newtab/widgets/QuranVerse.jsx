import React, { useMemo } from 'react';
import verses from '../../../data/quran-verses.json';

const QuranVerse = () => {
  // Pick a random verse on each mount
  const verse = useMemo(() => {
    if (!verses || !Array.isArray(verses) || verses.length === 0) return null;
    return verses[Math.floor(Math.random() * verses.length)];
  }, []);

  if (!verse) {
    return (
      <div
        className="widget-card w-full h-full min-h-[170px] min-w-[352px] flex items-center justify-center rounded-[25px] bg-white/80 text-[#BDC8C2] text-2xl font-semibold"
        style={{ fontFamily: 'Wix Madefor Display' }}
      >
        Quran Verse (No data)
      </div>
    );
  }

  // For button hover state
  const [btnHover, setBtnHover] = React.useState(false);
  const quranUrl = `https://quran.com/${verse.sura}/${verse.aya}`;

  return (
    <div
      className="widget-card w-full h-full min-h-[170px] min-w-[352px] flex flex-col items-center justify-center rounded-[25px] bg-white/80 px-6 py-6 relative"
      style={{ fontFamily: 'Wix Madefor Display' }}
    >
      {/* Top right button */}
      <a
        href={quranUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 flex items-center justify-center"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: btnHover
            ? 'rgba(95,190,146,0.22)'
            : 'rgba(95,190,146,0.12)',
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
          boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
          transition: 'background 0.5s',
          textDecoration: 'none',
        }}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        tabIndex={0}
        title="View on Quran.com"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 11L11 5"
            stroke="#5FBE92"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 5H11V8.5"
            stroke="#5FBE92"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
      {/* Surah:Verse badge */}
      <div
        className="mb-2 px-2 py-1 rounded-[10px] text-[12px] font-semibold"
        style={{
          background: '#F1F7F3',
          color: '#6E8D72',
          letterSpacing: '0.02em',
        }}
      >
        {verse.sura}:{verse.aya}
      </div>
      {/* Arabic */}
      <div
        className="mb-3 text-[1.2rem] text-center font-[400]"
        style={{
          color: '#1C5C3C',
          lineHeight: 1.5,
          letterSpacing: '0.0em',
          fontFamily: 'Cairo',
        }}
        dir="rtl"
      >
        {verse.arabic}
      </div>
      {/* Translation */}
      <div
        className="mb-2 text-base text-center font-medium"
        style={{ color: '#7E8884', lineHeight: 1.2, letterSpacing: '-0.025em' }}
      >
        {verse.translation}
      </div>
      {/* Translator */}
      <div
        className="text-xs text-center font-medium"
        style={{ color: '#B8BEBB', letterSpacing: '-0.025em' }}
      >
        Saheeh International
      </div>
    </div>
  );
};

export default QuranVerse;
