# Codebase Structure

**Analysis Date:** 2026-04-04

## Directory Layout

```
lumen-layer/
├── apps/            # Runtime applications
│   ├── api/         # Fastify + SQLite protocol backend
│   └── web/         # Vite + React frontend
├── packages/        # Shared packages and schemas
├── docs/            # Present in the repo; no files detected
├── .planning/       # Planning outputs, including codebase maps
├── .agents/         # Local agent skills and references
├── .claude/         # Claude tooling, commands, and hooks
├── .codex/          # Codex tooling, skills, templates, and commands
├── README.md        # Root product overview
└── LICENSE          # Apache-2.0 license
```

## Directory Purposes

**`apps/`:**
- Purpose: Holds the two runtime applications.
- Contains: application subdirectories and their source trees.
- Key files: `apps/api/src/server.ts`, `apps/web/src/main.tsx`.
- Subdirectories: `api/` for the backend, `web/` for the frontend.

**`apps/api/`:**
- Purpose: Backend protocol service and local persistence.
- Contains: TypeScript source, PM2 config, package manifests, and runtime SQLite/log output.
- Key files: `apps/api/src/server.ts`, `apps/api/src/db.ts`, `apps/api/src/receipt.ts`, `apps/api/src/verifier.ts`, `apps/api/src/bam-service.ts`, `apps/api/src/test-flow.ts`, `apps/api/package.json`, `apps/api/tsconfig.json`, `apps/api/ecosystem.config.js`.
- Subdirectories: `src/` for code, `data/` for SQLite artifacts such as `apps/api/data/lumen.db`, `logs/` for PM2 logs.

**`apps/web/`:**
- Purpose: Browser-facing React application and landing page.
- Contains: Vite entry files, section components, CSS, static assets, and browser/public files.
- Key files: `apps/web/src/main.tsx`, `apps/web/src/App.tsx`, `apps/web/src/index.css`, `apps/web/vite.config.ts`, `apps/web/index.html`, `apps/web/package.json`, `apps/web/eslint.config.js`, `apps/web/tsconfig.json`, `apps/web/tsconfig.app.json`, `apps/web/tsconfig.node.json`.
- Subdirectories: `src/assets/` for images and SVGs, `src/components/sections/` for page sections, `public/` for directly served static files.

**`packages/`:**
- Purpose: Shared code and protocol artifacts.
- Contains: schema assets and package-scoped shared material.
- Key files: `packages/schema/receipt-schema.json`.
- Subdirectories: `schema/` for the current canonical receipt schema.

**`docs/`:**
- Purpose: Documentation directory reserved in the repo.
- Contains: no files detected in the current tree.
- Key files: Not detected.
- Subdirectories: None detected.

**`.planning/`:**
- Purpose: Workspace for generated planning documents.
- Contains: codebase analysis outputs.
- Key files: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`.
- Subdirectories: `codebase/` for current mapping artifacts.

**`.agents/`, `.claude/`, `.codex/`:**
- Purpose: Tooling and agent support directories in the workspace.
- Contains: skills, commands, templates, and agent configuration material.
- Key files: Not applicable to runtime product code.
- Subdirectories: Multiple nested skill and template folders.

## Key File Locations

**Entry Points:**
- `apps/api/src/server.ts`: API process entry point and HTTP route registration.
- `apps/api/src/test-flow.ts`: Local end-to-end API exercise script.
- `apps/web/src/main.tsx`: Browser entry point that mounts React.
- `apps/web/index.html`: HTML shell that loads `apps/web/src/main.tsx`.

**Configuration:**
- `apps/api/package.json`: API scripts, dependencies, and CommonJS module type.
- `apps/api/tsconfig.json`: API TypeScript configuration.
- `apps/api/ecosystem.config.js`: PM2 process definition for the API.
- `apps/web/package.json`: Web scripts and dependencies.
- `apps/web/vite.config.ts`: Vite and React plugin configuration.
- `apps/web/eslint.config.js`: Frontend linting rules.
- `apps/web/tsconfig.json`, `apps/web/tsconfig.app.json`, `apps/web/tsconfig.node.json`: Frontend TypeScript configs.

**Core Logic:**
- `apps/api/src/db.ts`: SQLite schema creation and database handle.
- `apps/api/src/receipt.ts`: Receipt construction and hash generation.
- `apps/api/src/verifier.ts`: Receipt lookup and hash verification.
- `apps/api/src/bam-service.ts`: Jito bundle and Solana connection helpers.
- `apps/web/src/App.tsx`: Frontend page composition and global motion observer.
- `apps/web/src/components/sections/*.tsx`: Homepage section modules.

**Testing:**
- `apps/api/src/test-flow.ts`: Manual integration flow for stamp/verify/list endpoints.
- No `*.test.ts` or `*.spec.ts` files detected in the current tree.

**Documentation:**
- `README.md`: Root product overview and protocol summary.
- `apps/web/README.md`: Scaffold README for the frontend package.
- `packages/schema/receipt-schema.json`: Protocol schema reference for receipt shape and attestation levels.

## Naming Conventions

**Files:**
- `*.ts` and `*.tsx` for source modules in `apps/api/src/` and `apps/web/src/`.
- `*.json` for schema and configuration data such as `packages/schema/receipt-schema.json`.
- `*.svg` and `*.png` for imported visuals in `apps/web/src/assets/`.

**Directories:**
- Lowercase directory names throughout the product code.
- Feature grouping in `apps/web/src/components/sections/`.
- Runtime data isolated under `apps/api/data/`.

**Special Patterns:**
- `main.tsx` is the frontend mount point.
- `server.ts` is the backend process entry file.
- `receipt-schema.json` is the shared schema artifact rather than generated code.

## Where to Add New Code

**New Feature:**
- Primary code: `apps/api/src/` for backend features, `apps/web/src/components/` for frontend features.
- Tests: `apps/api/src/` for ad hoc integration scripts or a new dedicated test directory if added later.
- Config if needed: `apps/api/ecosystem.config.js`, `apps/web/vite.config.ts`, or the relevant package `package.json`.

**New Component/Module:**
- Implementation: `apps/web/src/components/sections/` for landing-page sections, `apps/api/src/` for service modules.
- Types: colocated in the same module or adjacent file in the owning directory.
- Tests: currently no dedicated frontend test location is detected.

**New Route/Command:**
- Definition: `apps/api/src/server.ts`.
- Handler: `apps/api/src/` next to the related domain module.
- Tests: `apps/api/src/test-flow.ts` or a new flow file beside the API source.

**Utilities:**
- Shared helpers: `apps/api/src/` for backend helpers, `apps/web/src/` for UI helpers.
- Type definitions: colocated with the module that owns the data shape.

## Special Directories

**`apps/api/data/`:**
- Purpose: SQLite database storage.
- Source: created and mutated by `apps/api/src/db.ts`.
- Committed: runtime artifacts are present in the workspace, including `apps/api/data/lumen.db-wal` and `apps/api/data/lumen.db-shm`.

**`apps/api/logs/`:**
- Purpose: PM2 output and error logs.
- Source: configured in `apps/api/ecosystem.config.js`.
- Committed: treated as runtime output.

**`apps/web/public/`:**
- Purpose: Static files served directly by Vite.
- Source: browser-visible assets such as `apps/web/public/favicon.svg`.
- Committed: yes, as source assets.

---

*Structure analysis: 2026-04-04*
*Update when directory structure changes*
