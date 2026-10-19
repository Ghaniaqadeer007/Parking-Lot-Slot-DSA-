'use client';

import React, { useState } from 'react';
import WarpText from '../components/WarpText';

export default function CoverPage() {
  const [activeTab, setActiveTab] = useState('cover');

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#FBF8F3', // Warm Ivory Canvas
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      color: '#261517',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 48px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient background glows */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(114, 47, 55, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(183, 168, 154, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Top Navigation */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: '#722F37', // Deep Burgundy
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: '18px',
            boxShadow: '0 4px 12px rgba(114, 47, 55, 0.2)'
          }}>
            P
          </div>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', fontSize: '18px', color: '#722F37' }}>
              PARKFLOW
            </div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#B7A89A', letterSpacing: '0.05em' }}>
              DSA ALLOCATOR SUITE
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#E8DCC6', // Mocha Cream
          padding: '8px 18px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#722F37',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid rgba(183, 168, 154, 0.5)'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#337046' }} />
          SYSTEM READY • MIN-HEAP ACTIVE
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        gap: '40px',
        alignItems: 'center',
        margin: 'auto 0',
        zIndex: 10
      }}>
        {/* Left Column: Heading with WarpText */}
        <div>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#E8DCC6',
            color: '#722F37',
            padding: '6px 16px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '16px',
            border: '1px solid #B7A89A'
          }}>
            ✦ REACT BITS WEBGL REFRACTION • COSMIC LATTE & BURGUNDY
          </div>

          {/* MAIN HEADING WITH WARPTEXT INTEGRATION */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '180px',
            margin: '0 0 10px 0',
            cursor: 'crosshair'
          }}>
            <WarpText
              text={"PARKING LOT\nSLOT ALLOCATER"}
              color="#722F37"
              warpStrength={0.08}
              warpScale={1.7}
              speed={0.55}
              lens="bulge"
              pointerInfluence={0.42}
              pointerStrength={0.38}
              refraction={0.018}
              chromatic={0.35}
              idleDrift={0.2}
              ripple
              clickRipple
              intro
              fontSize="clamp(2.5rem, 5.2vw, 4.2rem)"
              fontWeight={800}
              fontFamily="Georgia, serif"
              letterSpacing="-0.02em"
              lineHeight={1.05}
              style={{ width: '100%', height: '180px' }}
            />
          </div>

          <p style={{
            fontSize: '15px',
            lineHeight: 1.6,
            color: '#5D4F4B',
            maxWidth: '520px',
            marginBottom: '28px'
          }}>
            An intelligent, high-speed parking lot slot allocation system engineered for maximum efficiency. Powered by Min-Heap priority queues for instant nearest bay routing, O(1) hash indexing, and real-time WebGL interactive visuals.
          </p>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <button style={{
              backgroundColor: '#722F37',
              color: '#FFFFFF',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(114, 47, 55, 0.25)',
              transition: 'transform 0.2s, background-color 0.2s'
            }}>
              🚀 Launch Slot Allocator →
            </button>

            <button style={{
              backgroundColor: '#FFFFFF',
              color: '#722F37',
              border: '1.5px solid #E8DCC6',
              padding: '14px 24px',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: 'pointer'
            }}>
              🧠 Explore DSA Specs
            </button>
          </div>

          {/* DSA Feature Badges */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E8DCC6',
              borderRadius: '10px',
              padding: '12px 16px',
              flex: 1
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#722F37' }}>⚡ Min-Heap</div>
              <div style={{ fontSize: '11px', color: '#B7A89A', marginTop: '2px' }}>O(log N) Nearest Bay</div>
            </div>
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E8DCC6',
              borderRadius: '10px',
              padding: '12px 16px',
              flex: 1
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#722F37' }}>🔍 Hash Table</div>
              <div style={{ fontSize: '11px', color: '#B7A89A', marginTop: '2px' }}>O(1) Plate Resolution</div>
            </div>
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E8DCC6',
              borderRadius: '10px',
              padding: '12px 16px',
              flex: 1
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#337046' }}>⏳ FIFO Queue</div>
              <div style={{ fontSize: '11px', color: '#B7A89A', marginTop: '2px' }}>Zero-Collision Buffer</div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Simulation Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px',
          border: '1.5px solid #E8DCC6',
          boxShadow: '0 12px 36px rgba(60, 40, 42, 0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', fontSize: '16px', color: '#722F37' }}>
                Live Parking Simulation
              </div>
              <div style={{ fontSize: '12px', color: '#B7A89A' }}>
                Real-time Min-Heap slot assignment visualizer
              </div>
            </div>
            <div style={{
              backgroundColor: '#E8DCC6',
              color: '#722F37',
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '4px 10px',
              borderRadius: '12px'
            }}>
              ● LIVE
            </div>
          </div>

          {/* Graphical parking bays preview */}
          <div style={{
            backgroundColor: '#F3EDE4',
            borderRadius: '12px',
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            border: '1px solid #E8DCC6'
          }}>
            {['A-01 (Occupied)', 'A-02 (EV Available)', 'A-03 (Allocated)', 'B-01 (Available)', 'B-02 (Occupied)', 'B-03 (VIP)'].map((slot, i) => (
              <div key={i} style={{
                backgroundColor: i === 0 || i === 4 ? '#FFFFFF' : '#E8DCC6',
                border: '1px solid ' + (i === 2 ? '#722F37' : '#B7A89A'),
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: i === 2 ? '#722F37' : '#261517'
              }}>
                {slot}
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            backgroundColor: '#FBF8F3',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#5D4F4B',
            border: '1px solid #E8DCC6',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: '#722F37' }}>⚡</span>
            <span>Allocating nearest slot (Min-Heap): <strong>Slot A-03</strong> assigned to vehicle.</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '16px',
        borderTop: '1px solid #E8DCC6',
        fontSize: '12px',
        color: '#8E7E76',
        zIndex: 10
      }}>
        <div>⚡ React Bits &lt;WarpText /&gt; • C# .NET 8 WinForms Solution • Visual Studio Ready</div>
        <div style={{ fontWeight: 'bold', color: '#722F37' }}>Cosmic Latte, Mocha Cream &amp; Deep Burgundy Theme</div>
      </footer>
    </main>
  );
}
