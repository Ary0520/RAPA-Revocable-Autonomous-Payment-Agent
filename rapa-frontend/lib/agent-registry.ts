// Agent Registry - Centralized agent tracking for production
export interface AgentInfo {
  contractId: string;
  owner: string;
  recipient: string;
  maxAmount: number;
  intervalSeconds: number;
  expiryTimestamp: number;
  createdAt: number;
}

// Shared registry path - accessible by both frontend and keeper
const REGISTRY_PATH = '../../agent-registry.json';

export function registerAgent(agent: AgentInfo) {
  try {
    console.log('🔥 REGISTERING NEW AGENT 🔥');
    console.log('Contract ID:', agent.contractId);
    console.log('Owner:', agent.owner);
    console.log('Recipient:', agent.recipient);
    console.log('Max Amount:', agent.maxAmount / 10_000_000, 'XLM');
    console.log('Interval:', agent.intervalSeconds, 'seconds');

    // Store in localStorage for the frontend UI
    const storageKey = `rapa_agents_${agent.owner}`;
    const existingAgents = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existingAgents.push(agent);
    localStorage.setItem(storageKey, JSON.stringify(existingAgents));

    // CRITICAL: Also notify keeper via API call
    // Since frontend runs in browser and keeper is Node.js, we need a bridge
    // For now, we'll make an HTTP request to a keeper endpoint
    fetch('http://localhost:3001/register-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent)
    }).catch(err => {
      console.log('⚠️ Could not reach keeper service. Agent registered locally only.');
      console.log('Manual action required: Update keeper configuration with contract:', agent.contractId);
    });

    console.log('🔥 AGENT REGISTERED 🔥');

  } catch (error) {
    console.error('Failed to register agent:', error);
  }
}

export function getAllAgents(): AgentInfo[] {
  try {
    // In production, this would query a database
    // For now, return empty array - the keeper will discover agents automatically
    return [];
  } catch (error) {
    console.error('Failed to get agents:', error);
    return [];
  }
}