'use client';

import { useState } from 'react';
import { createAgent, storeUserAgent } from '@/lib/stellar';
import { useAccount } from '@/hooks';
import { ConnectButton } from './ConnectButton';

export function CreateAgent() {
  const { account, isConnected } = useAccount();
  const [formData, setFormData] = useState({
    recipient: '',
    maxAmount: '',
    intervalHours: '0.033', // Default to 2 minutes for testing
    expiryDays: '30',
    fundingAmount: '' // Add funding amount field
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check wallet connection
      if (!isConnected || !account) {
        throw new Error('Please connect your wallet first');
      }

      if (!formData.recipient || !formData.maxAmount || !formData.fundingAmount) {
        throw new Error('Please fill in all required fields');
      }

      const maxAmountStroops = Math.floor(parseFloat(formData.maxAmount) * 10_000_000);
      const fundingAmountStroops = Math.floor(parseFloat(formData.fundingAmount) * 10_000_000);
      const intervalSeconds = Math.floor(parseFloat(formData.intervalHours) * 3600);
      const expiryTimestamp = Date.now() + (parseInt(formData.expiryDays) * 24 * 3600 * 1000);

      // Debug logging
      console.log('Agent Parameters:', {
        recipient: formData.recipient,
        maxAmountXLM: formData.maxAmount,
        maxAmountStroops,
        fundingAmountXLM: formData.fundingAmount,
        fundingAmountStroops,
        intervalHours: formData.intervalHours,
        intervalSeconds,
        expiryDays: formData.expiryDays,
        expiryTimestamp: Math.floor(expiryTimestamp / 1000)
      });

      const result = await createAgent({
        recipient: formData.recipient,
        maxAmount: maxAmountStroops,
        intervalSeconds,
        expiryTimestamp: Math.floor(expiryTimestamp / 1000),
        fundingAmount: fundingAmountStroops
      });

      // Store the agent in localStorage for the user
      storeUserAgent(result.contractId, {
        recipient: formData.recipient,
        maxAmount: maxAmountStroops,
        intervalSeconds,
        expiryTimestamp: Math.floor(expiryTimestamp / 1000)
      });

      setSuccess(`Agent deployed and funded successfully! Contract: ${result.contractId.slice(0, 8)}... Funded with ${formData.fundingAmount} XLM`);
      
      setFormData({
        recipient: '',
        maxAmount: '',
        intervalHours: '0.033', // Reset to 2 minutes for testing
        expiryDays: '30',
        fundingAmount: ''
      });

    } catch (err: any) {
      setError(err.message || 'Failed to create agent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Show wallet connection prompt if not connected
  if (!isConnected || !account) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔗</div>
        <div className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Connect Your Wallet
        </div>
        <div className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Connect your Stellar wallet to deploy autonomous payment agents.
        </div>
        <ConnectButton label="Connect Wallet" />
        <div className="mt-6 p-4 rounded-xl" style={{ 
          background: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid rgba(0, 212, 255, 0.2)'
        }}>
          <div className="text-sm">
            <div className="font-semibold mb-1" style={{ color: 'var(--accent-primary)' }}>
              Supported Wallets
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              • Freighter (Browser Extension)<br/>
              • WalletConnect (Coming Soon)
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl border" style={{ 
          background: 'rgba(255, 68, 68, 0.1)',
          borderColor: 'var(--error)',
          color: 'var(--error)'
        }}>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl border" style={{ 
          background: 'rgba(0, 255, 136, 0.1)',
          borderColor: 'var(--success)',
          color: 'var(--success)'
        }}>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}

      {/* Connected Wallet Info */}
      <div className="p-4 rounded-xl" style={{ 
        background: 'rgba(0, 255, 136, 0.1)',
        border: '1px solid rgba(0, 255, 136, 0.2)'
      }}>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full" style={{ background: 'var(--success)' }}></div>
          <div>
            <div className="font-semibold" style={{ color: 'var(--success)' }}>
              Wallet Connected
            </div>
            <div className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
              {account.displayName} ({account.walletType})
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Recipient Address *
          </label>
          <input
            type="text"
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            className="input-field font-mono"
            required
          />
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Stellar address that will receive the automated payments
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Max Amount (XLM) *
          </label>
          <input
            type="number"
            name="maxAmount"
            value={formData.maxAmount}
            onChange={handleChange}
            placeholder="100.0"
            step="0.0000001"
            min="0.0000001"
            className="input-field"
            required
          />
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Maximum per payment
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Funding Amount (XLM) *
          </label>
          <input
            type="number"
            name="fundingAmount"
            value={formData.fundingAmount}
            onChange={handleChange}
            placeholder="500.0"
            step="0.0000001"
            min="0.0000001"
            className="input-field"
            required
          />
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Total XLM to fund the agent with (for multiple payments)
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Payment Interval
          </label>
          <select
            name="intervalHours"
            value={formData.intervalHours}
            onChange={handleChange}
            className="input-field"
          >
            <option value="0.033">2 Minutes (Testing)</option>
            <option value="0.083">5 Minutes (Testing)</option>
            <option value="0.5">30 Minutes</option>
            <option value="1">1 Hour</option>
            <option value="6">6 Hours</option>
            <option value="12">12 Hours</option>
            <option value="24">24 Hours</option>
            <option value="168">1 Week</option>
            <option value="720">1 Month</option>
          </select>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Minimum time between payments
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Agent Expiry
          </label>
          <select
            name="expiryDays"
            value={formData.expiryDays}
            onChange={handleChange}
            className="input-field"
          >
            <option value="1">1 Day</option>
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
            <option value="90">90 Days</option>
            <option value="365">1 Year</option>
          </select>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            When agent expires automatically
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Cost Summary
          </label>
          <div className="p-4 rounded-xl" style={{ 
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)'
          }}>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Per payment:</span>
                <span className="font-semibold text-gradient">
                  {formData.maxAmount ? `${formData.maxAmount} XLM` : '0 XLM'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Total funding:</span>
                <span className="font-bold text-gradient text-lg">
                  {formData.fundingAmount ? `${formData.fundingAmount} XLM` : '0 XLM'}
                </span>
              </div>
              {formData.maxAmount && formData.fundingAmount && (
                <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Estimated payments:</span>
                  <span className="font-semibold">
                    {Math.floor(parseFloat(formData.fundingAmount) / parseFloat(formData.maxAmount))} payments
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed glow-hover"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Deploying Agent...</span>
            </div>
          ) : (
            'Deploy Agent'
          )}
        </button>
      </div>

      <div className="p-4 rounded-xl" style={{ 
        background: 'rgba(255, 170, 0, 0.1)',
        border: '1px solid rgba(255, 170, 0, 0.2)'
      }}>
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--warning)' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <div className="font-semibold mb-1" style={{ color: 'var(--warning)' }}>
              Production Deployment
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              This will create a real smart contract on Stellar Testnet using your connected {account.walletType} wallet. Ensure your wallet is funded and you understand the agent rules.
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}