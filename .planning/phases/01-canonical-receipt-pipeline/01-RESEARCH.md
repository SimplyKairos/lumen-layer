# Phase 1: Canonical Receipt Pipeline - Research

**Researched:** 2026-04-04
**Domain:** Jito bundle-status receipt stamping, canonical receipt contracts, and Fastify API validation
**Confidence:** HIGH

## User Constraints

### Locked Decisions
- **D-01:** `POST /api/v1/stamp` accepts `txSignature` and `bundleId`, plus optional `walletAddress`.
- **D-02:** The server fetches `slot` and `confirmationStatus` from live Jito bundle status before building the receipt. Client-supplied bundle metadata beyond `bundleId` is not part of the contract.
- **D-03:** Keep the runtime and API receipt contract in camelCase.
- **D-04:** Standardize the time field on `createdAt`, not `timestamp`.
- **D-05:** Keep `onChainMemo` nullable in Phase 1 because memo anchoring belongs to Phase 2.
- **D-06:** Keep `verified` false until Phase 2 memo anchoring exists. Phase 1 must not imply that a receipt is fully verified before on-chain proof exists.
- **D-07:** If Jito bundle lookup fails, returns no result, or returns incomplete live bundle data, the stamp request fails and no receipt row is created.
- **D-08:** Phase 1 should prefer explicit retryable failure over creating partial or lower-confidence receipts.
- **D-09:** Stamping is idempotent on `txSignature`. If a receipt already exists for the same transaction signature, the API returns the existing receipt instead of creating a new one.

### the agent's Discretion
- Exact HTTP status codes and response body shape for retryable stamp failures, as long as they clearly distinguish bad input from upstream bundle-data failures
- Internal module boundaries for moving receipt-building, bundle-fetching, and persistence logic out of `apps/api/src/server.ts`
- Migration strategy for aligning `packages/schema/receipt-schema.json`, database serialization, and runtime types, as long as the resulting contract matches the decisions above

### Deferred Ideas
None — discussion stayed within phase scope.

## Project Constraints (from AGENTS.md)

- Keep the current Fastify + TypeScript + SQLite + Solana stack; do not introduce a parallel validation or persistence framework for Phase 1.
- Backend helpers should stay as small named-export modules with relative imports, single quotes, and two-space indentation.
- `apps/api/src/server.ts` route handlers should continue to use explicit `try/catch` blocks and JSON status responses.
- Keep modules colocated with their owning layer instead of introducing barrel files or alias churn.
- Treat `packages/schema/receipt-schema.json` as the shared protocol contract and `apps/api/src/bam-service.ts` as the Jito integration seam.
- Preserve GSD-compatible planning and execution artifacts instead of making direct ad hoc repo changes.

## Summary

Phase 1 should make the receipt pipeline honest by moving all receipt creation behind one canonical contract and one live bundle lookup path. The current API trusts caller-supplied `slot` and `confirmationStatus`, stores snake_case database rows directly in API responses, and marks receipts `verified: true` even though memo anchoring is a Phase 2 concern. The cleanest correction is to centralize receipt typing, row serialization, and hash generation in backend helpers, then have the stamp route call a dedicated service that looks up the bundle through Jito before anything is inserted.

The external integration facts are clear enough to plan concretely. Jito documents `getBundleStatuses` as a dedicated POST endpoint at `/api/v1/getBundleStatuses`, returning `null` when a bundle is not found or has not landed, and surfacing retryable failures through an `err` field. Fastify 5 already recommends JSON Schema for request validation and response serialization, and its built-in `inject()` support gives this phase a deterministic smoke-test path without adding a new test framework. That makes the best Phase 1 path: convert the schema file into a real JSON Schema, reuse one row-to-receipt mapper everywhere, wire live Jito status into stamping, and switch the smoke flow to `fastify.inject()` with a stubbed bundle lookup so automation stays reliable.

**Primary recommendation:** Convert `packages/schema/receipt-schema.json` into a real Draft 7 schema, centralize canonical receipt and row mapping helpers in `apps/api/src/receipt.ts`, route live status lookup through a small `stamp-service.ts`, and replace the current external-server smoke flow with an in-process `fastify.inject()` harness.

## Phase Requirements

