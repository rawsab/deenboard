import React, { useState, useEffect } from 'react';

const SAMPLE_EVENTS = [
  // Add more sample events if needed
];

function formatEventTime(event) {
  // Handles both dateTime and date (all-day)
  if (!event.start || !event.end) return '';
  const start = event.start.dateTime || event.start.date;
  const end = event.end.dateTime || event.end.date;
  // If all-day
  if (start.length === 10 && end.length === 10) return 'All day';
  // Otherwise, format as h:mm AM/PM
  const format = (dt) => {
    const d = new Date(dt);
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  };
  return `${format(start)} - ${format(end)}`;
}

function isToday(event) {
  // Handles both dateTime and date (all-day)
  if (!event.start) return false;
  const start = event.start.dateTime || event.start.date;
  const eventDate = new Date(start);
  const now = new Date();
  return (
    eventDate.getFullYear() === now.getFullYear() &&
    eventDate.getMonth() === now.getMonth() &&
    eventDate.getDate() === now.getDate()
  );
}

function isUpcoming(event) {
  if (!event.end) return false;
  const now = new Date();
  // Use dateTime if available, otherwise treat as all-day event (end.date is exclusive per Google Calendar API)
  let end = event.end.dateTime || event.end.date;
  // If end is a date (all-day), treat as end of that day (23:59:59)
  if (end.length === 10) {
    end = new Date(end + 'T23:59:59');
  } else {
    end = new Date(end);
  }
  // If end is before now, event is not upcoming
  return end > now;
}

