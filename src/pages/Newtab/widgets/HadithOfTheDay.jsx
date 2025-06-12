import React, { useEffect, useState } from 'react';

const HADITH_COUNT = 7563;

const HadithOfTheDay = () => {
  const [hadith, setHadith] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchHadith() {
      // Dynamic import for static JSON
      const data = await import('../../../static/eng-bukhari.min.json');
      const hadiths = data.hadiths || data.default?.hadiths;
      if (!hadiths || !Array.isArray(hadiths) || hadiths.length === 0) return;
      // Pick a random hadithnumber between 1 and 7563
      const randomNumber = Math.floor(Math.random() * HADITH_COUNT) + 1;
      // Find hadith with matching hadithnumber
      const found = hadiths.find((h) => h.hadithnumber === randomNumber);
      // If not found (shouldn't happen), fallback to first
      setHadith(found || hadiths[0]);
      setIsLoaded(true);
    }
    fetchHadith();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="widget-card w-full h-full min-h-[170px] min-w-[170px] flex flex-col items-start justify-start rounded-[26px] bg-white/80 text-gray-700 p-5 relative"
      style={{ fontFamily: 'Wix Madefor Display' }}
    >
      {/* Top right button */}
      {hadith && (
        <a
          href={`https://sunnah.com/bukhari/${hadith.reference?.book || ''}/${
            hadith.reference?.hadith || ''
          }`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 flex items-center justify-center"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(95,190,146,0.12)',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
            transition: 'background 0.5s',
            textDecoration: 'none',
            zIndex: 10,
          }}
          title="View on Sunnah.com"
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
      )}
      <div className="text-[1.1rem] text-[#2B2B2B] font-semibold mb-3 -tracking-[0.03em]">
        Hadith of the Day
      </div>
      <div
        className="flex flex-row items-stretch w-full mb-2 transition-opacity duration-500"
        style={{ opacity: isLoaded ? 1 : 0 }}
      >
        <div
          className="bg-[#D6DBD9] mr-3 ml-1"
          style={{
            width: '12px',
            borderRadius: '0px',
            height: '100%',
            opacity: 0.8,
          }}
        />
        <div
          className="text-sm text-[#7E8884] font-medium line-clamp-4 overflow-hidden -tracking-[0.025em]"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            opacity: 0.8,
          }}
        >
          {hadith ? hadith.text : '...'}
        </div>
      </div>
      <div
        className="text-xs text-[#B8BEBB] font-medium mt-auto -tracking-[0.025em] ml-0 transition-opacity duration-500"
        style={{ opacity: isLoaded ? 1 : 0 }}
      >
        {hadith
          ? `Sahih al-Bukhari Book ${hadith.reference?.book || ''} #${
              hadith.reference?.hadith || ''
            }`
          : ''}
      </div>
    </div>
  );
};

export default HadithOfTheDay;
