'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled for Three.js 3D Car and WebGL2 GridScan
const Car3DViewer = dynamic(() => import('../components/Car3DViewer'), { ssr: false });
const GridScanLotMap = dynamic(() => import('../components/GridScanLotMap'), { ssr: false });

const CAR_COLORS = ['#c8102e', '#232a35', '#3d7a4a', '#8b93a1', '#e7cf78', '#f6f4ef'];

function renderCoverCarSvg(c) {
  return (
    <svg viewBox="0 0 44 22" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect x="1" y="2" width="42" height="18" rx="6.5" fill={c} stroke="rgba(20,23,28,.28)" strokeWidth=".7" />
      <rect x="11" y="4.5" width="18" height="13" rx="3.5" fill="#14171C" opacity=".9" />
      <path d="M29 5.2 35.5 8v6L29 16.8z" fill="#cfd9e6" />
      <path d="M12 5.2 7.5 8v6L12 16.8z" fill="#cfd9e6" opacity=".85" />
      <rect x="39.5" y="3.4" width="3.6" height="3.6" rx="1.2" fill="#fff6c0" />
      <rect x="39.5" y="15" width="3.6" height="3.6" rx="1.2" fill="#fff6c0" />
      <rect x="1" y="3.4" width="2.6" height="3.6" rx="1" fill="#ff8a96" />
      <rect x="1" y="15" width="2.6" height="3.6" rx="1" fill="#ff8a96" />
    </svg>
  );
}

