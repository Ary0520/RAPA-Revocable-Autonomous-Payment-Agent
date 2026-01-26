'use client';

import { useAccount, useIsMounted } from '@/hooks';
import { ConnectButton } from './ConnectButton';

export function WalletConnect() {
  const mounted = useIsMounted();
  const { account, disconnect } = useAccount();

  if (!mounted) {
    return (
      <div className="w-24 h-10 rounded-xl animate-pulse" style={{ background: 'var(--bg-card)' }}></div>
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

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(account.publicKey);
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const getWalletIcon = (walletType: string) => {
    switch (walletType) {
      case 'freighter':
        return (
          <div className="w-5 h-5 rounded bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
            F
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center text-xs font-bold text-white">
            W
          </div>
        );
    }
  };

  const getWalletName = (walletType: string) => {
    switch (walletType) {
      case 'freighter':
        return 'Freighter';
      default:
        return 'Wallet';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-300 glow-hover"
        style={{ 
          background: 'var(--glass)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="flex items-center space-x-2">
          {getWalletIcon(account.walletType)}
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)' }}></div>
        </div>
        <span className="font-mono text-sm">{account.displayName}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div 
          className="absolute right-0 mt-2 w-72 card-glass rounded-xl shadow-2xl z-50"
          style={{ animation: 'fadeInUp 0.2s ease-out' }}
        >
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              {getWalletIcon(account.walletType)}
              <div>
                <div className="font-semibold">{getWalletName(account.walletType)}</div>
                <div className="text-xs" style={{ color: 'var(--success)' }}>Connected</div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Address</div>
              <div 
                className="font-mono text-sm p-3 rounded-lg cursor-pointer transition-colors break-all"
                style={{ 
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
                onClick={copyAddress}
              >
                {account.publicKey}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Click to copy
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${account.publicKey}`, '_blank')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-800 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>View on Explorer</span>
              </button>
              <button
                onClick={() => window.open('https://laboratory.stellar.org/#account-creator?network=test', '_blank')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-800 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Fund Account (Testnet)</span>
              </button>
              <button
                onClick={() => {
                  onDisconnect();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-red-900/20 text-red-400 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Import useState at the top
import { useState } from 'react';