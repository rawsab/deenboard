import React, { useEffect, useState } from 'react';
import compassImg from '../../../assets/img/widget_bg/compass.png';
import pointerSvg from '../../../assets/img/icons/pointer.svg';
import kaabaSvg from '../../../assets/img/icons/kaaba.svg';

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

// Radius for the Kaaba icon (in px, from center)
const KAABA_RADIUS = 65;

// Calculate Qibla direction (initial bearing from lat1/lon1 to lat2/lon2)
function getQiblaAngle(lat, lon) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;
  const dLon = toRad(KAABA_LON - lon);
  const lat1 = toRad(lat);
  const lat2 = toRad(KAABA_LAT);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  let brng = Math.atan2(y, x);
  brng = toDeg(brng);
  return (brng + 360) % 360; // in degrees, relative to north
}

const QiblaDirection = () => {
  const [angle, setAngle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayAngle, setDisplayAngle] = useState(0);
  const [kaabaVisible, setKaabaVisible] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const qibla = getQiblaAngle(latitude, longitude);
        setAngle(qibla);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
  }, []);

  // Animate the pointer from 0 to the correct angle
  useEffect(() => {
    if (angle !== null && !loading && !error) {
      let start = null;
      const duration = 1200; // ms
      const initial = 0;
      const target = angle;
      function animate(ts) {
        if (!start) start = ts;
        const elapsed = ts - start;
        const progress = Math.min(elapsed / duration, 1);
        const current = initial + (target - initial) * progress;
        setDisplayAngle(current);
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayAngle(target);
        }
      }
      setDisplayAngle(0);
      requestAnimationFrame(animate);
      setKaabaVisible(false);
      setTimeout(() => setKaabaVisible(true), duration - 200); // fade in near end of pointer animation
    }
  }, [angle, loading, error]);

  // Calculate Kaaba icon position on the circle
  const center = 85; // px
  const rad = (angle ?? 0) * (Math.PI / 180);
  const kaabaX = center + KAABA_RADIUS * Math.sin(rad) - 23;
  const kaabaY = center - KAABA_RADIUS * Math.cos(rad) - 26;

  return (
    <div
      className="w-full h-full min-h-[170px] min-w-[170px] rounded-[25px] bg-white flex flex-col items-center justify-center relative overflow-hidden"
      style={{ fontFamily: 'Wix Madefor Display', padding: 0 }}
    >
      {/* Compass background */}
      <div
        className="absolute left-1/2 top-1/2 flex items-center justify-center"
        style={{
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          width: 140,
          height: 140,
        }}
      >
        <img
          src={compassImg}
          alt="Compass"
          className="object-contain opacity-60 pointer-events-none select-none"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
        {/* Kaaba icon on invisible circle */}
        {angle !== null && !loading && !error && (
          <img
            src={kaabaSvg}
            alt="Kaaba"
            style={{
              position: 'absolute',
              left: kaabaX,
              top: kaabaY,
              width: 'auto',
              height: 20,
              zIndex: 3,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 2px 6px #0002)',
              opacity: kaabaVisible ? 1 : 0,
              transition: 'opacity 0.7s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        )}
      </div>
      {/* Pointer */}
      <div
        className="absolute left-1/2 top-1/2 flex items-center justify-center"
        style={{
          transform: `translate(-50%, -50%) rotate(${displayAngle}deg)`,
          zIndex: 2,
          height: '100%',
          width: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 1.2s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <img
          src={pointerSvg}
          alt="Qibla Pointer"
          style={{ height: '110px', width: 'auto', display: 'block' }}
        />
      </div>
      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center mt-[130px]">
        {loading ? (
          <div className="text-gray-500 text-lg mt-2 -mb-1">Loading...</div>
        ) : null}
      </div>
    </div>
  );
};
export default QiblaDirection;