export default function UpcomingEvents() {
  const [calHover, setCalHover] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signedIn, setSignedIn] = useState(true); // assume signed in by default
  const [signingIn, setSigningIn] = useState(false);

  // Helper to check if we have a token
  async function checkSignedIn() {
    return new Promise((resolve) => {
      if (!window.chrome?.identity) return resolve(false);
      window.chrome.identity.getAuthToken({ interactive: false }, (token) => {
        resolve(!!token);
      });
    });
  }

  // Fetch events or check sign-in
  useEffect(() => {
    let cancelled = false;
    async function fetchEvents() {
      setLoading(true);
      setError(null);
      setEvents([]);
      if (!window.chrome?.identity) {
        setSignedIn(false);
        setEvents(SAMPLE_EVENTS);
        setLoading(false);
        return;
      }
      window.chrome.identity.getAuthToken(
        { interactive: false },
        async (token) => {
          if (!token) {
            setSignedIn(false);
            setEvents([]);
            setLoading(false);
            return;
          }
          setSignedIn(true);
          try {
            const now = new Date();
            const startOfDay = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              0,
              0,
              0,
              0
            ).toISOString();
            const endOfDay = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59,
              999
            ).toISOString();
            const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true&timeMin=${encodeURIComponent(
              startOfDay
            )}&timeMax=${encodeURIComponent(endOfDay)}`;
            const res = await fetch(url, {
              headers: { Authorization: 'Bearer ' + token },
            });
            if (!res.ok) throw new Error('Failed to fetch events');
            const data = await res.json();
            if (!cancelled) {
              if (data.items && data.items.length > 0) {
                setEvents(
                  data.items
                    .filter(isToday)
                    .filter(isUpcoming)
                    .map((ev) => ({
                      id: ev.id,
                      name: ev.summary || '(No title)',
                      time: formatEventTime(ev),
                      htmlLink: ev.htmlLink,
                    }))
                );
              } else {
                setEvents([]);
              }
              setLoading(false);
            }
          } catch (e) {
            if (!cancelled) {
              setError('Could not fetch events');
              setEvents([]);
              setLoading(false);
            }
          }
        }
      );
    }
    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, [signingIn]);

  // Sign in handler
  const handleSignIn = () => {
    setSigningIn(true);
    if (!window.chrome?.identity) return;
    window.chrome.identity.getAuthToken({ interactive: true }, (token) => {
      setSigningIn(false);
      if (token) {
        setSignedIn(true);
      }
    });
  };

  return (
    <div
      className="widget-card h-full w-full flex flex-col bg-white/80 rounded-[25px] p-4 shadow-sm relative"
      style={{ minWidth: 0 }}
    >
      {/* Top right button */}
      <a
        href="https://calendar.google.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 flex items-center justify-center"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: calHover
            ? 'rgba(95,190,146,0.22)'
            : 'rgba(95,190,146,0.12)',
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
          boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
          transition: 'background 0.5s',
          textDecoration: 'none',
        }}
        onMouseEnter={() => setCalHover(true)}
        onMouseLeave={() => setCalHover(false)}
        tabIndex={0}
        title="Open Google Calendar"
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
      <div
        className="text-[1.1rem] font-semibold text-[#2B2B2B] mb-3"
        style={{ letterSpacing: '-0.01em', fontFamily: 'Wix Madefor Display' }}
      >
        Upcoming
      </div>
      <div
        className="flex flex-col gap-3 flex-1 justify-start"
        style={{ flexGrow: 1 }}
      >
        {!signedIn ? (
          <div className="flex flex-col items-center justify-center flex-1 w-full h-full">
            <button
              type="button"
              onClick={handleSignIn}
              disabled={signingIn}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: '#F2F4F3',
                border: 'none',
                outline: 'none',
                cursor: signingIn ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
                filter: 'grayscale(1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
                transition: 'background 0.5s, filter 0.3s',
              }}
              title="Sign in with Google"
            >
              {/* Google G icon SVG */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g>
                  <path
                    d="M44.5 20H24V28.5H36.7C35.3 32.6 31.1 35.5 24 35.5C16.6 35.5 10.5 29.4 10.5 22C10.5 14.6 16.6 8.5 24 8.5C27.1 8.5 29.8 9.6 31.9 11.5L37.6 6.1C34.1 2.9 29.4 1 24 1C11.8 1 2 10.8 2 23C2 35.2 11.8 45 24 45C36.2 45 46 35.2 46 23C46 21.3 45.8 20.6 45.5 20Z"
                    fill="#E0E0E0"
                  />
                  <path
                    d="M6.3 14.7L12.7 19.2C14.5 15.2 18.8 12.5 24 12.5C27.1 12.5 29.8 13.6 31.9 15.5L37.6 10.1C34.1 6.9 29.4 5 24 5C16.6 5 10.5 11.1 10.5 18.5C10.5 19.2 10.6 19.9 10.7 20.6L6.3 14.7Z"
                    fill="#BDBDBD"
                  />
                  <path
                    d="M24 45C31.1 45 35.3 42.1 36.7 38H24V30.5H44.5C45.8 32.2 46 33.9 46 36C46 38.2 45.2 40.2 43.8 41.8L37.6 36.5C35.3 38.4 31.1 39.5 24 39.5C18.8 39.5 14.5 36.8 12.7 32.8L6.3 37.3C10.6 42.1 16.6 45 24 45Z"
                    fill="#9E9E9E"
                  />
                </g>
              </svg>
            </button>
            <div className="text-[#BDC8C2] text-sm -tracking-[0.025em] font-medium leading-tight text-center">
              Sign in with Google to see events.
            </div>
          </div>
        ) : loading ? (
          <div className="text-[#BDC8C2] text-base -tracking-[0.025em]">
            Loading events...
          </div>
        ) : error ? (
          <div className="text-[#E57373] text-base -tracking-[0.025em]">
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="text-[#BDC8C2] text-base -tracking-[0.025em] leading-tight">
            No upcoming events for today.
          </div>
        ) : (
          events.slice(0, 2).map((event) => (
            <a
              key={event.id}
              href={event.htmlLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-row items-start w-full hover:bg-[#eafaf3] rounded-lg transition-colors duration-150"
              style={{ textDecoration: 'none' }}
              title={event.name}
            >
              {/* Green vertical line */}
              <div
                style={{
                  width: 4,
                  minWidth: 4,
                  height: '100%',
                  background: '#5FBE92',
                  borderRadius: 0,
                  marginRight: 10,
                  marginLeft: 2,
                }}
              />
              {/* Event text */}
              <div className="flex flex-col min-w-0 w-full">
                <div
                  className="font-medium text-[#4F4F4F] text-sm leading-tight"
                  style={{
                    fontFamily: 'Wix Madefor Display',
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    letterSpacing: '-0.025em',
                  }}
                >
                  {event.name}
                </div>
                <div
                  className="text-sm text-[#7E8884] font-medium mt-0"
                  style={{
                    fontFamily: 'Wix Madefor Display',
                    letterSpacing: '-0.025em',
                  }}
                >
                  {event.time}
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
