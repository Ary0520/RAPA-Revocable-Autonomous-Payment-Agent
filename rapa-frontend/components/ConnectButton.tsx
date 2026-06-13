'use client';

import { useState } from 'react';
import { useAccount } from '@/hooks';

interface ConnectButtonProps {
  label?: string;
  className?: string;
}

export function ConnectButton({ label = 'Connect Wallet', className = '' }: ConnectButtonProps) {
  const { connectFreighter, isFreighterInstalled } = useAccount();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');

    try {
      const success = await connectFreighter();
      if (!success) {
        setError('Failed to connect to Freighter. Please try again.');
      } else {
        setShowOptions(false);
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInstallFreighter = () => {
    window.open('https://freighter.app/', '_blank');
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isConnecting}
        className={`btn-primary ${className}`}
        style={{ padding: '9px 18px', fontSize: '13.5px' }}
      >
        {isConnecting ? (
          <>
            <div style={{
              width: '13px', height: '13px',
              border: '2px solid rgba(255,255,255,0.25)',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
            Connecting
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 6.5h10M8 2.5l4 4-4 4"/>
            </svg>
            {label}
          </>
        )}
      </button>

      {showOptions && !isConnecting && (
        <div
          className="animate-fadeInUp wallet-dropdown"
          style={{
            position: 'fixed',
            top: 'auto',
            right: '16px',
            width: 'min(320px, calc(100vw - 32px))',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-active)',
            borderRadius: 'var(--r-lg)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5), var(--glow-sm)',
            zIndex: 200,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 20px 16px',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '2px' }}>
              Connect Wallet
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Select a wallet to connect to RAPA
            </div>
          </div>

          <div style={{ padding: '16px 20px' }}>
            {error && (
              <div className="alert-error" style={{ marginBottom: '14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <circle cx="7.5" cy="7.5" r="6"/>
                  <path d="M7.5 5v3M7.5 10v.5"/>
                </svg>
                <span style={{ fontSize: '13px' }}>{error}</span>
              </div>
            )}

            {/* Freighter option */}
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--r-md)',
                background: 'var(--bg-hover)',
                border: '1px solid var(--border-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '10px',
                display: 'flex', alignItems: 'center', gap: '14px',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-blue)';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(77,158,255,0.06)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-primary)';
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)';
              }}
            >
              <div style={{
                width: '38px', height: '38px', flexShrink: 0,
                borderRadius: 'var(--r-md)',
                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '15px', fontWeight: 700, color: '#fff', fontFamily: 'monospace',
              }}>
                F
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  Freighter
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {isFreighterInstalled ? 'Stellar browser extension' : 'Not installed — click to install'}
                </div>
              </div>
              {!isFreighterInstalled ? (
                <span style={{
                  fontSize: '11px', fontWeight: 600, padding: '3px 8px',
                  borderRadius: 'var(--r-pill)',
                  background: 'rgba(251,191,36,0.1)',
                  border: '1px solid rgba(251,191,36,0.2)',
                  color: 'var(--accent-amber)',
                }}>
                  Install
                </span>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M1 7h12M8 2l5 5-5 5"/>
                </svg>
              )}
            </button>

            {/* WalletConnect coming soon */}
            <div
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--r-md)',
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', gap: '14px',
                opacity: 0.45,
                cursor: 'not-allowed',
              }}
            >
              <div style={{
                width: '38px', height: '38px', flexShrink: 0,
                borderRadius: 'var(--r-md)',
                background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: '#fff', fontFamily: 'monospace',
              }}>
                WC
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  WalletConnect
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Mobile &amp; desktop wallets
                </div>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 600, padding: '3px 8px',
                borderRadius: 'var(--r-pill)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-muted)',
              }}>
                Soon
              </span>
            </div>

            {!isFreighterInstalled && (
              <div className="alert-info" style={{ marginTop: '14px' }}>
                <div style={{ fontWeight: 600, fontSize: '12.5px', marginBottom: '4px', color: 'var(--accent-blue)' }}>
                  Get Freighter
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Install the Freighter browser extension to use your Stellar wallet with RAPA.
                </div>
                <button
                  onClick={handleInstallFreighter}
                  style={{
                    fontSize: '12px', fontWeight: 600,
                    color: 'var(--accent-blue)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  Download Freighter
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M1 5.5h9M6 1.5l4 4-4 4"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}