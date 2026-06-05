import {
  Contract,
  rpc,
  TransactionBuilder,
  Networks,
  nativeToScVal,
  Address,
  TimeoutInfinite,
  StrKey,
  Operation,
  Account
} from '@stellar/stellar-sdk';
import { signTransaction as signFreighterTransaction } from '@stellar/freighter-api';
import { registerAgent } from './agent-registry';

// ── Network Configuration ────────────────────────────────────────────────────
// Switch NETWORK to 'mainnet' and fill in the IDs after running deploy.sh
const NETWORK: 'testnet' | 'mainnet' = 'testnet';

const RPC_URL =
  NETWORK === 'mainnet'
    ? 'https://mainnet.sorobanrpc.com'
    : 'https://soroban-testnet.stellar.org';

const NETWORK_PASSPHRASE =
  NETWORK === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET;

// rapa-agent WASM hash — shared across all agent instances
const WASM_HASH = '1c209fac1a53075bbcb793fe7004109c481981aa98174661d7840ffad6076bed';

// rapa-registry singleton — tracks all deployed agent contract IDs on-chain
// Fill in after deploying with deploy.sh
const REGISTRY_CONTRACT_ID = '';   // e.g. 'CXXX...'

// rapa-config singleton — protocol-level config (wasm hash, min interval, cap)
// Fill in after deploying with deploy.sh
const CONFIG_CONTRACT_ID = '';     // e.g. 'CYYY...'

// Native XLM Stellar Asset Contract
const NATIVE_TOKEN_CONTRACT_ID =
  NETWORK === 'mainnet'
    ? 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA'
    : 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
// ─────────────────────────────────────────────────────────────────────────────

const server = new rpc.Server(RPC_URL);

// Freighter wallet integration

// Get user's public key from connected wallet
function getUserPublicKey(): string {
  const publicKey = localStorage.getItem('stellar_public_key');
  if (!publicKey) {
    throw new Error('No wallet connected. Please connect your wallet first.');
  }
  return publicKey;
}

// Sign transaction using connected wallet
async function signTransaction(transaction: any): Promise<any> {
  const walletType = localStorage.getItem('wallet_type');

  if (walletType === 'freighter') {
    const xdr = transaction.toXDR();
    const { signedTxXdr } = await signFreighterTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
      address: getUserPublicKey()
    });

    if (!signedTxXdr) {
      throw new Error('Failed to sign transaction');
    }

    return TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
  }

  throw new Error('No supported wallet connected for signing');
}

