'use client';

import React from 'react';

export const PRESET_COLORS = [
  { name: 'Deep Burgundy', hex: '#722F37' },
  { name: 'Cosmic Latte', hex: '#B7A89A' },
  { name: 'Mocha Cream', hex: '#E8DCC6' },
  { name: 'Emerald Forest', hex: '#2A5A3B' },
  { name: 'Midnight Navy', hex: '#1D3557' },
  { name: 'Solar Amber', hex: '#D48B28' }
];

export default function ColorPicker({ value = '#722F37', onChange }) {
  const handlePreset = (hex) => {
    onChange?.(hex);
  };

  const handleCustom = (e) => {
    onChange?.(e.target.value);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 140px',
      gap: '20px',
      padding: '20px',
      backgroundColor: '#FAF7F2',
      borderRadius: '16px',
      border: '1px solid #E8DCC6'
    }}>
      <div>
        <label style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#722F37',
          marginBottom: '10px'
        }}>
          Select Car Colour (Used in Animation)
        </label>

        {/* 6 Quick Presets */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {PRESET_COLORS.map((p) => {
            const isSelected = value.toLowerCase() === p.hex.toLowerCase();
            return (
              <button
                key={p.hex}
                type="button"
                onClick={() => handlePreset(p.hex)}
                title={p.name}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: p.hex,
                  border: isSelected ? '3px solid #722F37' : '1.5px solid rgba(0,0,0,0.15)',
                  boxShadow: isSelected ? '0 0 0 2px #FFFFFF, 0 4px 8px rgba(0,0,0,0.2)' : 'none',
                  cursor: 'pointer',
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.15s ease'
                }}
              />
            );
          })}
        </div>

        {/* Custom Color Bar + Hex Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="color"
              value={value}
              onChange={handleCustom}
              style={{
                width: '42px',
                height: '42px',
                padding: '2px',
                border: '1.5px solid #B7A89A',
                borderRadius: '10px',
                cursor: 'pointer',
                backgroundColor: '#FFFFFF'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#8E7E76' }}>HEX:</span>
            <input
              type="text"
              value={value.toUpperCase()}
              onChange={(e) => {
                let v = e.target.value;
                if (!v.startsWith('#')) v = '#' + v;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
                  onChange?.(v);
                }
              }}
              maxLength={7}
              style={{
                width: '90px',
                padding: '8px 10px',
                fontSize: '13px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                borderRadius: '8px',
                border: '1px solid #B7A89A',
                backgroundColor: '#FFFFFF',
                color: '#261517'
              }}
            />
          </div>
        </div>
      </div>

      {/* Live Top-Down Car Silhouette Preview */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '12px',
        border: '1px solid #E8DCC6',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#8E7E76', marginBottom: '8px' }}>
          LIVE CAR PREVIEW
        </div>

        <svg width="60" height="90" viewBox="0 0 60 90" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }}>
          {/* Wheels */}
          <rect x="2" y="14" width="6" height="14" rx="2" fill="#222222" />
          <rect x="52" y="14" width="6" height="14" rx="2" fill="#222222" />
          <rect x="2" y="62" width="6" height="14" rx="2" fill="#222222" />
          <rect x="52" y="62" width="6" height="14" rx="2" fill="#222222" />

          {/* Body */}
          <rect x="8" y="6" width="44" height="78" rx="10" fill={value} stroke="#1E1E1E" strokeWidth="1.2" />

          {/* Front Windshield */}
          <path d="M 14 30 Q 30 26 46 30 L 44 42 Q 30 40 16 42 Z" fill="#263238" opacity="0.85" />

          {/* Roof */}
          <rect x="15" y="42" width="30" height="20" rx="3" fill="#FFFFFF" opacity="0.18" />

          {/* Rear Windshield */}
          <path d="M 16 63 Q 30 65 44 63 L 42 71 Q 30 73 18 71 Z" fill="#263238" opacity="0.85" />

          {/* Headlights */}
          <circle cx="14" cy="8" r="2.5" fill="#FFF9C4" />
          <circle cx="46" cy="8" r="2.5" fill="#FFF9C4" />

          {/* Taillights */}
          <rect x="12" y="81" width="6" height="2" rx="1" fill="#FF1744" />
          <rect x="42" y="81" width="6" height="2" rx="1" fill="#FF1744" />
        </svg>

        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#722F37', marginTop: '6px' }}>
          {value.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
