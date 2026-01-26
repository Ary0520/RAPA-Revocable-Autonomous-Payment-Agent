'use client';

import { useState } from 'react';
import { useAccount } from '@/hooks';

interface ConnectButtonProps {
  label?: string;
  className?: string;
}

export function ConnectButton({ label = "Connect Wallet", className = "" }: ConnectButtonProps) {
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
        setError('Failed to connect to Freighter');
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
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isConnecting}
        className={`btn-primary px-6 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed glow-hover ${className}`}
      >
        {isConnecting ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </div>
        ) : (
          label
        )}
      </button>

      {showOptions && !isConnecting && (
        <div
          className="absolute top-full right-0 mt-2 w-80 card-glass rounded-xl shadow-2xl z-50"
          style={{ animation: 'fadeInUp 0.2s ease-out' }}
        >
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4 text-gradient">Connect Wallet</h3>

            {error && (
              <div className="mb-4 p-3 rounded-lg" style={{
                background: 'rgba(255, 68, 68, 0.1)',
                border: '1px solid var(--error)',
                color: 'var(--error)'
              }}>
                <div className="text-sm">{error}</div>
              </div>
            )}

            <div className="space-y-3">
              {/* Freighter Wallet */}
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full p-4 rounded-xl transition-all duration-300 hover:glow disabled:opacity-50"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    F
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold">Freighter</div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {isFreighterInstalled ? 'Browser extension wallet' : 'Not installed'}
                    </div>
                  </div>
                  {!isFreighterInstalled && (
                    <div className="ml-auto">
                      <span className="text-xs px-2 py-1 rounded" style={{
                        background: 'rgba(255, 170, 0, 0.1)',
                        color: 'var(--warning)'
                      }}>
                        Install
                      </span>
                    </div>
                  )}
                </div>
              </button>

              {/* WalletConnect - Coming Soon */}
              <button
                disabled
                className="w-full p-4 rounded-xl transition-all duration-300 opacity-50 cursor-not-allowed"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    WC
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold">WalletConnect</div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Mobile & desktop wallets
                    </div>
                  </div>
                  <div className="ml-auto">
                    <span className="text-xs px-2 py-1 rounded" style={{
                      background: 'rgba(255, 170, 0, 0.1)',
                      color: 'var(--warning)'
                    }}>
                      Soon
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {!isFreighterInstalled && (
              <div className="mt-4 p-3 rounded-lg" style={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.2)'
              }}>
                <div className="text-sm">
                  <div className="font-semibold mb-1" style={{ color: 'var(--accent-primary)' }}>
                    Install Freighter
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }} className="mb-2">
                    Get the Freighter browser extension to connect your Stellar wallet.
                  </div>
                  <button
                    onClick={handleInstallFreighter}
                    className="text-xs underline hover:no-underline transition-all"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    Download Freighter →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}