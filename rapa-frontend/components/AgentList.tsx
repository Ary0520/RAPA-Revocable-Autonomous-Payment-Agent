'use client';

import { useState, useEffect } from 'react';
import { revokeAgent, getUserAgents, getDetailedAgentState } from '@/lib/stellar';
import { useAccount } from '@/hooks';

interface Agent {
  contractId: string;
  owner: string;
  recipient: string;
  token: string;
  maxAmount: number;
  interval: number;
  lastExecuted: number;
  expiry: number;
  active: boolean;
  totalExecutions?: number;
  totalPaid?: number;
}

const NATIVE_TOKEN = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

export function AgentList() {
  const { account, isConnected } = useAccount();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAgents = async () => {
      if (!isConnected || !account) { setIsLoading(false); return; }

      try {
        const storedAgents = getUserAgents();
        if (storedAgents.length === 0) { setAgents([]); setIsLoading(false); return; }

        const agentPromises = storedAgents.map(async (stored: any) => {
          try {
            const state = await getDetailedAgentState(stored.contractId);
            return {
              contractId: stored.contractId,
              owner: account.publicKey,
              recipient: stored.recipient,
              token: NATIVE_TOKEN,
              maxAmount: stored.maxAmount,
              interval: stored.intervalSeconds,
              lastExecuted: state?.lastExecuted || 0,
              expiry: stored.expiryTimestamp,
              active: state?.active !== false,
              totalExecutions: 0,
              totalPaid: 0,
            };
          } catch {
            return {
              contractId: stored.contractId,
              owner: account.publicKey,
              recipient: stored.recipient,
              token: NATIVE_TOKEN,
              maxAmount: stored.maxAmount,
              interval: stored.intervalSeconds,
              lastExecuted: 0,
              expiry: stored.expiryTimestamp,
              active: true,
              totalExecutions: 0,
              totalPaid: 0,
            };
          }
        });

        setAgents(await Promise.all(agentPromises));
      } catch (err: any) {
        setError(err.message || 'Failed to load agents');
      } finally {
        setIsLoading(false);
      }
    };

    loadAgents();
  }, [isConnected, account]);

  const handleRevoke = async (contractId: string) => {
    try {
      await revokeAgent(contractId);
      setAgents(prev => prev.filter(a => a.contractId !== contractId));
    } catch (err: any) {
      setError(`Failed to revoke agent: ${err.message}`);
    }
  };

  const formatAmount   = (s: number) => (s / 10_000_000).toLocaleString();
  const formatInterval = (s: number) => { const h = s / 3600; return h < 24 ? `${h}h` : `${h / 24}d`; };
  const formatDate     = (ts: number) => new Date(ts * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatAddress  = (a: string) => `${a.slice(0, 6)}...${a.slice(-6)}`;

  const getStatus = (agent: Agent) => {
    if (!agent.active) return { text: 'Revoked', cls: 'status-inactive' };
    if (Date.now() / 1000 > agent.expiry) return { text: 'Expired', cls: 'status-warning' };
    return { text: 'Active', cls: 'status-active' };
  };

  const getNextExecution = (agent: Agent) => {
    if (!agent.active) return 'Never';
    const next = agent.lastExecuted + agent.interval;
    const now  = Date.now() / 1000;
    if (next <= now) return 'Ready';
    const diff = next - now;
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  // ── Not connected ─────────────────────────────────────────────────
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
          </svg>
        </div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Connect Your Wallet
        </div>
        <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Connect your wallet to view your deployed agents.
        </div>
      </div>
    );
  }

  // ── Loading skeleton ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            padding: '20px',
            borderRadius: 'var(--r-lg)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-input)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div className="skeleton" style={{ width: '80px', height: '20px' }} />
              <div className="skeleton" style={{ width: '60px', height: '20px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
              {[0, 1, 2, 3].map((j) => (
                <div key={j} className="skeleton" style={{ height: '32px' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="alert-error" style={{ textAlign: 'center', padding: '28px 20px' }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 12px', display: 'block' }}>
          <circle cx="16" cy="16" r="13"/>
          <path d="M16 10v7M16 20v1.5"/>
        </svg>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Error Loading Agents</div>
        <div style={{ fontSize: '13px', opacity: 0.8 }}>{error}</div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────
  if (agents.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <div style={{
          width: '56px', height: '56px',
          borderRadius: 'var(--r-lg)',
          background: 'rgba(129,140,248,0.08)',
          border: '1px dashed rgba(129,140,248,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          color: 'var(--accent-indigo)',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
            <path d="M12 8v4l3 3"/>
            <path d="M2 12h2M20 12h2M12 2v2M12 20v2"/>
          </svg>
        </div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          No Agents Deployed
        </div>
        <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Deploy your first autonomous payment agent to get started.
        </div>
        <button
          className="btn-primary"
          style={{ padding: '10px 22px' }}
          onClick={() => {
            const createTab = document.querySelector('[data-tab="create"]') as HTMLButtonElement;
            createTab?.click();
          }}
        >
          Create Agent
        </button>
      </div>
    );
  }

  // ── Agent list ────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {agents.map((agent, index) => {
        const status = getStatus(agent);
        const nextExecution = getNextExecution(agent);

        return (
          <div
            key={`agent-${index}-${agent.contractId}`}
            style={{
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--r-lg)',
              background: 'var(--bg-input)',
              overflow: 'hidden',
              transition: 'border-color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-active)'}
            onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-primary)'}
          >
            {/* Card header */}
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '10px', flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={status.cls}>{status.text}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {formatAddress(agent.contractId)}
                </span>
              </div>
              {agent.active && (
                <button
                  onClick={() => handleRevoke(agent.contractId)}
                  className="btn-danger"
                  style={{ padding: '6px 14px', fontSize: '12.5px' }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M2 2l8 8M10 2L2 10"/>
                  </svg>
                  Revoke
                </button>
              )}
            </div>

            {/* Stats row */}
            <div
              className="grid-4col"
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                padding: '16px 18px',
                gap: '12px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <StatCell label="Max Amount" value={`${formatAmount(agent.maxAmount)} XLM`} accent />
              <StatCell label="Interval" value={formatInterval(agent.interval)} />
              <StatCell
                label="Next Payment"
                value={nextExecution}
                valueColor={nextExecution === 'Ready' ? 'var(--accent-green)' : 'var(--text-primary)'}
              />
              <StatCell label="Expires" value={formatDate(agent.expiry)} />
            </div>

            {/* Details */}
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <DetailRow label="Recipient" value={formatAddress(agent.recipient)} mono />
              {!!agent.totalExecutions && (
                <DetailRow label="Total Executions" value={String(agent.totalExecutions)} />
              )}
              {!!agent.totalPaid && (
                <DetailRow label="Total Paid" value={`${formatAmount(agent.totalPaid)} XLM`} accent />
              )}
              <DetailRow
                label="Last Execution"
                value={agent.lastExecuted === 0 ? 'Never' : new Date(agent.lastExecuted * 1000).toLocaleString()}
              />
            </div>

            {/* Action buttons */}
            <div
              className="agent-actions"
              style={{
                padding: '12px 18px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex', gap: '10px',
              }}
            >
              <button
                className="btn-secondary"
                style={{ flex: 1, padding: '8px', fontSize: '12.5px', justifyContent: 'center' }}
                onClick={() => window.open(`https://stellar.expert/explorer/testnet/contract/${agent.contractId}`, '_blank')}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V8.5"/>
                  <path d="M7 1h5v5"/>
                  <path d="M12 1L5.5 7.5"/>
                </svg>
                View Contract
              </button>
              <button
                className="btn-secondary"
                style={{ flex: 1, padding: '8px', fontSize: '12.5px', justifyContent: 'center' }}
                onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${agent.recipient}`, '_blank')}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6.5" cy="4.5" r="2.5"/>
                  <path d="M1 11.5c0-2.5 2.5-4 5.5-4s5.5 1.5 5.5 4"/>
                </svg>
                View Recipient
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCell({ label, value, accent, valueColor }: { label: string; value: string; accent?: boolean; valueColor?: string }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
        {label}
      </div>
      <div
        style={{ fontSize: '14px', fontWeight: 700, color: valueColor || 'var(--text-primary)' }}
        className={accent ? 'text-gradient' : ''}
      >
        {value}
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{label}</span>
      <span
        style={{
          fontSize: '12.5px',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit',
        }}
        className={accent ? 'text-gradient' : ''}
      >
        {value}
      </span>
    </div>
  );
}