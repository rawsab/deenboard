import React, { useState, useRef, useEffect } from 'react';

// Gradient color stops matching the actual bar
const GRADIENT_STOPS = [
  { stop: 0, color: '#236D46' },
  { stop: 0.16, color: '#23696F' },
  { stop: 0.33, color: '#4E5F8A' },
  { stop: 0.5, color: '#8C4D72' },
  { stop: 0.66, color: '#82563C' },
  { stop: 0.83, color: '#715D31' },
  { stop: 1, color: '#64602B' },
];

function lerpColor(a, b, t) {
  const ah = a.replace('#', '');
  const bh = b.replace('#', '');
  const ar = parseInt(ah.substring(0, 2), 16);
  const ag = parseInt(ah.substring(2, 4), 16);
  const ab = parseInt(ah.substring(4, 6), 16);
  const br = parseInt(bh.substring(0, 2), 16);
  const bg = parseInt(bh.substring(2, 4), 16);
  const bb = parseInt(bh.substring(4, 6), 16);
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `rgb(${rr},${rg},${rb})`;
}

function getColorAt(percent) {
  for (let i = 1; i < GRADIENT_STOPS.length; ++i) {
    if (percent <= GRADIENT_STOPS[i].stop) {
      const prev = GRADIENT_STOPS[i - 1];
      const t = (percent - prev.stop) / (GRADIENT_STOPS[i].stop - prev.stop);
      return lerpColor(prev.color, GRADIENT_STOPS[i].color, t);
    }
  }
  return GRADIENT_STOPS[GRADIENT_STOPS.length - 1].color;
}

const GRADIENT_CSS =
  'linear-gradient(90deg, #236D46 0%, #23696F 16%, #4E5F8A 33%, #8C4D72 50%, #82563C 66%, #715D31 83%, #64602B 100%)';

const CIRCLE_SIZE = 22;
const BORDER_SIZE = 2;
const OUTER_SIZE = CIRCLE_SIZE + 2 * BORDER_SIZE + 8;
const RECT_WIDTH = 240;
const RECT_HEIGHT = 18;
const SELECTOR_RADIUS = 12;

