#!/bin/bash

# RAPA Contract Deployment Script — deploys all 3 contracts
echo "🚀 Deploying RAPA Contracts to Stellar Mainnet"

# Check if stellar CLI is available
if ! command -v stellar &> /dev/null; then
    echo "❌ Stellar CLI not found. Please install it first."
    echo "   Visit: https://developers.stellar.org/docs/tools/developer-tools"
    exit 1
fi

NETWORK=${1:-mainnet}
echo "📡 Target network: $NETWORK"

if [ "$NETWORK" = "mainnet" ]; then
    RPC_URL="https://mainnet.sorobanrpc.com"
    NATIVE_TOKEN="CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA"
else
    RPC_URL="https://soroban-testnet.stellar.org"
    NATIVE_TOKEN="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
fi

stellar network add $NETWORK $RPC_URL
stellar network use $NETWORK

# Build all contracts
echo "🔨 Building all contracts..."
cd contracts/rapa-agent && stellar contract build && cd ../..
cd contracts/rapa-registry && stellar contract build && cd ../..
cd contracts/rapa-config && stellar contract build && cd ../..

# ── 1. Upload rapa-agent WASM (shared, deployed per-user as instances) ────────
echo ""
echo "📦 [1/5] Uploading rapa-agent WASM..."
WASM_HASH=$(stellar contract upload \
    --wasm contracts/rapa-agent/target/wasm32-unknown-unknown/release/rapa_agent.wasm \
    --source alice \
    --network $NETWORK)
echo "   WASM Hash: $WASM_HASH"

# ── 2. Deploy rapa-registry (singleton) ──────────────────────────────────────
echo ""
echo "📦 [2/5] Deploying rapa-registry..."
REGISTRY_ID=$(stellar contract deploy \
    --wasm contracts/rapa-registry/target/wasm32-unknown-unknown/release/rapa_registry.wasm \
    --source alice \
    --network $NETWORK)
echo "   Registry Contract ID: $REGISTRY_ID"

# ── 3. Deploy rapa-config (singleton) ────────────────────────────────────────
echo ""
echo "📦 [3/5] Deploying rapa-config..."
CONFIG_ID=$(stellar contract deploy \
    --wasm contracts/rapa-config/target/wasm32-unknown-unknown/release/rapa_config.wasm \
    --source alice \
    --network $NETWORK)
echo "   Config Contract ID: $CONFIG_ID"

ALICE_PUB=$(stellar keys show alice --public-key)

# ── 4. Initialize rapa-registry ───────────────────────────────────────────────
echo ""
echo "⚙️  [4/5] Initializing rapa-registry..."
stellar contract invoke \
    --id $REGISTRY_ID \
    --source alice \
    --network $NETWORK \
    -- initialize \
    --admin $ALICE_PUB
echo "   ✅ Registry initialized"

# ── 5. Initialize rapa-config ─────────────────────────────────────────────────
echo ""
echo "⚙️  [5/5] Initializing rapa-config..."
stellar contract invoke \
    --id $CONFIG_ID \
    --source alice \
    --network $NETWORK \
    -- initialize \
    --admin $ALICE_PUB \
    --agent_wasm_hash $WASM_HASH \
    --native_token $NATIVE_TOKEN \
    --min_interval 60 \
    --max_payment_cap 1000000000000
echo "   ✅ Config initialized"

# ── Save all IDs ──────────────────────────────────────────────────────────────
echo "$WASM_HASH"    > contract_wasm_hash.txt
echo "$REGISTRY_ID"  > contract_registry_id.txt
echo "$CONFIG_ID"    > contract_config_id.txt

cat > contract_ids.txt << EOF
# RAPA Contract IDs — $NETWORK — $(date)
WASM_HASH=$WASM_HASH
REGISTRY_CONTRACT_ID=$REGISTRY_ID
CONFIG_CONTRACT_ID=$CONFIG_ID
NATIVE_TOKEN=$NATIVE_TOKEN
EOF

echo ""
echo "🎉 All 3 contracts deployed and initialized!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  CONTRACT SUMMARY (for submission form)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Project: RAPA — Revocable Autonomous Payment Agent"
echo ""
echo "  1. rapa-agent    (per-user, deployed as WASM instances)"
echo "     WASM Hash: $WASM_HASH"
echo ""
echo "  2. rapa-registry (singleton — on-chain agent directory)"
echo "     Contract ID: $REGISTRY_ID"
echo ""
echo "  3. rapa-config   (singleton — protocol config & WASM hash)"
echo "     Contract ID: $CONFIG_ID"
echo ""
echo "  Estimated gas per agent creation: ~0.05–0.15 XLM"
echo "  Registry/Config deploy: ~0.01 XLM each (one-time)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Update rapa-frontend/lib/stellar.ts with these values."
echo "💾 All IDs saved to contract_ids.txt"
