# Portal-OS V1 → V2 Migration Map

## Overview
This document defines the architectural integration between Portal-OS V1 (Foundation OS) and Portal-OS V2 (Unified Kernel OS). V2 enhances, unifies, and extends V1 systems into a distributed governance architecture.

---

## V1 Components → V2 Integration

### Core System Layer

#### 1. Kernel → Unified Kernel
**V1 Component:** `kernel/`
- Single-node kernel architecture
- Process scheduling
- Memory management
- Interrupt handling

**V2 Enhancement:** `unified_kernel/`
- Distributed kernel consensus
- Multi-node coordination
- Unified state management
- Cross-domain synchronization
- **Integration:** V1 kernel becomes the single-node reference implementation for unified kernel nodes

---

#### 2. Runtime → Runtime Graph
**V1 Component:** `runtime/`
- Linear execution model
- Task scheduling
- Resource allocation

**V2 Enhancement:** `runtime_graph/`
- Directed acyclic graph (DAG) execution model
- Parallel task execution
- Distributed scheduling across V2 nodes
- Resource optimization across domain boundaries
- **Integration:** V1 runtime becomes foundation for individual node runtimes in V2's distributed graph

---

#### 3. Hypervisor → Substrate Class-S
**V1 Component:** `hypervisor/`
- Virtual machine abstraction
- Hardware resource isolation
- Memory virtualization

**V2 Enhancement:** `substrate_class_s/`
- Scalable substrate for distributed systems
- Cross-domain virtualization
- Resource pooling across nodes
- **Integration:** V1 hypervisor principles applied to V2's class-S substrate for multi-domain isolation

---

### Data & Communication Layer

#### 4. Memory → Orchestration
**V1 Component:** `memory/`
- Local memory management
- Cache hierarchy
- Memory protection

**V2 Enhancement:** `orchestration/`
- Distributed memory coordination
- State synchronization across domains
- Consensus-based memory operations
- **Integration:** V1 memory system informs V2's distributed state orchestration

---

#### 5. Event Bus → Orchestration + Identity
**V1 Component:** `event_bus/`
- Local event routing
- Publish/subscribe messaging
- Event handling

**V2 Enhancement:** `orchestration/` + `identity/`
- Distributed event propagation with identity verification
- Authenticated message routing
- Cross-domain event coordination
- **Integration:** V1 event bus extends into V2's authenticated orchestration layer

---

#### 6. Process → Orchestration
**V1 Component:** `process/`
- Process lifecycle management
- Inter-process communication (IPC)
- Process isolation

**V2 Enhancement:** `orchestration/`
- Distributed process coordination
- Service mesh for process communication
- Cross-domain process management
- **Integration:** V1 process model becomes V2's service-level orchestration

---

#### 7. IPC → Orchestration
**V1 Component:** `ipc/`
- Local inter-process communication
- Message passing
- Synchronization primitives

**V2 Enhancement:** `orchestration/`
- Distributed message passing with authentication
- Cross-domain communication protocols
- Consensus-based coordination
- **Integration:** V1 IPC mechanisms extended for secure distributed orchestration

---

### Governance & Security Layer

#### 8. Cognitive + TEC → Cognitive Mesh + TEC Chains
**V1 Components:** `cognitive/`, `tec/`
- Local cognitive processing
- Transaction execution chains
- Decision making

**V2 Enhancement:** `cognitive_mesh/`, `tec_chains/`
- Distributed cognitive processing across nodes
- Consensus-based TEC execution
- Multi-node decision coordination
- **Integration:** V1 cognitive and TEC systems scale into V2's distributed mesh and chain architecture

---

#### 9. NEW: Identity System
**V2 Component:** `identity/`
- No direct V1 equivalent
- **Purpose:** Secure authentication and authorization across distributed domains
- **Feeds from:** V1's security concepts and memory isolation
- **Enables:** All V2 distributed systems

---

#### 10. NEW: Governance System
**V2 Component:** `governance/`
- No direct V1 equivalent
- **Purpose:** Constitutional rules for multi-domain coordination
- **Feeds from:** V1's event bus and process management
- **Enables:** V2's consensus and orchestration

---

#### 11. NEW: Security System
**V2 Component:** `security/`
- Extends V1's implicit security
- **Purpose:** Cryptographic verification, access control, domain isolation
- **Feeds from:** V1's kernel and memory isolation
- **Enables:** Trust across distributed V2 domains

---

### Infrastructure & Support Layer

#### 12. Substrate → Substrate Class-S
**V1 Component:** `substrate/`
- Hardware abstraction layer
- Resource scheduling
- Device management

