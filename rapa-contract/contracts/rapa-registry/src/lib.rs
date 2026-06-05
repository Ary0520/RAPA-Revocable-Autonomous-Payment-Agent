#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, vec, Address, Env, Vec};

/// On-chain registry of all deployed RAPA payment agent contract IDs.
/// Replaces the localStorage-based registry in the frontend and the
/// flat file registry used by the keeper.
///
/// Any user can register their own agent; only the owner can remove it.
/// The keeper queries this contract instead of a local JSON file.

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    /// Admin address (set once at init)
    Admin,
    /// All agent contract IDs (Vec<Address>)
    Agents,
    /// owner -> list of their agent contract IDs
    OwnerAgents(Address),
}

#[contract]
pub struct RapaRegistry;

#[contractimpl]
impl RapaRegistry {
    /// Initialize the registry with an admin address.
    pub fn initialize(e: Env, admin: Address) {
        if e.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        admin.require_auth();
        e.storage().instance().set(&DataKey::Admin, &admin);
        let empty: Vec<Address> = vec![&e];
        e.storage().instance().set(&DataKey::Agents, &empty);
    }

    /// Register a new agent contract.  Must be called by the agent owner.
    pub fn register_agent(e: Env, owner: Address, agent_contract: Address) {
        owner.require_auth();

        // Add to global list
        let mut all: Vec<Address> = e
            .storage()
            .instance()
            .get(&DataKey::Agents)
            .unwrap_or(vec![&e]);

        // Deduplicate
        for existing in all.iter() {
            if existing == agent_contract {
                panic!("Agent already registered");
            }
        }
        all.push_back(agent_contract.clone());
        e.storage().instance().set(&DataKey::Agents, &all);

        // Add to owner's personal list
        let mut owner_agents: Vec<Address> = e
            .storage()
            .instance()
            .get(&DataKey::OwnerAgents(owner.clone()))
            .unwrap_or(vec![&e]);
        owner_agents.push_back(agent_contract);
        e.storage()
            .instance()
            .set(&DataKey::OwnerAgents(owner), &owner_agents);
    }

    /// Remove an agent from the registry.  Only the agent owner or admin can do this.
    pub fn remove_agent(e: Env, caller: Address, agent_contract: Address) {
        caller.require_auth();

        let admin: Address = e.storage().instance().get(&DataKey::Admin).unwrap();
        // Caller must be admin OR the contract's owner (we verify by checking owner list)
        let is_admin = caller == admin;
        if !is_admin {
            // Verify caller actually owns this agent
            let owner_agents: Vec<Address> = e
                .storage()
                .instance()
                .get(&DataKey::OwnerAgents(caller.clone()))
                .unwrap_or(vec![&e]);
            let mut found = false;
            for a in owner_agents.iter() {
                if a == agent_contract {
                    found = true;
                    break;
                }
            }
            if !found {
                panic!("Not authorized to remove this agent");
            }
        }

        // Remove from global list
        let all: Vec<Address> = e
            .storage()
            .instance()
            .get(&DataKey::Agents)
            .unwrap_or(vec![&e]);
        let mut new_all: Vec<Address> = vec![&e];
        for a in all.iter() {
            if a != agent_contract {
                new_all.push_back(a);
            }
        }
        e.storage().instance().set(&DataKey::Agents, &new_all);

        // Remove from owner list
        if !is_admin {
            let owner_agents: Vec<Address> = e
                .storage()
                .instance()
                .get(&DataKey::OwnerAgents(caller.clone()))
                .unwrap_or(vec![&e]);
            let mut new_owner: Vec<Address> = vec![&e];
            for a in owner_agents.iter() {
                if a != agent_contract {
                    new_owner.push_back(a);
                }
            }
            e.storage()
                .instance()
                .set(&DataKey::OwnerAgents(caller), &new_owner);
        }
    }

    /// Get all registered agent contract IDs.
    pub fn get_all_agents(e: Env) -> Vec<Address> {
        e.storage()
            .instance()
            .get(&DataKey::Agents)
            .unwrap_or(vec![&e])
    }

    /// Get agents owned by a specific address.
    pub fn get_owner_agents(e: Env, owner: Address) -> Vec<Address> {
        e.storage()
            .instance()
            .get(&DataKey::OwnerAgents(owner))
            .unwrap_or(vec![&e])
    }

    /// Total number of registered agents.
    pub fn agent_count(e: Env) -> u32 {
        let all: Vec<Address> = e
            .storage()
            .instance()
            .get(&DataKey::Agents)
            .unwrap_or(vec![&e]);
        all.len()
    }

    /// Get the admin address.
    pub fn get_admin(e: Env) -> Address {
        e.storage().instance().get(&DataKey::Admin).unwrap()
    }
}
