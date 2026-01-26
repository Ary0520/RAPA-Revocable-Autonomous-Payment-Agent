const {
    Contract,
    Keypair,
    rpc,
    TransactionBuilder,
    Networks,
    scValToNative,
    TimeoutInfinite
} = require('@stellar/stellar-sdk');
require('dotenv').config();

const RPC_URL = process.env.RPC_URL;
const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE;
const KEEPER_SECRET = process.env.KEEPER_SECRET;

const server = new rpc.Server(RPC_URL);
const keeperKeypair = Keypair.fromSecret(KEEPER_SECRET);

// Read agent from registry
const fs = require('fs');
const agents = JSON.parse(fs.readFileSync('../agent-registry.json', 'utf8'));
const agent = agents[0];

console.log('\n🔍 AGENT DIAGNOSTICS');
console.log('='.repeat(60));

async function checkAgent() {
    try {
        const account = await server.getAccount(keeperKeypair.publicKey());
        const contract = new Contract(agent.contractId);

        // Get agent state
        const tx = new TransactionBuilder(account, { fee: "100" })
            .addOperation(contract.call("get_state"))
            .setTimeout(TimeoutInfinite)
            .setNetworkPassphrase(NETWORK_PASSPHRASE)
            .build();

        const sim = await server.simulateTransaction(tx);

        if (rpc.Api.isSimulationError(sim)) {
            console.log('❌ Failed to get state:', sim.error);
            return;
        }

        const state = scValToNative(sim.result.retval);
        const [owner, recipient, token, maxAmount, interval, lastExec, expiry, active] = state;

        const now = Math.floor(Date.now() / 1000);
        const nextExec = Number(lastExec) + Number(interval);
        const timeUntilNext = nextExec - now;

        console.log('\n📋 Agent State:');
        console.log(`  Active: ${active}`);
        console.log(`  Owner: ${owner}`);
        console.log(`  Recipient: ${recipient}`);
        console.log(`  Token: ${token}`);
        console.log(`  Max Amount: ${maxAmount} (${Number(maxAmount) / 10_000_000} XLM)`);
        console.log(`  Interval: ${interval} seconds`);
        console.log(`  Last Executed: ${lastExec} (${lastExec > 0 ? new Date(Number(lastExec) * 1000).toLocaleString() : 'Never'})`);
        console.log(`  Expiry: ${expiry} (${new Date(Number(expiry) * 1000).toLocaleString()})`);

        console.log('\n⏰ Timing:');
        console.log(`  Current Time: ${now} (${new Date(now * 1000).toLocaleString()})`);
        console.log(`  Next Payment At: ${nextExec} (${new Date(nextExec * 1000).toLocaleString()})`);

        if (timeUntilNext > 0) {
            console.log(`  ⏳ TIME REMAINING: ${timeUntilNext} seconds`);
        } else {
            console.log(`  ✅ READY TO EXECUTE! (${Math.abs(timeUntilNext)} seconds overdue)`);
        }

        if (now > Number(expiry)) {
            console.log('  ⚠️  WARNING: Agent expired!');
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

checkAgent();
