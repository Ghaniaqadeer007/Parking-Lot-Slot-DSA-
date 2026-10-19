'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Stepper from '../../components/Stepper';
import ColorPicker from '../../components/ColorPicker';
import DsaPanel from '../../components/DsaPanel';
import { dsaStore, getDraftVehicle, saveDraftVehicle } from '../../lib/dsaStore';

export default function CarDetailsPage() {
  const router = useRouter();

  const [plate, setPlate] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [color, setColor] = useState('#722F37');
  const [errorMsg, setErrorMsg] = useState('');
  const [duplicateSlot, setDuplicateSlot] = useState(null);

  useEffect(() => {
    // Restore any existing draft
    const draft = getDraftVehicle();
    if (draft.plate) setPlate(draft.plate);
    if (draft.ownerName) setOwnerName(draft.ownerName);
    if (draft.phone) setPhone(draft.phone);
    if (draft.color) setColor(draft.color);
  }, []);

  const handlePlateChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setPlate(val);
    setErrorMsg('');
    setDuplicateSlot(null);

    // Live duplicate check against Hash Map
    if (val.length >= 3) {
      const snap = dsaStore.getSnapshot();
      const existing = snap.bookings.find((b) => b.plate === val);
      if (existing) {
        setDuplicateSlot(existing.slotNumber);
      }
    }
  };

  const isPlateValid = plate.trim().length >= 3 && plate.trim().length <= 10;
  const isNameValid = ownerName.trim().length >= 2;
  const canProceed = isPlateValid && isNameValid && !duplicateSlot;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canProceed) return;

    // Check if garage is full
    const snap = dsaStore.getSnapshot();
    if (snap.freeSlotsCount === 0) {
      router.push('/full');
      return;
    }

    saveDraftVehicle({
      plate: plate.trim().toUpperCase(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      color,
      mode: 'closest'
    });

    router.push('/slots');
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#FBF8F3',
      padding: '32px 48px',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      color: '#261517'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Stepper (Step 1) */}
        <Stepper currentStep={1} onBack={() => router.push('/')} />

        {/* Main Card */}
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
              Step 1 of 4 • Driver &amp; Vehicle Registration
            </span>
            <h1 style={{
              fontFamily: 'Georgia, serif',
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#722F37',
              marginTop: '10px'
            }}>
              Enter Your Vehicle Details
            </h1>
            <p style={{ fontSize: '14px', color: '#8E7E76', marginTop: '4px' }}>
              Your plate will be indexed into our O(1) Hash Map. Choose your vehicle colour to watch it navigate the lot.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* License Plate Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#722F37',
                marginBottom: '8px'
              }}>
                License Plate Number <span style={{ color: '#D32F2F' }}>*</span>
              </label>
              <input
                type="text"
                value={plate}
                onChange={handlePlateChange}
                placeholder="e.g. LEA-101 or LHR-2025"
                maxLength={10}
                required
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: duplicateSlot ? '2px solid #D32F2F' : '1.5px solid #B7A89A',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  outline: 'none',
                  backgroundColor: '#FAF7F2',
                  boxSizing: 'border-box'
                }}
              />

              {duplicateSlot && (
                <div style={{
                  marginTop: '10px',
                  padding: '12px 16px',
                  backgroundColor: '#FFEBEE',
                  border: '1px solid #FFCDD2',
                  borderRadius: '10px',
                  color: '#C62828',
                  fontSize: '13px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Vehicle <strong>{plate}</strong> is already parked in Slot #{duplicateSlot}!</span>
                  <Link
                    href={`/find?plate=${plate}`}
                    style={{
                      backgroundColor: '#C62828',
                      color: '#FFFFFF',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  >
                    View on Map →
                  </Link>
                </div>
              )}
            </div>

            {/* Owner Name & Phone Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: '#722F37',
                  marginBottom: '8px'
                }}>
                  Driver / Owner Name <span style={{ color: '#D32F2F' }}>*</span>
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Ayan Mazhar"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '1.5px solid #B7A89A',
                    fontSize: '15px',
                    outline: 'none',
                    backgroundColor: '#FAF7F2',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: '#722F37',
                  marginBottom: '8px'
                }}>
                  Phone Number <span style={{ fontSize: '11px', color: '#8E7E76' }}>(Optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300-1234567"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '1.5px solid #B7A89A',
                    fontSize: '15px',
                    outline: 'none',
                    backgroundColor: '#FAF7F2',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Car Color Picker */}
            <div>
              <ColorPicker value={color} onChange={setColor} />
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '20px',
              borderTop: '1px solid #E8DCC6'
            }}>
              <button
                type="button"
                onClick={() => router.push('/')}
                style={{
                  backgroundColor: 'transparent',
                  color: '#722F37',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ← Cancel &amp; Back
              </button>

              <button
                type="submit"
                disabled={!canProceed}
                style={{
                  backgroundColor: canProceed ? '#722F37' : '#D8CABA',
                  color: '#FFFFFF',
                  padding: '14px 32px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: canProceed ? 'pointer' : 'not-allowed',
                  boxShadow: canProceed ? '0 8px 20px rgba(114, 47, 55, 0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Proceed to Slot Selection →
              </button>
            </div>
          </form>
        </div>
      </div>

      <DsaPanel />
    </main>
  );
}
