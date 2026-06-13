'use client';

import { useState, useEffect, useRef } from 'react';

const PILLS = [
  { label: 'Live on Stellar Testnet', dot: true },
  { label: 'Soroban Smart Contracts' },
];

const STATS = [
  { value: '100%', label: 'Non-Custodial' },
  { value: '24/7', label: 'Autonomous Execution' },
  { value: '<1s', label: 'Revocation Time' },
];

const FEATURES = [
  {
    title: 'Non-Custodial',
    desc: 'Funds stay in your wallet until the exact moment of payment. No escrow, no trust assumptions.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="14" height="10" rx="2"/>
        <path d="M7 8V6a3 3 0 016 0v2"/>
        <circle cx="10" cy="13" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    title: 'Autonomous',
    desc: 'Deploy once and your agent executes payments on schedule — no repeated approvals required.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z"/>
        <path d="M10 6v4l2.5 2.5"/>
      </svg>
    ),
  },
  {
    title: 'Instantly Revocable',
    desc: 'Cancel any agent at any time with a single on-chain transaction. Full control, always.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 5l10 10M15 5L5 15"/>
        <circle cx="10" cy="10" r="8"/>
      </svg>
    ),
  },
];

export function Hero() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        paddingTop: 'clamp(100px, 15vw, 130px)',
        paddingBottom: 'clamp(60px, 10vw, 100px)',
        overflow: 'hidden',
        maxWidth: '100%',
      }}
    >
      {/* Grid background */}
      <div
        className="grid-bg"
        style={{
          position: 'absolute', inset: 0,
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
        }}
      />

      {/* Radial glow orbs */}
      <div style={{
        position: 'absolute', top: '-20%', left: '50%',
        transform: 'translateX(-50%)',
        width: '900px', height: '600px',
        background: 'radial-gradient(ellipse at center, rgba(77,158,255,0.07) 0%, rgba(129,140,248,0.04) 50%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '10%', left: '15%',
        width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(77,158,255,0.06) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '30%', right: '10%',
        width: '280px', height: '280px',
        background: 'radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', position: 'relative' }}>

        {/* Top pills */}
        <div
          className="hero-pills"
          style={{
            display: 'flex', justifyContent: 'center', gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '40px',
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(12px)',
            transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {PILLS.map((pill) => (
            <div
              key={pill.label}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '6px 14px',
                borderRadius: 'var(--r-pill)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-primary)',
                fontSize: '12.5px', fontWeight: 500,
                color: 'var(--text-secondary)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {pill.dot && (
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: 'var(--accent-green)',
                  boxShadow: '0 0 6px var(--accent-green)',
                  display: 'inline-block',
                  animation: 'pulse-dot 2s infinite',
                }} />
              )}
              {!pill.dot && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="6" cy="6" r="4.5"/>
                  <path d="M6 4v2.5l1.5 1.5" strokeLinecap="round"/>
                </svg>
              )}
              {pill.label}
            </div>
          ))}
        </div>

        {/* Headline */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1
            style={{
              fontSize: 'clamp(44px, 8vw, 88px)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              marginBottom: '0',
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(20px)',
              transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1) 0.08s',
            }}
          >
            <span style={{ color: 'var(--text-primary)' }}>Autonomous Payment</span>
            <br />
            <span className="text-gradient-hero">Infrastructure</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>for</span>
            {' '}
            <span className="text-gradient-hero">Stellar</span>
          </h1>
        </div>

        {/* Subheadline */}
        <p
          style={{
            textAlign: 'center',
            maxWidth: '560px',
            margin: '0 auto 44px',
            fontSize: '17px',
            lineHeight: 1.65,
            color: 'var(--text-secondary)',
            fontWeight: 400,
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(16px)',
            transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1) 0.16s',
          }}
        >
          RAPA empowers you to deploy rule-based agents on Stellar that execute payments autonomously —
          enforced entirely by{' '}
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Soroban smart contracts</span>,
          fully revocable at any moment.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center',
            marginBottom: 'clamp(48px, 8vw, 80px)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(14px)',
            transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1) 0.24s',
          }}
        >
          <button
            className="btn-primary"
            style={{ padding: '12px 28px', fontSize: '15px' }}
            onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Launch App
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 7h12M8 2l5 5-5 5"/>
            </svg>
          </button>
          <button
            className="btn-secondary"
            style={{ padding: '12px 28px', fontSize: '15px' }}
            onClick={() => window.open('https://github.com/Ary0520/RAPA-Revocable-Autonomous-Payment-Agent', '_blank')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            View Source
          </button>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            width: '100%',
            maxWidth: '560px',
            margin: '0 auto clamp(48px, 8vw, 80px)',
            borderRadius: 'var(--r-lg)',
            border: '1px solid var(--border-primary)',
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(12px)',
            overflow: 'hidden',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease 0.32s',
          }}
        >
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                padding: 'clamp(12px, 3vw, 20px) clamp(8px, 2vw, 16px)',
                textAlign: 'center',
                borderRight: i < STATS.length - 1 ? '1px solid var(--border-primary)' : 'none',
              }}
            >
              <div style={{ fontSize: 'clamp(18px, 5vw, 26px)', fontWeight: 800, letterSpacing: '-0.02em' }} className="text-gradient">
                {stat.value}
              </div>
              <div style={{ fontSize: 'clamp(9px, 2vw, 11.5px)', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s',
          }}
        >
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--r-lg)',
                padding: '24px',
                transition: 'border-color 0.25s, box-shadow 0.25s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-active)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--glow-sm)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-primary)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '38px', height: '38px',
                borderRadius: 'var(--r-md)',
                background: 'rgba(77,158,255,0.1)',
                border: '1px solid rgba(77,158,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-blue)',
                marginBottom: '16px',
              }}>
                {feat.icon}
              </div>
              <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                {feat.title}
              </div>
              <div style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {feat.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '64px' }}>
          <div
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              color: 'var(--text-muted)', fontSize: '11px', fontWeight: 500,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: 'pointer',
              opacity: visible ? 0.7 : 0,
              transition: 'opacity 0.6s ease 0.6s',
            }}
            onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span>Scroll to app</span>
            <div style={{
              width: '24px', height: '38px',
              border: '1px solid var(--border-primary)',
              borderRadius: '12px',
              display: 'flex', justifyContent: 'center', paddingTop: '6px',
            }}>
              <div style={{
                width: '3px', height: '8px',
                background: 'var(--accent-blue)',
                borderRadius: '2px',
                animation: 'float 1.6s ease-in-out infinite',
              }} />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}