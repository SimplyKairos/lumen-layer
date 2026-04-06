# Lumen Layer

> Clarity before capital.

Lumen is an open execution fairness protocol for Solana. It turns canonical bundle execution context into a cryptographically verifiable receipt, anchors the receipt hash on Solana devnet via memo, and lets anyone replay the result against chain data.

Built on Jito BAM's execution infrastructure, Lumen standardizes what fairness means at the execution layer and makes it verifiable by anyone, forever.

## What it does

- **Execution receipts** — SHA-256 binding of transaction signature + bundle execution context, anchored on devnet through a memo transaction
- **Public verifier** — anyone can verify any receipt in real time, no trust in Lumen required
- **Open schema** — canonical JSON receipt standard any wallet, launchpad, or custodian can integrate
- **Webhook API** — one-line integration for external platforms
- **Reference launchpad** — fair-launch token launchpad that runs entirely on the Lumen protocol

## How it works

1. Caller submits a transaction signature and bundle ID to Lumen
2. Lumen fetches bundle data via `getBundleStatuses` — bundle ID, slot, confirmation status
3. `SHA-256(txSignature || bundleId || slot)` is computed
4. Lumen anchors the hash on devnet as a Solana memo transaction and stores that transaction signature in `onChainMemo`
5. Anyone can fetch the memo transaction, compare its memo payload to `receiptHash`, and verify the receipt without trusting the database

**Attestation levels:**
- `BUNDLE_VERIFIED` — confirmed via Jito bundle data and canonical receipt hashing
- `BAM_ATTESTED` — full TEE attestation digest bound to receipt (upgrade path ready when BAM API is available)

**Current BAM constraint**

Lumen does not currently have access to public per-bundle BAM TEE attestation digests. The available BAM integration surface exposes bundle-level execution metadata through `getBundleStatuses`, including:

- `bundleId`
- `slot`
- `confirmationStatus`

For that reason, current receipts are intentionally issued as `BUNDLE_VERIFIED`, not `BAM_ATTESTED`. This is a known protocol constraint and an explicit part of Lumen's proof model, not an implementation bug.

If deeper BAM attestation access becomes available, Lumen's attestation model is designed to support a clean upgrade path to stronger proof levels without changing the core receipt standard.

## Stack

- **Backend** — Fastify, Node.js, SQLite
- **Frontend** — React, Vite, Tailwind CSS v4
- **Blockchain** — Solana, Jito BAM SDK, Helius RPC, @solana/web3.js
- **Deployment** — Vercel, DigitalOcean

## Getting started
```bash
git clone https://github.com/SimplyKairos/lumen-layer
cd lumen-layer
```

**Frontend**
```bash
cd apps/web && npm install && npm run dev
```

**Backend**
```bash
cd apps/api && npm install && npm run dev
```

## API

POST /api/v1/stamp        — submit a transaction for receipt generation
GET  /api/v1/verify/:id   — verify a receipt by ID
GET  /api/v1/receipts     — list recent receipts

Current stamp request body:
`{ txSignature, bundleId, walletAddress? }`

Successful stamp responses now anchor `receiptHash` before returning `201` and store the memo transaction signature in `onChainMemo`.

Verification statuses:
- `VERIFIED`
- `HASH_MISMATCH`
- `MEMO_MISMATCH`
- `ANCHOR_NOT_FOUND`

## Receipt schema

See `/packages/schema/receipt-schema.json` for the full open schema.

## License

Apache-2.0 — open for anyone to integrate, fork, or build on. · @LumenLayer
