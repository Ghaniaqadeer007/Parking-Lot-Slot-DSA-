'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DsaPanel from '../../components/DsaPanel';
import { dsaStore } from '../../lib/dsaStore';

export default function GarageFullPage() {
  const [snapshot, setSnapshot] = useState(dsaStore.getSnapshot());
  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [phone, setPhone] = useState('');
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const unsub = dsaStore.subscribe((newSnap) => setSnapshot(newSnap));
    return unsub;
  }, []);

  const handleJoinQueue = (e) => {
    e.preventDefault();
    if (!plate.trim()) return;

    const t = dsaStore.joinWaitingList({ name, plate, phone });
    setTicket(t);
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#FBF8F3',
      padding: '32px 48px',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      color: '#261517'
    }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <span style={{
              backgroundColor: '#D32F2F',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '4px 12px',
              borderRadius: '12px'
            }}>
              CAPACITY REACHED
            </span>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 'bold', color: '#722F37', marginTop: '6px' }}>
              Garage Is Currently Full
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

        {/* Status Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1.5px solid #E8DCC6',
          padding: '36px',
          boxShadow: '0 12px 36px rgba(114, 47, 55, 0.05)'
        }}>
          {snapshot.freeSlotsCount > 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '24px',
              backgroundColor: '#EAFAF3',
              borderRadius: '16px',
              border: '1.5px solid #BFEEDB',
              marginBottom: '20px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#196C44' }}>
                A Slot Just Opened Up!
              </h2>
              <p style={{ fontSize: '13px', color: '#337046', marginTop: '4px' }}>
                There are now {snapshot.freeSlotsCount} free slot(s) available.
              </p>
              <Link
                href="/car-details"
                style={{
                  display: 'inline-block',
                  marginTop: '16px',
                  backgroundColor: '#337046',
                  color: '#FFFFFF',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                Claim Free Slot Now →
              </Link>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '14px', color: '#8E7E76', marginBottom: '24px' }}>
                All 100 parking bays are currently occupied. You can join the FIFO waiting list queue. As soon as any vehicle vacates, the nearest freed bay will be allocated to drivers in order of arrival.
              </p>

              {!ticket ? (
                <form onSubmit={handleJoinQueue} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#722F37', marginBottom: '6px' }}>
                      Driver Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ghania Qadeer"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1.5px solid #B7A89A',
                        fontSize: '14px',
                        backgroundColor: '#FAF7F2',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#722F37', marginBottom: '6px' }}>
                      License Plate Number
                    </label>
                    <input
                      type="text"
                      value={plate}
                      onChange={(e) => setPlate(e.target.value.toUpperCase())}
                      placeholder="e.g. LEA-999"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1.5px solid #B7A89A',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: '#FAF7F2',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#722F37', marginBottom: '6px' }}>
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0300-1234567"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1.5px solid #B7A89A',
                        fontSize: '14px',
                        backgroundColor: '#FAF7F2',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#722F37',
                      color: '#FFFFFF',
                      padding: '14px 28px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginTop: '12px',
                      boxShadow: '0 6px 16px rgba(114, 47, 55, 0.25)'
                    }}
                  >
                    Join Waiting List Queue (FIFO) ⏳
                  </button>
                </form>
              ) : (
                <div style={{
                  backgroundColor: '#FFF5DD',
                  borderRadius: '16px',
                  border: '1.5px solid #F9D98B',
                  padding: '24px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#8F5E05' }}>
                    FIFO QUEUE TICKET CONFIRMED
                  </div>
                  <div style={{
                    fontSize: '36px',
                    fontWeight: '900',
                    color: '#722F37',
                    margin: '8px 0',
                    fontFamily: 'monospace'
                  }}>
                    {ticket.ticketId}
                  </div>
                  <p style={{ fontSize: '14px', color: '#5D4F4B' }}>
                    You are currently <strong>Position #{ticket.position}</strong> in line.
                  </p>
                  <p style={{ fontSize: '12px', color: '#8E7E76', marginTop: '4px' }}>
                    Vehicle: {ticket.plate} • Requested at {ticket.timestamp}
                  </p>
                </div>
              )}
            </div>
          )}

          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #E8DCC6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={() => setSnapshot(dsaStore.getSnapshot())}
              style={{
                backgroundColor: 'transparent',
                color: '#722F37',
                border: '1px solid #B7A89A',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh Status
            </button>

            <Link
              href="/find"
              style={{
                fontSize: '13px',
                color: '#722F37',
                fontWeight: 'bold',
                textDecoration: 'underline'
              }}
            >
              Search Existing Parked Car →
            </Link>
          </div>
        </div>
      </div>

      <DsaPanel />
    </main>
  );
}
