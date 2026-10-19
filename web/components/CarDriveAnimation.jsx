'use client';

import React, { useEffect, useState, useRef } from 'react';
import { getSlotInfo, getPathToSlot } from '../lib/layout';

export default function CarDriveAnimation({
  slotNumber = 1,
  carColor = '#722F37',
  plate = 'ABC-123',
  onComplete
}) {
  const [progress, setProgress] = useState(0); // 0 to 1
  const [statusText, setStatusText] = useState('Gate Opening...');
  const [barrierOpen, setBarrierOpen] = useState(false);
  const animRef = useRef(null);
  const startTimeRef = useRef(null);
  const duration = 4000; // 4 seconds total smooth drive

  const slotInfo = getSlotInfo(slotNumber);

  useEffect(() => {
    // Lift barrier after 400ms
    const barrierTimer = setTimeout(() => {
      setBarrierOpen(true);
      setStatusText('Gate open. Entering parking lot...');
    }, 400);

    const animate = (time) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);

      if (p < 0.25) {
        setStatusText('Passing entrance gate onto Main Road...');
      } else if (p < 0.6) {
        setStatusText(`Navigating down Main Road towards Aisle ${slotInfo.band + 1}...`);
      } else if (p < 0.85) {
        setStatusText(`Turning into Drive Aisle ${slotInfo.band + 1}...`);
      } else if (p < 0.99) {
        setStatusText(`Parking smoothly into Bay #${slotNumber}...`);
      } else {
        setStatusText(`Successfully parked in Slot #${slotNumber}!`);
      }

      if (p < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        // Completed
        const endTimer = setTimeout(() => {
          onComplete?.();
        }, 600);
        return () => clearTimeout(endTimer);
      }
    };

    const startAnimTimer = setTimeout(() => {
      animRef.current = requestAnimationFrame(animate);
    }, 600);

    return () => {
      clearTimeout(barrierTimer);
      clearTimeout(startAnimTimer);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [slotNumber, onComplete, duration, slotInfo.band]);

  const handleSkip = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setProgress(1);
    onComplete?.();
  };

  // Dimensions of the animation stage
  const STAGE_WIDTH = 700;
  const STAGE_HEIGHT = 440;

  // Waypoints from layout
  const waypoints = getPathToSlot(slotNumber, STAGE_WIDTH, STAGE_HEIGHT);
  const p0 = waypoints[0]; // Gate
  const p1 = waypoints[1]; // Road at Aisle
  const p2 = waypoints[2]; // Aisle at Slot Col
  const p3 = waypoints[3]; // Inside Slot

  // Multi-segment interpolation for vehicle (x, y, angle)
  let carX = p0.x;
  let carY = p0.y;
  let carAngle = 90; // Facing down initially

  if (progress < 0.35) {
    // Segment 1: p0 -> p1
    const t = progress / 0.35;
    carX = p0.x;
    carY = p0.y + (p1.y - p0.y) * t;
    carAngle = 90;
  } else if (progress < 0.75) {
    // Segment 2: p1 -> p2
    const t = (progress - 0.35) / 0.4;
    carX = p1.x + (p2.x - p1.x) * t;
    carY = p1.y;
    carAngle = 0; // Facing right down the aisle
  } else {
    // Segment 3: p2 -> p3 (turn into slot)
    const t = (progress - 0.75) / 0.25;
    carX = p2.x;
    carY = p2.y + (p3.y - p2.y) * t;
    carAngle = slotInfo.position === 0 ? -90 : 90; // Up or Down into slot
  }

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#FFFFFF',
      borderRadius: '20px',
      border: '1.5px solid #E8DCC6',
      padding: '28px',
      boxShadow: '0 12px 40px rgba(114, 47, 55, 0.06)'
    }}>
      {/* Animation Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#337046',
              display: 'inline-block'
            }} />
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#722F37' }}>
              Autonomous Bay Routing Simulation
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: '#8E7E76', marginTop: '2px' }}>
            Guiding vehicle {plate} to designated Slot #{slotNumber} ({slotInfo.distanceFromEntrance}m from entrance)
          </p>
        </div>

        <button
          onClick={handleSkip}
          style={{
            backgroundColor: '#E8DCC6',
            color: '#722F37',
            border: '1px solid #B7A89A',
            padding: '8px 18px',
            borderRadius: '10px',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          Skip Animation ⏭
        </button>
      </div>

      {/* SVG Animation Arena */}
      <div style={{
        backgroundColor: '#F8F5F0',
        borderRadius: '16px',
        border: '1.5px solid #E8DCC6',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <svg
          viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          {/* Background Grid */}
          <defs>
            <pattern id="roadHatch" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 0 10 L 20 10" stroke="#E2DACD" strokeWidth="1" strokeDasharray="3,3" />
            </pattern>
          </defs>

          {/* Road Lane */}
          <rect
            x={STAGE_WIDTH * 0.03}
            y="10"
            width={STAGE_WIDTH * 0.12}
            height={STAGE_HEIGHT - 20}
            rx="10"
            fill="#EAE3D5"
            stroke="#D8CABA"
            strokeWidth="1.5"
          />

          {/* Road Central Line */}
          <line
            x1={STAGE_WIDTH * 0.09}
            y1="30"
            x2={STAGE_WIDTH * 0.09}
            y2={STAGE_HEIGHT - 30}
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeDasharray="8,8"
          />

          {/* Drive Aisles (5 Bands) */}
          {[0, 1, 2, 3, 4].map((b) => {
            const bh = (STAGE_HEIGHT - 60) / 5;
            const ay = 40 + b * bh + bh * 0.5;
            const isTargetAisle = b === slotInfo.band;

            return (
              <g key={b}>
                <rect
                  x={STAGE_WIDTH * 0.14}
                  y={ay - 14}
                  width={STAGE_WIDTH * 0.82}
                  height="28"
                  rx="6"
                  fill={isTargetAisle ? '#F3EDE4' : '#F9F6F0'}
                  stroke={isTargetAisle ? '#722F37' : '#E8DCC6'}
                  strokeWidth={isTargetAisle ? '1.5' : '1'}
                  strokeDasharray={isTargetAisle ? 'none' : '4,4'}
                />
                <text
                  x={STAGE_WIDTH * 0.18}
                  y={ay + 4}
                  fill="#8E7E76"
                  fontSize="10"
                  fontWeight="bold"
                >
                  Aisle {b + 1}
                </text>
              </g>
            );
          })}

          {/* Target Slot Destination Bay */}
          <rect
            x={p3.x - 22}
            y={p3.y - 18}
            width="44"
            height="36"
            rx="6"
            fill="#FFF5DD"
            stroke="#722F37"
            strokeWidth="2.5"
          />
          <text
            x={p3.x}
            y={p3.y + 4}
            textAnchor="middle"
            fill="#722F37"
            fontSize="12"
            fontWeight="bold"
          >
            #{slotNumber}
          </text>

          {/* Entrance Barrier Arm */}
          <g transform={`translate(${STAGE_WIDTH * 0.03 + 5}, 35)`}>
            <rect x="0" y="0" width="8" height="16" fill="#722F37" rx="2" />
            <line
              x1="4"
              y1="4"
              x2={barrierOpen ? "8" : "55"}
              y2={barrierOpen ? "-35" : "4"}
              stroke="#D32F2F"
              strokeWidth="4"
              strokeDasharray="6,4"
              style={{ transition: 'all 0.5s ease-in-out' }}
            />
          </g>

          {/* Driven Path Breadcrumb Line */}
          <path
            d={`M ${p0.x} ${p0.y} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`}
            fill="none"
            stroke="#722F37"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.35"
          />

          {/* Animated Driving Car */}
          <g
            transform={`translate(${carX}, ${carY}) rotate(${carAngle})`}
            style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))' }}
          >
            {/* Tires */}
            <rect x="-16" y="-12" width="6" height="5" rx="1" fill="#1E1E1E" />
            <rect x="10" y="-12" width="6" height="5" rx="1" fill="#1E1E1E" />
            <rect x="-16" y="7" width="6" height="5" rx="1" fill="#1E1E1E" />
            <rect x="10" y="7" width="6" height="5" rx="1" fill="#1E1E1E" />

            {/* Chassis Body */}
            <rect x="-20" y="-10" width="40" height="20" rx="6" fill={carColor} stroke="#222" strokeWidth="1" />

            {/* Windshields */}
            <path d="M -8 -8 L -2 -8 L -4 8 L -8 8 Z" fill="#2B3A42" opacity="0.8" />
            <path d="M 6 -8 L 12 -8 L 10 8 L 6 8 Z" fill="#2B3A42" opacity="0.8" />

            {/* Roof */}
            <rect x="-4" y="-7" width="10" height="14" rx="2" fill="#FFFFFF" opacity="0.2" />

            {/* Headlights (Glow Beams) */}
            <polygon points="20,-8 45,-16 45,-2 20,-5" fill="#FFF9C4" opacity="0.35" />
            <polygon points="20,8 45,16 45,2 20,5" fill="#FFF9C4" opacity="0.35" />
            <circle cx="20" cy="-6" r="2" fill="#FFFF77" />
            <circle cx="20" cy="6" r="2" fill="#FFFF77" />
          </g>
        </svg>
      </div>

      {/* Progress & Live Guidance Telemetry */}
      <div style={{ marginTop: '20px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          fontSize: '13px'
        }}>
          <span style={{ fontWeight: 'bold', color: '#722F37' }}>
            {statusText}
          </span>
          <span style={{ fontWeight: 'bold', color: '#8E7E76' }}>
            {Math.round(progress * 100)}%
          </span>
        </div>

        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#E8DCC6',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress * 100}%`,
            height: '100%',
            backgroundColor: '#722F37',
            borderRadius: '4px',
            transition: 'width 0.1s linear'
          }} />
        </div>
      </div>
    </div>
  );
}
