const { Keypair } = require('@stellar/stellar-sdk');
const fs = require('fs');
const path = require('path');

// Generate valid keypair
const keeper = Keypair.random();

const envContent = `KEEPER_SECRET=${keeper.secret()}
RPC_URL=https://soroban-testnet.stellar.org
NETWORK_PASSPHRASE=Test SDF Network ; September 2015
`;

// Write to .env
fs.writeFileSync(path.join(__dirname, '.env'), envContent);

console.log('✅ Generated valid keeper keypair and saved to .env');
console.log('');
console.log('🔑 KEEPER PUBLIC KEY (FUND THIS):');
console.log(keeper.publicKey());
console.log('');
console.log('👉 Fund it here: https://laboratory.stellar.org/#account-creator?network=test');
console.log('');
console.log('Then run: node keeper-multi.js');
