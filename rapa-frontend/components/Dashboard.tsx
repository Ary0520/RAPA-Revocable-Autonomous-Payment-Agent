'use client';

import { useState } from 'react';
import { CreateAgent } from './CreateAgent';
import { AgentList } from './AgentList';

const USE_CASES = [
  {
    title: 'SaaS Subscriptions',
    description: '"Pay 50 XLM monthly to my SaaS provider, revocable anytime"',
    detail: 'Non-custodial recurring payments',
    color: 'var(--accent-green)',
    bgColor: 'rgba(52,211,153,0.06)',
    borderColor: 'rgba(52,211,153,0.15)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1.5" y="4.5" width="15" height="11" rx="1.5"/>
        <path d="M1.5 7.5h15"/>
        <path d="M5 11h2M5 13h4"/>
      </svg>
    ),
  },
  {
    title: 'DAO Treasury',
    description: '"Pay contributors up to 1000 XLM weekly from treasury"',
    detail: 'Automated payroll without multisig',
    color: 'var(--accent-indigo)',
    bgColor: 'rgba(129,140,248,0.06)',
    borderColor: 'rgba(129,140,248,0.15)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2L16 6v6l-7 4L2 12V6l7-4z"/>
        <path d="M9 2v14M2 6l7 4 7-4"/>
      </svg>
    ),
  },
  {
    title: 'Emergency Locks',
    description: '"Lock funds automatically after 24h of inactivity"',
    detail: 'Autonomous security protocols',
    color: 'var(--accent-red)',
    bgColor: 'rgba(248,113,113,0.06)',
    borderColor: 'rgba(248,113,113,0.15)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 1l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/>
      </svg>
    ),
  },
];

const INFRA_FEATURES = [
  {
    title: 'Smart Contract Security',
    description: 'All payment rules are enforced by Soroban smart contracts. No trusted intermediaries, no custody.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2L3 5.5V10c0 4 3.5 7 7 8 3.5-1 7-4 7-8V5.5L10 2z"/>
        <path d="M7 10l2 2 4-4"/>
      </svg>
    ),
  },
  {
    title: 'Stellar Network Speed',
    description: 'Built on Stellar for 5-second finality, near-zero fees, and global accessibility.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10h3l3-7 4 14 3-7h2"/>
      </svg>
    ),
  },
  {
    title: 'Precision Rule Engine',
    description: 'Set exact per-payment limits, execution intervals, expiry dates, and funding caps.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="8"/>
        <path d="M10 6v4l2.5 2.5"/>
        <path d="M2 10h2M16 10h2M10 2v2M10 16v2"/>
      </svg>
    ),
  },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

  return (
    <section
      id="dashboard"
      style={{
        padding: 'clamp(60px, 10vw, 100px) 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top gradient line */}
      <div style={{
        position: 'absolute', top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(600px, 100%)', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(77,158,255,0.3), transparent)',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '5px 14px',
            borderRadius: 'var(--r-pill)',
            background: 'rgba(77,158,255,0.06)',
            border: '1px solid rgba(77,158,255,0.15)',
            fontSize: '12px', fontWeight: 600,
            color: 'var(--accent-blue)',
            letterSpacing: '0.05em', textTransform: 'uppercase',
            marginBottom: '20px',
          }}>
            Agent Control Center
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            marginBottom: '14px',
          }}>
            Deploy &amp; Manage Your Payment Agents
          </h2>
          <p style={{
            fontSize: '15.5px',
            color: 'var(--text-secondary)',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}>
            Configure autonomous payment agents with custom rules, limits, and expiry — all enforced on-chain.
          </p>
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--r-lg)',
            padding: '4px',
            gap: '4px',
          }}>
            {(['create', 'manage'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '9px 24px',
                  borderRadius: 'calc(var(--r-lg) - 4px)',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: activeTab === tab
                    ? 'linear-gradient(135deg, #4d9eff, #818cf8)'
                    : 'transparent',
                  color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                  boxShadow: activeTab === tab ? '0 2px 12px rgba(77,158,255,0.25)' : 'none',
                }}
              >
                {tab === 'create' ? 'Create Agent' : 'Manage Agents'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ maxWidth: '780px', margin: '0 auto 80px' }}>
          {activeTab === 'create' && (
            <div className="animate-fadeInUp">
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--r-xl)',
                padding: 'clamp(20px, 4vw, 32px)',
                boxShadow: 'var(--shadow-card)',
              }}
              className="dashboard-panel"
              >
                <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Deploy New Agent
                  </h3>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                    Configure your autonomous payment agent with custom rules and spending limits.
                  </p>
                </div>
                <CreateAgent />
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="animate-fadeInUp">
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--r-xl)',
                padding: 'clamp(20px, 4vw, 32px)',
                boxShadow: 'var(--shadow-card)',
              }}
              className="dashboard-panel"
              >
                <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Active Agents
                  </h3>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                    Monitor, review, and control your deployed payment agents in real time.
                  </p>
                </div>
                <AgentList />
              </div>
            </div>
          )}
        </div>

        {/* Horizontal divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--border-primary), transparent)',
          marginBottom: '80px',
        }} />

        {/* Infrastructure features */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Built for Production
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Enterprise-grade infrastructure under the hood.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '80px',
        }}>
          {INFRA_FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="card"
              style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}
            >
              <div style={{
                width: '40px', height: '40px', flexShrink: 0,
                background: 'rgba(77,158,255,0.08)',
                border: '1px solid rgba(77,158,255,0.15)',
                borderRadius: 'var(--r-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-blue)',
              }}>
                {feat.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {feat.title}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {feat.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Use cases */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Real-World Use Cases
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            From DeFi payroll to autonomous subscriptions.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}>
          {USE_CASES.map((uc) => (
            <div
              key={uc.title}
              style={{
                background: uc.bgColor,
                border: `1px solid ${uc.borderColor}`,
                borderRadius: 'var(--r-lg)',
                padding: '24px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '36px', height: '36px',
                borderRadius: 'var(--r-md)',
                background: 'rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: uc.color,
                marginBottom: '14px',
              }}>
                {uc.icon}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: uc.color, marginBottom: '8px' }}>
                {uc.title}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.55, fontStyle: 'italic' }}>
                {uc.description}
              </p>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {uc.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{
          marginTop: '80px',
          padding: '24px',
          borderRadius: 'var(--r-lg)',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Running on Stellar Testnet
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              This deployment uses the Stellar Testnet. Mainnet launch coming soon.
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--r-pill)',
            background: 'rgba(52,211,153,0.08)',
            border: '1px solid rgba(52,211,153,0.2)',
            fontSize: '12px', fontWeight: 600,
            color: 'var(--accent-green)',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
            All systems operational
          </div>
        </div>

      </div>
    </section>
  );
}