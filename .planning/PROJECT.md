# Lumen Layer

## What This Is

Lumen Layer is an open execution fairness protocol for Solana. It turns Jito BAM bundle execution into a public, replayable receipt flow: capture live bundle status, hash the transaction signature with canonical bundle data, anchor that hash on-chain as a Solana memo, and let anyone verify the result without trusting Lumen's database. The v1 product includes the protocol API, a public verifier and explorer, and a reference fair-launch launchpad that automatically issues Lumen receipts for every trade.

## Core Value

Anyone can independently verify that a Solana transaction received the execution treatment Lumen claims by checking a receipt anchored to canonical chain state.

## Requirements

### Validated

- ✓ Integrator can submit receipt input to `POST /api/v1/stamp` and receive a persisted receipt record backed by SQLite in `apps/api/src/server.ts` and `apps/api/src/db.ts` — existing
- ✓ Anyone can call `GET /api/v1/verify/:receiptId` and receive a recomputed verification result from `apps/api/src/verifier.ts` — existing
- ✓ Anyone can call `GET /api/v1/receipts` to inspect recent receipt rows, and `apps/api/src/test-flow.ts` exercises the stamp → verify → list flow — existing
- ✓ Visitor can browse a public landing page explaining the receipt protocol and reference launchpad vision in `apps/web/src/App.tsx` and `apps/web/src/components/sections/*.tsx` — existing

### Active

- [ ] Stamp flow uses live Jito bundle status so receipts derive `bundleId`, `slot`, and confirmation state from the real execution path rather than caller-supplied bundle metadata
- [ ] Receipt lifecycle anchors the canonical receipt hash on Solana devnet through the Memo program before a receipt is treated as verifiable
- [ ] Runtime receipt objects, API responses, database fields, and `packages/schema/receipt-schema.json` share one canonical contract with no field drift
- [ ] Public web app includes a verifier page where anyone can paste a receipt ID and run live verification against the stored receipt and on-chain memo
- [ ] Public web app includes a receipt explorer with recent receipts and individual receipt detail views
- [ ] External integrators can subscribe to receipt events through a real webhook endpoint
- [ ] Reference fair-launch launchpad lets creators configure launches with an anti-bundling protection window and issues a Lumen receipt for every trade
- [ ] Creator profiles and bundler detection expose launch history, suspicious activity, and protocol trust signals inside the launchpad experience

### Out of Scope

- Mainnet rollout before devnet anchoring and verification are trustworthy end-to-end — correctness comes before production scale
- Multi-chain fairness receipts outside Solana — the protocol focus is Solana + Jito BAM for v1
- A general-purpose trading terminal or wallet product — the UI surface is the public verifier/explorer plus the reference launchpad
- Broad enterprise backoffice workflows unrelated to receipt issuance, verification, or launchpad trust — they dilute the core protocol story

## Context

- Brownfield monorepo with a working Fastify + SQLite backend in `apps/api/` and a React + Vite + Tailwind frontend in `apps/web/`
- Current receipt flow is partially real: the API can create, verify, and list receipts locally, but `apps/api/src/server.ts` does not yet wire `apps/api/src/bam-service.ts` into the live stamp route or write Solana memo anchors
- Existing code already reflects the product narrative in `README.md`, `apps/web/src/components/sections/HowItWorks.tsx`, and `apps/web/src/components/sections/WhyWeBuiltThis.tsx`; implementation now needs to catch up to the stated protocol claims
- Shared receipt semantics currently drift between `packages/schema/receipt-schema.json`, `apps/api/src/receipt.ts`, and `apps/api/src/verifier.ts`
- `apps/api/src/db.ts` already contains broader protocol tables for launches, creators, users, and bundler alerts, giving the launchpad work a schema foothold
- Target deployment shape is DigitalOcean for the API, Vercel for the frontend, and `lumenlayer.tech` as the public domain

## Constraints

- **Tech stack**: Keep the existing Fastify, SQLite, TypeScript, React, Vite, Tailwind, Jito, Helius, Solana Web3, Solana Memo, and Meteora stack — v1 should extend the current repo rather than reboot it
- **Protocol**: Receipt hashing remains the canonical `SHA-256(txSignature || bundleId || slot)` flow — this is the core cryptographic claim the product is built around
- **Network**: Ship devnet memo anchoring and public verification before any mainnet push — the protocol needs a trustworthy proving ground first
- **Verification**: A receipt is not "real" unless an external party can recompute the hash and confirm it against the anchored memo — database-only checks are insufficient
- **Deployment**: Preserve the split deployment model of API on DigitalOcean and frontend on Vercel — it matches the current operational intent
- **Product focus**: v1 must prove the protocol with both public verification surfaces and a reference launchpad, not just a backend API

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep the existing monorepo as the base for v1 | `apps/api/`, `apps/web/`, and `packages/schema/` already encode the product shape and provide a working brownfield baseline | — Pending |
| Treat public verification as a first-class deliverable | Trustless verification is the protocol's core value, so the UI and API must make proof replayable by anyone | — Pending |
| Include the reference fair-launch launchpad in v1 | The launchpad is the clearest way to demonstrate automatic receipt issuance and fairness guarantees on real user flows | — Pending |
| Go devnet-first for memo anchoring and verification | End-to-end correctness matters more than premature production rollout | — Pending |
| Unify the receipt contract before expanding integrations | Webhooks, explorer views, and launchpad flows all depend on one canonical receipt shape | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-04 after initialization*
