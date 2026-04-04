# External Integrations

**Analysis Date:** 2026-04-04

## APIs & External Services

**Payment Processing:**
- Not detected

**Email/SMS:**
- Not detected

**External APIs:**
- Jito block engine - Bundle status lookup and bundle submission helpers in `apps/api/src/bam-service.ts`
  - Integration method: direct `fetch` calls to `https://mainnet.block-engine.jito.wtf/api/v1/bundles` or the value in `JITO_BLOCK_ENGINE_URL`
  - Auth: Not detected
  - Current state: `getBundleData()` and `submitBundle()` are exported from `apps/api/src/bam-service.ts`, but no call sites were detected in `apps/api/src/server.ts`

- Helius RPC - Solana RPC endpoint selection in `apps/api/src/bam-service.ts`
  - Integration method: `new Connection(RPC_URL, 'confirmed')` from `@solana/web3.js`
  - Auth: RPC URLs are read from `HELIUS_RPC_DEVNET` and `HELIUS_RPC_MAINNET`
  - Current state: the connection object is exported, but no RPC methods were detected in the server flow

- Solana memo anchoring - Protocol surface described by the README and schema files
  - Integration method: `apps/api/src/receipt.ts` computes the receipt hash from transaction data
  - Current state: `onChainMemo` remains `null` in the receipt object and no on-chain memo write path was detected in the current API code

- Google Fonts - Frontend font loading in `apps/web/src/index.css`
  - Integration method: CSS `@import` from `https://fonts.googleapis.com/css2`
  - Current state: loads `Outfit` and `DM Mono` at runtime in the browser

- Third-party image assets - Runtime asset requests in `apps/web/src/components/sections/Hero.tsx`
  - Integration method: direct image URLs for Jito, Helius, and the Solana logo
  - Current state: `https://jito.wtf/favicon.ico`, `https://helius.dev/favicon.ico`, and `https://upload.wikimedia.org/...` are fetched by the browser

## Data Storage

**Databases:**
- SQLite file - Local protocol database in `apps/api/data/lumen.db`
  - Connection: local filesystem path in `apps/api/src/db.ts`
  - Client: `better-sqlite3`
  - Migrations: Not detected; tables are created with `CREATE TABLE IF NOT EXISTS` in `apps/api/src/db.ts`

**File Storage:**
- Not detected

**Caching:**
- Not detected

## Authentication & Identity

**Auth Provider:**
- Not detected

**OAuth Integrations:**
- Not detected

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Analytics:**
- Not detected

**Logs:**
- Fastify logger writes to stdout/stderr in `apps/api/src/server.ts`
- PM2 logging is configured in `apps/api/ecosystem.config.js` with `logs/error.log`, `logs/out.log`, and `logs/combined.log`

## CI/CD & Deployment

**Hosting:**
- Not detected in repo config
- README text references Vercel and DigitalOcean, but no deployment manifest is present in the codebase

**CI Pipeline:**
- Not detected

## Environment Configuration

**Development:**
- `apps/api/.env` exists; its contents were not inspected
- `apps/api/src/server.ts`, `apps/api/src/bam-service.ts`, and `apps/api/src/test-flow.ts` all load `dotenv/config`
- `apps/api/src/test-flow.ts` is a local smoke-test client against `http://localhost:3001`
- Environment variables referenced in code: `SOLANA_NETWORK`, `HELIUS_RPC_DEVNET`, `HELIUS_RPC_MAINNET`, and `JITO_BLOCK_ENGINE_URL`

**Staging:**
- Not detected

**Production:**
- `apps/api/ecosystem.config.js` sets `NODE_ENV=production` and `PORT=3001`

## Webhooks & Callbacks

**Incoming:**
- `POST /api/v1/webhook` in `apps/api/src/server.ts`
  - Verification: Not detected
  - Current state: endpoint exists as an external integrator callback surface, but it currently returns `501 not implemented yet`

**Outgoing:**
- Not detected

---

*Integration audit: 2026-04-04*
*Update when adding/removing external services*