// Create a new payment agent (deploys fresh contract instance)
export async function createAgent(params: {
  recipient: string;
  maxAmount: number;
  intervalSeconds: number;
  expiryTimestamp: number;
  fundingAmount: number; // Add funding amount parameter
}): Promise<{ hash: string; status: string; contractId: string }> {

  // Validate inputs
  if (!StrKey.isValidEd25519PublicKey(params.recipient)) {
    throw new Error('Invalid recipient address');
  }

  const publicKey = getUserPublicKey();
  const account = await server.getAccount(publicKey);

  // Generate a truly unique salt using crypto.getRandomValues()
  const timestamp = Date.now();
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);

  // Combine multiple sources of entropy
  const entropyString = `${publicKey}-${timestamp}-${Math.random()}-${params.recipient}-${params.maxAmount}`;
  const entropyBytes = new TextEncoder().encode(entropyString);

  // Create 32-byte salt by combining random bytes and entropy
  const salt = new Uint8Array(32);
  salt.set(randomBytes, 0);
  salt.set(entropyBytes.slice(0, 16), 16);

  console.log('Generated salt:', Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''));

  // Convert addresses to ScVal
  const owner = new Address(publicKey);
  const recipient = new Address(params.recipient);
  const nativeTokenScVal = nativeToScVal(NATIVE_TOKEN_CONTRACT_ID, { type: 'address' });

  // OFFICIAL STELLAR PATTERN: Local sequence number management for multiple transactions
  // Instead of fetching account between transactions, manage sequence locally
  let currentSequence = account.sequenceNumber();

  // Step 1: Deploy contract
  const deployTx = new TransactionBuilder(account, { fee: "50000" })
    .addOperation(
      Operation.createCustomContract({
        address: owner,
        wasmHash: Buffer.from(WASM_HASH, 'hex'),
        salt: Buffer.from(salt)
      })
    )
    .setTimeout(TimeoutInfinite)
    .setNetworkPassphrase(NETWORK_PASSPHRASE)
    .build();

  // Simulate deployment to get contract address
  const deploySim = await server.simulateTransaction(deployTx);
  if (rpc.Api.isSimulationError(deploySim)) {
    throw new Error(`Contract deployment simulation failed: ${JSON.stringify(deploySim)}`);
  }

  // Extract contract address from simulation using official API
  let contractAddress: string;
  try {
    if (deploySim.result && deploySim.result.retval) {
      // Use the official Address.fromScVal() method
      const addressFromScVal = Address.fromScVal(deploySim.result.retval);
      contractAddress = addressFromScVal.toString();
    } else {
      throw new Error("No retval in simulation result");
    }
  } catch (error) {
    // Fallback: generate deterministic address using official Address.contract() method
    const addressBytes = new Uint8Array(32);
    const wasmBytes = Buffer.from(WASM_HASH, 'hex');
    const ownerBytes = Buffer.from(publicKey, 'base64');

    for (let i = 0; i < 32; i++) {
      addressBytes[i] = wasmBytes[i % wasmBytes.length] ^
        ownerBytes[i % ownerBytes.length] ^
        salt[i % salt.length];
    }

    contractAddress = Address.contract(Buffer.from(addressBytes)).toString();
  }

  // Deploy the contract
  const preparedDeployTx = await server.prepareTransaction(deployTx);
  const signedDeployTx = await signTransaction(preparedDeployTx);
  const deployResponse = await server.sendTransaction(signedDeployTx);

  if (deployResponse.status === "ERROR") {
    throw new Error(`Contract deployment failed: ${JSON.stringify(deployResponse)}`);
  }

  // Wait for deployment transaction to be confirmed
  console.log('Waiting for contract deployment to be confirmed...');
  let deployConfirmed = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!deployConfirmed && attempts < maxAttempts) {
    try {
      const txResult = await server.getTransaction(deployResponse.hash);
      if (txResult.status === 'SUCCESS') {
        deployConfirmed = true;
        console.log('Contract deployment confirmed!');
      }
    } catch (error) {
      // Transaction not found yet, keep waiting
    }

    if (!deployConfirmed) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }
  }

  if (!deployConfirmed) {
    throw new Error('Contract deployment confirmation timeout');
  }

  // Step 2: Initialize the deployed contract
  // Use local sequence management instead of fetching from network
  currentSequence = (BigInt(currentSequence) + BigInt(1)).toString();
  const account2 = new Account(publicKey, currentSequence);

  const contract = new Contract(contractAddress);
  const initTx = new TransactionBuilder(account2, { fee: "50000" })
    .addOperation(
      contract.call("initialize",
        owner.toScVal(),
        recipient.toScVal(),
        nativeTokenScVal,
        nativeToScVal(params.maxAmount, { type: 'i128' }),
        nativeToScVal(params.intervalSeconds, { type: 'u64' }),
        nativeToScVal(params.expiryTimestamp, { type: 'u64' })
      )
    )
    .setTimeout(TimeoutInfinite)
    .setNetworkPassphrase(NETWORK_PASSPHRASE)
    .build();

  // Simulate initialization
  const initSim = await server.simulateTransaction(initTx);
  if (rpc.Api.isSimulationError(initSim)) {
    throw new Error(`Contract initialization simulation failed: ${JSON.stringify(initSim)}`);
  }

  // Prepare and submit initialization
  const preparedInitTx = await server.prepareTransaction(initTx);
  const signedInitTx = await signTransaction(preparedInitTx);
  const initResponse = await server.sendTransaction(signedInitTx);

  if (initResponse.status === "ERROR") {
    throw new Error(`Contract initialization failed: ${JSON.stringify(initResponse)}`);
  }

  // Wait for initialization transaction to be confirmed
  console.log('Waiting for contract initialization to be confirmed...');
  let initConfirmed = false;
  attempts = 0;

  while (!initConfirmed && attempts < maxAttempts) {
    try {
      const txResult = await server.getTransaction(initResponse.hash);
      if (txResult.status === 'SUCCESS') {
        initConfirmed = true;
        console.log('Contract initialization confirmed!');
      }
    } catch (error) {
      // Transaction not found yet, keep waiting
    }

    if (!initConfirmed) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }
  }

  if (!initConfirmed) {
    throw new Error('Contract initialization confirmation timeout');
  }

  // Step 3: Fund the contract using Stellar Asset Contract (SAC)
  console.log(`Funding contract with ${params.fundingAmount / 10_000_000} XLM via SAC...`);

  // Use local sequence management for third transaction
  currentSequence = (BigInt(currentSequence) + BigInt(1)).toString();
  const account3 = new Account(publicKey, currentSequence);

  // Use the native token contract (SAC) to transfer XLM to the contract
  const nativeTokenContract = new Contract(NATIVE_TOKEN_CONTRACT_ID);

  const fundTx = new TransactionBuilder(account3, { fee: "10000" })
    .addOperation(
      nativeTokenContract.call("transfer",
        new Address(publicKey).toScVal(), // from: your wallet
        new Address(contractAddress).toScVal(), // to: the agent contract
        nativeToScVal(params.fundingAmount, { type: 'i128' }) // amount in stroops
      )
    )
    .setTimeout(TimeoutInfinite)
    .setNetworkPassphrase(NETWORK_PASSPHRASE)
    .build();

  // Simulate the SAC transfer
  const fundSim = await server.simulateTransaction(fundTx);
  if (rpc.Api.isSimulationError(fundSim)) {
    throw new Error(`Contract funding simulation failed: ${JSON.stringify(fundSim)}`);
  }

  // Prepare and submit funding via SAC
  const preparedFundTx = await server.prepareTransaction(fundTx);
  const signedFundTx = await signTransaction(preparedFundTx);
  const fundResponse = await server.sendTransaction(signedFundTx);

  if (fundResponse.status === "ERROR") {
    throw new Error(`Contract funding failed: ${JSON.stringify(fundResponse)}`);
  }

  // ── Step 4: Register agent in on-chain rapa-registry (if deployed) ──────────
  if (REGISTRY_CONTRACT_ID) {
    try {
      const account4Seq = (BigInt(currentSequence) + BigInt(1)).toString();
      const account4 = new Account(publicKey, account4Seq);
      const registryContract = new Contract(REGISTRY_CONTRACT_ID);

      const regTx = new TransactionBuilder(account4, { fee: '100000' })
        .addOperation(
          registryContract.call(
            'register_agent',
            new Address(publicKey).toScVal(),
            new Address(contractAddress).toScVal()
          )
        )
        .setTimeout(TimeoutInfinite)
        .setNetworkPassphrase(NETWORK_PASSPHRASE)
        .build();

      const regSim = await server.simulateTransaction(regTx);
      if (!rpc.Api.isSimulationError(regSim)) {
        const preparedRegTx = await server.prepareTransaction(regTx);
        const signedRegTx = await signTransaction(preparedRegTx);
        await server.sendTransaction(signedRegTx);
        console.log('✅ Agent registered in on-chain registry');
      } else {
        console.warn('⚠️  Registry registration simulation failed (non-fatal):', regSim.error);
      }
    } catch (err) {
      // Non-fatal — agent still works without registry entry
      console.warn('⚠️  Could not register in on-chain registry (non-fatal):', err);
    }
  }

  // Log the contract ID clearly for manual keeper update
  console.log('=== AGENT DEPLOYED SUCCESSFULLY ===');
  console.log('Contract ID:', contractAddress);
  console.log('Recipient:', params.recipient);
  console.log('Max Amount:', params.maxAmount / 10_000_000, 'XLM');
  console.log('Interval:', params.intervalSeconds, 'seconds');
  console.log('===================================');

  // Register the agent in the keeper's off-chain registry (backup)
  registerAgent({
    contractId: contractAddress,
    owner: publicKey,
    recipient: params.recipient,
    maxAmount: params.maxAmount,
    intervalSeconds: params.intervalSeconds,
    expiryTimestamp: params.expiryTimestamp,
    createdAt: Date.now()
  });

  return {
    hash: fundResponse.hash,
    status: fundResponse.status,
    contractId: contractAddress
  };
}