export default function ColorChanger({ onColorChange, initialPercent = 0 }) {
  const [open, setOpen] = useState(false);
  const [percent, setPercent] = useState(initialPercent); // 0-1
  const [morphingBack, setMorphingBack] = useState(false);
  const [morphOrigin, setMorphOrigin] = useState({ left: 0, top: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef(null);
  const rectRef = useRef(null);

  // Call onColorChange when percent changes
  useEffect(() => {
    if (onColorChange) onColorChange(percent);
  }, [percent, onColorChange]);

  // Fade in effect on mount
  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        // Get selector position before closing
        if (rectRef.current) {
          const rect = rectRef.current.getBoundingClientRect();
          const left = rect.left + percent * rect.width - SELECTOR_RADIUS;
          const top = rect.top + rect.height / 2 - SELECTOR_RADIUS;
          setMorphOrigin({ left, top });
          setMorphingBack(true);
        }
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
    // eslint-disable-next-line
  }, [open, percent]);

  // After morphingBack, reset after animation
  useEffect(() => {
    if (!morphingBack) return;
    const timeout = setTimeout(() => setMorphingBack(false), 400);
    return () => clearTimeout(timeout);
  }, [morphingBack]);

  // Handle click/drag on gradient
  const handleRectClick = (e) => {
    const rect = rectRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let p = x / rect.width;
    p = Math.max(0, Math.min(1, p));
    setPercent(p);
  };
  const handleDrag = (e) => {
    if (!open) return;
    if (e.type === 'touchmove') {
      handleRectClick(e.touches[0]);
    } else {
      handleRectClick(e);
    }
  };
  const handleMouseDown = (e) => {
    handleRectClick(e);
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleMouseUp);
  };
  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleDrag);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  // Color at current percent
  const color = getColorAt(percent);

  // Animation: interpolate between circle and bar
  const style = open
    ? {
        width: RECT_WIDTH,
        height: RECT_HEIGHT,
        borderRadius: RECT_HEIGHT / 2,
        background: GRADIENT_CSS,
        border: '2px solid rgba(255,255,255,0.7)',
        marginTop: 7,
        marginRight: 7,
        boxShadow: '0 2px 16px 0 rgba(0,0,0,0.10)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        padding: 0,
        transition:
          'width 0.35s cubic-bezier(.7,0,.3,1), height 0.35s cubic-bezier(.7,0,.3,1), border-radius 0.35s cubic-bezier(.7,0,.3,1), background 0.35s cubic-bezier(.7,0,.3,1)',
      }
    : {
        width: OUTER_SIZE,
        height: OUTER_SIZE,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.15)',
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        transition:
          'width 0.35s cubic-bezier(.7,0,.3,1), height 0.35s cubic-bezier(.7,0,.3,1), border-radius 0.35s cubic-bezier(.7,0,.3,1), background 0.35s cubic-bezier(.7,0,.3,1)',
      };

  // Morph-back circle style
  const morphCircleStyle = morphingBack
    ? {
        position: 'fixed',
        left: morphOrigin.left,
        top: morphOrigin.top,
        width: CIRCLE_SIZE + 2 * BORDER_SIZE,
        height: CIRCLE_SIZE + 2 * BORDER_SIZE,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        pointerEvents: 'none',
        transition:
          'left 0.4s cubic-bezier(.7,0,.3,1), top 0.4s cubic-bezier(.7,0,.3,1)',
      }
    : {};

  const morphInnerStyle = morphingBack
    ? {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: '50%',
        background: color,
        border: '2px solid transparent',
        boxShadow: '0 0 0 4px rgba(255,255,255,0)',
        transition: 'background 0.35s',
      }
    : {};

  // When morphingBack, animate to top:16,right:16
  useEffect(() => {
    if (!morphingBack) return;
    // Next tick, set left/top to top-right
    requestAnimationFrame(() => {
      setMorphOrigin({
        left: window.innerWidth - 12 - OUTER_SIZE,
        top: 20,
      });
    });
  }, [morphingBack]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 50,
        userSelect: 'none',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
      }}
      ref={wrapperRef}
    >
      {/* Morph-back animation circle */}
      {morphingBack && (
        <div style={morphCircleStyle}>
          <div style={morphInnerStyle} />
        </div>
      )}
      {/* Main widget */}
      {!morphingBack && (
        <div
          style={style}
          onClick={() => {
            if (!open) setOpen(true);
          }}
          ref={open ? rectRef : null}
          onMouseDown={open ? handleMouseDown : undefined}
          onTouchStart={open ? (e) => handleRectClick(e.touches[0]) : undefined}
          onTouchMove={open ? handleDrag : undefined}
        >
          {/* Circle content (when closed) */}
          {!open && (
            <div
              style={{
                width: CIRCLE_SIZE + 2 * BORDER_SIZE,
                height: CIRCLE_SIZE + 2 * BORDER_SIZE,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.35s',
              }}
            >
              <div
                style={{
                  width: CIRCLE_SIZE,
                  height: CIRCLE_SIZE,
                  borderRadius: '50%',
                  background: color,
                  border: '2px solid transparent',
                  boxShadow: '0 0 0 4px rgba(255,255,255,0)',
                  transition: 'background 0.35s',
                }}
              />
            </div>
          )}
          {/* Gradient content (when open) */}
          {open && (
            <>
              {/* Selector circle */}
              <div
                style={{
                  position: 'absolute',
                  left: `calc(${percent * 100}% - ${SELECTOR_RADIUS}px)`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: SELECTOR_RADIUS * 2,
                  height: SELECTOR_RADIUS * 2,
                  borderRadius: '50%',
                  background: color,
                  border: '2px solid #fff',
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                  transition: 'left 0.2s',
                  pointerEvents: 'none',
                }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
