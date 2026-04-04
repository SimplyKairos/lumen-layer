# Testing Patterns

**Analysis Date:** 2026-04-04

## Test Framework

**Runner:**
- No Jest, Vitest, Playwright, or other dedicated test runner config was detected in the inspected repo paths.
- The closest current test entry point is `apps/api/src/test-flow.ts`, which is executed by `apps/api/package.json` via `npm run test:flow`.
- `apps/web/package.json` does not define a test script.

**Assertion Library:**
- No assertion library config or test matcher setup was detected.
- `apps/api/src/test-flow.ts` uses explicit runtime checks such as `if (!receipt.receiptId)` and `if (!verification.verified)` rather than assertion helpers.

**Run Commands:**
```bash
cd apps/api && npm run test:flow
cd apps/web && npm run lint
cd apps/web && npm run build
```

## Test File Organization

**Location:**
- No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx` files were detected.
- The only test-like automation file is `apps/api/src/test-flow.ts`.

**Naming:**
- There is no established unit/integration/E2E naming split in the current tree.
- The only scripted verification path is named as a flow script rather than a conventional test file.

**Structure:**
```
apps/api/src/
  server.ts
  test-flow.ts
```

## Test Structure

**Suite Organization:**
```typescript
async function testFullFlow() {
  const stampRes = await fetch(`${BASE_URL}/api/v1/stamp`, { ... })
  const receipt = await stampRes.json() as any
  if (!receipt.receiptId) process.exit(1)

  const verifyRes = await fetch(`${BASE_URL}/api/v1/verify/${receipt.receiptId}`)
  const verification = await verifyRes.json() as any
  if (!verification.verified) process.exit(1)
}
```

**Patterns:**
- Tests are written as a single sequential async flow rather than nested `describe` or `it` blocks.
- The flow script uses console output to narrate progress through setup, execution, and verification steps.
- Failures are handled immediately with `process.exit(1)`.

## Mocking

**Framework:**
- No mocking framework was detected.

**Patterns:**
```typescript
const BASE_URL = 'http://localhost:3001'
const stampRes = await fetch(`${BASE_URL}/api/v1/stamp`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    txSignature: `test-sig-${Date.now()}`,
    bundleId: `test-bundle-${Date.now()}`,
    slot: 324901882,
  }),
})
```

**What to Mock:**
- No explicit mock boundaries were detected.
- The current flow script exercises the live local API rather than replacing dependencies with doubles.

**What NOT to Mock:**
- The current script does not separate pure logic from transport concerns, so no mock-vs-real pattern is established in the inspected files.

## Fixtures and Factories

**Test Data:**
- Test inputs are created inline inside `apps/api/src/test-flow.ts`.
- Receipt request values use `Date.now()`-based unique strings for `txSignature` and `bundleId`.

**Location:**
- No shared `tests/fixtures/` or `tests/factories/` directory was detected.

## Coverage

**Requirements:**
- No coverage target was detected.
- No coverage gate is defined in the inspected package scripts.

**Configuration:**
- No coverage runner configuration was detected.
- No exclude/include coverage rules were detected.

**View Coverage:**
```bash
Not applicable in the current repo state.
```

## Test Types

**Unit Tests:**
- No unit test files were detected.

**Integration Tests:**
- `apps/api/src/test-flow.ts` acts as an integration-style script by calling the local API at `http://localhost:3001`.
- It exercises receipt creation, receipt verification, and receipt listing in sequence.

**E2E Tests:**
- No browser E2E framework was detected.

## Common Patterns

**Async Testing:**
```typescript
const listRes = await fetch(`${BASE_URL}/api/v1/receipts`)
const list = await listRes.json() as any
console.log(`✅ Found ${list.count} receipts in DB`)
```

**Error Testing:**
```typescript
if (!receipt.receiptId) {
  console.error('❌ Stamp failed:', receipt)
  process.exit(1)
}
```

**Snapshot Testing:**
- No snapshot testing pattern was detected.

*Testing analysis: 2026-04-04*
*Update when test patterns change*
