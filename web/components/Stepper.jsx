'use client';

import React from 'react';
import Link from 'next/link';

export default function Stepper({ currentStep = 1, onBack }) {
  const steps = [
    { num: 1, label: 'Car Details', href: '/car-details' },
    { num: 2, label: 'Choose Slot', href: '/slots' },
    { num: 3, label: 'Review & Confirm', href: '/confirm' },
    { num: 4, label: 'Parking Ticket', href: '/ticket' }
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      border: '1.5px solid #E8DCC6',
      marginBottom: '28px',
      boxShadow: '0 4px 16px rgba(114, 47, 55, 0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {steps.map((step, idx) => {
          const isDone = step.num < currentStep;
          const isActive = step.num === currentStep;

          return (
            <React.Fragment key={step.num}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  backgroundColor: isActive
                    ? '#722F37'
                    : isDone
                    ? '#337046'
                    : '#E8DCC6',
                  color: isActive || isDone ? '#FFFFFF' : '#722F37',
                  boxShadow: isActive ? '0 4px 10px rgba(114, 47, 55, 0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}>
                  {isDone ? '✓' : step.num}
                </div>
                <span style={{
                  fontSize: '13px',
                  fontWeight: isActive ? '700' : '600',
                  color: isActive ? '#722F37' : isDone ? '#337046' : '#8E7E76'
                }}>
                  {step.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div style={{
                  width: '36px',
                  height: '2px',
                  backgroundColor: isDone ? '#337046' : '#E8DCC6',
                  borderRadius: '2px'
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {onBack ? (
          <button
            onClick={onBack}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #B7A89A',
              backgroundColor: '#FFFFFF',
              color: '#722F37',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
        ) : (
          <Link
            href="/"
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #B7A89A',
              backgroundColor: '#FFFFFF',
              color: '#722F37',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            Home
          </Link>
        )}
      </div>
    </div>
  );
}
