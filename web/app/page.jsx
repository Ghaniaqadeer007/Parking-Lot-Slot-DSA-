'use client';

import React, { useState, useEffect, useRef } from 'react';

const COLS = ['#FFFFFF', '#242831', '#3E6F4B', '#8E95A1', '#F7DF94', '#14171C'];

function renderCarSvg(c) {
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
  const [currentPage, setCurrentPage] = useState('cover'); // 'cover' or 'details'
  const [wipeClass, setWipeClass] = useState('wipe');
  const [color, setColor] = useState(COLS[0]);
  const [plate, setPlate] = useState('');
  const [owner, setOwner] = useState('');
  const [phone, setPhone] = useState('');
  const [plateError, setPlateError] = useState('');
  const [ownerError, setOwnerError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastOn, setToastOn] = useState(false);

  const dispRef = useRef(null);
  const turbRef = useRef(null);
  const boostRef = useRef(0);
  const toastTimeoutRef = useRef(null);

  // Warp text liquid displacement loop
  useEffect(() => {
    let animId;
    const t0 = performance.now();
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function warpLoop(now) {
      const t = (now - t0) / 1000;
      const intro = Math.max(0, 95 * Math.exp(-(t - 0.1) * 1.25));
      const idle = 3.2 + 1.6 * Math.sin(t * 1.4);
      boostRef.current *= 0.94;
      const amp = reduce ? 0 : (t < 0.1 ? 95 : intro + idle + boostRef.current);

      if (dispRef.current) {
        dispRef.current.setAttribute('scale', amp.toFixed(2));
      }
      if (turbRef.current) {
        turbRef.current.setAttribute(
          'baseFrequency',
          (0.010 + 0.004 * Math.sin(t * 0.9)).toFixed(4) + ' ' + (0.045 + 0.01 * Math.cos(t * 0.7)).toFixed(4)
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
    }, 560);
    setTimeout(() => {
      setWipeClass('wipe');
    }, 1200);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastOn(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastOn(false);
    }, 2600);
  };

  const handlePlateChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9 -]/g, '');
    setPlate(val);
    setPlateError('');
  };

  const handleOwnerChange = (e) => {
    setOwner(e.target.value);
    setOwnerError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let ok = true;
    const p = plate.trim();
    const PL = /^[A-Z0-9][A-Z0-9 -]{1,8}[A-Z0-9]$/;

    if (!PL.test(p)) {
      setPlateError('Enter a plate with 3 to 10 letters or numbers.');
      ok = false;
    }
    if (owner.trim().length < 2) {
      setOwnerError('Please enter the owner name.');
      ok = false;
    }
    if (!ok) return;

    try {
      sessionStorage.setItem('parkflow_car', JSON.stringify({
        plate: p,
        owner: owner.trim(),
        phone: phone.trim(),
        colour: color
      }));
    } catch (_) {}

    showToast('Saved. Next page: choose your slot (not built in this sample).');
  };

  return (
    <>
      {/* SVG Liquid Filter */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="warp" x="-15%" y="-40%" width="130%" height="180%">
          <feTurbulence ref={turbRef} id="turb" type="fractalNoise" baseFrequency="0.010 0.045" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap ref={dispRef} id="disp" in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Shared Background */}
      <div className="bg">
        <div className="blob a" />
        <div className="blob b" />
      </div>

      {/* Top Bar */}
      <div className="top">
        <div className="mark">
          <i>P</i>ParkFlow
        </div>
      </div>

      {/* ================= COVER PAGE ================= */}
      <main className={`page cover ${currentPage === 'cover' ? 'on' : ''}`}>
        <div className="hero">
          <div className="kicker">
            <b />Smart parking, simplified
          </div>

          <h1
            className="brand"
            aria-label="ParkFlow"
            onMouseEnter={() => { boostRef.current = 55; }}
            onClick={() => { boostRef.current = 80; }}
            style={{ cursor: 'pointer' }}
          >
            {'ParkFlow'.split('').map((ch, i) => (
              <span
                key={i}
                className={i >= 4 ? 'flow' : ''}
                style={{
                  animationDelay: `${0.35 + i * 0.09}s, ${1.5 + i * 0.18}s`
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
            {renderCarSvg('#FFFFFF')}
          </div>
        </div>
      </main>

      {/* ================= CAR DETAILS PAGE ================= */}
      <section className={`page details ${currentPage === 'details' ? 'on' : ''}`}>
        <div className="card">
          <form className="form" onSubmit={handleSubmit} noValidate>
            <div className="step">
              Step 1 of 4 <span className="dots"><i className="on" /><i /><i /><i /></span>
            </div>
            <h2>Your car</h2>
            <p className="hint">Tell us about your car. Next you will pick a slot.</p>

            <div className="f">
              <label htmlFor="plate">Plate number *</label>
              <input
                type="text"
                id="plate"
                value={plate}
                onChange={handlePlateChange}
                placeholder="e.g. LEA-101"
                maxLength={12}
                autoComplete="off"
                className={plateError ? 'bad' : ''}
              />
              {plateError && <div className="err">{plateError}</div>}
            </div>

            <div className="f">
              <label htmlFor="owner">Owner name *</label>
              <input
                type="text"
                id="owner"
                value={owner}
                onChange={handleOwnerChange}
                placeholder="e.g. Ali Raza"
                maxLength={40}
                autoComplete="off"
                className={ownerError ? 'bad' : ''}
              />
              {ownerError && <div className="err">{ownerError}</div>}
            </div>

            <div className="f">
              <label htmlFor="phone">Phone (optional)</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0300 1234567"
                maxLength={16}
                autoComplete="off"
              />
            </div>

            <div className="f">
              <label>Car colour</label>
              <div className="sw">
                {COLS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    style={{ background: c }}
                    title={c}
                    aria-label={`Colour ${c}`}
                    className={color === c ? 'on' : ''}
                    onClick={() => setColor(c)}
                  />
                ))}

                <button
                  type="button"
                  className={`custom ${!COLS.includes(color) ? 'on' : ''}`}
                  title="Custom colour"
                  aria-label="Custom colour"
                >
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </button>
                <small>or pick any colour</small>
              </div>
            </div>

            <div className="actions">
              <button
                type="button"
                className="btn ghost"
                onClick={() => handlePageTransition('cover')}
              >
                Back
              </button>
              <button type="submit" className="btn">
                Choose my slot
                <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>
          </form>

          <aside className="side" aria-label="Car preview">
            <div className="bay">
              {renderCarSvg(color)}
            </div>
            <div className="cap">
              <span className="plate">{plate || 'YOUR PLATE'}</span>
              <div className="own">{owner}</div>
            </div>
          </aside>
        </div>
      </section>

      {/* Wipe Screen Transition */}
      <div className={wipeClass} />

      {/* Toast Notification */}
      <div className={`toast ${toastOn ? 'on' : ''}`}>
        {toastMessage}
      </div>
    </>
  );
}
