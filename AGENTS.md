<!-- GSD:project-start source:PROJECT.md -->
## Project

Lumen Layer is an open execution fairness protocol for Solana. It turns live Jito BAM bundle execution into a replayable receipt flow by fetching canonical bundle status, hashing `txSignature || bundleId || slot`, anchoring that hash on-chain with Solana Memo, and exposing public verification.

Current v1 scope:
- Make the receipt pipeline truthful with live Jito data and devnet memo anchoring
- Unify the receipt contract across runtime code, API responses, database fields, and `packages/schema/receipt-schema.json`
- Ship the public verifier, receipt explorer, webhook integration, and reference fair-launch launchpad

Core value: anyone can independently verify a claimed execution outcome against canonical chain state without trusting Lumen's database.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

- Backend: Fastify, TypeScript, SQLite, `better-sqlite3`, `@solana/web3.js`, `dotenv`
- Frontend: React 19, Vite 8, Tailwind CSS v4
- Protocol integrations: Jito bundle status helpers in `apps/api/src/bam-service.ts`, Solana Memo anchoring target, Helius RPC, Meteora launch-related dependencies
- Workspace shape: `apps/api/` for the protocol service, `apps/web/` for the public web app, `packages/schema/` for the shared receipt contract
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

- TypeScript/TSX code uses single quotes, two-space indentation, and usually omits semicolons
- React section components in `apps/web/src/components/sections/` use default exports and PascalCase filenames
- Backend helpers in `apps/api/src/` use named exports, camelCase functions, and mostly relative imports
- Route handlers in `apps/api/src/server.ts` prefer explicit `try/catch` blocks with JSON status responses
- Keep modules small and colocated with their owning layer instead of introducing barrel files or aliases by default
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

- `apps/api/` owns receipt stamping, verification, persistence, and future launchpad routes
- `apps/web/` is the public-facing React app for protocol explanation and the upcoming verifier/explorer/launchpad UI
- `packages/schema/receipt-schema.json` is the shared protocol contract and must stay aligned with runtime receipt models
- `apps/api/src/bam-service.ts` is the integration seam for live Jito and Solana access; `apps/api/src/server.ts` is the current API entry point
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `$gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `$gsd-debug` for investigation and bug fixing
- `$gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `$gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` — do not edit manually.
<!-- GSD:profile-end -->
