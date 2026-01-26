const {
    Contract,
    Keypair,
    rpc,
    TransactionBuilder,
    Networks,
    nativeToScVal,
    TimeoutInfinite
} = require('@stellar/stellar-sdk');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

dotenv.config();

const KEEPER_SECRET = process.env.KEEPER_SECRET;
const RPC_URL = process.env.RPC_URL || "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || Networks.TESTNET;
const REGISTRY_FILE = path.join(__dirname, '../agent-registry.json');

if (!KEEPER_SECRET) {
    console.error("❌ Missing KEEPER_SECRET in .env");
    process.exit(1);
}

const server = new rpc.Server(RPC_URL);
const keeperKeypair = Keypair.fromSecret(KEEPER_SECRET);

console.log(`
╔════════════════════════════════════════════════╗
║   🤖 RAPA MULTI-AGENT KEEPER 🤖               ║
╚════════════════════════════════════════════════╝
`);
console.log(`✅ Keeper Account: ${keeperKeypair.publicKey()}`);
console.log(`✅ Registry File:  ${REGISTRY_FILE}`);
console.log(`✅ Scanning every 10 seconds...`);
console.log('');

// Registry management
function loadRegistry() {
    try {
        if (fs.existsSync(REGISTRY_FILE)) {
            const data = fs.readFileSync(REGISTRY_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('⚠️  Error loading registry:', e.message);
    }
    return [];
}

function saveRegistry(agents) {
    try {
        fs.writeFileSync(REGISTRY_FILE, JSON.stringify(agents, null, 2));
    } catch (e) {
        console.error('⚠️  Error saving registry:', e.message);
    }
}

// HTTP server for frontend to register agents
const app = express();
app.use(cors());
app.use(express.json());

app.post('/register-agent', (req, res) => {
    const agent = req.body;
    console.log(`\n🔥 NEW AGENT REGISTERED`);
    console.log(`   Contract: ${agent.contractId}`);
    console.log(`   Recipient: ${agent.recipient}`);
    console.log(`   Max Amount: ${agent.maxAmount / 10_000_000} XLM`);
    console.log(`   Interval: ${agent.intervalSeconds}s`);

    const agents = loadRegistry();

    // Check if already exists
    const exists = agents.find(a => a.contractId === agent.contractId);
    if (!exists) {
        agents.push(agent);
        saveRegistry(agents);
        console.log(`   ✅ Added to registry`);
    } else {
        console.log(`   ℹ️  Already in registry`);
    }

    res.json({ success: true, message: 'Agent registered' });
});

app.get('/agents', (req, res) => {
    const agents = loadRegistry();
    res.json({ count: agents.length, agents });
});

app.listen(3001, () => {
    console.log('📡 HTTP API listening on http://localhost:3001');
    console.log('');
});

async function checkAndExecuteAgent(agent) {
    const contractId = agent.contractId;
    const shortId = `${contractId.slice(0, 6)}...${contractId.slice(-4)}`;
    const shortRecipient = `${agent.recipient.slice(0, 6)}...${agent.recipient.slice(-4)}`;

    // Use the agent's configured maxAmount!
    const executionAmount = BigInt(agent.maxAmount);

    try {
        const account = await server.getAccount(keeperKeypair.publicKey());
        const contract = new Contract(contractId);

        // Build transaction with agent's maxAmount
        const tx = new TransactionBuilder(account, { fee: "100" })
            .addOperation(
                contract.call("execute_payment", nativeToScVal(executionAmount, { type: 'i128' }))
            )
            .setTimeout(TimeoutInfinite)
            .setNetworkPassphrase(NETWORK_PASSPHRASE)
            .build();

        // Simulate first
        const sim = await server.simulateTransaction(tx);

        if (rpc.Api.isSimulationError(sim)) {
            // Not an error - just conditions not met
            return { contractId, status: 'skip', reason: sim.error };
        }

        // Conditions met! Execute
        const amountXLM = Number(executionAmount) / 10_000_000;
        console.log(`\n💰 EXECUTING: ${shortId} → ${shortRecipient} (${amountXLM} XLM)`);

        const preparedTx = await server.prepareTransaction(tx);
        preparedTx.sign(keeperKeypair);
        const response = await server.sendTransaction(preparedTx);

        if (response.status !== "ERROR") {
            console.log(`   ✅ SUCCESS! Hash: ${response.hash}`);
            console.log(`   🔗 https://stellar.expert/explorer/testnet/tx/${response.hash}`);
            return { contractId, status: 'success', hash: response.hash };
        } else {
            console.log(`   ❌ Failed: ${JSON.stringify(response)}`);
            return { contractId, status: 'error', error: response };
        }

    } catch (e) {
        console.error(`   ❌ Error for ${shortId}: ${e.message}`);
        return { contractId, status: 'error', error: e.message };
    }
}

async function checkAllAgents() {
    const agents = loadRegistry();

    if (agents.length === 0) {
        process.stdout.write(`\r[${new Date().toLocaleTimeString()}] 📭 No agents yet. Waiting for frontend...          `);
        return;
    }

    process.stdout.write(`\r[${new Date().toLocaleTimeString()}] 🔍 Checking ${agents.length} agent(s)...`);

    const results = await Promise.all(agents.map(agent => checkAndExecuteAgent(agent)));

    const executed = results.filter(r => r.status === 'success').length;
    const skipped = results.filter(r => r.status === 'skip').length;
    const errors = results.filter(r => r.status === 'error').length;

    if (executed > 0) {
        console.log(`\n🎉 ${executed} payment(s) executed!`);
    } else {
        process.stdout.write(` (${skipped} waiting, ${errors} errors)          `);
    }
}

// Check every 10 seconds
setInterval(checkAllAgents, 10000);
checkAllAgents();
