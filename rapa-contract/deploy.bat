@echo off
echo 🚀 Deploying RAPA Contract to Stellar Testnet

REM Check if stellar CLI is available
stellar --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Stellar CLI not found. Please install it first.
    echo    Visit: https://developers.stellar.org/docs/tools/developer-tools
    pause
    exit /b 1
)

REM Set network to testnet
echo 📡 Setting up testnet configuration...
stellar network add testnet https://soroban-testnet.stellar.org
stellar network use testnet

REM Check if alice identity exists, create if not
stellar keys show alice >nul 2>&1
if errorlevel 1 (
    echo 🔑 Creating alice identity...
    stellar keys generate alice --network testnet
) else (
    echo ✅ Alice identity found
)

REM Fund alice account
echo 💰 Funding alice account...
stellar keys fund alice --network testnet

REM Build the contract
echo 🔨 Building contract...
cd contracts\rapa-agent
stellar contract build

REM Deploy the contract
echo 📦 Deploying contract...
for /f "tokens=*" %%i in ('stellar contract deploy --wasm target\wasm32-unknown-unknown\release\rapa_agent.wasm --source alice --network testnet') do set CONTRACT_ID=%%i

echo ✅ Contract deployed successfully!
echo 📋 Contract ID: %CONTRACT_ID%

REM Save contract ID to file
echo %CONTRACT_ID% > ..\..\contract_id.txt
echo 💾 Contract ID saved to contract_id.txt

REM Get native asset contract ID
echo 🪙 Getting native asset contract ID...
for /f "tokens=*" %%i in ('stellar contract id asset --asset native --network testnet') do set NATIVE_CONTRACT_ID=%%i
echo 📋 Native Asset Contract ID: %NATIVE_CONTRACT_ID%

REM Update keeper environment
echo ⚙️  Updating keeper configuration...
cd ..\..\rapa-keeper

REM Create production .env file
(
echo # RAPA Production Configuration
echo # Generated: %date% %time%
echo.
echo # Deployed contract
echo CONTRACT_ID=%CONTRACT_ID%
echo.
echo # Native asset contract
echo NATIVE_TOKEN_CONTRACT_ID=%NATIVE_CONTRACT_ID%
echo.
echo # Network configuration
echo RPC_URL=https://soroban-testnet.stellar.org
echo NETWORK_PASSPHRASE=Test SDF Network ; September 2015
echo.
echo # Keeper configuration ^(replace with your keys^)
echo KEEPER_SECRET=REPLACE_WITH_YOUR_SECRET_KEY
echo KEEPER_PUBLIC=REPLACE_WITH_YOUR_PUBLIC_KEY
echo.
echo # Recipient for testing ^(replace with actual recipient^)
echo BOB_ADDRESS=REPLACE_WITH_RECIPIENT_ADDRESS
) > .env.production

echo ✅ Created .env.production file
echo.
echo 🎉 Deployment Complete!
echo.
echo 📋 Summary:
echo    Contract ID: %CONTRACT_ID%
echo    Native Token: %NATIVE_CONTRACT_ID%
echo    Network: Stellar Testnet
echo.
echo 📝 Next Steps:
echo    1. Update rapa-keeper/.env.production with your keys
echo    2. Update rapa-frontend/lib/stellar.ts with the new CONTRACT_ID
echo    3. Fund your keeper account
echo    4. Test the system!
echo.
echo 🔗 Useful Links:
echo    - Fund Account: https://laboratory.stellar.org/#account-creator?network=test
echo    - Explorer: https://stellar.expert/explorer/testnet
echo    - Contract: https://stellar.expert/explorer/testnet/contract/%CONTRACT_ID%

pause