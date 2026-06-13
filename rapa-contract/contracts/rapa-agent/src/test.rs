#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token, Address, Env,
};

// ── helpers ──────────────────────────────────────────────────────────────────

fn setup() -> (Env, Address, Address, Address, Address) {
    // Returns: (env, contract_id, token_id, owner, recipient)
    let e = Env::default();
    e.mock_all_auths();

    let owner = Address::generate(&e);
    let recipient = Address::generate(&e);

    // Deploy a token contract and mint funds
    let sac = e.register_stellar_asset_contract_v2(owner.clone());
    let token_id = sac.address();
    let token_admin = token::StellarAssetClient::new(&e, &token_id);
    token_admin.mint(&owner, &1_000_000_000_i128);

    let contract_id = e.register(RapaContract, ());

    // Fund the agent contract with 500 tokens
    let token_client = token::Client::new(&e, &token_id);
    token_client.transfer(&owner, &contract_id, &500_000_000_i128);

    // Set expiry 1 hour from ledger timestamp
    let expiry = e.ledger().timestamp() + 3600;

    RapaContractClient::new(&e, &contract_id).initialize(
        &owner,
        &recipient,
        &token_id,
        &100_000_000_i128, // 10 tokens max per payment
        &60_u64,           // 60-second interval
        &expiry,
    );

    (e, contract_id, token_id, owner, recipient)
}

// ── Test 1: initialize stores correct state ──────────────────────────────────
#[test]
fn test_initialize_stores_state() {
    let (e, contract_id, _token_id, owner, recipient) = setup();
    let client = RapaContractClient::new(&e, &contract_id);

    let (st_owner, st_recipient, _st_token, max_amount, interval, last_exec, _expiry, active) =
        client.get_state();

    assert_eq!(st_owner, owner);
    assert_eq!(st_recipient, recipient);
    assert_eq!(max_amount, 100_000_000_i128);
    assert_eq!(interval, 60_u64);
    assert_eq!(last_exec, 0_u64);
    assert!(active);
}

// ── Test 2: execute_payment transfers tokens and updates last_executed ────────
#[test]
fn test_execute_payment_succeeds() {
    let (e, contract_id, token_id, _owner, recipient) = setup();
    // Set ledger time to non-zero so last_executed gets a real value
    e.ledger().with_mut(|l| l.timestamp = 1000);
    let client = RapaContractClient::new(&e, &contract_id);
    let token_client = token::Client::new(&e, &token_id);

    let before = token_client.balance(&recipient);
    client.execute_payment(&50_000_000_i128); // 5 tokens
    let after = token_client.balance(&recipient);

    assert_eq!(after - before, 50_000_000_i128);

    // last_executed should now be the ledger timestamp (non-zero)
    let (_, _, _, _, _, last_exec, _, _) = client.get_state();
    assert_eq!(last_exec, 1000_u64);
}

// ── Test 3: execute_payment panics when amount exceeds max ────────────────────
#[test]
#[should_panic(expected = "Amount exceeds limit")]
fn test_execute_payment_exceeds_limit() {
    let (e, contract_id, _, _, _) = setup();
    let client = RapaContractClient::new(&e, &contract_id);
    client.execute_payment(&200_000_000_i128); // 20 tokens — over the 10 token cap
}

// ── Test 4: execute_payment panics before interval elapses ───────────────────
#[test]
#[should_panic(expected = "Interval not satisfied")]
fn test_execute_payment_interval_not_satisfied() {
    let (e, contract_id, _, _, _) = setup();
    // Set non-zero timestamp so the interval guard triggers on second call
    e.ledger().with_mut(|l| l.timestamp = 1000);
    let client = RapaContractClient::new(&e, &contract_id);

    // First payment OK (last_executed = 0, so guard is skipped)
    client.execute_payment(&10_000_000_i128);
    // Timestamp still 1000 — interval of 60s not yet passed — should panic
    client.execute_payment(&10_000_000_i128);
}

// ── Test 5: execute_payment succeeds after interval elapses ──────────────────
#[test]
fn test_execute_payment_after_interval() {
    let (e, contract_id, token_id, _owner, recipient) = setup();
    e.ledger().with_mut(|l| l.timestamp = 1000);
    let client = RapaContractClient::new(&e, &contract_id);
    let token_client = token::Client::new(&e, &token_id);

    client.execute_payment(&10_000_000_i128);

    // Advance ledger 61 seconds past the 60s interval
    e.ledger().with_mut(|l| l.timestamp += 61);

    let before = token_client.balance(&recipient);
    client.execute_payment(&10_000_000_i128);
    let after = token_client.balance(&recipient);

    assert_eq!(after - before, 10_000_000_i128);
}

// ── Test 6: revoke_agent sets active = false ──────────────────────────────────
#[test]
fn test_revoke_agent() {
    let (e, contract_id, _, _, _) = setup();
    let client = RapaContractClient::new(&e, &contract_id);

    client.revoke_agent();

    let (_, _, _, _, _, _, _, active) = client.get_state();
    assert!(!active);
}

// ── Test 7: execute_payment panics when agent is revoked ─────────────────────
#[test]
#[should_panic(expected = "Agent is not active")]
fn test_execute_payment_after_revoke() {
    let (e, contract_id, _, _, _) = setup();
    let client = RapaContractClient::new(&e, &contract_id);

    client.revoke_agent();
    client.execute_payment(&10_000_000_i128);
}

// ── Test 8: execute_payment panics when expired ───────────────────────────────
#[test]
#[should_panic(expected = "Agent expired")]
fn test_execute_payment_expired() {
    let (e, contract_id, _, _, _) = setup();
    let client = RapaContractClient::new(&e, &contract_id);

    // Jump past the 3600s expiry
    e.ledger().with_mut(|l| l.timestamp += 3601);

    client.execute_payment(&10_000_000_i128);
}
