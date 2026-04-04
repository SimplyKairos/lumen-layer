---
phase: 1
slug: canonical-receipt-pipeline
status: planned
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-04
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `tsc` + custom Fastify `inject()` smoke flow in `apps/api/src/test-flow.ts` |
| **Config file** | `apps/api/tsconfig.json` |
| **Quick run command** | `cd apps/api && npm run build` |
| **Full suite command** | `cd apps/api && npm run test:flow` |
| **Estimated runtime** | ~15 seconds |

`npm run test:flow` becomes the phase-complete check after Plan `01-03` refactors the flow to use `buildServer().inject()` instead of a separately running server.

## Sampling Rate

- **After every task commit:** Run `cd apps/api && npm run build`
- **After every plan wave:** Run `cd apps/api && npm run build`
- **Before `$gsd-verify-work`:** Run `cd apps/api && npm run test:flow`
- **Max feedback latency:** 20 seconds

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | PIPE-03 | build | `cd apps/api && npm run build` | ✅ | ⬜ pending |
| 01-01-02 | 01 | 1 | PIPE-03 | build | `cd apps/api && npm run build` | ✅ | ⬜ pending |
| 01-02-01 | 02 | 2 | PIPE-01 | build | `cd apps/api && npm run build` | ✅ | ⬜ pending |
| 01-02-02 | 02 | 2 | PIPE-01, PIPE-02 | build | `cd apps/api && npm run build` | ✅ | ⬜ pending |
| 01-03-01 | 03 | 3 | PIPE-01, PIPE-02, PIPE-03 | build | `cd apps/api && npm run build` | ✅ | ⬜ pending |
| 01-03-02 | 03 | 3 | PIPE-01, PIPE-02, PIPE-03 | smoke | `cd apps/api && npm run test:flow` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

## Wave 0 Requirements

- [ ] `apps/api/src/test-flow.ts` — replace the external `BASE_URL` flow with in-process `buildServer().inject()` requests so the full suite is deterministic
- [ ] `apps/api/src/server.ts` — export a reusable `buildServer()` factory that `test-flow.ts` can instantiate with a stubbed bundle lookup

## Manual-Only Verifications

All phase behaviors can be automated once the Wave 0 `inject()` refactor lands.

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending execution
