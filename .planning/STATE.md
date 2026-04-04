# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-04)

**Core value:** Anyone can independently verify that a Solana transaction received the execution treatment Lumen claims by checking a receipt anchored to canonical chain state.
**Current focus:** Phase 1: Canonical Receipt Pipeline

## Current Position

Phase: 1 of 6 (Canonical Receipt Pipeline)
Plan: 3 of 3 in current phase
Status: Ready to execute
Last activity: 2026-04-04 — Phase 1 research, validation, and execution plans created

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: 0 min
- Total execution time: 0.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: none yet
- Trend: Stable

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Initialization: v1 includes the protocol API, public verifier/explorer, webhooks, and the reference launchpad
- Initialization: Devnet memo anchoring precedes any mainnet rollout
- Initialization: Receipt contract alignment is an early prerequisite for every downstream surface
- Phase 1: `POST /api/v1/stamp` accepts only `txSignature`, `bundleId`, and optional `walletAddress`
- Phase 1: receipts remain `verified: false` and `onChainMemo: null` until Phase 2 memo anchoring
- Phase 1: stamping is idempotent on `txSignature` and never persists partial bundle lookups

### Pending Todos

None yet.

### Blockers/Concerns

- `apps/api/src/server.ts` does not yet wire `apps/api/src/bam-service.ts` into the real stamp flow
- `packages/schema/receipt-schema.json`, `apps/api/src/receipt.ts`, and `apps/api/src/verifier.ts` currently drift on receipt shape semantics
- `apps/api/src/test-flow.ts` still depends on an external server process and synthetic bundle data until Phase 1 execution lands
- Launchpad and webhook routes still return `501` placeholders in `apps/api/src/server.ts`

## Session Continuity

Last session: 2026-04-04 22:36
Stopped at: Phase 1 planning complete
Resume file: .planning/phases/01-canonical-receipt-pipeline/01-01-PLAN.md

## Known Constraints

### Jito BAM Attestation Access
Full TEE attestation digests from Jito BAM are not publicly available via API yet. 
The BAM SDK does not expose per-bundle attestation data directly.
Current workaround: use getBundleStatuses which returns bundleId, slot, and confirmationStatus.
Receipt attestation level is BUNDLE_VERIFIED not BAM_ATTESTED.
Upgrade path: if Jito responds to outreach (contact@jito.wtf), receipts automatically upgrade to BAM_ATTESTED level.
This is known and intentional — not a bug.

## Messaging Guidelines
Say "execution context" not "proof you weren't front-run"
Say "BUNDLE_VERIFIED" explicitly, never imply full TEE proof
Say "designed for upgrade path" not "automatically upgrades"
Say "most launchpads ask you to trust fairness claims" not "pump.fun lies. Never name a specific launchpad"
Say "portable execution record" not "bank statement"