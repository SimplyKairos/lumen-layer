import { db } from './db'
import {
  getReceiptInsertParams,
  mapReceiptRowToReceipt,
  receiptListSchema,
  receiptSchema,
  type ReceiptRow,
} from './receipt'
import { verifyReceipt, verificationResultSchema } from './verifier'
import { createStampedReceipt, type StampServiceDependencies } from './stamp-service'
import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'

const stampBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['txSignature', 'bundleId'],
  properties: {
    txSignature: { type: 'string', minLength: 1 },
    bundleId: { type: 'string', minLength: 1 },
    walletAddress: { type: ['string', 'null'] },
  },
} as const

const receiptIdParamsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['receiptId'],
  properties: {
    receiptId: { type: 'string', minLength: 1 },
  },
} as const

const apiErrorSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['error'],
  properties: {
    error: { type: 'string' },
    retryable: { type: 'boolean' },
  },
} as const

function isUniqueTxConstraintError(err: unknown) {
  return err instanceof Error && err.message.includes('receipts.tx_signature')
}

export interface BuildServerDependencies extends StampServiceDependencies {}

export function buildServer(deps: BuildServerDependencies = {}) {
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
  server.post('/api/v1/stamp', {
    schema: {
      body: stampBodySchema,
      response: {
        200: receiptSchema,
        201: receiptSchema,
        400: apiErrorSchema,
        422: apiErrorSchema,
        503: apiErrorSchema,
        500: apiErrorSchema,
      },
    },
  }, async (request, reply) => {
    const { txSignature, bundleId, walletAddress } = request.body as {
      txSignature: string
      bundleId: string
      walletAddress?: string | null
    }

    try {
      const existingReceipt = db.prepare(
        'SELECT * FROM receipts WHERE tx_signature = ?'
      ).get(txSignature) as ReceiptRow | undefined

      if (existingReceipt) {
        return reply.code(200).send(mapReceiptRowToReceipt(existingReceipt))
      }

      const stampResult = await createStampedReceipt({
        txSignature,
        bundleId,
        walletAddress,
      }, deps)

      if ('statusCode' in stampResult) {
        return reply.code(stampResult.statusCode).send({
          error: stampResult.error,
          retryable: stampResult.retryable,
        })
      }

      db.prepare(`
        INSERT INTO receipts (id, tx_signature, bundle_id, slot, confirmation_status, receipt_hash, on_chain_memo, attestation_level, wallet_address, verified, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(...getReceiptInsertParams(stampResult.receipt))

      return reply.code(201).send(stampResult.receipt)
    } catch (err) {
      if (isUniqueTxConstraintError(err)) {
        const existingReceipt = db.prepare(
          'SELECT * FROM receipts WHERE tx_signature = ?'
        ).get(txSignature) as ReceiptRow | undefined

        if (existingReceipt) {
          return reply.code(200).send(mapReceiptRowToReceipt(existingReceipt))
        }
      }

      server.log.error(err)
      return reply.code(500).send({ error: 'Failed to create receipt' })
    }
  })

  // GET /api/v1/verify/:receiptId — verify a receipt
  server.get('/api/v1/verify/:receiptId', {
    schema: {
      params: receiptIdParamsSchema,
      response: {
        200: verificationResultSchema,
        404: apiErrorSchema,
        500: apiErrorSchema,
      },
    },
  }, async (request, reply) => {
    const { receiptId } = request.params as { receiptId: string }

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
  server.get('/api/v1/receipts', {
    schema: {
      response: {
        200: receiptListSchema,
        500: apiErrorSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const receipts = db.prepare(
        'SELECT * FROM receipts ORDER BY created_at DESC LIMIT 50'
      ).all() as ReceiptRow[]

      return reply.send({
        receipts: receipts.map(mapReceiptRowToReceipt),
        count: receipts.length,
      })
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

  return server
}

// Start server
export const start = async () => {
  const server = buildServer()

  try {
    await server.listen({ port: 3001, host: '0.0.0.0' })
    console.log('Lumen API running on port 3001')
    return server
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

if (require.main === module) {
  start()
}
