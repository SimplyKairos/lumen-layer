# Coding Conventions

**Analysis Date:** 2026-04-04

## Naming Patterns

**Files:**
- API source files in `apps/api/src/` use lower-case, hyphenated or simple utility names such as `server.ts`, `bam-service.ts`, `test-flow.ts`, `receipt.ts`, `verifier.ts`, and `db.ts`.
- React component files in `apps/web/src/components/sections/` use PascalCase names such as `Navbar.tsx`, `Hero.tsx`, `Ticker.tsx`, `Stats.tsx`, `WhyWeBuiltThis.tsx`, `HowItWorks.tsx`, `CTA.tsx`, and `Footer.tsx`.
- Shared entry files use standard app-level names such as `apps/web/src/App.tsx` and `apps/web/src/main.tsx`.
- Test-like automation currently appears as `apps/api/src/test-flow.ts` rather than `*.test.ts` or `*.spec.ts`.

**Functions:**
- Functions are camelCase in both apps, for example `buildReceipt`, `computeReceiptHash`, `verifyReceipt`, `getBundleData`, `submitBundle`, and `testFullFlow`.
- React components are exported as PascalCase functions, for example `Navbar`, `Hero`, `Stats`, and `Footer`.
- Async functions do not use any special naming prefix.

**Variables:**
- Local variables are camelCase, such as `receiptHash`, `recomputedHash`, `animId`, and `doubled`.
- Constants and environment-derived values commonly use UPPER_SNAKE_CASE, such as `DB_PATH`, `RPC_URL`, `JITO_URL`, and `BASE_URL`.
- Event handler locals are simple inline names, such as `fn` and `onMove`.

**Types:**
- Interfaces use PascalCase with no `I` prefix, such as `LumenReceipt`, `VerificationResult`, and `BundleData`.
- Type unions are written inline rather than as enums in the observed source files.
- No enum declarations are present in the inspected files.

## Code Style

**Formatting:**
- TypeScript and TSX files use single quotes throughout, as seen in `apps/api/src/server.ts` and `apps/web/src/App.tsx`.
- Semicolons are generally omitted.
- Indentation is two spaces.
- JSX often uses long inline `style` objects rather than CSS modules or utility class composition.

**Linting:**
- `apps/web/eslint.config.js` defines ESLint for the web app with `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.
- `apps/web/tsconfig.app.json` and `apps/web/tsconfig.node.json` enforce strict TypeScript options such as `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`.
- No repository-wide ESLint config was detected outside `apps/web/eslint.config.js`.
- No formatter config such as Prettier or Biome was detected in the inspected paths.

## Import Organization

**Order:**
- Import ordering is not standardized across the repo.
- Some files place internal imports first, such as `apps/api/src/server.ts` importing `./db`, `./receipt`, and `./verifier` before external packages.
- Other files place external imports first, such as `apps/web/src/main.tsx` importing React packages before `./index.css` and `./App.tsx`.

**Grouping:**
- Blank-line grouping is inconsistent.
- Asset imports are kept with local imports, such as `apps/web/src/App.tsx` and `apps/web/src/components/sections/Hero.tsx`.

**Path Aliases:**
- No path aliases were detected in `apps/api/tsconfig.json`, `apps/web/tsconfig.json`, or `apps/web/tsconfig.app.json`.
- Relative imports dominate the codebase, for example `./db`, `./receipt`, `../../assets/LumenLogo.svg`, and `./components/sections/Navbar`.

## Error Handling

**Patterns:**
- API route handlers wrap writes and reads in `try/catch` blocks and return JSON error responses with status codes, as in `apps/api/src/server.ts`.
- Helper services return `null` on failure instead of throwing, as in `apps/api/src/bam-service.ts`.
- Verification returns `null` for missing receipts in `apps/api/src/verifier.ts`.

**Error Types:**
- Invalid request input returns `400` from `apps/api/src/server.ts`.
- Missing records return `404` from `apps/api/src/server.ts`.
- Unexpected failures return `500` from `apps/api/src/server.ts`.
- Not-implemented routes return `501` from `apps/api/src/server.ts`.

## Logging

**Framework:**
- Fastify logging is enabled in `apps/api/src/server.ts` with `Fastify({ logger: true })`.
- Console logging is used directly in `apps/api/src/db.ts`, `apps/api/src/bam-service.ts`, `apps/api/src/server.ts`, and `apps/api/src/test-flow.ts`.

**Patterns:**
- Logging is informal and message-based rather than structured.
- `apps/api/src/test-flow.ts` prints step-by-step progress messages and exits with `process.exit(1)` on failure.
- No dedicated logger abstraction was detected in the inspected source.

## Comments

**When to Comment:**
- Comments mark route groups and intent in `apps/api/src/server.ts` and schema sections in `apps/api/src/db.ts`.
- Section comments are common in the web components, such as `apps/web/src/components/sections/Hero.tsx` and `apps/web/src/components/sections/HowItWorks.tsx`.
- Comments are short and descriptive rather than explanatory.

**JSDoc/TSDoc:**
- No JSDoc or TSDoc blocks were detected in the inspected source.

**TODO Comments:**
- No tracked TODO-style comment pattern was detected in the inspected files.

## Function Design

**Size:**
- Functions are generally small and single-purpose in `apps/api/src/receipt.ts`, `apps/api/src/verifier.ts`, and `apps/api/src/bam-service.ts`.
- React components are self-contained section components with local data arrays and inline handlers.

**Parameters:**
- Functions typically accept a small fixed parameter list.
- Object parameters are mostly avoided in favor of positional arguments in utility functions like `buildReceipt` and `computeReceiptHash`.

**Return Values:**
- Helper functions return concrete objects or `null`.
- Route handlers return reply objects directly.

## Module Design

**Exports:**
- Named exports are used for most non-component helpers, such as `computeReceiptHash`, `buildReceipt`, `verifyReceipt`, `getBundleData`, and `submitBundle`.
- Default exports are used for React components in `apps/web/src/components/sections/`.
- `apps/api/src/db.ts` exports both a named `db` constant and a default export.

**Barrel Files:**
- No barrel `index.ts` files were detected in the inspected source tree.
- Modules are imported directly from their defining files.

*Convention analysis: 2026-04-04*
*Update when patterns change*
