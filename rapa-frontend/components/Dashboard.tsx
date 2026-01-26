'use client';

import { useState } from 'react';
import { CreateAgent } from './CreateAgent';
import { AgentList } from './AgentList';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

  return (
    <section id="dashboard" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Agent Control Center</span>
          </h2>
          <p className="text-lg max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Deploy and manage your autonomous payment agents with enterprise-grade security and control.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="card-glass p-2 flex rounded-2xl">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'create'
                  ? 'btn-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Agent
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'manage'
                  ? 'btn-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Manage Agents
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'create' && (
            <div className="animate-fadeInUp">
              <div className="card-glass">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 text-gradient">Deploy New Agent</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Configure your autonomous payment agent with custom rules and limits.
                  </p>
                </div>
                <CreateAgent />
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="animate-fadeInUp">
              <div className="card-glass">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 text-gradient">Active Agents</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Monitor and control your deployed payment agents.
                  </p>
                </div>
                <AgentList />
              </div>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="card hover:glow transition-all duration-300">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold mb-3 text-gradient">Smart Contract Security</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              All rules enforced by Soroban smart contracts. No trusted intermediaries required.
            </p>
          </div>

          <div className="card hover:glow transition-all duration-300">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-3 text-gradient">Lightning Fast</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Built on Stellar network for fast, low-cost transactions with global reach.
            </p>
          </div>

          <div className="card hover:glow transition-all duration-300">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-3 text-gradient">Precision Control</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Set exact amounts, intervals, and expiry dates. Full customization at your fingertips.
            </p>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center mb-12 text-gradient">
            Production Use Cases
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card border-gradient">
              <div className="text-2xl mb-4">💳</div>
              <h4 className="text-lg font-bold mb-3" style={{ color: 'var(--success)' }}>
                SaaS Subscriptions
              </h4>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                "Pay 50 XLM monthly to my SaaS provider, revocable anytime"
              </p>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Non-custodial recurring payments
              </div>
            </div>

            <div className="card border-gradient">
              <div className="text-2xl mb-4">🏛️</div>
              <h4 className="text-lg font-bold mb-3" style={{ color: 'var(--warning)' }}>
                DAO Treasury
              </h4>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                "Pay contributors up to 1000 XLM weekly from treasury"
              </p>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Automated payroll without multisig
              </div>
            </div>

            <div className="card border-gradient">
              <div className="text-2xl mb-4">🚨</div>
              <h4 className="text-lg font-bold mb-3" style={{ color: 'var(--error)' }}>
                Emergency Locks
              </h4>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                "Lock funds automatically after 24h of inactivity"
              </p>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Autonomous security protocols
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}