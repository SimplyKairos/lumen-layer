# Phase 1: Canonical Receipt Pipeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-04
**Phase:** 01-canonical-receipt-pipeline
**Areas discussed:** Stamp input contract, Canonical receipt shape, Failure policy, Duplicate stamping behavior

---

## Stamp input contract

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Keep the request to `txSignature + bundleId` with optional `walletAddress`, and have Lumen fetch `slot` and `confirmationStatus` from Jito before it creates the receipt | ✓ |
| 2 | Accept only `txSignature`, and make Lumen discover the bundle on its own | |
| 3 | Keep the current wider request shape, but treat caller-supplied `slot` and `confirmationStatus` as untrusted hints | |

**User's choice:** Option 1
**Notes:** Keeps the stamp contract smaller and cleaner while fitting the existing route shape and staying within Phase 1 scope.

---

## Canonical receipt shape

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Use camelCase everywhere in the runtime/API contract, standardize on `createdAt`, keep `onChainMemo: null` until Phase 2, and make `verified` false until memo anchoring exists | ✓ |
| 2 | Rename everything to match the schema now: `timestamp`, required `onChainMemo`, and adapt runtime code to that shape immediately | |
| 3 | Split contracts: keep one internal runtime shape and one public schema shape with translation between them | |

**User's choice:** Option 1
**Notes:** Phase 1 should be honest about pre-anchor receipts instead of implying that Phase 2 already exists.

---

## Failure policy

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Fail the request and do not create a receipt row unless live bundle data is available and complete enough to build the canonical receipt | ✓ |
| 2 | Create a pending receipt row with partial data, then expect a later retry/update flow to fill it in | |
| 3 | Fall back to caller-supplied values when Jito lookup fails, but mark the receipt as lower confidence | |

**User's choice:** Option 1
**Notes:** "No live bundle data, no receipt" is the integrity boundary for this phase.

---

## Duplicate stamping behavior

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Make it idempotent: if a receipt already exists for the same `txSignature`, return that existing receipt instead of erroring | ✓ |
| 2 | Return a conflict/error and make callers handle duplicates themselves | |
| 3 | Allow multiple receipts for the same transaction by loosening the uniqueness rule | |

**User's choice:** Option 1
**Notes:** Matches the existing unique `tx_signature` constraint in `apps/api/src/db.ts` and simplifies integrator behavior.

---

## the agent's Discretion

- Exact retryable error payload shape
- Internal refactor structure around bundle lookup, receipt building, and persistence
- Migration mechanics for aligning the runtime contract with `packages/schema/receipt-schema.json`

## Deferred Ideas

None.
