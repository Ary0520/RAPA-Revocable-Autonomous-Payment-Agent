'use client';

import { useState } from 'react';
import { WalletConnect } from './WalletConnect';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="text-2xl font-bold text-gradient">RAPA</div>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"></div>
            </div>
            <div className="hidden md:block text-sm" style={{ color: 'var(--text-secondary)' }}>
              Revocable Autonomous Payment Agents
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="#dashboard" 
              className="text-sm font-medium transition-colors hover:text-gradient"
              style={{ color: 'var(--text-secondary)' }}
            >
              Dashboard
            </a>
            <a 
              href="#agents" 
              className="text-sm font-medium transition-colors hover:text-gradient"
              style={{ color: 'var(--text-secondary)' }}
            >
              Agents
            </a>
            <a 
              href="#docs" 
              className="text-sm font-medium transition-colors hover:text-gradient"
              style={{ color: 'var(--text-secondary)' }}
            >
              Docs
            </a>
            <a 
              href="https://github.com/your-repo/rapa" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium transition-colors hover:text-gradient"
              style={{ color: 'var(--text-secondary)' }}
            >
              GitHub
            </a>
          </nav>

          {/* Wallet Connect */}
          <div className="flex items-center space-x-4">
            <WalletConnect />
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ 
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-current transition-all"></div>
                <div className="w-full h-0.5 bg-current transition-all"></div>
                <div className="w-full h-0.5 bg-current transition-all"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
            <nav className="flex flex-col space-y-4">
              <a 
                href="#dashboard" 
                className="text-sm font-medium transition-colors hover:text-gradient"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </a>
              <a 
                href="#agents" 
                className="text-sm font-medium transition-colors hover:text-gradient"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Agents
              </a>
              <a 
                href="#docs" 
                className="text-sm font-medium transition-colors hover:text-gradient"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Docs
              </a>
              <a 
                href="https://github.com/your-repo/rapa" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium transition-colors hover:text-gradient"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setIsMenuOpen(false)}
              >
                GitHub
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}