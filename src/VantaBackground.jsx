import React, { useRef, useEffect } from 'react';

const VANTA_THREE_SRC = chrome.runtime.getURL('three.min.js');
const VANTA_FOG_SRC = chrome.runtime.getURL('vanta.fog.min.js');

export default function VantaBackground() {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

    let isMounted = true;

    // Load three.js first, then Vanta
    loadScript(VANTA_THREE_SRC)
      .then(() => {
        // Ensure THREE is on window
        if (!window.THREE && window.exports && window.exports.THREE) {
          window.THREE = window.exports.THREE;
        }
        return loadScript(VANTA_FOG_SRC);
      })
      .then(() => {
        if (
          window.VANTA &&
          window.VANTA.FOG &&
          vantaRef.current &&
          isMounted &&
          window.THREE
        ) {
          vantaEffect.current = window.VANTA.FOG({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            highlightColor: 0xf0f0f0,
            midtoneColor: 0x909b8f,
            lowlightColor: 0x99c0a4,
            baseColor: 0xf2f2f2,
          });
        }
      });

    return () => {
      isMounted = false;
      if (vantaEffect.current) vantaEffect.current.destroy();
    };
  }, []);

  return (
    <>
      {/* Fallback solid background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -2,
          width: '100vw',
          height: '100vh',
          background: '#E2E5E4',
        }}
      />
      {/* Vanta effect background */}
      <div
        ref={vantaRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
        }}
      />
    </>
  );
}
