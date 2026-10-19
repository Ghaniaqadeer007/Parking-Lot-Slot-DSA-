'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Stepper from '../../components/Stepper';
import DsaPanel from '../../components/DsaPanel';
import { dsaStore, getDraftVehicle } from '../../lib/dsaStore';
import { getSlotInfo } from '../../lib/layout';

export default function ConfirmPage() {
  const router = useRouter();
  const [draft, setDraft] = useState(null);
  const [slotInfo, setSlotInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentDraft = getDraftVehicle();
    if (!currentDraft.plate || !currentDraft.slotNumber) {
      router.push('/car-details');
      return;
    }
    setDraft(currentDraft);
    setSlotInfo(getSlotInfo(currentDraft.slotNumber));
  }, []);

  const handleConfirmAndPark = () => {
    if (!draft || isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    const res = dsaStore.bookSlot({
      plate: draft.plate,
      ownerName: draft.ownerName,
      phone: draft.phone,
      color: draft.color,
      slotNumber: draft.slotNumber,
      mode: draft.mode
    });

    if (res.success) {
      router.push(`/parking?slot=${draft.slotNumber}&plate=${encodeURIComponent(draft.plate)}&color=${encodeURIComponent(draft.color)}`);
    } else {
      setIsSubmitting(false);
      setError(res.message || 'Unable to book slot');
    }
  };

  if (!draft || !slotInfo) {
    return null;
  }

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#FBF8F3',
      padding: '32px 48px',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      color: '#261517'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Stepper (Step 3) */}
        <Stepper currentStep={3} onBack={() => router.push('/slots')} />

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1.5px solid #E8DCC6',
          padding: '36px',
          boxShadow: '0 12px 36px rgba(114, 47, 55, 0.05)'
        }}>
          <div style={{ marginBottom: '28px' }}>
            <span style={{
              backgroundColor: '#E8DCC6',
              color: '#722F37',
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '4px 12px',
              borderRadius: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Step 3 of 4 • Review &amp; Confirmation
            </span>
            <h1 style={{
              fontFamily: 'Georgia, serif',
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#722F37',
              marginTop: '10px'
            }}>
              Confirm Your Parking Reservation
            </h1>
            <p style={{ fontSize: '14px', color: '#8E7E76', marginTop: '4px' }}>
              Please verify your vehicle details and assigned bay location before entering the parking facility.
            </p>
          </div>

          {error && (
            <div style={{
              padding: '14px 18px',
              backgroundColor: '#FFEBEE',
              border: '1px solid #FFCDD2',
              borderRadius: '12px',
              color: '#C62828',
              fontSize: '13px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {/* Detailed Summary Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '28px'
          }}>
            {/* Vehicle Details */}
            <div style={{
              backgroundColor: '#FAF7F2',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid #E8DCC6'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#722F37', marginBottom: '14px' }}>
                🚗 VEHICLE SPECIFICATIONS
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8E7E76' }}>License Plate:</span>
                  <strong style={{ color: '#722F37', letterSpacing: '0.05em' }}>{draft.plate}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8E7E76' }}>Owner Name:</span>
                  <strong>{draft.ownerName}</strong>
                </div>
                {draft.phone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#8E7E76' }}>Phone Contact:</span>
                    <span>{draft.phone}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8E7E76' }}>Car Colour:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      backgroundColor: draft.color,
                      border: '1px solid rgba(0,0,0,0.2)'
                    }} />
                    <strong style={{ fontFamily: 'monospace' }}>{draft.color.toUpperCase()}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Parking Slot Details */}
            <div style={{
              backgroundColor: '#FFF5DD',
              padding: '20px',
              borderRadius: '16px',
              border: '1.5px solid #F9D98B'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#8F5E05', marginBottom: '14px' }}>
                📍 DESIGNATED PARKING BAY
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8E7E76' }}>Assigned Slot:</span>
                  <span style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: '#722F37'
                  }}>
                    Slot #{draft.slotNumber}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8E7E76' }}>Location:</span>
                  <strong>Aisle {slotInfo.band + 1} • Column {slotInfo.column + 1}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8E7E76' }}>Distance from Gate:</span>
                  <strong style={{ color: '#337046' }}>{slotInfo.distanceFromEntrance} meters</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8E7E76' }}>Strategy:</span>
                  <span style={{
                    backgroundColor: '#E8DCC6',
                    color: '#722F37',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {draft.mode === 'closest' ? '⚡ Min-Heap Closest' : '🎯 Custom Selection'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '20px',
            borderTop: '1px solid #E8DCC6'
          }}>
            <button
              type="button"
              onClick={() => router.push('/slots')}
              style={{
                backgroundColor: 'transparent',
                color: '#722F37',
                border: 'none',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ← Change Slot
            </button>

            <button
              type="button"
              onClick={handleConfirmAndPark}
              disabled={isSubmitting}
              style={{
                backgroundColor: '#722F37',
                color: '#FFFFFF',
                padding: '16px 36px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(114, 47, 55, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              {isSubmitting ? 'Reserving...' : 'Confirm and Park 🚗 →'}
            </button>
          </div>
        </div>
      </div>

      <DsaPanel />
    </main>
  );
}