**V2 Enhancement:** `substrate_class_s/`
- Distributed resource abstraction
- Cross-node resource pooling
- **Integration:** V1 substrate becomes single-node implementation of V2's class-S

---

#### 13. Network → Orchestration
**V1 Component:** `network/`
- Local networking
- Protocol handling
- Network stack

**V2 Enhancement:** `orchestration/`
- Distributed networking with authentication
- Cross-domain communication
- **Integration:** V1 network stack bootstraps V2's orchestration layer

---

#### 14. FS → Orchestration
**V1 Component:** `fs/`
- Local file system
- Storage management
- File operations

**V2 Enhancement:** `orchestration/`
- Distributed storage coordination
- Consensus-based file operations
- **Integration:** V1 filesystem informs V2's orchestrated state management

---

## Data Flow Architecture

### Single Node (V1)
```
Application
    ↓
Runtime
    ↓
Kernel
    ├─→ Memory
    ├─→ Event Bus
    ├─→ Process
    └─→ Hypervisor
    ↓
Substrate
    ↓
Hardware
```

### Distributed Network (V2)
```
Domain 1                    Domain 2                    Domain N
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ App              │    │ App              │    │ App              │
│  ↓               │    │  ↓               │    │  ↓               │
│ Runtime Graph ◄──┼────┼─→ Runtime Graph ◄┼────┼─→ Runtime Graph  │
│  ↓               │    │  ↓               │    │  ↓               │
│ Unified Kernel ◄─┼────┼─→ Unified Kernel◄┼────┼─→ Unified Kernel │
│  ↓               │    │  ↓               │    │  ↓               │
│ Substrate-S  ◄───┼────┼─→ Substrate-S ◄─┼────┼─→ Substrate-S    │
└──────────────────┘    └──────────────────┘    └──────────────────┘
         ↓                       ↓                       ↓
    ┌────────────────────────────────────────────────────────┐
    │         Orchestration Layer (Consensus)                │
    │  ├─ Identity & Authentication                          │
    │  ├─ Governance & Constitutional Rules                  │
    │  ├─ Security & Access Control                          │
    │  ├─ Event Coordination                                 │
    │  └─ State Synchronization                              │
    └────────────────────────────────────────────────────────┘
         ↓
    ┌────────────────────────────────────────────────────────┐
    │      Cognitive Mesh + TEC Chains (Distributed AI)      │
    └────────────────────────────────────────────────────────┘
```

---

## Migration Strategy

### Phase 1: Parallel Operation
- V1 runs as single-node reference implementation
- V2 components developed alongside V1
- V1 documentation/tests inform V2 architecture

### Phase 2: V1 → V2 Integration
- V1 components wrapped with V2 interfaces
- Consensus layers added around V1 systems
- Identity/security overlaid on V1 communication

### Phase 3: Multi-Node Deployment
- Deploy multiple V1 instances
- Unified kernel coordinates them
- Orchestration layer manages state consistency

### Phase 4: Full V2 Architecture
- Complete transition to distributed governance
- V1 as optional single-node deployment mode
- V2 as primary multi-domain architecture

---

## Compatibility Matrix

| V1 Component | V2 Layer | Integration Type | Data Flow |
|---|---|---|---|
| kernel | unified_kernel | Direct Enhancement | V1 kernel → V2 node kernel |
| runtime | runtime_graph | Direct Enhancement | V1 runtime → V2 DAG executor |
| hypervisor | substrate_class_s | Direct Enhancement | V1 hypervisor → V2 domain isolation |
| memory | orchestration | Consensus Overlay | V1 memory → V2 distributed state |
| event_bus | orchestration | Auth Wrapper | V1 events → authenticated routing |
| process | orchestration | Service Mesh | V1 processes → V2 services |
| ipc | orchestration | Crypto Wrapper | V1 IPC → authenticated messaging |
| cognitive | cognitive_mesh | Distributed Version | V1 cognitive → mesh nodes |
| tec | tec_chains | Chain Wrapper | V1 TEC → consensus chains |
| substrate | substrate_class_s | Direct Enhancement | V1 substrate → V2 distributed resource layer |
| network | orchestration | Protocol Wrapper | V1 network → authenticated mesh |
| fs | orchestration | Replicated Store | V1 filesystem → distributed state store |
| — | identity | NEW | Single sign-on/auth across domains |
| — | governance | NEW | Constitutional rules & voting |
| — | security | NEW | Cryptography & access control |

---

## Key Architectural Principles

