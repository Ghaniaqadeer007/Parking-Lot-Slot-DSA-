'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CarDriveAnimation from '../../components/CarDriveAnimation';
import DsaPanel from '../../components/DsaPanel';
import { getDraftVehicle } from '../../lib/dsaStore';

function ParkingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const draft = getDraftVehicle();
  const slotNumber = parseInt(searchParams.get('slot') || draft.slotNumber || 1, 10);
  const plate = searchParams.get('plate') || draft.plate || 'CAR-001';
  const color = searchParams.get('color') || draft.color || '#722F37';

  const handleAnimationComplete = () => {
    router.push(`/ticket?slot=${slotNumber}&plate=${encodeURIComponent(plate)}`);
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#FBF8F3',
      padding: '32px 48px',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      color: '#261517'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <CarDriveAnimation
          slotNumber={slotNumber}
          plate={plate}
          carColor={color}
          onComplete={handleAnimationComplete}
        />
      </div>

      <DsaPanel />
    </main>
  );
}

export default function ParkingPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading Parking Visualizer...</div>}>
      <ParkingContent />
    </Suspense>
  );
}
