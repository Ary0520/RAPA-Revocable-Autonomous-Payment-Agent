'use client';

import { useState, useEffect } from 'react';

export function Hero() {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    { icon: '🔒', title: 'Non-Custodial', desc: 'Your funds, your rules' },
    { icon: '⚡', title: 'Autonomous', desc: 'Set once, run forever' },
    { icon: '🛑', title: 'Revocable', desc: 'Stop anytime, instantly' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          {/* Main Heading */}
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              <span className="text-gradient">RAPA</span>
            </h1>
            <div className="text-xl md:text-2xl font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
              Revocable Autonomous Payment Agents
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto opacity-60"></div>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl max-w-4xl mx-auto mb-12 leading-relaxed animate-fadeInUp" 
             style={{ color: 'var(--text-secondary)', animationDelay: '0.2s' }}>
            Create rule-based autonomous payment agents on Stellar that execute payments 
            without repeated approval, enforced entirely by{' '}
            <span className="text-gradient font-semibold">Soroban smart contracts</span>.
          </p>

          {/* Feature Showcase */}
          <div className="flex justify-center mb-12 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <div className="card-glass max-w-md">
              <div className="text-4xl mb-4">{features[currentFeature].icon}</div>
              <h3 className="text-xl font-bold mb-2 text-gradient">
                {features[currentFeature].title}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {features[currentFeature].desc}
              </p>
              
              {/* Progress indicators */}
              <div className="flex justify-center space-x-2 mt-6">
                {features.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentFeature 
                        ? 'bg-cyan-400 w-8' 
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" 
               style={{ animationDelay: '0.6s' }}>
            <button 
              className="btn-primary glow-hover px-8 py-4 text-lg font-semibold"
              onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Launch App
            </button>
            <button 
              className="btn-secondary px-8 py-4 text-lg font-semibold"
              onClick={() => window.open('https://github.com/your-repo/rapa', '_blank')}
            >
              View Code
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fadeInUp" 
             style={{ animationDelay: '0.8s' }}>
          <div className="text-center">
            <div className="text-3xl font-bold text-gradient mb-2">100%</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Non-Custodial</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gradient mb-2">24/7</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Autonomous</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gradient mb-2">0s</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Revocation Time</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-pulse">
        <div className="w-6 h-10 border-2 rounded-full flex justify-center" 
             style={{ borderColor: 'var(--border-secondary)' }}>
          <div className="w-1 h-3 bg-gradient-to-b from-cyan-400 to-transparent rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}