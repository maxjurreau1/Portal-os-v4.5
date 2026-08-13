# Portal-OS V2 Architecture Specification

## System Design

Portal-OS V2 (Unified Kernel OS) is built on a layered architecture that unifies and distributes the Foundation OS (V1) systems across multiple nodes with cryptographic security, consensus-based coordination, and governance.

## Layer 1: Kernel Tier

### Unified Kernel (`unified_kernel/`)

**Purpose:** Coordinate multiple kernel instances into a single logical distributed kernel.

**Components:**
- `kernel_unification_layer/` — Consensus wrapper around V1 kernels
- `kernel_graph/` — DAG representation of kernel operations
- `kernel_channels/` — Authenticated inter-kernel communication
- `kernel_state/` — Unified state machine across nodes

**Key Operations:**
- Multi-node process scheduling
- Distributed memory consistency
- Atomic state transitions
- Fault tolerance and recovery

---

## Layer 2: Execution Tier

### Runtime Graph (`runtime_graph/`)

**Purpose:** Execute distributed tasks as a directed acyclic graph with parallel processing.

**Components:**
- `graph_engine/` — DAG execution runtime
- `graph_scheduler/` — Multi-node task scheduling
- `graph_nodes/` — Vertices and edges in execution DAG
- `graph_events/` — Event propagation through graph

**Key Operations:**
- Task graph compilation and optimization
- Parallel task execution across nodes
- Dependency resolution and ordering
- Dynamic load balancing

### Substrate Class-S (`substrate_s/`)

**Purpose:** Provide scalable distributed hardware abstraction.

**Components:**
- `class_s/` — Class-S substrate implementation
- `substrate_memory/` — Distributed memory pool
- `substrate_integrity/` — Consistency verification
- `substrate_channels/` — Resource allocation channels

**Key Operations:**
- Virtual resource provisioning
- Cross-node resource scheduling
- Memory replication and consistency
- Channel bandwidth management

---

## Layer 3: Cognitive Tier

### Cognitive Mesh (`cognitive_mesh/`)

**Purpose:** Distribute intelligent processing across a mesh of cognitive agents.

**Components:**
- `mesh_engine/` — Mesh coordination engine
- `mesh_agents/` — Autonomous cognitive agents
- `mesh_memory/` — Distributed shared memory
- `mesh_domains/` — Domain-specific agents

**Key Operations:**
- Agent initialization and lifecycle
- Shared memory synchronization
- Message-based agent communication
- Domain-specific reasoning

### TEC Chains (`tec_chains/`)

**Purpose:** Execute transactions with distributed consensus.

**Components:**
- `chain_engine/` — BFT consensus engine
- `chain_nodes/` — Validator and executor nodes
- `chain_scheduler/` — Transaction ordering
- `chain_domains/` — Multi-domain settlement

**Key Operations:**
- Transaction ordering and validation
- BFT consensus protocol
- Finality determination
- Multi-domain atomic settlement

---

## Layer 4: Coordination Tier

### Orchestration (`orchestration/`)

**Purpose:** Coordinate all distributed systems through consensus and service mesh.

**Components:**
- `consensus_engine/` — BFT/Raft consensus
- `service_mesh/` — Service discovery and routing
- `state_sync/` — Cross-domain state synchronization
- `coordination/` — General coordination primitives

**Key Operations:**
- Consensus-based decisions
- Service registration and discovery
- Load balancing and failover
- State replication

---

## Layer 5: Trust & Governance Tier

### Identity (`identity/`)

**Purpose:** Establish and maintain cryptographic identity across the system.

**Components:**
- `auth_engine/` — Authentication protocols
- `identity_registry/` — Distributed identity store
- `key_management/` — Cryptographic key lifecycle
- `credential_store/` — Credential verification

**Key Operations:**
- Public key infrastructure (PKI)
- Single sign-on across domains
- Key rotation and revocation
- Credential issuance and verification

