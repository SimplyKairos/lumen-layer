# Roadmap: Lumen Layer

## Overview

Lumen v1 moves from a locally verifiable prototype to a public fairness protocol in six phases. The work starts by making the receipt pipeline truthful and canonical, then turns that proof into a real on-chain verification flow, exposes it through public web surfaces, opens it to external integrators, and finally proves the protocol inside a reference fair-launch launchpad with anti-bundling enforcement and automatic receipt issuance.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Canonical Receipt Pipeline** - Make receipt creation depend on real bundle data and one canonical contract
- [ ] **Phase 2: On-Chain Proof & Verification API** - Anchor receipts on devnet and make verification reflect chain truth
- [ ] **Phase 3: Public Verifier & Explorer** - Ship the public web surfaces for replayable receipt verification
- [ ] **Phase 4: Integrator Webhooks** - Deliver receipt events to external platforms through a real integration path
- [ ] **Phase 5: Launchpad Foundation & Creator Trust** - Activate launch creation and creator-facing trust surfaces
- [ ] **Phase 6: Fair-Launch Enforcement Loop** - Issue receipts on trades and surface bundling detection during protected windows

## Phase Details

### Phase 1: Canonical Receipt Pipeline
**Goal**: Integrators can create receipts from live Jito bundle status and a single canonical receipt contract
**Depends on**: Nothing (first phase)
**Requirements**: PIPE-01, PIPE-02, PIPE-03
**Success Criteria** (what must be TRUE):
  1. Integrator can submit a transaction signature and receive a receipt populated from live bundle status fields
  2. Stored receipt rows and API responses expose the same canonical receipt shape without runtime/schema drift
  3. Receipt creation depends on real protocol metadata rather than caller-supplied bundle placeholders
**Plans**: 3 plans

Plans:
- [ ] 01-01: Align the runtime receipt model, database serialization, and shared JSON schema into one canonical contract
- [ ] 01-02: Wire `apps/api/src/bam-service.ts` into the stamp pipeline so receipt creation uses live Jito bundle status
- [ ] 01-03: Refine the stamp persistence and API response path around the canonical receipt lifecycle

### Phase 2: On-Chain Proof & Verification API
**Goal**: Receipts are anchored on devnet and the verification API reflects chain-backed truth instead of database-only truth
**Depends on**: Phase 1
**Requirements**: PIPE-04, VER-01, VER-02
**Success Criteria** (what must be TRUE):
  1. A receipt is only treated as verified once its hash has been anchored through the Solana Memo program on devnet
  2. Anyone can verify a receipt by ID and see whether the recomputed hash matches the stored receipt and anchored memo
  3. Verification returns explicit mismatch states when bundle data or memo proof do not line up
**Plans**: 3 plans

Plans:
- [ ] 02-01: Implement devnet memo anchoring for the canonical receipt hash
- [ ] 02-02: Rework the verification service and API responses around memo-backed truth and mismatch reporting
- [ ] 02-03: Extend the existing flow harness to exercise stamp, anchor, and verify as one end-to-end protocol path

### Phase 3: Public Verifier & Explorer
**Goal**: Anyone can inspect and verify receipts through public web pages instead of relying on backend-only access
**Depends on**: Phase 2
**Requirements**: VER-03, EXP-01, EXP-02
**Success Criteria** (what must be TRUE):
  1. Anyone can paste a receipt ID into a public verifier page and run live verification
  2. Anyone can browse recent receipts from a public explorer page
  3. Anyone can open a receipt detail view showing canonical fields, anchor reference, and verification state
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [ ] 03-01: Build the React verifier experience for ID-based live receipt verification
- [ ] 03-02: Build the explorer and receipt detail views on top of the public receipt endpoints
- [ ] 03-03: Add shared frontend data-fetching and state patterns for public protocol surfaces

### Phase 4: Integrator Webhooks
**Goal**: External platforms can receive receipt-issued events through a real webhook integration surface
**Depends on**: Phase 2
**Requirements**: INT-01, INT-02
**Success Criteria** (what must be TRUE):
  1. External integrator can subscribe to receipt-issued events and receive deliveries when new receipts are created
  2. Webhook event payloads use the same canonical receipt contract as the public API
  3. Delivery failures are distinguishable from successful deliveries so integrators can debug the flow
**Plans**: 2 plans

Plans:
- [ ] 04-01: Implement webhook registration and delivery handling for receipt-issued events
- [ ] 04-02: Reuse the canonical receipt contract for webhook payloads and delivery status handling

### Phase 5: Launchpad Foundation & Creator Trust
**Goal**: Creators can configure fair launches and anyone can inspect creator trust context before trading opens
**Depends on**: Phase 4
**Requirements**: LCH-01, LCH-04
**Success Criteria** (what must be TRUE):
  1. Creator can create a fair-launch with a configured anti-bundling protection window
  2. Anyone can browse creator profiles with launch history and trust-oriented receipt signals
  3. Launch and creator records persist the data needed for protected trading and downstream receipt issuance
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [ ] 05-01: Activate the launch and creator data model paths already sketched in `apps/api/src/db.ts`
- [ ] 05-02: Implement launch creation and creator profile endpoints in the API
- [ ] 05-03: Build the launchpad and creator profile web surfaces

### Phase 6: Fair-Launch Enforcement Loop
**Goal**: Launchpad trades automatically produce Lumen receipts and bundling enforcement is visible during protected launch windows
**Depends on**: Phase 5
**Requirements**: LCH-02, LCH-03
**Success Criteria** (what must be TRUE):
  1. Trader receives a Lumen receipt automatically for every launchpad trade
  2. Bundling activity during the protected window is detected and surfaced on the relevant launch or creator view
  3. The reference launchpad demonstrates the full trust loop from launch configuration to trade receipt issuance and abuse detection
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [ ] 06-01: Connect launchpad trade execution to automatic receipt issuance
- [ ] 06-02: Implement anti-bundling detection and bundler alert persistence
- [ ] 06-03: Surface enforcement outcomes in the launchpad UI and harden the end-to-end fair-launch flow

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Canonical Receipt Pipeline | 0/3 | Not started | - |
| 2. On-Chain Proof & Verification API | 0/3 | Not started | - |
| 3. Public Verifier & Explorer | 0/3 | Not started | - |
| 4. Integrator Webhooks | 0/2 | Not started | - |
| 5. Launchpad Foundation & Creator Trust | 0/3 | Not started | - |
| 6. Fair-Launch Enforcement Loop | 0/3 | Not started | - |
