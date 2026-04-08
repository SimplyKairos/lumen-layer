# Lumen Layer

> Clarity before capital.

Lumen is an open execution fairness protocol for Solana. Every transaction gets a cryptographically verifiable receipt — SHA-256 bound to real Jito bundle execution context, anchored on-chain via Solana memo.

## What it does

- **Execution receipts** — SHA-256(txSignature || bundleId || slot), written on-chain as a Solana memo
- **Public verifier** — paste any receipt ID, get live verification, no trust in Lumen required
- **Receipt explorer** — browse and search receipts by transaction signature
- **Open schema** — canonical JSON standard at `/packages/schema/receipt-schema.json`
- **Webhook API** — per-subscription signed delivery with full delivery history
- **Reference launchpad** — every trade stamped with a Lumen receipt automatically

## How it works

1. Caller submits a transaction signature and bundle ID
2. Lumen calls `getBundleStatuses` — extracts bundle ID, slot, confirmation status
3. Computes `SHA-256(txSignature || bundleId || slot)`
4. Writes the digest on-chain as a Solana memo
5. Anyone can recompute the hash and verify it matches the memo

**Attestation levels**

- `BUNDLE_VERIFIED` — built from Jito bundle execution metadata, anchored on-chain
- `BAM_ATTESTED` — full TEE attestation digest (upgrade path ready, awaiting BAM API access)

**BAM constraint**

Public per-bundle BAM TEE attestation digests are not yet available via API. Current receipts use `getBundleStatuses` metadata: `bundleId`, `slot`, `confirmationStatus`. Receipts are issued as `BUNDLE_VERIFIED` intentionally. The schema supports a clean upgrade to `BAM_ATTESTED` when access becomes available — no changes to the core receipt contract required.

## Stack

- **Backend** — Fastify, Node.js, SQLite, TypeScript
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

```
POST /api/v1/stamp                                  — issue a receipt for a transaction
GET  /api/v1/verify/:receiptId                      — verify a receipt by ID
GET  /api/v1/receipts                               — list recent receipts
POST /api/v1/webhooks                               — register a webhook subscription
GET  /api/v1/webhooks/:subscriptionId/deliveries    — inspect delivery history
```

## License

Apache-2.0 · @LumenLayer