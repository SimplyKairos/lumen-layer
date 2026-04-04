# Phase 1: Canonical Receipt Pipeline - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase makes receipt creation truthful and canonical inside the existing API. `POST /api/v1/stamp` should accept a smaller request contract, fetch live bundle status from Jito before creating a receipt, and persist one canonical receipt shape across runtime code, API responses, and the shared schema. This phase does not anchor memos on-chain, does not mark receipts as fully verified, and does not add public verifier or explorer UI.

</domain>

<decisions>
## Implementation Decisions

### Stamp request contract
- **D-01:** `POST /api/v1/stamp` accepts `txSignature` and `bundleId`, plus optional `walletAddress`.
- **D-02:** The server fetches `slot` and `confirmationStatus` from live Jito bundle status before building the receipt. Client-supplied bundle metadata beyond `bundleId` is not part of the contract.

### Canonical receipt contract
- **D-03:** Keep the runtime and API receipt contract in camelCase.
- **D-04:** Standardize the time field on `createdAt`, not `timestamp`.
- **D-05:** Keep `onChainMemo` nullable in Phase 1 because memo anchoring belongs to Phase 2.
- **D-06:** Keep `verified` false until Phase 2 memo anchoring exists. Phase 1 must not imply that a receipt is fully verified before on-chain proof exists.

### Failure handling
- **D-07:** If Jito bundle lookup fails, returns no result, or returns incomplete live bundle data, the stamp request fails and no receipt row is created.
- **D-08:** Phase 1 should prefer explicit retryable failure over creating partial or lower-confidence receipts.

### Duplicate stamping
- **D-09:** Stamping is idempotent on `txSignature`. If a receipt already exists for the same transaction signature, the API returns the existing receipt instead of creating a new one.

### the agent's Discretion
- Exact HTTP status codes and response body shape for retryable stamp failures, as long as they clearly distinguish bad input from upstream bundle-data failures
- Internal module boundaries for moving receipt-building, bundle-fetching, and persistence logic out of `apps/api/src/server.ts`
- Migration strategy for aligning `packages/schema/receipt-schema.json`, database serialization, and runtime types, as long as the resulting contract matches the decisions above

</decisions>

<specifics>
## Specific Ideas

- "Smaller, cleaner request shape" for the stamp API: `txSignature + bundleId`, with `walletAddress` optional
- "No live bundle data, no receipt" is the trust boundary for this phase
- The receipt contract should be honest before memo anchoring exists: `onChainMemo: null` and `verified: false`

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and product constraints
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, and plan breakdown for the canonical receipt pipeline
- `.planning/REQUIREMENTS.md` — `PIPE-01`, `PIPE-02`, and `PIPE-03` define the committed scope for this phase
- `.planning/PROJECT.md` — project-level constraints: keep the current stack, stay devnet-first, and do not fake trustless verification before on-chain proof exists

### Existing protocol contract baseline
- `packages/schema/receipt-schema.json` — current shared receipt schema that must be aligned with the runtime and API contract during this phase
- `README.md` — public description of the protocol receipt flow and canonical `SHA-256(txSignature || bundleId || slot)` claim that implementation must support honestly

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/api/src/bam-service.ts` — already contains `getBundleData()` for `getBundleStatuses`; reuse it instead of reimplementing the Jito request path
- `apps/api/src/receipt.ts` — existing receipt type and hash utility provide the right refactor seam for the canonical contract
- `apps/api/src/db.ts` — the `receipts` table already persists receipt rows and enforces `tx_signature` uniqueness, which supports idempotent stamping
- `apps/api/src/test-flow.ts` — current smoke flow already exercises stamp → verify → list and should be updated to the new input contract

### Established Patterns
- `apps/api/src/server.ts` keeps route handlers thin-ish, with inline validation, helper calls, and direct SQLite persistence
- Backend helpers return objects or `null` rather than introducing a heavy error-type hierarchy
- Runtime and API field names are already closer to camelCase than the JSON schema, so aligning around camelCase is the least disruptive path

### Integration Points
- `apps/api/src/server.ts` `POST /api/v1/stamp` is the primary implementation entry point for this phase
- `apps/api/src/receipt.ts` and `packages/schema/receipt-schema.json` must be updated together so verifier and future webhook/UI work inherit one contract
- `apps/api/src/verifier.ts` depends on the receipt fields established here, even though full memo-backed verification lands in Phase 2
- `apps/api/src/test-flow.ts` and any future API consumers must be updated to the new stamp request contract and idempotent behavior

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---
*Phase: 01-canonical-receipt-pipeline*
*Context gathered: 2026-04-04*
