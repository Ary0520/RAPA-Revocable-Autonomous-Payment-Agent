#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env};

mod test;

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Owner,
    Recipient,
    Token,
    MaxAmount,
    Interval, 
    LastExecuted,
    Expiry,
    Active,
}

#[contract]
pub struct RapaContract;

#[contractimpl]
impl RapaContract {
    pub fn initialize(
        e: Env,
        owner: Address,
        recipient: Address,
        token: Address,
        max_amount: i128,
        interval: u64,
        expiry: u64,
    ) {
        if e.storage().instance().has(&DataKey::Owner) {
            panic!("Already initialized");
        }

        owner.require_auth();

        e.storage().instance().set(&DataKey::Owner, &owner);
        e.storage().instance().set(&DataKey::Recipient, &recipient);
        e.storage().instance().set(&DataKey::Token, &token);
        e.storage().instance().set(&DataKey::MaxAmount, &max_amount);
        e.storage().instance().set(&DataKey::Interval, &interval);
        e.storage().instance().set(&DataKey::Expiry, &expiry);
        e.storage().instance().set(&DataKey::Active, &true);
        e.storage().instance().set(&DataKey::LastExecuted, &0u64); 
    }

    pub fn execute_payment(e: Env, amount: i128) {
        // 1. Check if Active
        let active: bool = e.storage().instance().get(&DataKey::Active).unwrap();
        if !active {
            panic!("Agent is not active");
        }

        // 2. Check Expiry
        let expiry: u64 = e.storage().instance().get(&DataKey::Expiry).unwrap();
        if e.ledger().timestamp() > expiry {
            panic!("Agent expired");
        }

        // 3. Check Amount Limit
        let max_amount: i128 = e.storage().instance().get(&DataKey::MaxAmount).unwrap();
        if amount > max_amount {
            panic!("Amount exceeds limit");
        }

        // 4. Check Interval
        let last_executed: u64 = e.storage().instance().get(&DataKey::LastExecuted).unwrap();
        let interval: u64 = e.storage().instance().get(&DataKey::Interval).unwrap();
        
        // If last_executed is 0, it means it's the first run, so it's allowed immediately.
        // Otherwise, check time diff.
        if last_executed > 0 && e.ledger().timestamp() < last_executed + interval {
             panic!("Interval not satisfied");
        }

        let recipient: Address = e.storage().instance().get(&DataKey::Recipient).unwrap();
        let token_addr: Address = e.storage().instance().get(&DataKey::Token).unwrap();

        // 5. Check Balance (Optional, but good for error msg)
        // client.balance(&e.current_contract_address()) ...
        
        // 6. Execute Transfer
        let client = token::Client::new(&e, &token_addr);
        client.transfer(&e.current_contract_address(), &recipient, &amount);

        // 7. Update State
        e.storage().instance().set(&DataKey::LastExecuted, &e.ledger().timestamp());
    }

    pub fn revoke_agent(e: Env) {
        let owner: Address = e.storage().instance().get(&DataKey::Owner).unwrap();
        owner.require_auth();
        
        e.storage().instance().set(&DataKey::Active, &false);
    }
    
    // Helper to view state
    pub fn get_state(e: Env) -> (Address, Address, Address, i128, u64, u64, u64, bool) {
         (
            e.storage().instance().get(&DataKey::Owner).unwrap(),
            e.storage().instance().get(&DataKey::Recipient).unwrap(),
            e.storage().instance().get(&DataKey::Token).unwrap(),
            e.storage().instance().get(&DataKey::MaxAmount).unwrap(),
            e.storage().instance().get(&DataKey::Interval).unwrap(),
            e.storage().instance().get(&DataKey::LastExecuted).unwrap(),
            e.storage().instance().get(&DataKey::Expiry).unwrap(),
            e.storage().instance().get(&DataKey::Active).unwrap(),
         )
    }
}