// Get agent state
export async function getAgentState(contractId: string) {
  const contract = new Contract(contractId);
  const publicKey = getUserPublicKey();
  const account = await server.getAccount(publicKey);

  const tx = new TransactionBuilder(account, { fee: "100" })
    .addOperation(contract.call("get_state"))
    .setTimeout(TimeoutInfinite)
    .setNetworkPassphrase(NETWORK_PASSPHRASE)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Failed to get agent state: ${JSON.stringify(sim)}`);
  }

  return sim.result;
}

// Revoke an agent
export async function revokeAgent(contractId: string): Promise<{ hash: string; status: string }> {
  const publicKey = getUserPublicKey();
  const account = await server.getAccount(publicKey);
  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(account, { fee: "100" })
    .addOperation(contract.call("revoke_agent"))
    .setTimeout(TimeoutInfinite)
    .setNetworkPassphrase(NETWORK_PASSPHRASE)
    .build();

  // Simulate transaction
  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed: ${JSON.stringify(sim)}`);
  }

  // Prepare transaction
  const prepared = await server.prepareTransaction(tx);

  // Sign with connected wallet
  const signed = await signTransaction(prepared);

  // Submit transaction
  const response = await server.sendTransaction(signed);

  if (response.status === "ERROR") {
    throw new Error(`Transaction failed: ${JSON.stringify(response)}`);
  }

  // Remove from localStorage after successful revocation
  removeUserAgent(contractId);

  return {
    hash: response.hash,
    status: response.status
  };
}

