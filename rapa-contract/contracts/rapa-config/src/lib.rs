#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env};

/// Protocol-level configuration contract for RAPA.
/// Stores the canonical WASM hash for rapa-agent, the native token contract ID,
/// and protocol fee parameters.  The frontend reads these values instead of
/// having them hardcoded, making upgrades admin-only on-chain operations.

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    /// Protocol admin
    Admin,
    /// SHA-256 hash of the latest rapa-agent WASM (32 bytes)
    AgentWasmHash,
    /// Native XLM Stellar Asset Contract address
    NativeTokenContract,
    /// Minimum allowed payment interval in seconds
    MinInterval,
    /// Maximum allowed single payment in stroops (i128)
    MaxPaymentCap,
    /// Whether new agent creation is paused (circuit breaker)
    CreationPaused,
}

#[contract]
pub struct RapaConfig;

#[contractimpl]
impl RapaConfig {
    /// Initialize the config contract.
    /// `agent_wasm_hash`    – 32-byte WASM hash of the deployed rapa-agent WASM
    /// `native_token`       – address of the XLM SAC contract
    /// `min_interval`       – minimum seconds between payments (e.g. 60)
    /// `max_payment_cap`    – hard cap in stroops (e.g. 10_000 XLM = 100_000_000_000)
    pub fn initialize(
        e: Env,
        admin: Address,
        agent_wasm_hash: BytesN<32>,
        native_token: Address,
        min_interval: u64,
        max_payment_cap: i128,
    ) {
        if e.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        admin.require_auth();
        e.storage().instance().set(&DataKey::Admin, &admin);
        e.storage()
            .instance()
            .set(&DataKey::AgentWasmHash, &agent_wasm_hash);
        e.storage()
            .instance()
            .set(&DataKey::NativeTokenContract, &native_token);
        e.storage()
            .instance()
            .set(&DataKey::MinInterval, &min_interval);
        e.storage()
            .instance()
            .set(&DataKey::MaxPaymentCap, &max_payment_cap);
        e.storage()
            .instance()
            .set(&DataKey::CreationPaused, &false);
    }

    // ── Admin-only setters ────────────────────────────────────────────────────

    /// Update the WASM hash after a contract upgrade.
    pub fn set_wasm_hash(e: Env, admin: Address, new_hash: BytesN<32>) {
        Self::require_admin(&e, &admin);
        e.storage()
            .instance()
            .set(&DataKey::AgentWasmHash, &new_hash);
    }

    /// Update the minimum interval.
    pub fn set_min_interval(e: Env, admin: Address, min_interval: u64) {
        Self::require_admin(&e, &admin);
        e.storage()
            .instance()
            .set(&DataKey::MinInterval, &min_interval);
    }

    /// Update the maximum payment cap.
    pub fn set_max_payment_cap(e: Env, admin: Address, max_payment_cap: i128) {
        Self::require_admin(&e, &admin);
        e.storage()
            .instance()
            .set(&DataKey::MaxPaymentCap, &max_payment_cap);
    }

    /// Pause or unpause new agent creation.
    pub fn set_creation_paused(e: Env, admin: Address, paused: bool) {
        Self::require_admin(&e, &admin);
        e.storage()
            .instance()
            .set(&DataKey::CreationPaused, &paused);
    }

    /// Transfer admin rights to a new address.
    pub fn transfer_admin(e: Env, admin: Address, new_admin: Address) {
        Self::require_admin(&e, &admin);
        new_admin.require_auth();
        e.storage().instance().set(&DataKey::Admin, &new_admin);
    }

    // ── Public getters ────────────────────────────────────────────────────────

    pub fn get_wasm_hash(e: Env) -> BytesN<32> {
        e.storage()
            .instance()
            .get(&DataKey::AgentWasmHash)
            .unwrap()
    }

    pub fn get_native_token(e: Env) -> Address {
        e.storage()
            .instance()
            .get(&DataKey::NativeTokenContract)
            .unwrap()
    }

    pub fn get_min_interval(e: Env) -> u64 {
        e.storage()
            .instance()
            .get(&DataKey::MinInterval)
            .unwrap()
    }

    pub fn get_max_payment_cap(e: Env) -> i128 {
        e.storage()
            .instance()
            .get(&DataKey::MaxPaymentCap)
            .unwrap()
    }

    pub fn is_creation_paused(e: Env) -> bool {
        e.storage()
            .instance()
            .get(&DataKey::CreationPaused)
            .unwrap_or(false)
    }

    pub fn get_admin(e: Env) -> Address {
        e.storage().instance().get(&DataKey::Admin).unwrap()
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    fn require_admin(e: &Env, caller: &Address) {
        let admin: Address = e.storage().instance().get(&DataKey::Admin).unwrap();
        if *caller != admin {
            panic!("Not admin");
        }
        caller.require_auth();
    }
}