| Requirement | Meaning for this phase | Planning implication |
|-------------|------------------------|----------------------|
| `PIPE-01` | Stamping must fetch live Jito bundle status before creating the receipt | The request contract shrinks to `txSignature`, `bundleId`, and optional `walletAddress`; all live bundle fields come from Jito |
| `PIPE-02` | Stored rows must persist the live `bundleId`, `slot`, and `confirmationStatus` | Insert only after a successful Jito lookup, and never fall back to client-supplied placeholders |
| `PIPE-03` | Hashing and receipt fields must use one canonical contract across runtime, API, DB serialization, and shared schema | One receipt helper owns field names, hash generation, and DB row mapping; list and verify endpoints must stop returning raw SQLite columns |

## Standard Stack

### Core

| Library / Contract | Version | Purpose | Why it is the standard choice here |
|--------------------|---------|---------|------------------------------------|
| `fastify` | `5.8.4` | HTTP routes, request validation, and in-process injection | Already in the repo; official docs recommend schema-based validation and built-in injection for testable routes |
| `better-sqlite3` | `12.8.0` | Receipt persistence and idempotent lookup by `tx_signature` | Already owns the receipt table and unique constraint needed for D-09 |
| Jito Block Engine `getBundleStatuses` | Official JSON-RPC API | Canonical bundle lookup for `bundleId`, `slot`, `confirmationStatus`, and transaction signatures | User requirement and README contract both anchor fairness claims to Jito bundle status |
| `TypeScript` | `6.0.2` | Shared runtime types and helper contracts | Keeps the canonical receipt shape explicit across services, verifiers, and route handlers |

### Supporting

| Supporting piece | Current state | Use in Phase 1 |
|------------------|---------------|----------------|
| `packages/schema/receipt-schema.json` | Present, but custom and drifting | Convert to a real JSON Schema Draft 7 document so the contract is precise and machine-checkable |
| `apps/api/src/receipt.ts` | Present | Keep the canonical hash helper here and add the row-to-receipt serialization seam |
| `apps/api/src/test-flow.ts` | Present | Refactor to `fastify.inject()` so Phase 1 can validate the truthfulness contract without relying on a separately running server |

### Alternatives Considered

| Instead of | Could use | Tradeoff |
|------------|-----------|----------|
| Fastify JSON Schema | `zod`, `valibot`, or handwritten validators | Adds a parallel validation contract even though Fastify already ships the standard mechanism |
| Existing SQLite access | ORM or repository rewrite | Too much scope for a three-plan backend phase |
| `fastify.inject()` smoke flow | Hitting a separately running local server | Less deterministic and harder to automate once stamping depends on real or stubbed bundle lookup behavior |

## Architecture Patterns

### 1. Canonical contract first
Define the receipt once in `apps/api/src/receipt.ts` and serialize database rows through that same contract before any route sends them back. This is the easiest way to satisfy D-03, D-04, D-05, and D-06 together.

### 2. Dedicated stamp service, thin route
Keep `apps/api/src/server.ts` responsible for route schema, HTTP status handling, and reply shapes. Move bundle lookup, truth-bound receipt assembly, and retryable failure classification into a dedicated helper such as `apps/api/src/stamp-service.ts`.

### 3. Idempotency at the DB seam
The `receipts.tx_signature` unique constraint is already the source of truth for duplicate stamping. The route should check for an existing row and return it in canonical form before attempting a new insert.

### 4. Honest verification boundary
Phase 1 can still recompute the receipt hash, but that result should be represented as hash integrity, not final verification. `verified` stays `false` until Phase 2 memo anchoring exists; a separate field such as `hashMatches` can communicate integrity without lying about chain-backed proof.

### 5. Deterministic smoke flow through injection
Fastify's built-in injection lets the repo keep a smoke harness without launching an external server process. This phase can export `buildServer()` and pass a stubbed bundle lookup into the server for reliable end-to-end validation.

## Don't Hand-Roll

- Do not add a second validation stack when Fastify already accepts JSON Schema on route definitions.
- Do not keep the current "manual field checks + `as any`" path on the stamp route once the body schema exists.
- Do not trust or fall back to caller-supplied `slot` or `confirmationStatus`; Phase 1's trust boundary is "no live bundle data, no receipt."
- Do not create a pending or partial receipt state in this phase. The locked decision is explicit retryable failure, not provisional persistence.
- Do not change the receipt hash contract in multiple places. Keep one helper as the source of truth for `SHA-256(txSignature || bundleId || slot)`.
- Do not keep returning raw SQLite rows from `/api/v1/receipts`; that directly violates `PIPE-03`.

## Common Pitfalls

