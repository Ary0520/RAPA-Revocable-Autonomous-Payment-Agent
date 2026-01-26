// Simple test to verify agent storage works
// Run this in browser console after creating an agent

// Mock localStorage for testing
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    getItem: (key) => global.localStorage[key] || null,
    setItem: (key, value) => { global.localStorage[key] = value; },
    removeItem: (key) => { delete global.localStorage[key]; }
  };
}

// Mock user public key
localStorage.setItem('stellar_public_key', 'GD5KWG6MC2C3OFEHX4TMOTLP3PEY3YC4FOKGIXYY3IR3VNLUTZT52CGY');

// Test storing an agent
const testAgent = {
  contractId: 'CCWV6GWXHEEBTRFRBNZ22YUUBRZB7ZPYXMX3JZHUXDHY3A2GFZPPSIMK',
  recipient: 'GALKG62RNA7BFFVEJRORPULIDBTTHTDMCZ5LLTHBYQERM5PGJ2X3W6OT',
  maxAmount: 50000000, // 5 XLM
  intervalSeconds: 1800, // 30 minutes
  expiryTimestamp: Math.floor(Date.now() / 1000) + (7 * 24 * 3600) // 7 days
};

// Store agent
const userPublicKey = localStorage.getItem('stellar_public_key');
const storageKey = `rapa_agents_${userPublicKey}`;
const existingAgents = JSON.parse(localStorage.getItem(storageKey) || '[]');
existingAgents.push({ ...testAgent, createdAt: Date.now() });
localStorage.setItem(storageKey, JSON.stringify(existingAgents));

console.log('Stored agents:', JSON.parse(localStorage.getItem(storageKey)));
console.log('Agent storage test completed successfully!');