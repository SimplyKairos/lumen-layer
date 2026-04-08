import { db } from './db'
import {
  getReceiptInsertParams,
  mapReceiptRowToReceipt,
  receiptListSchema,
  receiptSchema,
  type ReceiptRow,
} from './receipt'
import {
  verifyReceipt,
  verificationResultSchema,
  type VerificationDependencies,
} from './verifier'
import { createStampedReceipt, type StampServiceDependencies } from './stamp-service'
import {
  createWebhookSubscription,
  deliverReceiptIssuedEvent,
  getWebhookSubscription,
  listWebhookDeliveries,
  type WebhookServiceDependencies,
} from './webhook-service'
import {
  webhookCreateResponseSchema,
  webhookDeliveryListSchema,
  webhookSubscriptionCreateBodySchema,
  webhookSubscriptionParamsSchema,
} from './webhook'
import {
  createLaunch,
  getLaunchById,
  listLaunches,
  type LaunchServiceDependencies,
} from './launch-service'
import {
  launchCreateBodySchema,
  launchListSchema,
  launchParamsSchema,
  launchSchema,
  type LaunchCreateBody,
} from './launch'
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

const stampErrorCodes = [
  'bundle_status_unavailable',
  'tx_signature_not_in_bundle',
  'anchor_signer_unavailable',
  'memo_anchor_failed',
] as const

const stampErrorSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['error'],
  properties: {
    error: { type: 'string', enum: [...stampErrorCodes] },
    retryable: { type: 'boolean' },
  },
} as const

function isUniqueTxConstraintError(err: unknown) {
  return err instanceof Error && err.message.includes('receipts.tx_signature')
}

export interface BuildServerDependencies
  extends
    StampServiceDependencies,
    VerificationDependencies,
    WebhookServiceDependencies,
    LaunchServiceDependencies {}

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
        422: stampErrorSchema,
        503: stampErrorSchema,
        500: stampErrorSchema,
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

      try {
        await deliverReceiptIssuedEvent(stampResult.receipt, deps)
      } catch (deliveryError) {
        server.log.error(
          { err: deliveryError, receiptId: stampResult.receipt.receiptId },
          'Failed to deliver receipt-issued webhooks'
        )
      }

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
      const result = await verifyReceipt(receiptId, deps)
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
  server.post('/api/v1/launch', {
    schema: {
      body: launchCreateBodySchema,
      response: {
        201: launchSchema,
        500: apiErrorSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const launch = await createLaunch(request.body as LaunchCreateBody, deps)
      return reply.code(201).send(launch)
    } catch (err) {
      server.log.error(err)
      return reply.code(500).send({ error: 'Failed to create launch' })
    }
  })

  // GET /api/v1/launches — list all launches
  server.get('/api/v1/launches', {
    schema: {
      response: {
        200: launchListSchema,
        500: apiErrorSchema,
      },
    },
  }, async (request, reply) => {
    try {
      return reply.send(listLaunches())
    } catch (err) {
      server.log.error(err)
      return reply.code(500).send({ error: 'Failed to fetch launches' })
    }
  })

  // GET /api/v1/launches/:launchId — get a specific launch
  server.get('/api/v1/launches/:launchId', {
    schema: {
      params: launchParamsSchema,
      response: {
        200: launchSchema,
        404: apiErrorSchema,
        500: apiErrorSchema,
      },
    },
  }, async (request, reply) => {
    const { launchId } = request.params as { launchId: string }

    try {
      const launch = getLaunchById(launchId)

      if (!launch) {
        return reply.code(404).send({ error: 'Launch not found' })
      }

      return reply.send(launch)
    } catch (err) {
      server.log.error(err)
      return reply.code(500).send({ error: 'Failed to fetch launch' })
    }
  })

  // CREATOR ROUTES
  // GET /api/v1/creators/:walletAddress — get creator profile
  server.get('/api/v1/creators/:walletAddress', async (request, reply) => {
    return reply.code(501).send({ error: 'not implemented yet' })
  })

  // WEBHOOK ROUTE
  // POST /api/v1/webhooks — register an external receipt-issued webhook
  server.post('/api/v1/webhooks', {
    schema: {
      body: webhookSubscriptionCreateBodySchema,
      response: {
        201: webhookCreateResponseSchema,
        400: apiErrorSchema,
        500: apiErrorSchema,
      },
    },
  }, async (request, reply) => {
    const { targetUrl, eventType } = request.body as {
      targetUrl: string
      eventType?: 'receipt.issued'
    }

    try {
      const subscription = createWebhookSubscription({
        targetUrl,
        eventType,
      })

      return reply.code(201).send(subscription)
    } catch (err) {
      if (err instanceof Error && err.message === 'invalid_webhook_target_url') {
        return reply.code(400).send({ error: 'Invalid webhook target URL' })
      }

      server.log.error(err)
      return reply.code(500).send({ error: 'Failed to create webhook subscription' })
    }
  })

  // GET /api/v1/webhooks/:subscriptionId/deliveries — inspect delivery history for one subscription
  server.get('/api/v1/webhooks/:subscriptionId/deliveries', {
    schema: {
      params: webhookSubscriptionParamsSchema,
      response: {
        200: webhookDeliveryListSchema,
        404: apiErrorSchema,
        500: apiErrorSchema,
      },
    },
  }, async (request, reply) => {
    const { subscriptionId } = request.params as { subscriptionId: string }

    try {
      const subscription = getWebhookSubscription(subscriptionId)

      if (!subscription) {
        return reply.code(404).send({ error: 'Webhook subscription not found' })
      }

      const deliveryHistory = listWebhookDeliveries(subscriptionId)

      if (!deliveryHistory) {
        return reply.code(404).send({ error: 'Webhook subscription not found' })
      }

      return reply.send(deliveryHistory)
    } catch (err) {
      server.log.error(err)
      return reply.code(500).send({ error: 'Failed to fetch webhook deliveries' })
    }
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