1. **Backward Compatibility:** V1 systems remain functional as single-node implementations
2. **Layered Enhancement:** V2 adds layers around V1 rather than replacing it
3. **Consensus-Based:** All distributed operations use consensus/authentication
4. **Domain Isolation:** Each V1 instance becomes isolated domain in V2
5. **Gradual Migration:** Transition from single-node to distributed incrementally

---

## Implementation Checklist

- [ ] V2 Identity system (authentication foundation)
- [ ] V2 Governance system (constitutional rules)
- [ ] V2 Security system (cryptography & access control)
- [ ] V2 Orchestration layer (consensus engine)
- [ ] Unified kernel (multi-node coordination)
- [ ] Runtime graph (DAG-based execution)
- [ ] Cognitive mesh (distributed AI)
- [ ] TEC chains (consensus transaction execution)
- [ ] Substrate class-S (distributed resources)
- [ ] V1 → V2 integration tests
- [ ] Multi-node deployment verification

---

## Notes

- V1 deployment remains unchanged (standalone OS)
- V2 deployment requires 3+ nodes minimum for consensus
- V3 builds on V2's orchestration and governance
- Deploy layer handles both V1 (single-node) and V2+ (distributed) deployments
# **MIGRATION_V1_TO_V2.md**  
### *Portal‑OS Foundation OS → Unified Kernel OS*

---

## **1. Overview**
Portal‑OS v1 is the **Foundation OS**: a subsystem‑based architecture with discrete modules (kernel, runtime, cognitive, TEC, substrate, etc.).

Portal‑OS v2 is the **Unified Kernel OS**: a graph‑driven, mesh‑based, constitutionally governed operating system where all v1 subsystems are unified under a single kernel lattice.

This document explains **how each v1 subsystem evolves into its v2 counterpart**, and how the architecture transitions from *modular* → *unified*.

---

## **2. Core Migration Principles**

### **A. Subsystems become graphs**
V1 modules (runtime, TEC, cognitive, substrate) become **graph engines** in v2.

### **B. Kernel becomes a lattice**
The v1 kernel becomes the **Unified Kernel Lattice**, absorbing scheduling, routing, and state management.

### **C. Cognition becomes a mesh**
The v1 cognitive engine becomes the **Cognitive Mesh**, with agents, domains, and shared memory.

### **D. TEC becomes chains**
V1 TEC pipelines become **TEC Chains**, with chain nodes and chain schedulers.

### **E. Substrate becomes Class‑S**
V1 substrate becomes **Substrate‑S**, with structured channels and integrity layers.

### **F. Umbrella becomes a constitution**
Umbrella v1 becomes **Umbrella v2**, a constitutional governance layer.

### **G. Identity becomes physics**
Identity physics becomes **Identity v2**, with registry + auth + key management.

---

## **3. Migration Map (Subsystem → Unified Kernel OS)**

### **Kernel → Unified Kernel**
- v1 kernel  
- v1 scheduler  
- v1 signals  
- v1 process manager  

**Become:**  
- unified_kernel/kernel_unification_layer  
- unified_kernel/kernel_graph  
- unified_kernel/kernel_channels  
- unified_kernel/kernel_state  

---

### **Runtime → Runtime Graph**
- v1 runtime engine  
- v1 event bus  
- v1 routing  

**Become:**  
- runtime_graph/graph_engine  
- runtime_graph/graph_scheduler  
- runtime_graph/graph_nodes  
- runtime_graph/graph_events  

---

### **Cognitive Engine → Cognitive Mesh**
- v1 cognitive engine  
- v1 memory manager  
- v1 suites  

**Become:**  
- cognitive_mesh/mesh_engine  
- cognitive_mesh/mesh_agents  
- cognitive_mesh/mesh_memory  
- cognitive_mesh/mesh_domains  

---

### **TEC Pipelines → TEC Chains**
- v1 TEC pipelines  
- v1 TEC scheduler  

**Become:**  
- tec_chains/chain_engine  
- tec_chains/chain_nodes  
- tec_chains/chain_scheduler  
- tec_chains/chain_domains  

---

### **Substrate Class‑C → Substrate Class‑S**
- v1 substrate  
- v1 network stack  
- v1 fs  

**Become:**  
- substrate_s/class_s  
- substrate_s/substrate_memory  
- substrate_s/substrate_integrity  
- substrate_s/substrate_channels  

---

### **Umbrella v1 → Umbrella v2**
- v1 umbrella  
- v1 governance rules  

**Become:**  
- governance/constitution  
- governance/governance_chambers  
- governance/governance_graph  
- governance/voting_engine  
- governance/rules_engine  
- umbrella_v2/integration  

