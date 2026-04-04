import { db } from './db'
import { buildReceipt } from './receipt'
import { verifyReceipt } from './verifier'
import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'

const server = Fastify({ logger: true })

server.register(cors, {
  origin: '*'
})

// Health check
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// PROTOCOL ROUTES
// POST /api/v1/stamp — submit a transaction for receipt generation
server.post('/api/v1/stamp', async (request, reply) => {
  const { txSignature, bundleId, slot, confirmationStatus, walletAddress } = request.body as any

  if (!txSignature || !bundleId || !slot) {
    return reply.code(400).send({ error: 'txSignature, bundleId and slot are required' })
  }

  try {
    const receipt = buildReceipt(txSignature, bundleId, slot, confirmationStatus || 'confirmed', walletAddress)

    db.prepare(`
      INSERT INTO receipts (id, tx_signature, bundle_id, slot, confirmation_status, receipt_hash, on_chain_memo, attestation_level, wallet_address, verified, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      receipt.receiptId,
      receipt.txSignature,
      receipt.bundleId,
      receipt.slot,
      receipt.confirmationStatus,
      receipt.receiptHash,
      receipt.onChainMemo,
      receipt.attestationLevel,
      receipt.walletAddress,
      receipt.verified ? 1 : 0,
      receipt.createdAt
    )

    return reply.code(201).send(receipt)
  } catch (err) {
    server.log.error(err)
    return reply.code(500).send({ error: 'Failed to create receipt' })
  }
})

// GET /api/v1/verify/:receiptId — verify a receipt
server.get('/api/v1/verify/:receiptId', async (request, reply) => {
  const { receiptId } = request.params as any

  try {
    const result = await verifyReceipt(receiptId)
    if (!result) return reply.code(404).send({ error: 'Receipt not found' })
    return reply.send(result)
  } catch (err) {
    server.log.error(err)
    return reply.code(500).send({ error: 'Verification failed' })
  }
})

// GET /api/v1/receipts — list recent receipts
server.get('/api/v1/receipts', async (request, reply) => {
  try {
    const receipts = db.prepare('SELECT * FROM receipts ORDER BY created_at DESC LIMIT 50').all()
    return reply.send({ receipts, count: receipts.length })
  } catch (err) {
    server.log.error(err)
    return reply.code(500).send({ error: 'Failed to fetch receipts' })
  }
})

// LAUNCHPAD ROUTES
// POST /api/v1/launch — create a new token launch
server.post('/api/v1/launch', async (request, reply) => {
  return reply.code(501).send({ error: 'not implemented yet' })
})

// GET /api/v1/launches — list all launches
server.get('/api/v1/launches', async (request, reply) => {
  return reply.code(501).send({ error: 'not implemented yet' })
})

// GET /api/v1/launches/:launchId — get a specific launch
server.get('/api/v1/launches/:launchId', async (request, reply) => {
  return reply.code(501).send({ error: 'not implemented yet' })
})

// CREATOR ROUTES
// GET /api/v1/creators/:walletAddress — get creator profile
server.get('/api/v1/creators/:walletAddress', async (request, reply) => {
  return reply.code(501).send({ error: 'not implemented yet' })
})

// WEBHOOK ROUTE
// POST /api/v1/webhook — webhook for external integrators
server.post('/api/v1/webhook', async (request, reply) => {
  return reply.code(501).send({ error: 'not implemented yet' })
})

// Start server
const start = async () => {
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' })
    console.log('Lumen API running on port 3001')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()