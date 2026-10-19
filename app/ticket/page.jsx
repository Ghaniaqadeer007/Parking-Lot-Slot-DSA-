'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Stepper from '../../components/Stepper';
import DsaPanel from '../../components/DsaPanel';
import { dsaStore } from '../../lib/dsaStore';
import { getSlotInfo } from '../../lib/layout';

function TicketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const plateParam = searchParams.get('plate');
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const snap = dsaStore.getSnapshot();
    if (plateParam) {
      const found = snap.bookings.find((b) => b.plate === plateParam.toUpperCase());
      if (found) {
        setBooking(found);
        return;
      }
    }
    // Fallback: pick the latest booking
    if (snap.bookings.length > 0) {
      setBooking(snap.bookings[snap.bookings.length - 1]);
    }
  }, [plateParam]);

  if (!booking) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <h2>No Active Ticket Found</h2>
        <Link href="/" style={{ color: '#722F37', textDecoration: 'underline', marginTop: '12px', display: 'inline-block' }}>
          Return to Home
        </Link>
      </div>
    );
  }

  const slotInfo = getSlotInfo(booking.slotNumber);

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#FBF8F3',
      padding: '32px 48px',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      color: '#261517'
    }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Stepper (Step 4 - Completed) */}
        <Stepper currentStep={4} />

        {/* Digital Parking Pass Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '2px solid #E8DCC6',
          boxShadow: '0 16px 48px rgba(114, 47, 55, 0.08)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Card Top Banner */}
          <div style={{
            backgroundColor: '#722F37',
            color: '#FFFFFF',
            padding: '24px 32px',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: '#E8DCC6',
              color: '#722F37',
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '3px 12px',
              borderRadius: '12px',
              marginBottom: '8px'
            }}>
              OFFICIAL PARKING PERMIT
            </div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: 'bold' }}>
              ParkFlow Allocator Ticket
            </h1>
            <p style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>
              DSA Course Project • UET Lahore • Evaluated by Sir Sultan
            </p>
          </div>

          {/* Ticket Body */}
          <div style={{ padding: '32px' }}>
            {/* Slot Number Spotlight */}
            <div style={{
              backgroundColor: '#FFF5DD',
              border: '2px dashed #F9D98B',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '28px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#8F5E05', letterSpacing: '0.05em' }}>
                YOUR ALLOCATED PARKING BAY
              </div>
              <div style={{
                fontSize: '48px',
                fontWeight: '900',
                color: '#722F37',
                fontFamily: 'Georgia, serif',
                margin: '6px 0'
              }}>
                SLOT #{booking.slotNumber}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#337046' }}>
                Aisle {slotInfo.band + 1} • {slotInfo.distanceFromEntrance} Meters from Gate
              </div>
            </div>

            {/* Vehicle Details Table */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              fontSize: '13px',
              marginBottom: '28px'
            }}>
              <div style={{ backgroundColor: '#FAF7F2', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E8DCC6' }}>
                <span style={{ fontSize: '11px', color: '#8E7E76', display: 'block' }}>LICENSE PLATE</span>
                <strong style={{ fontSize: '16px', color: '#722F37', letterSpacing: '0.05em' }}>
                  {booking.plate}
                </strong>
              </div>

              <div style={{ backgroundColor: '#FAF7F2', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E8DCC6' }}>
                <span style={{ fontSize: '11px', color: '#8E7E76', display: 'block' }}>DRIVER NAME</span>
                <strong style={{ fontSize: '15px' }}>
                  {booking.ownerName}
                </strong>
              </div>

              <div style={{ backgroundColor: '#FAF7F2', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E8DCC6' }}>
                <span style={{ fontSize: '11px', color: '#8E7E76', display: 'block' }}>ENTRY TIMESTAMP</span>
                <strong style={{ fontSize: '14px' }}>
                  {booking.entryTime}
                </strong>
              </div>

              <div style={{ backgroundColor: '#FAF7F2', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E8DCC6' }}>
                <span style={{ fontSize: '11px', color: '#8E7E76', display: 'block' }}>VEHICLE COLOUR</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '4px',
                    backgroundColor: booking.color,
                    border: '1px solid #B7A89A'
                  }} />
                  <strong style={{ fontFamily: 'monospace' }}>{booking.color.toUpperCase()}</strong>
                </div>
              </div>
            </div>

            {/* Walking Directions Box */}
            <div style={{
              backgroundColor: '#FAF7F2',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #E8DCC6',
              marginBottom: '28px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#722F37', marginBottom: '4px' }}>
                🧭 Navigation &amp; Walking Instructions:
              </div>
              <p style={{ fontSize: '13px', color: '#5D4F4B', lineHeight: 1.5 }}>
                Enter through the Main Gate on the left road lane. Proceed forward to <strong>Drive Aisle {slotInfo.band + 1}</strong>. Turn right into the aisle; Bay #{booking.slotNumber} is located in <strong>Column {slotInfo.column + 1}</strong> ({slotInfo.position === 0 ? 'top row' : 'bottom row'}).
              </p>
            </div>

            {/* Barcode Simulated Visual */}
            <div style={{
              textAlign: 'center',
              padding: '12px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px dashed #B7A89A',
              marginBottom: '28px'
            }}>
              <div style={{
                fontFamily: 'monospace',
                letterSpacing: '0.35em',
                fontSize: '18px',
                color: '#261517',
                userSelect: 'none'
              }}>
                ||| | |||| | |||||| || | |||| ||
              </div>
              <div style={{ fontSize: '10px', color: '#8E7E76', marginTop: '4px' }}>
                REF: {booking.plate}-BAY{booking.slotNumber} • 256-BIT AUTH
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Link
                href={`/find?plate=${booking.plate}`}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#722F37',
                  border: '1.5px solid #722F37',
                  padding: '12px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}
              >
                🔍 Find My Car
              </Link>

              <Link
                href={`/exit?plate=${booking.plate}`}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#722F37',
                  border: '1.5px solid #E8DCC6',
                  padding: '12px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}
              >
                🚗 Exit &amp; Leave Bay
              </Link>
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link
                href="/"
                style={{
                  color: '#722F37',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  textDecoration: 'underline'
                }}
              >
                Done • Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <DsaPanel />
    </main>
  );
}

export default function TicketPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading Parking Pass...</div>}>
      <TicketContent />
    </Suspense>
  );
}
