<img width="1919" height="906" alt="image" src="https://github.com/user-attachments/assets/e76cb733-bdb9-4f02-a013-7650a4c726d6" /># 🚀 RAPA - Automated Payment Agent System

A decentralized platform for creating autonomous payment agents on Stellar blockchain.

MAINNET ADDRESS: CAND44ZK74KTWM3BJ73MJZ55QJ6ELSXSG6ECN3XSEBKQ4GGJ65A6FG63

CI/CD screenshot:
<img width="1902" height="425" alt="image" src="https://github.com/user-attachments/assets/4be90c5c-d6eb-4d6a-a60d-e39103418296" />


## 📁 Project Structure

```
RAPA/
├── rapa-contract/          # Soroban smart contract (Rust)
│   └── contracts/rapa-agent/
│       ├── src/lib.rs      # Main contract logic
│       └── Cargo.toml
│
├── rapa-frontend/          # Next.js frontend application
│   ├── app/                # Pages and routes
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Core logic and Stellar SDK integration
│   └── public/             # Static assets
│
├── rapa-keeper/            # Node.js keeper service (monitors and executes agents)
│   ├── keeper-multi.js     # Multi-agent keeper service
│   ├── setup-keeper.js     # Generate keeper wallet
│   ├── check-agent.js      # Diagnostic tool
│   ├── .env                # Keeper configuration
│   └── package.json
│
├── agent-registry.json     # Shared registry of all active agents
├── FINAL_LAUNCH_GUIDE.md   # Complete setup and launch guide
└── README.md               # This file
```

## 🎯 What is RAPA?

RAPA lets users create **autonomous payment agents** on Stellar:
- Set a recipient address
- Configure payment amount and interval
- Fund the agent contract
- The keeper automatically executes payments on schedule!

## ⚙️ Setup (After Cloning from GitHub)

### Prerequisites
- Node.js 18+ installed
- Stellar Freighter wallet extension
- Some testnet XLM

### Installation

**1. Clone and Install Dependencies**
```bash
git clone <your-repo-url>
cd RAPA

# Install frontend dependencies
cd rapa-frontend
npm install

# Install keeper dependencies
cd ../rapa-keeper
npm install
```

**2. Configure Keeper**
```bash
cd rapa-keeper
cp .env.example .env
node setup-keeper.js          # This will generate and save a keeper secret to .env
```

**3. Fund Keeper Wallet**
- The setup script will show you a public key
- Fund it at: https://laboratory.stellar.org/#account-creator?network=test

**4. Create Registry File**
```bash
cd ..
cp agent-registry.example.json agent-registry.json
```

**Done!** Your system is ready to run.

## 🚀 Quick Start

### 1. Start the Keeper
```bash
cd rapa-keeper
node setup-keeper.js           # Generate keeper wallet
# Fund the keeper address shown
node keeper-multi.js           # Start monitoring
```

### 2. Start the Frontend
```bash
cd rapa-frontend
npm install
npm run dev                    # Open http://localhost:3000
```

### 3. Create an Agent
1. Connect Freighter wallet
2. Fill in recipient, amount, interval
3. Click "Create Agent"
4. Confirm 3 transactions (deploy, initialize, fund)

### 4. Watch It Work!
The keeper automatically executes payments when conditions are met!

## 🔧 Tech Stack

- **Smart Contract**: Rust + Soroban SDK
- **Frontend**: Next.js + React + TypeScript
- **Keeper**: Node.js + Stellar SDK
- **Blockchain**: Stellar (Soroban testnet)

## 📖 Documentation

See `FINAL_LAUNCH_GUIDE.md` for complete setup instructions.

## 🎉 Features

✅ Deploy autonomous payment agents
✅ Configure custom payment schedules
✅ Real-time agent monitoring
✅ Revoke agents anytime
✅ Multi-agent support
✅ Automatic execution via keeper service

## 🔐 Security

- Agents require owner authorization to revoke
- Keeper only pays gas fees (not payment funds)
- All transactions signed via Freighter wallet
- Smart contract enforces interval and expiry limits

---

Built for Stellar blockchain | Soroban smart contracts
