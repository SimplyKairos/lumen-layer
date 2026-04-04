# Technology Stack

**Analysis Date:** 2026-04-04

## Languages

**Primary:**
- TypeScript - Application code in `apps/api/src/` and `apps/web/src/`

**Secondary:**
- JavaScript - Tooling and process config in `apps/web/eslint.config.js` and `apps/api/ecosystem.config.js`
- JSON - Manifests and the shared receipt contract in `apps/api/package.json`, `apps/web/package.json`, and `packages/schema/receipt-schema.json`

## Runtime

**Environment:**
- Node.js - API server runs through `ts-node` in development and `node dist/server.js` in production start scripts
- Browser - React frontend is delivered by Vite and runs in the browser

**Package Manager:**
- npm - Lockfiles are present in `apps/api/package-lock.json` and `apps/web/package-lock.json`
- Lockfile: `package-lock.json` present in both apps

## Frameworks

**Core:**
- Fastify - HTTP API server in `apps/api/src/server.ts`
- React 19 - Frontend UI in `apps/web/src/main.tsx` and `apps/web/src/App.tsx`
- Vite 8 - Frontend dev server and build tool in `apps/web/vite.config.ts`

**Testing:**
- No dedicated test runner detected
- ts-node - Used for the API smoke test script in `apps/api/src/test-flow.ts`

**Build/Dev:**
- TypeScript compiler - API build in `apps/api/package.json` and frontend typecheck/build in `apps/web/package.json`
- `@vitejs/plugin-react` - React transform for the frontend in `apps/web/vite.config.ts`
- `@tailwindcss/vite` - Tailwind CSS v4 integration in `apps/web/vite.config.ts`
- ESLint 9 - Frontend linting in `apps/web/eslint.config.js`

## Key Dependencies

**Critical:**
- `fastify` - API server foundation in `apps/api/src/server.ts`
- `@fastify/cors` - Permissive CORS setup in `apps/api/src/server.ts`
- `better-sqlite3` - Local persistence in `apps/api/src/db.ts`
- `@solana/web3.js` - Solana RPC client setup in `apps/api/src/bam-service.ts`
- `dotenv` - Loads runtime configuration in `apps/api/src/server.ts`, `apps/api/src/bam-service.ts`, and `apps/api/src/test-flow.ts`
- `react` and `react-dom` - Frontend runtime dependencies in `apps/web/package.json`

**Infrastructure:**
- `ts-node` - Runs TypeScript directly for `apps/api/src/server.ts` and `apps/api/src/test-flow.ts`
- `typescript` - Shared typechecking and transpilation in both apps
- `tailwindcss` - Styling system backing the frontend CSS in `apps/web/src/index.css`
- `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` - React-specific lint rules in `apps/web/eslint.config.js`

## Configuration

**Environment:**
- `apps/api/.env` exists and is loaded through `dotenv/config`; its contents were not inspected
- Environment variables referenced in code: `SOLANA_NETWORK`, `HELIUS_RPC_DEVNET`, `HELIUS_RPC_MAINNET`, and `JITO_BLOCK_ENGINE_URL`
- Shared protocol contract: `packages/schema/receipt-schema.json` defines the `LumenReceipt` shape and attestation labels

**Build:**
- `apps/api/tsconfig.json`
- `apps/web/tsconfig.json`
- `apps/web/tsconfig.app.json`
- `apps/web/tsconfig.node.json`
- `apps/web/vite.config.ts`
- `apps/web/eslint.config.js`
- `apps/api/ecosystem.config.js`

## Platform Requirements

**Development:**
- Node.js-based development workflow on a local machine; no container config detected
- Browser required for the frontend app
- PM2 is configured in `apps/api/ecosystem.config.js` for a production-style TypeScript process

**Production:**
- No deployment provider config detected in the repo
- `apps/api/ecosystem.config.js` targets `NODE_ENV=production` and `PORT=3001`

---

*Stack analysis: 2026-04-04*
*Update after major dependency changes*
