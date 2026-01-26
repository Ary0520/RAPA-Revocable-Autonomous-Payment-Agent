#!/bin/bash

# RAPA Contract Deployment Script
echo "🚀 Deploying RAPA Contract to Stellar Testnet"

# Check if stellar CLI is available
if ! command -v stellar &> /dev/null; then
    echo "❌ Stellar CLI not found. Please install it first."
    echo "   Visit: https://developers.stellar.org/docs/tools/developer-tools"
    exit 1
fi

# Set network to testnet
echo "📡 Setting up testnet configuration..."
stellar network add testnet https://soroban-testnet.stellar.org
stellar network use testnet

# Check if alice identity exists, create if not
if ! stellar keys show alice &> /dev/null; then
    echo "🔑 Creating alice identity..."
    stellar keys generate alice --network testnet
else
    echo "✅ Alice identity found"
fi

# Fund alice account
echo "💰 Funding alice account..."
stellar keys fund alice --network testnet

# Build the contract
echo "🔨 Building contract..."
cd contracts/rapa-agent
stellar contract build

# Deploy the contract
echo "📦 Deploying contract..."
CONTRACT_ID=$(stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/rapa_agent.wasm \
    --source alice \
    --network testnet)

echo "✅ Contract deployed successfully!"
echo "📋 Contract ID: $CONTRACT_ID"

# Save contract ID to file
echo "$CONTRACT_ID" > ../../contract_id.txt
echo "💾 Contract ID saved to contract_id.txt"

# Get native asset contract ID
echo "🪙 Getting native asset contract ID..."
NATIVE_CONTRACT_ID=$(stellar contract id asset --asset native --network testnet)
echo "📋 Native Asset Contract ID: $NATIVE_CONTRACT_ID"

# Update keeper environment
echo "⚙️  Updating keeper configuration..."
cd ../../rapa-keeper

# Create production .env file
cat > .env.production << EOF
# RAPA Production Configuration
# Generated: $(date)

# Deployed contract
CONTRACT_ID=$CONTRACT_ID

# Native asset contract
NATIVE_TOKEN_CONTRACT_ID=$NATIVE_CONTRACT_ID

# Network configuration
RPC_URL=https://soroban-testnet.stellar.org
NETWORK_PASSPHRASE=Test SDF Network ; September 2015

# Keeper configuration (replace with your keys)
KEEPER_SECRET=REPLACE_WITH_YOUR_SECRET_KEY
KEEPER_PUBLIC=REPLACE_WITH_YOUR_PUBLIC_KEY

# Recipient for testing (replace with actual recipient)
BOB_ADDRESS=REPLACE_WITH_RECIPIENT_ADDRESS
EOF

echo "✅ Created .env.production file"
echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📋 Summary:"
echo "   Contract ID: $CONTRACT_ID"
echo "   Native Token: $NATIVE_CONTRACT_ID"
echo "   Network: Stellar Testnet"
echo ""
echo "📝 Next Steps:"
echo "   1. Update rapa-keeper/.env.production with your keys"
echo "   2. Update rapa-frontend/lib/stellar.ts with the new CONTRACT_ID"
echo "   3. Fund your keeper account"
echo "   4. Test the system!"
echo ""
echo "🔗 Useful Links:"
echo "   - Fund Account: https://laboratory.stellar.org/#account-creator?network=test"
echo "   - Explorer: https://stellar.expert/explorer/testnet"
echo "   - Contract: https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"