'use client';

import React, { useState, useEffect } from 'react';
import { dsaStore } from '../lib/dsaStore';

export default function DsaPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [snapshot, setSnapshot] = useState(dsaStore.getSnapshot());

  useEffect(() => {
    const unsub = dsaStore.subscribe((newSnap) => {
      setSnapshot(newSnap);
    });
    return unsub;
  }, []);

  return (
    <>
      {/* Floating Toggle Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#722F37',
          color: '#FFFFFF',
          border: '2px solid #E8DCC6',
          borderRadius: '30px',
          padding: '12px 22px',
          fontWeight: 'bold',
          fontSize: '13px',
          boxShadow: '0 8px 24px rgba(114, 47, 55, 0.35)',
          cursor: 'pointer',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}
      >
        <span>🧠</span>
        <span>{isOpen ? 'Close DSA Inspector' : 'Examiner DSA Panel (Sir Sultan)'}</span>
        <span style={{
          backgroundColor: '#E8DCC6',
          color: '#722F37',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px'
        }}>
          LIVE
        </span>
      </button>

      {/* Modal / Slide-out Inspector Drawer */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          right: '24px',
          width: '540px',
          maxHeight: '80vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '2px solid #E8DCC6',
          boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#722F37',
            color: '#FFFFFF',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>
                DSA Internal State Inspector
              </h3>
              <p style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px' }}>
                UET Lahore • DSA Project Evaluation • Real-time Data Structures
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>

          {/* Scrollable Content */}
          <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 1. Min-Heap Priority Queue */}
            <div style={{
              backgroundColor: '#FAF7F2',
              borderRadius: '14px',
              padding: '14px',
              border: '1px solid #E8DCC6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#722F37' }}>
                  1. Indexed Min-Heap (Free Slots)
                </span>
                <span style={{
                  fontSize: '10px',
                  backgroundColor: '#E8DCC6',
                  color: '#722F37',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontWeight: 'bold'
                }}>
                  PopMin / Remove: O(log N) • Peek: O(1)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '8px', borderRadius: '8px', border: '1px solid #E8DCC6' }}>
                  <div style={{ fontSize: '10px', color: '#8E7E76' }}>Root (Peek)</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#722F37' }}>
                    Slot #{snapshot.closestFreeSlot ?? 'None'}
                  </div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '8px', borderRadius: '8px', border: '1px solid #E8DCC6' }}>
                  <div style={{ fontSize: '10px', color: '#8E7E76' }}>Heap Size</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#337046' }}>
                    {snapshot.freeSlotsCount} free
                  </div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '8px', borderRadius: '8px', border: '1px solid #E8DCC6' }}>
                  <div style={{ fontSize: '10px', color: '#8E7E76' }}>Active Holds</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#B07329' }}>
                    {snapshot.heldSlotsCount} held
                  </div>
                </div>
              </div>

              {/* Heap Array Preview */}
              <div style={{ fontSize: '11px', color: '#5D4F4B' }}>
                <strong>Heap Array Buffer (First 15 nodes):</strong>
                <div style={{
                  fontFamily: 'monospace',
                  backgroundColor: '#FFFFFF',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #E8DCC6',
                  marginTop: '4px',
                  fontSize: '11px',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap'
                }}>
                  [{snapshot.heapArray.slice(0, 15).join(', ')}{snapshot.heapArray.length > 15 ? ', ...' : ''}]
                </div>
              </div>
            </div>

            {/* 2. Hash Map (Plate -> Booking) */}
            <div style={{
              backgroundColor: '#FAF7F2',
              borderRadius: '14px',
              padding: '14px',
              border: '1px solid #E8DCC6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#722F37' }}>
                  2. Hash Map (Dictionary&lt;string, Booking&gt;)
                </span>
                <span style={{
                  fontSize: '10px',
                  backgroundColor: '#E8DCC6',
                  color: '#722F37',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontWeight: 'bold'
                }}>
                  Lookup / Insert / Delete: O(1)
                </span>
              </div>

              <div style={{
                maxHeight: '120px',
                overflowY: 'auto',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E8DCC6',
                padding: '8px'
              }}>
                {snapshot.bookings.length === 0 ? (
                  <div style={{ fontSize: '11px', color: '#8E7E76', textAlign: 'center', padding: '8px' }}>
                    No cars currently parked.
                  </div>
                ) : (
                  snapshot.bookings.map((b) => (
                    <div key={b.plate} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '4px 8px',
                      borderBottom: '1px solid #F3EDE4',
                      fontSize: '11px'
                    }}>
                      <span style={{ fontWeight: 'bold', color: '#722F37' }}>{b.plate}</span>
                      <span style={{ color: '#8E7E76' }}>{b.ownerName}</span>
                      <span style={{ fontWeight: 'bold', color: '#337046' }}>Slot #{b.slotNumber}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. Real-time DSA Audit Log */}
            <div style={{
              backgroundColor: '#FAF7F2',
              borderRadius: '14px',
              padding: '14px',
              border: '1px solid #E8DCC6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#722F37' }}>
                  3. Real-Time Complexity Audit Log
                </span>
                <span style={{ fontSize: '10px', color: '#8E7E76' }}>Live Big-O Trace</span>
              </div>

              <div style={{
                maxHeight: '160px',
                overflowY: 'auto',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E8DCC6',
                padding: '6px'
              }}>
                {snapshot.auditLog.map((log) => (
                  <div key={log.id} style={{
                    padding: '6px 8px',
                    borderBottom: '1px solid #F3EDE4',
                    fontSize: '11px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: '#722F37' }}>{log.operation}</span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: '#B07329',
                        backgroundColor: '#FFF5DD',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        {log.complexity}
                      </span>
                    </div>
                    <div style={{ color: '#5D4F4B', fontSize: '10px' }}>
                      {log.details}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