export default function ParkFlowApp() {
  const [currentPage, setCurrentPage] = useState('cover'); // 'cover' | 'details' | 'map'
  const [wipeClass, setWipeClass] = useState('wipe');
  
  // User car configuration
  const [color, setColor] = useState(CAR_COLORS[0]);
  const [plate, setPlate] = useState('');
  const [passengers, setPassengers] = useState('2');
  const [plateError, setPlateError] = useState('');

  const dispRef = useRef(null);
  const turbRef = useRef(null);
  const boostRef = useRef(0);

  // Warp text liquid displacement loop for Ghania's Cover Page
  useEffect(() => {
    let animId;
    const t0 = performance.now();
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function warpLoop(now) {
      const t = (now - t0) / 1000;
      const intro = Math.max(0, 95 * Math.exp(-(t - 0.1) * 1.25));
      const idle = 3.2 + 1.6 * Math.sin(t * 1.4);
      boostRef.current *= 0.94;
      const amp = reduce ? 0 : t < 0.1 ? 95 : intro + idle + boostRef.current;

      if (dispRef.current) {
        dispRef.current.setAttribute('scale', amp.toFixed(2));
      }
      if (turbRef.current) {
        turbRef.current.setAttribute(
          'baseFrequency',
          (0.01 + 0.004 * Math.sin(t * 0.9)).toFixed(4) + ' ' + (0.045 + 0.01 * Math.cos(t * 0.7)).toFixed(4)
        );
      }
      animId = requestAnimationFrame(warpLoop);
    }

    animId = requestAnimationFrame(warpLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handlePageTransition = (targetPage) => {
    setWipeClass('wipe in');
    setTimeout(() => {
      setCurrentPage(targetPage);
      setWipeClass('wipe out');
      if (typeof window !== 'undefined') window.scrollTo(0, 0);
    }, 560);
    setTimeout(() => {
      setWipeClass('wipe');
    }, 1200);
  };

  const handlePlateChange = (e) => {
    const val = e.target.value.toUpperCase();
    setPlate(val);
    setPlateError('');
  };

  const handleProceedToSlot = (e) => {
    e.preventDefault();
    const cleanPlate = plate.trim().toUpperCase();
    if (!cleanPlate) {
      setPlateError('Enter your plate number.');
      return;
    }
    handlePageTransition('map');
  };

  return (
    <>
      {/* SVG Liquid Filter for Cover Page Header */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="warp" x="-15%" y="-40%" width="130%" height="180%">
          <feTurbulence
            ref={turbRef}
            id="turb"
            type="fractalNoise"
            baseFrequency="0.010 0.045"
            numOctaves="2"
            seed="4"
            result="n"
          />
          <feDisplacementMap
            ref={dispRef}
            id="disp"
            in="SourceGraphic"
            in2="n"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      {/* Shared Ambient Background */}
      <div className="bg">
        <div className="blob a" />
        <div className="blob b" />
      </div>

      {/* Top Brand Bar */}
      <div className="top">
        <div className="mark">
          <i>P</i>ParkFlow
        </div>
      </div>

      {/* ================= PAGE 1: GHANIA'S ORIGINAL COVER PAGE ================= */}
      <main className={`page cover ${currentPage === 'cover' ? 'on' : ''}`}>
        <div className="hero">
          <h1
            className="brand"
            aria-label="ParkFlow"
            onMouseEnter={() => {
              boostRef.current = 55;
            }}
            onClick={() => {
              boostRef.current = 80;
            }}
            style={{ cursor: 'pointer' }}
          >
            {'ParkFlow'.split('').map((ch, i) => (
              <span
                key={i}
                className={i >= 4 ? 'flow' : ''}
                style={{
                  animationDelay: `${0.35 + i * 0.09}s, ${1.5 + i * 0.18}s`,
                }}
              >
                {ch}
              </span>
            ))}
          </h1>

          <p className="sub">Parking Lot Slot Allocator</p>
          <div className="rule" />
          <p className="line">
            Skip the circling. <em>Your spot is already waiting</em>, and we&apos;ll show you the way there.
          </p>

          <div className="cta">
            <button className="btn" onClick={() => handlePageTransition('details')}>
              Enter car details
              <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>

        {/* Road Strip with Driving Car */}
        <div className="strip" aria-hidden="true">
          <div className="bays">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <i key={num} className={num === 5 ? 'mine' : ''}>
                <b>{String(num).padStart(2, '0')}</b>
              </i>
            ))}
          </div>
          <div className="road" />
          <div className="car" style={{ '--stop': 'calc(50vw - 48px)' }}>
            {renderCoverCarSvg('#FFFFFF')}
          </div>
        </div>
      </main>

      {/* ================= PAGE 2: UPDATED CAR DETAILS (WITH 3D VIEWER) ================= */}
      <section
        className={`page ${currentPage === 'details' ? 'on' : ''}`}
        style={{ paddingTop: 90, paddingBottom: 60 }}
      >
        <main style={{ maxWidth: 1040, margin: '0 auto', padding: '0 16px' }}>
          <div className="card split" style={{ overflow: 'hidden', borderRadius: 26, boxShadow: '0 18px 50px rgba(31,36,48,.14)' }}>
            {/* Form Column */}
            <div className="pad">
              <div className="steps">
                <span>Step 2 of 3</span>
                <i className="on" />
                <i className="on" />
                <i />
              </div>
              <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 30, margin: '10px 0 4px' }}>
                Your car
              </h3>
              <p className="sub" style={{ fontSize: 15, margin: '0 0 16px', color: 'var(--mu)' }}>
                Tell us about your visit. Next you will pick a slot.
              </p>

              <form onSubmit={handleProceedToSlot} noValidate>
                {/* Plate number */}
                <label className="f" htmlFor="vn">
                  Plate number *
                </label>
                <input
                  id="vn"
                  type="text"
                  placeholder="e.g. LEA-1234"
                  style={{ textTransform: 'uppercase' }}
                  maxLength={12}
                  value={plate}
                  onChange={handlePlateChange}
                  autoComplete="off"
                />

                {/* Passengers */}
                <div className="row" style={{ marginTop: 14 }}>
                  <div>
                    <label className="f" htmlFor="ps">
                      Passengers
                    </label>
                    <select
                      id="ps"
                      value={passengers}
                      onChange={(e) => setPassengers(e.target.value)}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5+">5+</option>
                    </select>
                  </div>
                </div>

                {/* Car Colour Swatches + Custom Picker */}
                <label className="f" style={{ marginTop: 14 }}>
                  Car colour
                </label>
                <div className="sw">
                  {CAR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      style={{ background: c }}
                      className={color.toLowerCase() === c.toLowerCase() ? 'on' : ''}
                      aria-label={`Car colour ${c}`}
                      onClick={() => setColor(c)}
                    />
                  ))}
                  <input
                    type="color"
                    id="vc"
                    value={color}
                    aria-label="Pick any colour"
                    onChange={(e) => setColor(e.target.value)}
                  />
                  <small>or pick any colour</small>
                </div>

                {/* Error message */}
                <div className="err" style={{ minHeight: 22, marginTop: 10, color: 'var(--er)', fontWeight: 600 }}>
                  {plateError}
                </div>

                {/* Actions */}
                <div className="acts">
                  <button
                    type="button"
                    className="btn o"
                    onClick={() => handlePageTransition('cover')}
                  >
                    Back
                  </button>
                  <button type="submit" className="btn">
                    Choose my slot &rarr;
                  </button>
                </div>
              </form>
            </div>

            {/* 3D Car Preview Column */}
            <div className="pv">
              <div className="slot-preview">
                <Car3DViewer color={color} />
              </div>
              <div className="plate" id="pvp">
                {plate.trim().toUpperCase() || 'PLATE'}
              </div>
            </div>
          </div>
        </main>
      </section>

      {/* ================= PAGE 3: PARKING MAP & GUIDANCE ================= */}
      {currentPage === 'map' && (
        <GridScanLotMap
          userCar={{
            plate: plate.trim().toUpperCase() || 'LEA-1234',
            color,
            passengers,
          }}
          onBack={() => handlePageTransition('details')}
        />
      )}

      {/* Wipe Screen Transition */}
      <div className={wipeClass} />
    </>
  );
}
