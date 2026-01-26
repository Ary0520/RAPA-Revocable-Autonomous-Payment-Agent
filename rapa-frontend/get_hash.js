const { rpc, xdr, StrKey } = require('@stellar/stellar-sdk');

const server = new rpc.Server('https://soroban-testnet.stellar.org');

async function main() {
    const contractId = 'CAXZF4MZBASXLYXVL6GQKBAMRTGNDYIDWTNSWFQ4AAOXLRMCF757DEUB';
    console.log(`Fetching info for contract: ${contractId}`);

    try {
        const contractIdBuffer = StrKey.decodeContract(contractId);

        // LedgerKey for Contract Data (Instance)
        // Note: LedgerKeyContractData has fields: contract, key, durability
        const ledgerKey = xdr.LedgerKey.contractData(new xdr.LedgerKeyContractData({
            contract: new xdr.ScAddress.scAddressTypeContract(contractIdBuffer),
            key: xdr.ScVal.scvLedgerKeyContractInstance(),
            durability: xdr.ContractDataDurability.persistent()
        }));

        const keyBase64 = ledgerKey.toXDR("base64");
        console.log("Key XDR:", keyBase64);

        // Try getLedgerEntries
        const result = await server.getLedgerEntries([keyBase64]);

        if (!result || !result.entries || result.entries.length === 0) {
            console.log("No ledger entry found.");
            // check if there is an error
            return;
        }

        const entryData = result.entries[0];
        // The xdr might be in 'xdr' or 'val'. Usually 'xdr' is the base64 string of LedgerEntryData
        const xdrString = entryData.xdr;

        const entry = xdr.LedgerEntryData.fromXDR(xdrString, 'base64');
        const contractData = entry.contractData();
        const instance = contractData.val().instance(); // ScContractInstance
        const executable = instance.executable(); // ContractExecutable

        console.log("Executable Type:", executable.switch().name);

        if (executable.switch().name === 'contractExecutableWasm') {
            const hash = executable.wasmHash();
            console.log("WASM Hash (hex):", hash.toString('hex'));
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
