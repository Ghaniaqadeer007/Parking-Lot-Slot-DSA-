'use client';

import React, { useState } from 'react';
import { TOTAL_SLOTS, COLUMNS, ROWS, getSlotInfo } from '../lib/layout';

export default function LotMap2D({
  slotBookings = [],
  activeHolds = [],
  recommendedSlot = null,
  selectedSlot = null,
  highlightSlot = null,
  onSelectSlot,
  viewMode = '2D', // '2D' or '3D'
  onToggleViewMode
}) {
  const [hoveredSlot, setHoveredSlot] = useState(null);

  // Quick lookup maps
  const bookingMap = new Map();
  slotBookings.forEach((b) => {
    if (b && b.slotNumber) bookingMap.set(b.slotNumber, b);
  });

  const holdMap = new Map();
  activeHolds.forEach((h) => {
    if (h && h.slotNumber) holdMap.set(h.slotNumber, h);
  });

  // 5 bands of 2 rows each
  const bands = [0, 1, 2, 3, 4];

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#FFFFFF',
      borderRadius: '20px',
      border: '1.5px solid #E8DCC6',
      padding: '24px',
      boxShadow: '0 8px 30px rgba(114, 47, 55, 0.05)',
      overflow: 'hidden'
    }}>
      {/* Map Header & View Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#337046'
          }} />
          <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#722F37' }}>
            Interactive Garage Map (100 Slots)
          </span>
          <span style={{ fontSize: '12px', color: '#8E7E76' }}>
            Slot 1 (Entrance) → Slot 100 (Farthest)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onToggleViewMode && (
            <div style={{
              display: 'flex',
              backgroundColor: '#F3EDE4',
              borderRadius: '10px',
              padding: '3px',
              border: '1px solid #E8DCC6'
            }}>
              <button
                type="button"
                onClick={() => onToggleViewMode('2D')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: viewMode === '2D' ? '#722F37' : 'transparent',
                  color: viewMode === '2D' ? '#FFFFFF' : '#722F37',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                📐 2D Layout
              </button>
              <button
                type="button"
                onClick={() => onToggleViewMode('3D')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: viewMode === '3D' ? '#722F37' : 'transparent',
                  color: viewMode === '3D' ? '#FFFFFF' : '#722F37',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🧊 3D Perspective
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        padding: '10px 16px',
        backgroundColor: '#FAF7F2',
        borderRadius: '10px',
        marginBottom: '20px',
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#5D4F4B',
        border: '1px solid #E8DCC6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#EAFAF3', border: '1px solid #BFEEDB' }} />
          <span>Free Slot</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#FFF5DD', border: '1.5px solid #F9D98B' }} />
          <span>Recommended (Min-Heap Root) ✦</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '4px', border: '2.5px solid #722F37', backgroundColor: '#FFFFFF' }} />
          <span>Your Selected Slot</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#F3EDE4', border: '1px solid #D8CABA' }} />
          <span>Taken / Occupied</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '14px',
            height: '14px',
            borderRadius: '4px',
            background: 'repeating-linear-gradient(45deg, #FFF9E6, #FFF9E6 3px, #FCE3B4 3px, #FCE3B4 6px)',
            border: '1px solid #E4B875'
          }} />
          <span>120s Hold Reservation</span>
        </div>
      </div>

      {/* Map Layout Container */}
      <div style={{
        transform: viewMode === '3D'
          ? 'perspective(1200px) rotateX(24deg) rotateZ(-3deg) scale(0.97)'
          : 'none',
        transformOrigin: 'center center',
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: viewMode === '3D' ? '0 30px 60px rgba(0,0,0,0.12)' : 'none',
        backgroundColor: '#F8F5F0',
        borderRadius: '16px',
        padding: '16px',
        border: '1.5px solid #E8DCC6',
        position: 'relative'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '14px' }}>
          {/* Main Road Lane on the Left */}
          <div style={{
            backgroundColor: '#EAE4D9',
            borderRadius: '10px',
            border: '1.5px dashed #B7A89A',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 6px',
            position: 'relative'
          }}>
            {/* Entrance Gate */}
            <div style={{
              backgroundColor: '#337046',
              color: '#FFFFFF',
              borderRadius: '6px',
              padding: '6px 4px',
              fontSize: '10px',
              fontWeight: 'bold',
              textAlign: 'center',
              width: '100%',
              boxShadow: '0 2px 6px rgba(51, 112, 70, 0.3)'
            }}>
              🟢 IN<br />GATE
            </div>

            <div style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#722F37',
              letterSpacing: '0.2em'
            }}>
              ⬇ MAIN ROAD LANE ⬇
            </div>

            {/* Exit Gate */}
            <div style={{
              backgroundColor: '#722F37',
              color: '#FFFFFF',
              borderRadius: '6px',
              padding: '6px 4px',
              fontSize: '10px',
              fontWeight: 'bold',
              textAlign: 'center',
              width: '100%',
              boxShadow: '0 2px 6px rgba(114, 47, 55, 0.3)'
            }}>
              🔴 OUT<br />GATE
            </div>
          </div>

          {/* 5 Drive Aisle Bands */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bands.map((bandIdx) => {
              const rowTop = bandIdx * 2;
              const rowBottom = bandIdx * 2 + 1;

              return (
                <div key={bandIdx} style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E8DCC6',
                  padding: '10px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}>
                  {/* Top Row of Slots (10 Slots) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '6px' }}>
                    {Array.from({ length: 10 }).map((_, col) => {
                      const slotNum = rowTop * 10 + col + 1;
                      return renderSlot(slotNum);
                    })}
                  </div>

                  {/* Central Drive Aisle */}
                  <div style={{
                    margin: '6px 0',
                    height: '24px',
                    backgroundColor: '#F3EDE4',
                    borderRadius: '6px',
                    border: '1px dashed #D8CABA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#8E7E76',
                    letterSpacing: '0.08em'
                  }}>
                    ⎯⎯⎯ DRIVE AISLE {bandIdx + 1} ⎯⎯⎯
                  </div>

                  {/* Bottom Row of Slots (10 Slots) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '6px' }}>
                    {Array.from({ length: 10 }).map((_, col) => {
                      const slotNum = rowBottom * 10 + col + 1;
                      return renderSlot(slotNum);
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hover Information / Quick Details Drawer */}
      {hoveredSlot && (
        <div style={{
          marginTop: '16px',
          padding: '12px 18px',
          backgroundColor: '#FAF7F2',
          borderRadius: '10px',
          border: '1px solid #E8DCC6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px'
        }}>
          <div>
            <strong>Slot #{hoveredSlot.slotNumber}</strong> • Row {hoveredSlot.row + 1}, Column {hoveredSlot.column + 1} •{' '}
            <span style={{ color: '#722F37', fontWeight: 'bold' }}>
              {hoveredSlot.distanceFromEntrance}m from entrance
            </span>
          </div>
          <div>
            Status:{' '}
            <span style={{
              fontWeight: 'bold',
              color: hoveredSlot.isTaken ? '#722F37' : hoveredSlot.isHeld ? '#D48B28' : '#337046'
            }}>
              {hoveredSlot.isTaken
                ? `Occupied by ${hoveredSlot.booking?.plate || 'Vehicle'}`
                : hoveredSlot.isHeld
                ? 'On 120s Hold'
                : hoveredSlot.isRec
                ? 'Recommended Closest (Min-Heap Root)'
                : 'Free & Available'}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  function renderSlot(slotNum) {
    const booking = bookingMap.get(slotNum);
    const hold = holdMap.get(slotNum);
    const isTaken = !!booking;
    const isHeld = !!hold && !isTaken;
    const isRec = slotNum === recommendedSlot && !isTaken && !isHeld;
    const isSelected = slotNum === selectedSlot;
    const isHighlight = slotNum === highlightSlot;

    const info = getSlotInfo(slotNum);

    // Styling based on state
    let bg = '#EAFAF3';
    let borderColor = '#BFEEDB';
    let textColor = '#196C44';

    if (isTaken) {
      bg = '#F3EDE4';
      borderColor = '#D8CABA';
      textColor = '#8E7E76';
    } else if (isHeld) {
      bg = 'repeating-linear-gradient(45deg, #FFF9E6, #FFF9E6 4px, #FCE3B4 4px, #FCE3B4 8px)';
      borderColor = '#E4B875';
      textColor = '#945800';
    } else if (isRec) {
      bg = '#FFF5DD';
      borderColor = '#F9D98B';
      textColor = '#8F5E05';
    }

    if (isSelected) {
      borderColor = '#722F37';
    }

    if (isHighlight) {
      borderColor = '#337046';
    }

    const isClickable = !isTaken && !isHeld && onSelectSlot;

    return (
      <div
        key={slotNum}
        onClick={() => {
          if (isClickable) onSelectSlot(slotNum);
        }}
        onMouseEnter={() =>
          setHoveredSlot({
            ...info,
            isTaken,
            isHeld,
            isRec,
            isSelected,
            booking
          })
        }
        onMouseLeave={() => setHoveredSlot(null)}
        className={isRec ? 'pulse-recommended' : ''}
        style={{
          background: bg,
          border: isSelected ? '2.5px solid #722F37' : isHighlight ? '2.5px solid #337046' : `1.2px solid ${borderColor}`,
          borderRadius: '8px',
          height: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isClickable ? 'pointer' : 'default',
          position: 'relative',
          padding: '2px',
          boxShadow: isSelected
            ? '0 0 0 2px #FFFFFF, 0 4px 10px rgba(114, 47, 55, 0.3)'
            : 'none',
          transform: isSelected ? 'scale(1.05)' : 'none',
          transition: 'all 0.15s ease'
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: textColor }}>
          {slotNum}
        </span>

        {isTaken && (
          <div style={{
            fontSize: '9px',
            backgroundColor: booking?.color || '#722F37',
            color: '#FFFFFF',
            padding: '1px 4px',
            borderRadius: '4px',
            marginTop: '2px',
            fontWeight: 'bold',
            maxWidth: '90%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {booking?.plate ? booking.plate.slice(0, 5) : 'CAR'}
          </div>
        )}

        {isRec && (
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#B07329', marginTop: '1px' }}>
            ✦ MIN
          </span>
        )}

        {isHeld && (
          <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#945800', marginTop: '1px' }}>
            HOLD
          </span>
        )}
      </div>
    );
  }
}
