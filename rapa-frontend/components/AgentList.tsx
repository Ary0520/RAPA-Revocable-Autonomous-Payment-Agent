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

export function AgentList() {
  const { account, isConnected } = useAccount();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAgents = async () => {
      if (!isConnected || !account) {
        setIsLoading(false);
        return;
      }

      try {
        // Get stored agents from localStorage
        const storedAgents = getUserAgents();

        if (storedAgents.length === 0) {
          setAgents([]);
          setIsLoading(false);
          return;
        }

        // Fetch current state for each agent
        const agentPromises = storedAgents.map(async (stored: any) => {
          try {
            const state = await getDetailedAgentState(stored.contractId);

            return {
              contractId: stored.contractId,
              owner: account.publicKey,
              recipient: stored.recipient,
              token: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC', // Native token
              maxAmount: stored.maxAmount,
              interval: stored.intervalSeconds,
              lastExecuted: state?.lastExecuted || 0,
              expiry: stored.expiryTimestamp,
              active: state?.active !== false,
              totalExecutions: 0, // Could be fetched from contract events
              totalPaid: 0 // Could be calculated from execution history
            };
          } catch (error) {
            console.error(`Error loading agent ${stored.contractId}:`, error);
            // Return agent with stored data even if blockchain fetch fails
            return {
              contractId: stored.contractId,
              owner: account.publicKey,
              recipient: stored.recipient,
              token: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
              maxAmount: stored.maxAmount,
              interval: stored.intervalSeconds,
              lastExecuted: 0,
              expiry: stored.expiryTimestamp,
              active: true, // Assume active if we can't fetch state
              totalExecutions: 0,
              totalPaid: 0
            };
          }
        });

        const loadedAgents = await Promise.all(agentPromises);
        setAgents(loadedAgents);
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

      // Remove the agent from the UI immediately
      setAgents(prev => prev.filter(agent => agent.contractId !== contractId));

    } catch (err: any) {
      setError(`Failed to revoke agent: ${err.message}`);
    }
  };

  const formatAmount = (stroops: number) => {
    return (stroops / 10_000_000).toLocaleString();
  };

  const formatInterval = (seconds: number) => {
    const hours = seconds / 3600;
    if (hours < 24) return `${hours}h`;
    const days = hours / 24;
    return `${days}d`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const getStatus = (agent: Agent) => {
    if (!agent.active) return { text: 'Revoked', color: 'status-inactive' };
    if (Date.now() / 1000 > agent.expiry) return { text: 'Expired', color: 'status-warning' };
    return { text: 'Active', color: 'status-active' };
  };

  const getNextExecution = (agent: Agent) => {
    if (!agent.active) return 'Never';
    const nextTime = agent.lastExecuted + agent.interval;
    const now = Date.now() / 1000;

    if (nextTime <= now) return 'Ready';

    const diff = nextTime - now;
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (!isConnected || !account) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔗</div>
        <div className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Connect Your Wallet
        </div>
        <div className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Connect your wallet to view your deployed agents.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-700 rounded w-24"></div>
              <div className="h-6 bg-gray-700 rounded w-16"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-3 bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border text-center" style={{
        background: 'rgba(255, 68, 68, 0.1)',
        borderColor: 'var(--error)',
        color: 'var(--error)'
      }}>
        <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div className="font-semibold mb-2">Error Loading Agents</div>
        <div className="text-sm">{error}</div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🤖</div>
        <div className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          No Agents Deployed
        </div>
        <div className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Create your first autonomous payment agent to get started.
        </div>
        <button
          className="btn-primary px-6 py-3"
          onClick={() => {
            // Switch to create tab
            const createTab = document.querySelector('[data-tab="create"]') as HTMLButtonElement;
            createTab?.click();
          }}
        >
          Create Agent
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {agents.map((agent, index) => {
        const status = getStatus(agent);
        const nextExecution = getNextExecution(agent);

        return (
          <div key={`agent-${index}-${agent.contractId || 'unknown'}`} className="card hover:glow transition-all duration-300">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={status.color}>
                  {status.text}
                </div>
                <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {formatAddress(agent.contractId)}
                </div>
              </div>

              {agent.active && (
                <button
                  onClick={() => handleRevoke(agent.contractId)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: 'rgba(255, 68, 68, 0.1)',
                    border: '1px solid rgba(255, 68, 68, 0.2)',
                    color: 'var(--error)'
                  }}
                >
                  Revoke
                </button>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Max Amount</div>
                <div className="font-semibold text-gradient">
                  {formatAmount(agent.maxAmount)} XLM
                </div>
              </div>

              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Interval</div>
                <div className="font-semibold">{formatInterval(agent.interval)}</div>
              </div>

              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Next Payment</div>
                <div className="font-semibold" style={{
                  color: nextExecution === 'Ready' ? 'var(--success)' : 'var(--text-primary)'
                }}>
                  {nextExecution}
                </div>
              </div>

              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Expires</div>
                <div className="font-semibold">{formatDate(agent.expiry)}</div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Recipient:</span>
                <span className="font-mono">{formatAddress(agent.recipient)}</span>
              </div>

              {agent.totalExecutions && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Total Executions:</span>
                  <span className="font-semibold">{agent.totalExecutions}</span>
                </div>
              )}

              {agent.totalPaid && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Total Paid:</span>
                  <span className="font-semibold text-gradient">
                    {formatAmount(agent.totalPaid)} XLM
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Last Execution:</span>
                <span>
                  {agent.lastExecuted === 0
                    ? 'Never'
                    : new Date(agent.lastExecuted * 1000).toLocaleString()
                  }
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <button
                onClick={() => window.open(`https://stellar.expert/explorer/testnet/contract/${agent.contractId}`, '_blank')}
                className="btn-secondary flex-1 py-2 text-sm"
              >
                View Contract
              </button>
              <button
                onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${agent.recipient}`, '_blank')}
                className="btn-secondary flex-1 py-2 text-sm"
              >
                View Recipient
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}