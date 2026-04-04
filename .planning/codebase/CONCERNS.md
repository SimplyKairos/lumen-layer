# Codebase Concerns

**Analysis Date:** 2026-04-04

## Tech Debt

**Protocol surface is wider than the implementation**
- Issue: `apps/api/src/server.ts` advertises launchpad and webhook routes, but `POST /api/v1/launch`, `GET /api/v1/launches`, `GET /api/v1/launches/:launchId`, `GET /api/v1/creators/:walletAddress`, and `POST /api/v1/webhook` all return `501 not implemented yet`.
- Why: The public-facing README and UI describe a broader protocol than the server currently executes, and `apps/api/src/bam-service.ts` is not wired into the request flow.
- Impact: Integrators can reach dead endpoints, and future work has to reconcile docs, UI copy, and runtime behavior.
- Fix approach: Either wire the routes to the BAM/Jito helpers in `apps/api/src/bam-service.ts` or trim the advertised surface until those flows exist.

**Receipt shape is split across code and schema files**
- Issue: `packages/schema/receipt-schema.json` uses `timestamp` and a non-null `onChainMemo`, while `apps/api/src/receipt.ts` exposes `createdAt` and sets `onChainMemo: null`.
- Why: The schema and runtime object were authored separately and are not sharing one canonical definition.
- Impact: Downstream consumers can deserialize receipts incorrectly or assume fields that are not populated by the server.
- Fix approach: Make `packages/schema/receipt-schema.json`, `apps/api/src/receipt.ts`, and `apps/api/src/verifier.ts` share a single receipt contract.

**SQLite schema is broader than the live data path**
- Issue: `apps/api/src/db.ts` creates `launches`, `creators`, `users`, and `bundler_alerts`, but the current server only reads and writes `receipts`.
- Why: The database schema appears to have been expanded ahead of the implemented routes.
- Impact: Unused tables increase migration surface area and make schema drift harder to reason about.
- Fix approach: Keep the schema focused on active flows, or add migrations and tests that actually exercise the dormant tables.

## Known Bugs

**Verification succeeds without chain verification**
- Symptoms: `/api/v1/verify/:receiptId` can return `verified: true` when the stored hash matches the stored row, even if no on-chain memo was written.
- Trigger: Any receipt created by `apps/api/src/server.ts` in the current code path.
- Workaround: None in the codebase today.
- Root cause: `apps/api/src/receipt.ts` marks receipts as verified at creation time, and `apps/api/src/verifier.ts` only recomputes the hash from database fields.
- Blocked by: The live bundle, memo, and chain-state flow is not connected to the route handlers.

**Primary page controls point at missing sections**
- Symptoms: The navbar in `apps/web/src/components/sections/Navbar.tsx` and the footer in `apps/web/src/components/sections/Footer.tsx` target `verify`, `docs`, and `explorer`, but those anchors do not exist in `apps/web/src/App.tsx` or the section components.
- Trigger: Clicking the landing-page nav or footer controls.
- Workaround: Manual scrolling.
- Root cause: The page is organized as a single landing page without matching section IDs.
- Blocked by: No matching content blocks exist yet.

## Security Considerations

**Public write endpoint accepts untyped input**
- Risk: `apps/api/src/server.ts` casts `request.body` to `any`, checks only required fields, and persists whatever else arrives in the request.
- Current mitigation: Minimal presence checks for `txSignature`, `bundleId`, and `slot`.
- Recommendations: Add request schemas, type coercion, and explicit validation before hashing or persisting the record.

**CORS is open on the API**
- Risk: `apps/api/src/server.ts` registers `@fastify/cors` with `origin: '*'`, so any browser origin can call the API.
- Current mitigation: None in the server layer.
- Recommendations: Restrict origins for non-public routes and add rate limiting or auth if stamp and webhook calls become sensitive.

**Receipt hashing is structurally ambiguous**
- Risk: `apps/api/src/receipt.ts` hashes `${txSignature}${bundleId}${slot}` without separators or canonical encoding.
- Current mitigation: None.
- Recommendations: Canonicalize the payload before hashing, or use a structured encoding with explicit field boundaries.

## Fragile Areas

**BAM / Jito integration layer**
- Why fragile: `apps/api/src/bam-service.ts` depends on `process.env.SOLANA_NETWORK`, `HELIUS_RPC_DEVNET`, and `HELIUS_RPC_MAINNET` at module load, then treats upstream JSON as `any`.
- Common failures: Startup failures when env vars are missing, or silent `null` responses when Jito response shapes change.
- Safe modification: Guard env access before constructing `Connection`, validate the upstream payload, and cover the parsing path with fixtures.
- Test coverage: No dedicated tests exist for `getBundleData` or `submitBundle`.

