'use client';

import { useState } from 'react';
import { useAccount, useIsMounted } from '@/hooks';
import { ConnectButton } from './ConnectButton';

export function WalletConnect() {
  const mounted = useIsMounted();
  const { account, disconnect } = useAccount();

  if (!mounted) {
    return (
      <div style={{
        width: '120px', height: '36px',
        borderRadius: 'var(--r-md)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        animation: 'pulse-dot 2s infinite',
      }} />
    );
  }

  if (account) {
    return <WalletConnected account={account} onDisconnect={disconnect} />;
  }

  return <ConnectButton />;
}

interface WalletConnectedProps {
  account: {
    displayName: string;
    publicKey: string;
    walletType: string;
  };
  onDisconnect: () => void;
}

function WalletConnected({ account, onDisconnect }: WalletConnectedProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(account.publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const walletGradient =
    account.walletType === 'freighter'
      ? 'linear-gradient(135deg, #7c3aed, #ec4899)'
      : 'linear-gradient(135deg, #374151, #6b7280)';

  const walletInitial =
    account.walletType === 'freighter' ? 'F' : 'W';

  const walletName =
    account.walletType === 'freighter' ? 'Freighter' : 'Wallet';

  return (
    <div style={{ position: 'relative' }}>
      {/* Connected pill button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '7px 14px 7px 10px',
          borderRadius: 'var(--r-md)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-active)';
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-primary)';
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)';
        }}
      >
        {/* Wallet icon */}
        <div style={{
          width: '22px', height: '22px', flexShrink: 0,
          borderRadius: '6px',
          background: walletGradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 700, color: '#fff',
          fontFamily: 'monospace',
        }}>
          {walletInitial}
        </div>

        {/* Connection status dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: 'var(--accent-green)',
            boxShadow: '0 0 6px var(--accent-green)',
            display: 'inline-block',
            animation: 'pulse-dot 2s infinite',
          }} />
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12.5px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}>
            {account.displayName}
          </span>
        </div>

        {/* Chevron */}
        <svg
          width="12" height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{ transition: 'transform 0.2s ease', transform: showDropdown ? 'rotate(180deg)' : 'none' }}
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="animate-fadeInUp wallet-dropdown"
          style={{
            position: 'fixed',
            top: 'auto',
            right: '16px',
            width: 'min(300px, calc(100vw - 32px))',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-active)',
            borderRadius: 'var(--r-lg)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5), var(--glow-sm)',
            zIndex: 200,
            overflow: 'hidden',
          }}
        >
          {/* Account header */}
          <div style={{
            padding: '18px 18px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '36px', height: '36px', flexShrink: 0,
              borderRadius: 'var(--r-md)',
              background: walletGradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 700, color: '#fff',
              fontFamily: 'monospace',
            }}>
              {walletInitial}
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {walletName}
              </div>
              <div style={{
                fontSize: '11px', fontWeight: 600,
                color: 'var(--accent-green)',
                display: 'flex', alignItems: 'center', gap: '4px',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }} />
                Connected
              </div>
            </div>
          </div>

          {/* Address */}
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Address
            </div>
            <div
              onClick={copyAddress}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11.5px',
                color: 'var(--text-secondary)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--r-md)',
                padding: '10px 12px',
                cursor: 'pointer',
                wordBreak: 'break-all',
                lineHeight: 1.5,
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-active)'}
              onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-primary)'}
            >
              {account.publicKey}
            </div>
            <div style={{ fontSize: '11px', color: copied ? 'var(--accent-green)' : 'var(--text-muted)', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}>
              {copied ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6l2.5 2.5L9 3"/>
                  </svg>
                  Copied to clipboard
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3.5" y="3.5" width="6" height="6" rx="1"/>
                    <path d="M1.5 7V2a.5.5 0 01.5-.5h5"/>
                  </svg>
                  Click to copy
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding: '10px 10px' }}>
            <MenuAction
              label="View on Explorer"
              onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${account.publicKey}`, '_blank')}
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 2H2a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V9"/>
                  <path d="M8 1h5v5"/>
                  <path d="M13 1L6 8"/>
                </svg>
              }
            />
            <MenuAction
              label="Fund Account (Testnet)"
              onClick={() => window.open('https://laboratory.stellar.org/#account-creator?network=test', '_blank')}
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="7" cy="7" r="5.5"/>
                  <path d="M7 4v6M4 7h6"/>
                </svg>
              }
            />
            <MenuAction
              label="Disconnect"
              danger
              onClick={() => { onDisconnect(); setShowDropdown(false); }}
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3"/>
                  <path d="M9 10l3-3-3-3"/>
                  <path d="M12 7H5"/>
                </svg>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MenuAction({
  label, onClick, icon, danger,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 10px',
        borderRadius: 'var(--r-md)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
        color: danger ? 'var(--accent-red)' : 'var(--text-secondary)',
        fontSize: '13.5px', fontWeight: 500,
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = danger
          ? 'rgba(248,113,113,0.08)'
          : 'var(--bg-hover)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      {icon}
      {label}
    </button>
  );
}