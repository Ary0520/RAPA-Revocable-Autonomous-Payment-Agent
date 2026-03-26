'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Dashboard } from '@/components/Dashboard';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-void)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {/* Logo mark */}
          <div style={{
            width: '44px', height: '44px',
            background: 'linear-gradient(135deg, #4d9eff, #818cf8)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pulse-dot 1.5s infinite',
          }}>
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M8 2V14M2 5.5L14 10.5M14 5.5L2 10.5" stroke="white" strokeWidth="0.8" strokeOpacity="0.5"/>
            </svg>
          </div>
          <div style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
            RAPA
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)' }}>
      <Header />
      <main>
        <Hero />
        <Dashboard />
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '28px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        maxWidth: '1280px',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '22px', height: '22px',
            background: 'linear-gradient(135deg, #4d9eff, #818cf8)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>RAPA Protocol</span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Revocable Autonomous Payment Agents on Stellar · Testnet
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Powered by Soroban Smart Contracts
        </div>
      </footer>
    </div>
  );
}