'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DsaPanel from '../../components/DsaPanel';
import { dsaStore } from '../../lib/dsaStore';

function ExitContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [plate, setPlate] = useState(searchParams.get('plate') || '');
  const [snapshot, setSnapshot] = useState(dsaStore.getSnapshot());
  const [exitResult, setExitResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsub = dsaStore.subscribe((newSnap) => setSnapshot(newSnap));
    return unsub;
  }, []);

  const handleExit = (e) => {
    e?.preventDefault();
    const clean = (plate || '').trim().toUpperCase();
    if (!clean) return;

    setError('');
    const res = dsaStore.leaveSlot(clean);
    if (res.success) {
      setExitResult(res);
    } else {
      setError(res.message);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#FBF8F3',
      padding: '32px 48px',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      color: '#261517'
    }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Navigation Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px'
        }}>
          <div>
            <span style={{
              backgroundColor: '#E8DCC6',
              color: '#722F37',
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '4px 12px',
              borderRadius: '12px',
              textTransform: 'uppercase'
            }}>
              Slot Deallocation • Heap.Push(slot)
            </span>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 'bold', color: '#722F37', marginTop: '6px' }}>
              Exit Garage &amp; Vacate Slot
            </h1>
          </div>

          <Link
            href="/"
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid #B7A89A',
              backgroundColor: '#FFFFFF',
              color: '#722F37',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            ← Home
          </Link>
        </div>

        {/* Exit Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1.5px solid #E8DCC6',
          padding: '36px',
          boxShadow: '0 12px 36px rgba(114, 47, 55, 0.05)'
        }}>
          {!exitResult ? (
            <div>
              <p style={{ fontSize: '14px', color: '#8E7E76', marginBottom: '24px' }}>
                When you exit, your slot will be pushed back into the Min-Heap in <strong>O(log N)</strong> time, making it instantly available to new incoming drivers.
              </p>

              {error && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#FFEBEE',
                  border: '1px solid #FFCDD2',
                  borderRadius: '10px',
                  color: '#C62828',
                  fontSize: '13px',
                  marginBottom: '20px'
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleExit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#722F37', marginBottom: '8px' }}>
                    Enter License Plate to Check Out
                  </label>
                  <input
                    type="text"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    placeholder="e.g. LEA-101"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      border: '1.5px solid #B7A89A',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      backgroundColor: '#FAF7F2',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Quick Select Parked Cars */}
                {snapshot.bookings.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#8E7E76', fontWeight: 'bold' }}>Quick select parked:</span>
                    {snapshot.bookings.map((b) => (
                      <button
                        key={b.plate}
                        type="button"
                        onClick={() => setPlate(b.plate)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid #E8DCC6',
                          backgroundColor: plate === b.plate ? '#FFF5DD' : '#FFFFFF',
                          color: '#722F37',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {b.plate} (Slot #{b.slotNumber})
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    backgroundColor: '#722F37',
                    color: '#FFFFFF',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(114, 47, 55, 0.25)',
                    marginTop: '12px'
                  }}
                >
                  Confirm Exit &amp; Free Slot 🚗 💨
                </button>
              </form>
            </div>
          ) : (
            <div>
              {/* Success Exit Receipt */}
              <div style={{
                textAlign: 'center',
                padding: '24px',
                backgroundColor: '#EAFAF3',
                borderRadius: '16px',
                border: '1.5px solid #BFEEDB',
                marginBottom: '28px'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#337046',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  margin: '0 auto 12px auto'
                }}>
                  ✓
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#196C44' }}>
                  Departure Complete!
                </h2>
                <p style={{ fontSize: '13px', color: '#337046', marginTop: '4px' }}>
                  Slot #{exitResult.freedSlot} has been released and pushed back into the Min-Heap.
                </p>
              </div>

              <div style={{
                backgroundColor: '#FAF7F2',
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid #E8DCC6',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '13px',
                marginBottom: '28px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8E7E76' }}>Vehicle:</span>
                  <strong>{exitResult.booking.plate} ({exitResult.booking.ownerName})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8E7E76' }}>Vacated Bay:</span>
                  <strong style={{ color: '#722F37' }}>Slot #{exitResult.freedSlot}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8E7E76' }}>Entry Time:</span>
                  <span>{exitResult.booking.entryTime}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8E7E76' }}>Exit Time:</span>
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8E7E76' }}>Heap Operation:</span>
                  <span style={{ color: '#337046', fontWeight: 'bold' }}>Heap.Push({exitResult.freedSlot}) — O(log N)</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setExitResult(null);
                    setPlate('');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #B7A89A',
                    backgroundColor: '#FFFFFF',
                    color: '#722F37',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Exit Another Vehicle
                </button>

                <Link
                  href="/"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: '#722F37',
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(114, 47, 55, 0.25)'
                  }}
                >
                  Return to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <DsaPanel />
    </main>
  );
}

export default function ExitPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading Exit Checkout...</div>}>
      <ExitContent />
    </Suspense>
  );
}