// Remove agent from localStorage
export function removeUserAgent(contractId: string) {
  try {
    const userPublicKey = getUserPublicKey();
    const storageKey = `rapa_agents_${userPublicKey}`;

    const existingAgents = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedAgents = existingAgents.filter((agent: any) => agent.contractId !== contractId);

    localStorage.setItem(storageKey, JSON.stringify(updatedAgents));
    console.log(`✅ Agent ${contractId} removed from storage`);
  } catch (error) {
    console.error('Failed to remove agent from storage:', error);
  }
}

// Execute payment (for testing/manual execution)
export async function executePayment(contractId: string, amount: number): Promise<{ hash: string; status: string }> {
  const publicKey = getUserPublicKey();
  const account = await server.getAccount(publicKey);
  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(account, { fee: "100" })
    .addOperation(contract.call("execute_payment", nativeToScVal(amount, { type: 'i128' })))
    .setTimeout(TimeoutInfinite)
    .setNetworkPassphrase(NETWORK_PASSPHRASE)
    .build();

  // Simulate transaction
  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed: ${JSON.stringify(sim)}`);
  }

  // Prepare transaction
  const prepared = await server.prepareTransaction(tx);

  // Sign with connected wallet
  const signed = await signTransaction(prepared);

  // Submit transaction
  const response = await server.sendTransaction(signed);

  if (response.status === "ERROR") {
    throw new Error(`Transaction failed: ${JSON.stringify(response)}`);
  }

  return {
    hash: response.hash,
    status: response.status
  };
}

// Store agent in localStorage after successful creation
export function storeUserAgent(contractId: string, params: {
  recipient: string;
  maxAmount: number;
  intervalSeconds: number;
  expiryTimestamp: number;
}) {
  const userPublicKey = getUserPublicKey();
  const storageKey = `rapa_agents_${userPublicKey}`;

  const existingAgents = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const newAgent = {
    contractId,
    recipient: params.recipient,
    maxAmount: params.maxAmount,
    intervalSeconds: params.intervalSeconds,
    expiryTimestamp: params.expiryTimestamp,
    createdAt: Date.now()
  };

  existingAgents.push(newAgent);
  localStorage.setItem(storageKey, JSON.stringify(existingAgents));
}

// Add test agent for demonstration (can be called from browser console)
export function addTestAgent() {
  if (typeof window === 'undefined') return;

  const testAgent = {
    contractId: 'CCWV6GWXHEEBTRFRBNZ22YUUBRZB7ZPYXMX3JZHUXDHY3A2GFZPPSIMK',
    recipient: 'GALKG62RNA7BFFVEJRORPULIDBTTHTDMCZ5LLTHBYQERM5PGJ2X3W6OT',
    maxAmount: 50000000, // 5 XLM
    intervalSeconds: 1800, // 30 minutes
    expiryTimestamp: Math.floor(Date.now() / 1000) + (7 * 24 * 3600) // 7 days
  };

  storeUserAgent(testAgent.contractId, testAgent);
  console.log('Test agent added successfully!');

  // Trigger a page refresh to show the agent
  window.location.reload();
}

// Get user's stored agents
export function getUserAgents(): any[] {
  try {
    const userPublicKey = getUserPublicKey();
    const storageKey = `rapa_agents_${userPublicKey}`;
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch (error) {
    return [];
  }
}

// Get detailed agent state from blockchain
export async function getDetailedAgentState(contractId: string) {
  try {
    const contract = new Contract(contractId);
    const publicKey = getUserPublicKey();
    const account = await server.getAccount(publicKey);

    const tx = new TransactionBuilder(account, { fee: "100" })
      .addOperation(contract.call("get_state"))
      .setTimeout(TimeoutInfinite)
      .setNetworkPassphrase(NETWORK_PASSPHRASE)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) {
      throw new Error(`Failed to get agent state: ${JSON.stringify(sim)}`);
    }

    // Parse the result - this would need proper ScVal parsing
    // For now, return a basic structure
    return {
      active: true,
      lastExecuted: 0,
      // Add more fields as needed
    };
  } catch (error) {
    console.error(`Error getting agent state for ${contractId}:`, error);
    return null;
  }
}

// Check if wallet is connected
export function isWalletConnected(): boolean {
  return !!localStorage.getItem('stellar_public_key');
}

// Get connected wallet info
export function getWalletInfo() {
  return {
    publicKey: localStorage.getItem('stellar_public_key'),
    walletType: localStorage.getItem('wallet_type')
  };
}

// Utility function to format addresses
export function formatAddress(address: string, chars: number = 8): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Utility function to convert stroops to XLM
export function stroopsToXLM(stroops: number): number {
  return stroops / 10_000_000;
}

// Utility function to convert XLM to stroops
export function xlmToStroops(xlm: number): number {
  return Math.floor(xlm * 10_000_000);
}