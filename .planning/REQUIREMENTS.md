# Requirements: Lumen Layer

**Defined:** 2026-04-04
**Core Value:** Anyone can independently verify that a Solana transaction received the execution treatment Lumen claims by checking a receipt anchored to canonical chain state.

## v1 Requirements

### Receipt Pipeline

- [ ] **PIPE-01**: Integrator can submit a transaction signature to the stamp flow and Lumen fetches live Jito bundle status before creating the receipt
- [ ] **PIPE-02**: Stored receipts persist live `bundleId`, `slot`, and `confirmationStatus` from the Jito status lookup
- [ ] **PIPE-03**: Receipt hashing uses one canonical contract shared by runtime code, API responses, database serialization, and `packages/schema/receipt-schema.json`
- [ ] **PIPE-04**: Lumen anchors each receipt hash to Solana devnet via the Memo program before the receipt is treated as verified

### Verification

- [ ] **VER-01**: Anyone can verify a receipt by ID and see a fresh hash recomputation against stored receipt data and the anchored memo
- [ ] **VER-02**: Verification returns a clear failure state when bundle data, stored hash, or memo anchor do not match
- [ ] **VER-03**: Anyone can paste a receipt ID into the public verifier page and run live verification from the web app

### Explorer

- [ ] **EXP-01**: Anyone can browse recent receipts from a public explorer page
- [ ] **EXP-02**: Anyone can open a receipt detail view showing canonical receipt fields, anchor reference, and current verification result

### Integrations

- [ ] **INT-01**: External integrator can subscribe to receipt-issued events and receive delivery payloads through a real webhook flow
- [ ] **INT-02**: Webhook payloads and receipt API responses use the same canonical receipt contract with no field drift

### Launchpad

- [ ] **LCH-01**: Creator can create a fair-launch with a configured anti-bundling protection window
- [ ] **LCH-02**: Trader receives a Lumen receipt automatically for every launchpad trade
- [ ] **LCH-03**: Launchpad detects bundling activity during the protected window and surfaces it on the relevant launch or creator views
- [ ] **LCH-04**: Anyone can view creator profiles with launch history, receipt counts, and bundler-related trust signals

## v2 Requirements

### Operations

- **OPS-01**: Protocol supports a production-grade persistence and deployment posture beyond the current local SQLite-first setup
- **OPS-02**: Protocol supports mainnet rollout with hardened key management, retries, and operational monitoring

### Ecosystem

- **ECO-01**: Wallets, launchpads, and custodians can integrate through a packaged SDK or embeddable receipt widget
- **ECO-02**: Integrators can manage webhook secrets, retries, and delivery history from a dedicated operational surface

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mainnet launch before devnet proof is trustworthy | v1 must prove the end-to-end receipt and verification path safely first |
| Multi-chain fairness receipts | Solana + Jito BAM is the deliberate v1 protocol boundary |
| General-purpose trading terminal or wallet | The product surface is protocol verification plus the reference launchpad |
| Broad enterprise backoffice tooling | It is not required to prove the fairness protocol or launchpad trust loop |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PIPE-01 | Phase 1 | Pending |
| PIPE-02 | Phase 1 | Pending |
| PIPE-03 | Phase 1 | Pending |
| PIPE-04 | Phase 2 | Pending |
| VER-01 | Phase 2 | Pending |
| VER-02 | Phase 2 | Pending |
| VER-03 | Phase 3 | Pending |
| EXP-01 | Phase 3 | Pending |
| EXP-02 | Phase 3 | Pending |
| INT-01 | Phase 4 | Pending |
| INT-02 | Phase 4 | Pending |
| LCH-01 | Phase 5 | Pending |
| LCH-04 | Phase 5 | Pending |
| LCH-02 | Phase 6 | Pending |
| LCH-03 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-04*
*Last updated: 2026-04-04 after initial definition*