---

### **Identity (basic) → Identity v2 (physics)**
- v1 identity (implicit)  

**Become:**  
- identity/auth_engine  
- identity/identity_registry  
- identity/key_management  
- identity/credential_store  

---

### **Security (basic) → Security v2**
- v1 basic security  

**Become:**  
- security/crypto_engine  
- security/access_control  
- security/domain_isolation  
- security/audit_log  

---

## **4. Architectural Shifts**

### **From Modules → Meshes**
V1 is subsystem‑based.  
V2 is mesh‑based.

### **From Pipelines → Chains**
V1 TEC pipelines are linear.  
V2 TEC chains are multi‑node and multi‑domain.

### **From Events → Graphs**
V1 runtime dispatches events.  
V2 runtime is a graph engine.

### **From Rules → Constitution**
V1 Umbrella enforces rules.  
V2 Umbrella defines constitutional invariants.

### **From Identity → Physics**
Identity becomes a physics layer with registry + keys + credentials.

---

## **5. Migration Strategy**

### **Step 1 — Freeze v1**
No structural changes to portal-os-v1.

### **Step 2 — Build v2 clean**
portal-os-v2 is a **clean repo**, importing v1 concepts but not v1 code.

### **Step 3 — Map v1 subsystems to v2 equivalents**
Use the migration map above.

### **Step 4 — Implement Unified Kernel first**
All other v2 systems depend on it.

### **Step 5 — Integrate Umbrella v2**
Governance becomes constitutional.

### **Step 6 — Expand into v3 (World OS)**
Once v2 is stable, v3 builds on top.

---

## **6. Version Boundaries**

### **v1**  
Foundation OS  
Subsystem architecture  
Local scale  

### **v2**  
Unified Kernel OS  
Graph + mesh + chain architecture  
Multi‑domain scale  

### **v3**  
World OS  
Planetary substrate  
Global scale  

---

## **7. Data Flow Migration**

### **V1 Linear Flow**
```
Request → Kernel → Runtime → Cognitive → TEC → Substrate → Response
```

### **V2 Graph Flow**
```
Request → Identity Check → Governance Validation → Unified Kernel Lattice
    ↓
    Runtime Graph Engine (all tasks as DAG nodes)
    ↓
    Cognitive Mesh (multi-agent reasoning)
    ↓
    TEC Chains (consensus-based execution)
    ↓
    Substrate-S (distributed resources)
    ↓
    Umbrella v2 Policy Engine (rule enforcement)
    ↓
Response
```

---

## **8. Integration Points**

### **Unified Kernel ↔ Umbrella v2**
The unified kernel enforces constitutional rules from Umbrella v2.

### **Runtime Graph ↔ Cognitive Mesh**
Graph nodes can invoke cognitive agents for reasoning.

### **TEC Chains ↔ Orchestration**
Chains participate in global consensus via orchestration layer.

### **Substrate-S ↔ All Systems**
All systems allocate resources through Substrate-S channels.

---

## **9. Compatibility & Versioning**

### **API Compatibility**
V2 APIs are **not backward compatible** with V1.  
V1 systems remain frozen in portal-os-v1/.  
V2 is a clean evolution, not a patch.

### **Data Migration**
V1 state can be exported and re-imported into V2 (application-dependent).  
No automatic migration tool provided.

---

## **10. Deployment Timeline**

| Phase | Duration | Milestone |
|-------|----------|-----------|
| V1 Stable | ✓ Complete | Foundation OS production-ready |
| V2 Development | In Progress | Unified Kernel implementation |
| V2 Alpha Testing | Planned | Internal domain testing |
| V2 Beta | Planned | Multi-domain federation |
| V2 GA | Planned | Production deployment |
| V3 Development | Future | World OS implementation |

---

## **11. Next Documents**

- **MIGRATION_V2_TO_V3.md** — Unified Kernel → World OS evolution
- **V1_API_REFERENCE.md** — Foundation OS endpoint documentation
- **V2_IMPLEMENTATION_GUIDE.md** — Code skeleton and examples
- **V3_ARCHITECTURE_DEEP_DIVE.md** — Planetary-scale consensus

---

## **12. Status**
✅ Portal‑OS v1 is complete (portal-os-v1/)  
✅ Portal‑OS v2 repo structure is complete (portal-os-v2/)  
✅ Portal‑OS v3 repo structure is complete (portal-os-v3/)  
✅ Portal‑OS deploy layer is complete (portal-os-deploy/)  
✅ Migration path is now fully documented (this file)

---

**Ready to proceed with V2 implementation or next migration document.**
