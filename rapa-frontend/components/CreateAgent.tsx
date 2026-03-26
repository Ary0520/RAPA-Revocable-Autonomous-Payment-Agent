'use client';

import { useState } from 'react';
import { createAgent, storeUserAgent } from '@/lib/stellar';
import { useAccount } from '@/hooks';
import { ConnectButton } from './ConnectButton';

const INTERVAL_OPTIONS = [
  { value: '0.033', label: '2 Minutes', tag: 'Testing' },
  { value: '0.083', label: '5 Minutes', tag: 'Testing' },
  { value: '0.5',   label: '30 Minutes', tag: null },
  { value: '1',     label: '1 Hour', tag: null },
  { value: '6',     label: '6 Hours', tag: null },
  { value: '12',    label: '12 Hours', tag: null },
  { value: '24',    label: '24 Hours', tag: null },
  { value: '168',   label: '1 Week', tag: null },
  { value: '720',   label: '1 Month', tag: null },
];

const EXPIRY_OPTIONS = [
  { value: '1',   label: '1 Day' },
  { value: '7',   label: '7 Days' },
  { value: '30',  label: '30 Days' },
  { value: '90',  label: '90 Days' },
  { value: '365', label: '1 Year' },
];

function FormField({
  label, hint, children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.01em' }}>
        {label}
      </label>
      {children}
      {hint && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function CreateAgent() {
  const { account, isConnected } = useAccount();
  const [formData, setFormData] = useState({
    recipient: '',
    maxAmount: '',
    intervalHours: '0.033',
    expiryDays: '30',
    fundingAmount: '',
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
      if (!isConnected || !account) throw new Error('Please connect your wallet first');
      if (!formData.recipient || !formData.maxAmount || !formData.fundingAmount)
        throw new Error('Please fill in all required fields');

      const maxAmountStroops      = Math.floor(parseFloat(formData.maxAmount) * 10_000_000);
      const fundingAmountStroops  = Math.floor(parseFloat(formData.fundingAmount) * 10_000_000);
      const intervalSeconds       = Math.floor(parseFloat(formData.intervalHours) * 3600);
      const expiryTimestamp       = Date.now() + (parseInt(formData.expiryDays) * 24 * 3600 * 1000);

      console.log('Agent Parameters:', {
        recipient: formData.recipient,
        maxAmountXLM: formData.maxAmount,
        maxAmountStroops,
        fundingAmountXLM: formData.fundingAmount,
        fundingAmountStroops,
        intervalHours: formData.intervalHours,
        intervalSeconds,
        expiryDays: formData.expiryDays,
        expiryTimestamp: Math.floor(expiryTimestamp / 1000),
      });

      const result = await createAgent({
        recipient: formData.recipient,
        maxAmount: maxAmountStroops,
        intervalSeconds,
        expiryTimestamp: Math.floor(expiryTimestamp / 1000),
        fundingAmount: fundingAmountStroops,
      });

      storeUserAgent(result.contractId, {
        recipient: formData.recipient,
        maxAmount: maxAmountStroops,
        intervalSeconds,
        expiryTimestamp: Math.floor(expiryTimestamp / 1000),
      });

      setSuccess(`Agent deployed successfully. Contract: ${result.contractId.slice(0, 12)}... — Funded with ${formData.fundingAmount} XLM`);
      setFormData({ recipient: '', maxAmount: '', intervalHours: '0.033', expiryDays: '30', fundingAmount: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to create agent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const estimatedPayments =
    formData.maxAmount && formData.fundingAmount
      ? Math.floor(parseFloat(formData.fundingAmount) / parseFloat(formData.maxAmount))
      : null;

  // ── Wallet not connected ──────────────────────────────────────────
  if (!isConnected || !account) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <div style={{
          width: '52px', height: '52px',
          borderRadius: 'var(--r-lg)',
          background: 'rgba(77,158,255,0.08)',
          border: '1px solid rgba(77,158,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          color: 'var(--accent-blue)',
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 7H3a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
            <path d="M16 11h.01"/>
            <path d="M1 7l4-4 4 4M17 7l4-4-4-4"/>
          </svg>
        </div>
        <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Connect Your Wallet
        </div>
        <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '28px', maxWidth: '320px', margin: '0 auto 28px', lineHeight: 1.6 }}>
          Connect your Stellar wallet to deploy autonomous payment agents on-chain.
        </div>
        <ConnectButton label="Connect Wallet" />

        <div className="alert-info" style={{ marginTop: '24px', textAlign: 'left', maxWidth: '340px', margin: '24px auto 0' }}>
          <div style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--accent-blue)', marginBottom: '6px' }}>
            Supported Wallets
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="var(--accent-blue)"><circle cx="5" cy="5" r="2"/></svg>
              Freighter (Browser Extension)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.5 }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="var(--text-muted)"><circle cx="5" cy="5" r="2"/></svg>
              WalletConnect — Coming Soon
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit}>

      {/* Alerts */}
      {error && (
        <div className="alert-error" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
            <circle cx="8" cy="8" r="6.5"/>
            <path d="M8 5v3.5M8 10.5v.5"/>
          </svg>
          <span style={{ fontSize: '13.5px' }}>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert-success" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="6.5"/>
            <path d="M5.5 8l2 2 3-3"/>
          </svg>
          <span style={{ fontSize: '13.5px' }}>{success}</span>
        </div>
      )}

      {/* Connected account banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 14px',
        borderRadius: 'var(--r-md)',
        background: 'rgba(52,211,153,0.05)',
        border: '1px solid rgba(52,211,153,0.15)',
        marginBottom: '28px',
      }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 6px var(--accent-green)', display: 'inline-block', animation: 'pulse-dot 2s infinite', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--accent-green)', marginBottom: '1px' }}>
            Wallet Connected
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            {account.displayName} · {account.walletType}
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

        <FormField label="Recipient Address *" hint="Stellar address that will receive the automated payments">
          <input
            type="text"
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            className="input-field font-mono"
            style={{ fontSize: '12.5px' }}
            required
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="Max Per Payment (XLM) *" hint="Ceiling per individual payment">
            <input
              type="number"
              name="maxAmount"
              value={formData.maxAmount}
              onChange={handleChange}
              placeholder="100"
              step="0.0000001"
              min="0.0000001"
              className="input-field"
              required
            />
          </FormField>

          <FormField label="Total Funding (XLM) *" hint="Total XLM deposited into the agent">
            <input
              type="number"
              name="fundingAmount"
              value={formData.fundingAmount}
              onChange={handleChange}
              placeholder="500"
              step="0.0000001"
              min="0.0000001"
              className="input-field"
              required
            />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="Payment Interval" hint="Minimum time between executions">
            <select name="intervalHours" value={formData.intervalHours} onChange={handleChange} className="input-field">
              {INTERVAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}{o.tag ? ` (${o.tag})` : ''}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Agent Expiry" hint="Agent auto-terminates on this date">
            <select name="expiryDays" value={formData.expiryDays} onChange={handleChange} className="input-field">
              {EXPIRY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Cost summary */}
        <div style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--r-md)',
          padding: '16px',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Summary
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SummaryRow label="Per payment" value={formData.maxAmount ? `${formData.maxAmount} XLM` : '—'} />
            <SummaryRow label="Total funding" value={formData.fundingAmount ? `${formData.fundingAmount} XLM` : '—'} highlight />
            {estimatedPayments !== null && (
              <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <SummaryRow label="Est. payments" value={`${estimatedPayments} executions`} />
              </div>
            )}
          </div>
        </div>

        {/* Warning notice */}
        <div className="alert-warning" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
            <path d="M8 2l6 10H2L8 2z"/>
            <path d="M8 6v3.5M8 11v.5"/>
          </svg>
          <div>
            <div style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--accent-amber)', marginBottom: '4px' }}>
              On-Chain Deployment
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              This creates a real Soroban contract on Stellar Testnet using your {account.walletType} wallet. Ensure your wallet is funded and you understand the agent parameters before deploying.
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ paddingTop: '4px' }}>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: '14.5px', fontWeight: 700, justifyContent: 'center' }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '15px', height: '15px',
                  border: '2px solid rgba(255,255,255,0.25)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Deploying Agent...
              </>
            ) : (
              <>
                Deploy Agent
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 7h12M8 2l5 5-5 5"/>
                </svg>
              </>
            )}
          </button>
        </div>

      </div>
    </form>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{
        fontSize: highlight ? '15px' : '13px',
        fontWeight: highlight ? 700 : 600,
        color: highlight ? 'var(--text-primary)' : 'var(--text-secondary)',
      }} className={highlight ? 'text-gradient' : ''}>
        {value}
      </span>
    </div>
  );
}