### Governance (`governance/`)

**Purpose:** Define and enforce constitutional rules for the entire system.

**Components:**
- `constitution/` — V2 constitutional rules
- `governance_chambers/` — Multi-chamber voting bodies
- `governance_graph/` — Dependency graph of decisions
- `voting_engine/` — Distributed voting protocols
- `rules_engine/` — Rule enforcement

**Key Operations:**
- Constitutional rule definition
- Proposal and voting
- Rule validation and enforcement
- Constitutional amendments

### Security (`security/`)

**Purpose:** Enforce cryptographic security and access control.

**Components:**
- `crypto_engine/` — Cryptographic primitives
- `access_control/` — RBAC/ABAC systems
- `domain_isolation/` — Security boundaries
- `audit_log/` — Immutable event log

**Key Operations:**
- Encryption and signing
- Access control enforcement
- Domain separation
- Audit trail maintenance

---

## Layer 6: Integration

### Umbrella V2 (`umbrella_v2/`)

**Purpose:** Unified integration framework for all V2 systems.

**Components:**
- `integration/` — Cross-system integration

---

## Data Flow

### Request Path (simplified)
```
Client Request
    ↓
Identity (authenticate & authorize)
    ↓
Orchestration (route to service)
    ↓
Runtime Graph (schedule task)
    ↓
Unified Kernel (execute on node)
    ↓
Substrate-S (allocate resources)
    ↓
Execution
    ↓
Cognitive Mesh / TEC Chain (if needed)
    ↓
TEC Chains (if transaction)
    ↓
Governance (validate against rules)
    ↓
Response
```

### Consensus Path
```
State Change Proposed
    ↓
Orchestration → Consensus Engine
    ↓
BFT Round 1, 2, 3, ...
    ↓
2/3+ Nodes Agree?
    ├─ YES → Commit to Unified State
    └─ NO → Abort/Retry
    ↓
Audit Log Entry
    ↓
Notify Subscribers
```

---

## Consensus Protocols

### Kernel State Consensus
- **Protocol:** BFT (Byzantine Fault Tolerant)
- **Participants:** All kernel nodes
- **Safety:** No conflicting decisions
- **Liveness:** Decisions finalized in bounded time

### TEC Execution Consensus
- **Protocol:** Ordering-based BFT
- **Participants:** Transaction validators
- **Safety:** Transaction finality
- **Liveness:** Bounded confirmation time

### Governance Voting
- **Protocol:** Weighted quorum voting
- **Participants:** Voting chambers
- **Safety:** No invalid rules applied
- **Liveness:** Bounded voting period

---

## Security Model

### Trust Assumptions
- Honest supermajority (2/3+) of nodes
- Cryptographically secure channels
- Authentic time sources
- Tamper-resistant keystores

### Threat Model
- Byzantine failures (malicious nodes)
- Network partitions (temporary)
- Timing attacks (prevented by async design)
- Cryptographic attacks (prevented by proven algorithms)

### Defense Mechanisms
- BFT consensus prevents single-node attacks
- Cryptographic signatures verify authenticity
- Domain isolation prevents lateral movement
- Audit logs enable forensics
- Governance rules enforce policy

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Consensus latency | < 1 second |
| TEC throughput | > 10,000 tx/sec |
| State sync time | < 100ms |
| Failover time | < 5 seconds |
| Network overhead | < 10% |

---

## Deployment Modes

### Development
- 3-5 nodes (local or cloud)
- Single domain
- No replication

### Production
- 5-7 nodes (geographic distribution)
- Multiple domains
- Full replication
- Backup nodes

### Global
- 20+ nodes
- Continental distribution
- Multi-region replication
- Autonomous domains

---

## Future Extensions (V3 Preparation)

- **Multi-domain cognition:** Shared reasoning across domains
- **World simulation:** Large-scale system simulation
- **Self-governance:** Automatic rule adaptation
- **Autonomous agents:** Self-managing systems
