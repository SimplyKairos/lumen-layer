# Architecture

**Analysis Date:** 2026-04-04

## Pattern Overview

**Overall:** Two-app monorepo with a protocol API, a client-side React frontend, and a shared receipt schema.

**Key Characteristics:**
- `apps/api` owns receipt stamping, verification, and SQLite persistence.
- `apps/web` is a Vite-powered React shell composed from section modules.
- `packages/schema/receipt-schema.json` defines the canonical receipt contract.
- External protocol access is isolated in helper modules rather than embedded throughout the UI.

## Layers

**Presentation Layer:**
- Purpose: Render the public-facing product site and protocol explainer.
- Contains: `apps/web/src/App.tsx`, `apps/web/src/components/sections/*.tsx`, `apps/web/src/index.css`, `apps/web/index.html`.
- Depends on: local React components, browser APIs, and imported static assets in `apps/web/src/assets/`.
- Used by: browser clients bootstrapped through `apps/web/src/main.tsx`.

**API Layer:**
- Purpose: Expose receipt and launchpad HTTP endpoints.
- Contains: `apps/api/src/server.ts`, `apps/api/src/test-flow.ts`.
- Depends on: Fastify, CORS, receipt helpers, verifier helpers, and the SQLite module in `apps/api/src/db.ts`.
- Used by: the frontend, local integration checks, and external callers.

**Domain and Persistence Layer:**
- Purpose: Define receipt data, build receipt hashes, and store records.
- Contains: `apps/api/src/receipt.ts`, `apps/api/src/verifier.ts`, `apps/api/src/db.ts`, `packages/schema/receipt-schema.json`.
- Depends on: `crypto`, `uuid`, and `better-sqlite3`.
- Used by: the API request handlers and the local test flow.

**Integration Layer:**
- Purpose: Wrap Jito and Solana network access.
- Contains: `apps/api/src/bam-service.ts`.
- Depends on: `@solana/web3.js`, environment variables, and Jito HTTP endpoints.
- Used by: not wired into `apps/api/src/server.ts` in the current codebase state.

## Data Flow

**Receipt Stamp Flow:**
1. A client POSTs to `apps/api/src/server.ts` at `POST /api/v1/stamp`.
2. The handler validates `txSignature`, `bundleId`, and `slot`.
3. `buildReceipt()` in `apps/api/src/receipt.ts` computes `SHA-256(txSignature + bundleId + slot)` and builds a `LumenReceipt`.
4. The receipt row is inserted into the `receipts` table created in `apps/api/src/db.ts`.
5. The API returns the persisted receipt with `201 Created`.

**Verification Flow:**
1. A client calls `GET /api/v1/verify/:receiptId` in `apps/api/src/server.ts`.
2. `verifyReceipt()` in `apps/api/src/verifier.ts` loads the row from SQLite.
3. `computeReceiptHash()` recomputes the receipt hash from stored bundle data.
4. The verifier compares the recomputed hash with the stored hash.
5. The API returns a verification payload or `404` when the receipt is missing.

**State Management:**
- Persistent state lives in the SQLite file created under `apps/api/data/lumen.db`.
- Request handlers are otherwise stateless.
- The frontend keeps only UI-local state for scroll and animation behavior.

## Key Abstractions

**Receipt:**
- Purpose: Canonical record of a fairness event.
- Examples: `LumenReceipt` in `apps/api/src/receipt.ts`, receipt fields in `packages/schema/receipt-schema.json`.
- Pattern: value object with a derived hash, timestamp, and attestation metadata.

**Verification Result:**
- Purpose: Normalize the response shape for receipt verification.
- Examples: `VerificationResult` in `apps/api/src/verifier.ts`.
- Pattern: read model assembled from the database row plus recomputed integrity checks.

**Section Component:**
- Purpose: Split the frontend into independently maintained content blocks.
- Examples: `apps/web/src/components/sections/Hero.tsx`, `apps/web/src/components/sections/Stats.tsx`, `apps/web/src/components/sections/HowItWorks.tsx`.
- Pattern: function component composition with localized effects and inline styling.

**Bundle Service:**
- Purpose: Encapsulate Jito bundle lookup and submission calls.
- Examples: `getBundleData()` and `submitBundle()` in `apps/api/src/bam-service.ts`.
- Pattern: thin async helper around fetch-based JSON-RPC requests.

## Entry Points

**API Bootstrap:**
- Location: `apps/api/src/server.ts`.
- Triggers: `npm run dev`, `npm start`, or the PM2 config in `apps/api/ecosystem.config.js`.
- Responsibilities: register CORS, define routes, and listen on port `3001`.

**Web Bootstrap:**
- Location: `apps/web/src/main.tsx`.
- Triggers: browser load of `apps/web/index.html`.
- Responsibilities: mount `App` into `#root`.

**Manual Test Harness:**
- Location: `apps/api/src/test-flow.ts`.
- Triggers: `npm run test:flow` from `apps/api`.
- Responsibilities: exercise stamp, verify, and list endpoints against a local API instance.

## Error Handling

**Strategy:** Route handlers return explicit HTTP status codes, while helper modules log failures and return `null` where appropriate.

**Patterns:**
- `apps/api/src/server.ts` returns `400`, `404`, `500`, and `501` responses directly.
- `apps/api/src/verifier.ts` returns `null` when a receipt row is not found.
- `apps/api/src/bam-service.ts` logs Jito or fetch failures and returns `null`.
- `apps/api/src/db.ts` performs table creation at module load and fails fast if SQLite initialization breaks.

## Cross-Cutting Concerns

**Configuration:** `dotenv/config` is loaded in `apps/api/src/server.ts`, `apps/api/src/bam-service.ts`, and `apps/api/src/test-flow.ts`; Solana and Jito connectivity depend on `SOLANA_NETWORK`, `HELIUS_RPC_DEVNET`, `HELIUS_RPC_MAINNET`, and `JITO_BLOCK_ENGINE_URL`.

**Logging:** The API uses Fastify logging plus `console.log` and `console.error` in helper modules and the local test harness.

**UI Effects:** `apps/web/src/App.tsx` uses `IntersectionObserver`, `apps/web/src/components/sections/Navbar.tsx` uses a scroll listener, and `apps/web/src/components/sections/Hero.tsx` uses `requestAnimationFrame` plus mouse tracking for motion.

**Shared Contract:** `packages/schema/receipt-schema.json` defines the receipt field set and attestation level descriptions used as the protocol schema.

---

*Architecture analysis: 2026-04-04*
*Update when major patterns change*
