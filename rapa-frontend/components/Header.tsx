'use client';

import { useState } from 'react';
import { WalletConnect } from './WalletConnect';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Agents', href: '#agents' },
    { label: 'Docs', href: '#docs' },
    { label: 'GitHub', href: 'https://github.com/your-repo/rapa', external: true },
  ];

  return (
    <header
      className="glass-strong"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Icon mark */}
            <div style={{
              width: '30px', height: '30px',
              background: 'linear-gradient(135deg, #4d9eff, #818cf8)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 2V14M2 5.5L14 10.5M14 5.5L2 10.5" stroke="white" strokeWidth="1" strokeOpacity="0.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.01em', color: 'var(--text-primary)', lineHeight: 1 }}>
                RAPA
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '1px' }}>
                Protocol
              </div>
            </div>
          </div>

          {/* Nav — desktop */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
               className="hidden md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                style={{
                  fontSize: '13.5px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  padding: '6px 14px',
                  borderRadius: 'var(--r-md)',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)';
                  (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)';
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right — wallet + testnet pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Testnet badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px',
              borderRadius: 'var(--r-pill)',
              background: 'rgba(52,211,153,0.08)',
              border: '1px solid rgba(52,211,153,0.18)',
              fontSize: '11.5px', fontWeight: 600,
              color: 'var(--accent-green)',
              letterSpacing: '0.02em',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: 'var(--accent-green)',
                boxShadow: '0 0 6px var(--accent-green)',
                display: 'inline-block',
                animation: 'pulse-dot 2s infinite',
              }} />
              Testnet
            </div>

            <WalletConnect />

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              style={{
                display: 'none',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--r-md)',
                padding: '8px',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
              }}
              className="md:hidden-btn"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                {isMenuOpen ? (
                  <>
                    <line x1="2" y1="2" x2="14" y2="14" />
                    <line x1="14" y1="2" x2="2" y2="14" />
                  </>
                ) : (
                  <>
                    <line x1="2" y1="4" x2="14" y2="4" />
                    <line x1="2" y1="8" x2="14" y2="8" />
                    <line x1="2" y1="12" x2="14" y2="12" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            padding: '12px 0 16px',
          }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    padding: '10px 12px',
                    borderRadius: 'var(--r-md)',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}