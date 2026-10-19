'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Stepper from '../../components/Stepper';
import LotMap2D from '../../components/LotMap2D';
import DsaPanel from '../../components/DsaPanel';
import { dsaStore, getDraftVehicle, saveDraftVehicle } from '../../lib/dsaStore';
import { getSlotInfo } from '../../lib/layout';

export default function SlotsPage() {
  const router = useRouter();

  const [snapshot, setSnapshot] = useState(dsaStore.getSnapshot());
  const [draft, setDraft] = useState(getDraftVehicle());
  const [mode, setMode] = useState('closest'); // 'closest' or 'custom'
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [viewMode, setViewMode] = useState('2D'); // '2D' or '3D'
  const [holdTimeRemaining, setHoldTimeRemaining] = useState(120);

  // Subscribe to DSA store updates and polling
  useEffect(() => {
    const unsub = dsaStore.subscribe((newSnap) => {
      setSnapshot(newSnap);
    });

    const pollInterval = setInterval(() => {
      setSnapshot(dsaStore.getSnapshot());
    }, 3000);

    return () => {
      unsub();
      clearInterval(pollInterval);
    };
  }, []);

  // Initialize draft and hold
  useEffect(() => {
    const currentDraft = getDraftVehicle();
    if (!currentDraft.plate) {
      router.push('/car-details');
      return;
    }
    setDraft(currentDraft);

    // Initial slot allocation mode: if closest, pick root of min-heap
    const closest = snapshot.closestFreeSlot;
    if (closest) {
      handleHoldSlot(closest, 'closest');
    }
  }, []);

  // 120-second Countdown Timer
  useEffect(() => {
    if (!selectedSlot) return;

    const timer = setInterval(() => {
      const activeHold = snapshot.activeHolds.find((h) => h.slotNumber === selectedSlot);
      if (activeHold) {
        const remaining = Math.max(0, Math.floor((activeHold.expiresAt - Date.now()) / 1000));
        setHoldTimeRemaining(remaining);
        if (remaining <= 0) {
          dsaStore.releaseExpiredHolds();
          setSelectedSlot(null);
        }
      } else {
        setHoldTimeRemaining(120);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedSlot, snapshot.activeHolds]);

  const handleHoldSlot = (slotNum, newMode = mode) => {
    if (selectedSlot && selectedSlot !== slotNum) {
      dsaStore.releaseHold(selectedSlot);
    }

    const res = dsaStore.holdSlot(slotNum, draft.plate);
    if (res.success) {
      setSelectedSlot(slotNum);
      setMode(newMode);
      setHoldTimeRemaining(120);
      saveDraftVehicle({ slotNumber: slotNum, mode: newMode, holdId: res.hold.holdId });
    }
  };

  const handleModeSwitch = (targetMode) => {
    setMode(targetMode);
    if (targetMode === 'closest') {
      const closest = snapshot.closestFreeSlot;
      if (closest) {
        handleHoldSlot(closest, 'closest');
      }
    }
  };

  const handleConfirmSlot = () => {
    if (!selectedSlot) return;
    saveDraftVehicle({ slotNumber: selectedSlot, mode });
    router.push('/confirm');
  };

  const slotInfo = selectedSlot ? getSlotInfo(selectedSlot) : null;

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#FBF8F3',
      padding: '32px 48px',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      color: '#261517'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Stepper (Step 2) */}
        <Stepper currentStep={2} onBack={() => router.push('/car-details')} />

        {/* Top Control & Metric Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Left: Mode Selection Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E8DCC6',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(114, 47, 55, 0.04)'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#8E7E76', marginBottom: '8px' }}>
              STEP 2: CHOOSE ALLOCATION STRATEGY
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleModeSwitch('closest')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: mode === 'closest' ? '2px solid #722F37' : '1px solid #E8DCC6',
                  backgroundColor: mode === 'closest' ? '#FFF5DD' : '#FAF7F2',
                  color: '#722F37',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>⚡ Closest Slot (Auto)</span>
                  {mode === 'closest' && <span>✓</span>}
                </div>
                <div style={{ fontSize: '11px', color: '#B07329', marginTop: '2px', fontWeight: 'normal' }}>
                  Min-Heap Root: Slot #{snapshot.closestFreeSlot || 'N/A'}
                </div>
              </button>

              <button
                onClick={() => handleModeSwitch('custom')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: mode === 'custom' ? '2px solid #722F37' : '1px solid #E8DCC6',
                  backgroundColor: mode === 'custom' ? '#FFF5DD' : '#FAF7F2',
                  color: '#722F37',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>🎯 Choose My Own Slot</span>
                  {mode === 'custom' && <span>✓</span>}
                </div>
                <div style={{ fontSize: '11px', color: '#8E7E76', marginTop: '2px', fontWeight: 'normal' }}>
                  Tap any green bay on the map
                </div>
              </button>
            </div>
          </div>

          {/* Right: Metrics & Live Hold Timer */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E8DCC6',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 16px rgba(114, 47, 55, 0.04)'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8E7E76' }}>GARAGE STATUS</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#337046', marginTop: '2px' }}>
                {snapshot.freeSlotsCount} / 100 Free
              </div>
              <div style={{ fontSize: '11px', color: '#8E7E76', marginTop: '2px' }}>
                {snapshot.takenSlotsCount} occupied • {snapshot.heldSlotsCount} held
              </div>
            </div>

            {selectedSlot && (
              <div style={{
                backgroundColor: '#FAF7F2',
                padding: '10px 16px',
                borderRadius: '12px',
                border: '1px solid #E8DCC6',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#8E7E76' }}>
                  HOLD RESERVATION TIMER
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: holdTimeRemaining <= 30 ? '#D32F2F' : '#722F37',
                  fontFamily: 'monospace'
                }}>
                  {Math.floor(holdTimeRemaining / 60)}:{(holdTimeRemaining % 60).toString().padStart(2, '0')}
                </div>
                <div style={{ fontSize: '10px', color: '#B07329' }}>
                  Held for {draft.plate}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2D / 3D Interactive Lot Map */}
        <LotMap2D
          slotBookings={snapshot.slotBookings}
          activeHolds={snapshot.activeHolds}
          recommendedSlot={snapshot.closestFreeSlot}
          selectedSlot={selectedSlot}
          onSelectSlot={(slot) => handleHoldSlot(slot, 'custom')}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
        />

        {/* Bottom Floating Action Bar */}
        <div style={{
          marginTop: '24px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #E8DCC6',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 24px rgba(114, 47, 55, 0.06)'
        }}>
          <div>
            {selectedSlot ? (
              <div>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#722F37' }}>
                  Selected Bay #{selectedSlot}
                </span>{' '}
                <span style={{ fontSize: '13px', color: '#5D4F4B' }}>
                  ({slotInfo?.distanceFromEntrance}m from entrance • Aisle {slotInfo?.band + 1})
                </span>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: '#8E7E76' }}>
                Please select a slot to proceed
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => router.push('/car-details')}
              style={{
                backgroundColor: 'transparent',
                color: '#722F37',
                border: '1px solid #B7A89A',
                padding: '12px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ← Back to Details
            </button>

            <button
              onClick={handleConfirmSlot}
              disabled={!selectedSlot}
              style={{
                backgroundColor: selectedSlot ? '#722F37' : '#D8CABA',
                color: '#FFFFFF',
                padding: '12px 30px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: selectedSlot ? 'pointer' : 'not-allowed',
                boxShadow: selectedSlot ? '0 6px 16px rgba(114, 47, 55, 0.25)' : 'none'
              }}
            >
              Confirm and Review →
            </button>
          </div>
        </div>
      </div>

      <DsaPanel />
    </main>
  );
}