**Landing-page animation and layout**
- Why fragile: `apps/web/src/App.tsx`, `apps/web/src/components/sections/Hero.tsx`, `apps/web/src/components/sections/Stats.tsx`, and `apps/web/src/components/sections/WhyWeBuiltThis.tsx` rely on fixed paddings, four-column and two-column grids, and mousemove/requestAnimationFrame effects without responsive breakpoints.
- Common failures: Overlap or horizontal overflow on smaller viewports, plus extra animation work on slower devices.
- Safe modification: Add breakpoint-aware layouts and keep motion behind a reduced-motion check.
- Test coverage: No visual regression or responsive tests are present.

**Remote asset dependencies in the hero**
- Why fragile: `apps/web/src/components/sections/Hero.tsx` loads icons from `jito.wtf`, `helius.dev`, and Wikipedia at runtime, while `apps/web/src/index.css` imports Google Fonts from a remote stylesheet.
- Common failures: Slow first paint, broken imagery, or visual shifts when external hosts are unavailable.
- Safe modification: Bundle critical assets locally and self-host fonts.
- Test coverage: No network-failure path is exercised.

## Scaling Limits

**File-backed SQLite persistence**
- Current capacity: Not measured in this review; writes are handled by `better-sqlite3` against `apps/api/data/lumen.db`.
- Limit: Concurrent write pressure serializes through one process and one database file.
- Symptoms at limit: Request latency rises or writes block under heavier receipt traffic.
- Scaling path: Move receipts to a server-backed database and separate write-heavy flows from request handling.

**Live upstream calls**
- Current capacity: Not measured in this review; `apps/api/src/bam-service.ts` issues Jito and Helius calls on demand.
- Limit: Burst traffic directly depends on upstream latency and availability.
- Symptoms at limit: Stamping or verification requests stall while upstream services slow down.
- Scaling path: Add retries, caching, and background persistence.

## Dependencies at Risk

**External Solana infrastructure**
- Risk: The runtime depends on Jito block-engine endpoints and Helius RPC URLs configured in `apps/api/src/bam-service.ts`.
- Impact: If the upstream provider changes response shape, rate limits traffic, or is unavailable, the protocol flow degrades immediately.
- Migration plan: Keep a provider abstraction around the network layer and add fallback RPCs where possible.

## Missing Critical Features

**On-chain anchoring is not wired**
- Problem: `apps/api/src/server.ts` creates and stores receipts locally, but does not call `apps/api/src/bam-service.ts`, write a Solana memo, or persist bundle status from Jito.
- Current workaround: The code records a receipt row and marks it verified in the same request.
- Blocks: The README claim of immutable on-chain anchoring is not satisfied by the current request path.
- Implementation complexity: Medium, because the stamp flow needs bundle submission, status lookup, memo writing, and persistence updates.

**Launchpad and webhook routes are placeholders**
- Problem: The launchpad and external integration routes in `apps/api/src/server.ts` return `501 not implemented yet`.
- Current workaround: None beyond the receipt endpoints.
- Blocks: The launchpad and external integration story described in `README.md` is incomplete.
- Implementation complexity: Medium to high, because these routes need persistence, validation, and business logic.

## Test Coverage Gaps

**API request validation and error handling**
- What's not tested: Rejected bodies, malformed `slot` values, duplicate `txSignature` inserts, and DB failure paths in `apps/api/src/server.ts`.
- Risk: Bad input or storage errors can only be caught manually.
- Priority: High.
- Difficulty to test: Requires route-level tests or a harness around the Fastify server and SQLite fixture.

**Verification semantics**
- What's not tested: The difference between a locally recomputed hash and a receipt that is actually anchored to chain state.
- Risk: The current `verified` flag can mask an incomplete integration.
- Priority: High.
- Difficulty to test: Needs a mocked Jito/Solana path plus assertions on memo persistence.

**Frontend navigation and responsiveness**
- What's not tested: Missing anchor targets and narrow-screen layout behavior in `apps/web/src/components/sections/Navbar.tsx`, `apps/web/src/components/sections/Footer.tsx`, `apps/web/src/components/sections/Stats.tsx`, and `apps/web/src/components/sections/WhyWeBuiltThis.tsx`.
- Risk: Broken navigation and overflow can go unnoticed in desktop-only manual checks.
- Priority: Medium.
- Difficulty to test: Needs a browser-based visual or interaction pass.

*Concerns audit: 2026-04-04*
