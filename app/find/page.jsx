'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LotMap2D from '../../components/LotMap2D';
import DsaPanel from '../../components/DsaPanel';
import { dsaStore } from '../../lib/dsaStore';
import { getSlotInfo } from '../../lib/layout';

function FindCarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchPlate, setSearchPlate] = useState(searchParams.get('plate') || '');
  const [snapshot, setSnapshot] = useState(dsaStore.getSnapshot());
  const [foundBooking, setFoundBooking] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [viewMode, setViewMode] = useState('2D');

  useEffect(() => {
    const unsub = dsaStore.subscribe((newSnap) => setSnapshot(newSnap));
    return unsub;
  }, []);

  useEffect(() => {
    const initialPlate = searchParams.get('plate');
    if (initialPlate) {
      handleSearch(initialPlate);
    }
  }, [searchParams]);

  const handleSearch = (plateToSearch = searchPlate) => {
    const clean = (plateToSearch || '').trim().toUpperCase();
    if (!clean) return;
    setSearchAttempted(true);

    const res = dsaStore.findCar(clean);
    if (res.success) {
      setFoundBooking(res.booking);
    } else {
      setFoundBooking(null);
    }
  };

  const slotInfo = foundBooking ? getSlotInfo(foundBooking.slotNumber) : null;

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#FBF8F3',
      padding: '32px 48px',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      color: '#261517'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
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
              O(1) Hash Table Lookup
            </span>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 'bold', color: '#722F37', marginTop: '6px' }}>
              Find My Car
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

        {/* Search Bar Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1.5px solid #E8DCC6',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 16px rgba(114, 47, 55, 0.04)'
        }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
          >
            <input
              type="text"
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
              placeholder="Enter License Plate (e.g. LEA-101)"
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1.5px solid #B7A89A',
                fontSize: '16px',
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                backgroundColor: '#FAF7F2'
              }}
            />

            <button
              type="submit"
              style={{
                backgroundColor: '#722F37',
                color: '#FFFFFF',
                padding: '14px 28px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(114, 47, 55, 0.25)'
              }}
            >
              Search Plate 🔍
            </button>
          </form>

          {/* Quick Click Parked Cars (Helpful for demonstration) */}
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#8E7E76', fontWeight: 'bold' }}>
              Quick Select Parked Car:
            </span>
            {snapshot.bookings.map((b) => (
              <button
                key={b.plate}
                type="button"
                onClick={() => {
                  setSearchPlate(b.plate);
                  handleSearch(b.plate);
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #E8DCC6',
                  backgroundColor: searchPlate === b.plate ? '#FFF5DD' : '#FFFFFF',
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

          {/* Search Result Banner */}
          {searchAttempted && !foundBooking && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              backgroundColor: '#FFEBEE',
              border: '1px solid #FFCDD2',
              borderRadius: '10px',
              color: '#C62828',
              fontSize: '13px'
            }}>
              No parked vehicle found matching plate <strong>{searchPlate}</strong>.
            </div>
          )}

          {foundBooking && slotInfo && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              backgroundColor: '#FFF5DD',
              borderRadius: '16px',
              border: '1.5px solid #F9D98B',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8F5E05' }}>
                  VEHICLE LOCATED IN O(1) TIME
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722F37', marginTop: '4px' }}>
                  Parked in Slot #{foundBooking.slotNumber}
                </div>
                <div style={{ fontSize: '13px', color: '#5D4F4B', marginTop: '2px' }}>
                  Driver: <strong>{foundBooking.ownerName}</strong> • {slotInfo.distanceFromEntrance}m from entrance • Aisle {slotInfo.band + 1}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Link
                  href={`/ticket?plate=${foundBooking.plate}`}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#722F37',
                    border: '1px solid #B7A89A',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 'bold'
                  }}
                >
                  View Ticket 🎫
                </Link>
                <Link
                  href={`/exit?plate=${foundBooking.plate}`}
                  style={{
                    backgroundColor: '#722F37',
                    color: '#FFFFFF',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(114, 47, 55, 0.25)'
                  }}
                >
                  Leave &amp; Free Slot 🚗 →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 2D / 3D Lot Map with Highlighted Slot */}
        <LotMap2D
          slotBookings={snapshot.slotBookings}
          activeHolds={snapshot.activeHolds}
          highlightSlot={foundBooking?.slotNumber}
          recommendedSlot={null}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
        />
      </div>

      <DsaPanel />
    </main>
  );
}

export default function FindPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading Find Vehicle...</div>}>
      <FindCarContent />
    </Suspense>
  );
}