- **HIGH:** Jito documents `getBundleStatuses` at `/api/v1/getBundleStatuses`, not the `/api/v1/bundles` endpoint used by `sendBundle`. Reusing the send endpoint for status lookup is likely wrong. Source: [Jito docs](https://docs.jito.wtf/lowlatencytxnsend/).
- **HIGH:** `getBundleStatuses` returns `null` when a bundle is missing or has not landed. That should become a retryable upstream failure, not a partial receipt. Source: [Jito docs](https://docs.jito.wtf/lowlatencytxnsend/).
- **HIGH:** The Jito docs describe the field as `confirmationStatus`, while the example payload uses `confirmation_status`. The parser should normalize both spellings instead of assuming one. Source: [Jito docs](https://docs.jito.wtf/lowlatencytxnsend/).
- **HIGH:** The returned `transactions` array is part of the bundle status response. If the submitted `txSignature` is not in that array, stamping should fail rather than binding an unrelated signature to a real bundle slot.
- **HIGH:** Fastify only validates request bodies for `application/json`. The smoke flow and any client examples need the JSON content-type header. Source: [Fastify validation docs](https://fastify.dev/docs/v5.7.x/Reference/Validation-and-Serialization/).
- **HIGH:** The current verifier equates "recomputed hash matches stored hash" with `verified`. That directly conflicts with D-06 and must be split into integrity vs. verification state.
- **MEDIUM:** `packages/schema/receipt-schema.json` currently omits `walletAddress` and still uses `timestamp`. If execution only patches runtime types, schema drift will remain and Phase 1 will miss `PIPE-03`.

## Code Examples

### Fastify request validation shape

```ts
const stampBodySchema = {
  type: 'object',
  required: ['txSignature', 'bundleId'],
  additionalProperties: false,
  properties: {
    txSignature: { type: 'string', minLength: 1 },
    bundleId: { type: 'string', minLength: 1 },
    walletAddress: { type: ['string', 'null'] }
  }
}
```

### Jito status normalization seam

```ts
const response = await fetch(`${JITO_URL}/api/v1/getBundleStatuses`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'getBundleStatuses',
    params: [[bundleId]],
  }),
})

const item = json?.result?.value?.[0]
const confirmationStatus = item?.confirmation_status ?? item?.confirmationStatus
```

### Deterministic Fastify smoke harness

```ts
const app = buildServer({
  getBundleData: async () => ({
    bundleId,
    slot: 324901882,
    confirmationStatus: 'confirmed',
    transactions: [txSignature],
  }),
})

const stamp = await app.inject({
  method: 'POST',
  url: '/api/v1/stamp',
  payload: { txSignature, bundleId, walletAddress: 'TestWallet123' },
})
```

## Validation Architecture

- **Quick sampling command:** `cd apps/api && npm run build`
- **Full phase command:** `cd apps/api && npm run test:flow`
- **Expected feedback loop:** every code task can at least use `npm run build`; final-wave validation should run the injection-based smoke flow that covers stamp, verify, and list with the new contract.
- **Wave 0 requirement:** the existing `test:flow` must be refactored to use `buildServer().inject()` so the full suite does not depend on an already-running local server or a live bundle fixture.
- **No extra framework required:** Fastify already ships the injection mechanism we need, so there is no need to add Jest, Vitest, or Tap just to make Phase 1 plannable.

## Sources

- Jito Labs, "Low Latency Transaction Send" — `getBundleStatuses` request/response semantics and endpoint path: [https://docs.jito.wtf/lowlatencytxnsend/](https://docs.jito.wtf/lowlatencytxnsend/)
- Fastify v5.7.x, "Validation and Serialization" — JSON Schema validation behavior and nullable field syntax: [https://fastify.dev/docs/v5.7.x/Reference/Validation-and-Serialization/](https://fastify.dev/docs/v5.7.x/Reference/Validation-and-Serialization/)
- Fastify v5.0.x, "Routes" — route `schema` and `attachValidation` options: [https://fastify.dev/docs/v5.0.x/Reference/Routes/](https://fastify.dev/docs/v5.0.x/Reference/Routes/)
- Fastify v5.7.x, "Testing" — built-in `inject()` testing support: [https://fastify.dev/docs/v5.7.x/Guides/Testing/](https://fastify.dev/docs/v5.7.x/Guides/Testing/)
- JSON Schema reference, "null" — canonical nullable semantics: [https://json-schema.org/understanding-json-schema/reference/null](https://json-schema.org/understanding-json-schema/reference/null)
- Local code reference: `apps/api/src/server.ts`, `apps/api/src/receipt.ts`, `apps/api/src/bam-service.ts`, `apps/api/src/verifier.ts`, `apps/api/src/test-flow.ts`, `packages/schema/receipt-schema.json`
