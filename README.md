# Lumen Layer

> Clarity before capital.

Lumen is an open execution fairness protocol for Solana. Every transaction routed through Lumen receives a BAM-attested receipt — a cryptographic proof of fair execution, permanently anchored on-chain via Solana memo.

Built on Jito BAM's Trusted Execution Environment attestations, Lumen standardizes what fairness means at the execution layer and makes it verifiable by anyone, forever.

## What it does

- **Execution receipts** — SHA-256 binding of transaction signature + BAM TEE attestation digest, written on-chain
- **Public verifier** — anyone can verify any receipt in real time, no trust in Lumen required
- **Open schema** — canonical JSON receipt standard any wallet, launchpad, or custodian can integrate
- **Webhook API** — one-line integration for external platforms
- **Reference launchpad** — fair-launch token launchpad that runs entirely on the Lumen protocol

## How it works

1. Transaction is submitted through Jito BAM block engine
2. Lumen fetches the TEE attestation digest for the bundle
3. SHA-256(txSignature || bamAttestationDigest) is computed
4. Hash is written on-chain as a Solana memo — immutable and permissionless
5. Anyone can replay and verify via the public verifier

## Stack

- **Backend** — Fastify, Node.js, SQLite
- **Frontend** — React, Vite, Tailwind CSS v4
- **Blockchain** — Solana, Jito BAM SDK, Helius RPC, @solana/web3.js
- **Deployment** — Vercel, DigitalOcean

## Getting started

git clone https://github.com/SimplyKairos/lumen-layer
cd lumen-layer

Frontend
cd apps/web && npm install && npm run dev

Backend
cd apps/api && npm install && npm run dev

## API

POST /api/v1/stamp        — submit a transaction for receipt generation
GET  /api/v1/verify/:id   — verify a receipt by ID
GET  /api/v1/receipts     — list recent receipts

## Receipt Schema

See /packages/schema/receipt-schema.json for the full open schema.

## License

Apache-2.0 — open for anyone to integrate, fork, or build on.

Built for the Colosseum Frontier Hackathon 2026 · @LumenLayer