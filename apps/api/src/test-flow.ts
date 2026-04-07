import 'dotenv/config'
import { db } from './db'
import { buildServer } from './server'
import type { BundleLookupResult } from './bam-service'
import type {
  AnchorReceiptHashResult,
  MemoTransactionLookupResult,
} from './memo-service'
import type { WebhookSendRequest } from './webhook-service'

const receiptFieldKeys = [
  'receiptId',
  'txSignature',
  'bundleId',
  'slot',
  'confirmationStatus',
  'receiptHash',
  'onChainMemo',
  'attestationLevel',
  'walletAddress',
  'verified',
  'createdAt',
] as const

async function testFullFlow() {
  console.log('🔵 Starting Lumen Protocol test flow...\n')
  const txSignature = `test-sig-${Date.now()}`
  const bundleId = `test-bundle-${Date.now()}`
  const mismatchTxSignature = `test-sig-mismatch-${Date.now()}`
  const mismatchBundleId = `test-bundle-mismatch-${Date.now()}`
  const memoTransactions = new Map<string, MemoTransactionLookupResult>()
  const sentWebhookRequests: WebhookSendRequest[] = []
  let anchorCallCount = 0

  db.prepare('DELETE FROM webhook_deliveries').run()
  db.prepare('DELETE FROM webhook_subscriptions').run()

  const app = buildServer({
    getBundleData: async (requestedBundleId): Promise<BundleLookupResult> => ({
      status: 'ok',
      data: {
        bundleId: requestedBundleId,
        slot: 324901882,
        confirmationStatus: 'confirmed',
        transactions: [txSignature, mismatchTxSignature],
      },
    }),
    anchorReceiptHash: async (receiptHash): Promise<AnchorReceiptHashResult> => {
      anchorCallCount += 1
      const memoSignature = `memo-sig-${anchorCallCount}`
      const memoText = anchorCallCount === 1 ? receiptHash : `mismatch-${receiptHash}`

      memoTransactions.set(memoSignature, {
        status: 'ok',
        data: {
          signature: memoSignature,
          memoText,
          slot: 324901882,
        },
      })

      return {
        ok: true,
        memoSignature,
      }
    },
    getMemoTransactionData: async (signature): Promise<MemoTransactionLookupResult> => {
      return memoTransactions.get(signature) ?? { status: 'not_found' }
    },
    sendWebhookRequest: async (request) => {
      sentWebhookRequests.push(request)

      if (request.url.includes('/failure')) {
        return {
          ok: false,
          responseStatus: 500,
          errorMessage: 'receiver_status_500',
        }
      }

      return {
        ok: true,
        responseStatus: 202,
      }
    },
  })

  try {
    console.log('1. Creating webhook subscriptions...')
    const successSubscriptionRes = await app.inject({
      method: 'POST',
      url: '/api/v1/webhooks',
      payload: {
        targetUrl: 'https://integrator.test/success',
      },
    })
    const successSubscriptionPayload = successSubscriptionRes.json() as any

    if (
      successSubscriptionRes.statusCode !== 201 ||
      !successSubscriptionPayload.signingSecret ||
      successSubscriptionPayload.subscription?.signingSecretMasked == null ||
      successSubscriptionPayload.subscription.signingSecretMasked === successSubscriptionPayload.signingSecret
    ) {
      console.error('❌ Success subscription failed:', successSubscriptionPayload)
      process.exit(1)
    }

    const successSubscriptionId = successSubscriptionPayload.subscription.subscriptionId
    const successSigningSecret = successSubscriptionPayload.signingSecret

    const failureSubscriptionRes = await app.inject({
      method: 'POST',
      url: '/api/v1/webhooks',
      payload: {
        targetUrl: 'https://integrator.test/failure',
      },
    })
    const failureSubscriptionPayload = failureSubscriptionRes.json() as any

    if (
      failureSubscriptionRes.statusCode !== 201 ||
      !failureSubscriptionPayload.signingSecret ||
      failureSubscriptionPayload.subscription?.signingSecretMasked == null ||
      failureSubscriptionPayload.subscription.signingSecretMasked === failureSubscriptionPayload.signingSecret
    ) {
      console.error('❌ Failure subscription failed:', failureSubscriptionPayload)
      process.exit(1)
    }

    const failureSubscriptionId = failureSubscriptionPayload.subscription.subscriptionId

    console.log('✅ Webhook subscriptions created')
    console.log()

    console.log('2. Stamping a transaction...')
    const deliveryOffset = sentWebhookRequests.length
    const stampRes = await app.inject({
      method: 'POST',
      url: '/api/v1/stamp',
      payload: {
        txSignature,
        bundleId,
        walletAddress: 'TestWallet123',
      },
    })

    const receipt = stampRes.json() as any

    if (stampRes.statusCode !== 201 || !receipt.receiptId || !receipt.onChainMemo) {
      console.error('❌ Stamp failed:', receipt)
      process.exit(1)
    }

    const primaryDeliveries = sentWebhookRequests.slice(deliveryOffset)
    const successDelivery = primaryDeliveries.find(request => request.url.includes('/success'))
    const failureDelivery = primaryDeliveries.find(request => request.url.includes('/failure'))

    console.log('✅ Receipt issued:', receipt.receiptId)
    console.log('   Hash:', receipt.receiptHash)
    console.log('   Level:', receipt.attestationLevel)
    console.log()

    if (
      primaryDeliveries.length !== 2 ||
      !successDelivery ||
      !failureDelivery ||
      successDelivery.headers['x-lumen-event-type'] !== 'receipt.issued' ||
      !successDelivery.headers['x-lumen-signature'] ||
      !successDelivery.headers['x-lumen-signature'].startsWith('sha256=') ||
      !successDelivery.headers['x-lumen-timestamp']
    ) {
      console.error('❌ Webhook delivery contract failed:', primaryDeliveries)
      process.exit(1)
    }

    const successEvent = JSON.parse(successDelivery.body) as any

    if (successEvent.eventType !== 'receipt.issued' || !successEvent.eventId || !successEvent.receipt) {
      console.error('❌ Webhook event envelope failed:', successEvent)
      process.exit(1)
    }

    const receiptMatches = receiptFieldKeys.every(
      key => successEvent.receipt[key] === receipt[key]
    )

    if (!receiptMatches) {
      console.error('❌ Nested webhook receipt drift detected:', successEvent.receipt, receipt)
      process.exit(1)
    }

    console.log('✅ receipt.issued delivery captured with canonical nested receipt')
    console.log()

    console.log('3. Re-stamping to confirm idempotency...')
    const duplicateRes = await app.inject({
      method: 'POST',
      url: '/api/v1/stamp',
      payload: {
        txSignature,
        bundleId,
        walletAddress: 'TestWallet123',
      },
    })
    const duplicateReceipt = duplicateRes.json() as any

    if (duplicateRes.statusCode !== 200 || duplicateReceipt.receiptId !== receipt.receiptId) {
      console.error('❌ Duplicate stamp failed:', duplicateReceipt)
      process.exit(1)
    }

    if (sentWebhookRequests.length !== deliveryOffset + 2) {
      console.error('❌ Duplicate stamp unexpectedly triggered new webhooks')
      process.exit(1)
    }

    console.log('✅ Duplicate stamp returned existing receipt')
    console.log()

    console.log('4. Verifying anchored receipt...')
    const verifyRes = await app.inject({
      method: 'GET',
      url: `/api/v1/verify/${receipt.receiptId}`,
    })
    const verification = verifyRes.json() as any

    if (
      verifyRes.statusCode !== 200 ||
      verification.hashMatches !== true ||
      verification.memoMatches !== true ||
      verification.verificationStatus !== 'VERIFIED' ||
      verification.verified !== true
    ) {
      console.error('❌ Verification failed:', verification)
      process.exit(1)
    }

    console.log('✅ Verification status:', verification.verificationStatus)
    console.log('✅ Hash matches:', verification.hashMatches)
    console.log('✅ Verified flag:', verification.verified)
    console.log()

    console.log('5. Inspecting webhook delivery history...')
    const successHistoryRes = await app.inject({
      method: 'GET',
      url: `/api/v1/webhooks/${successSubscriptionId}/deliveries`,
    })
    const successHistory = successHistoryRes.json() as any

    if (
      successHistoryRes.statusCode !== 200 ||
      successHistory.subscription.subscriptionId !== successSubscriptionId ||
      successHistory.subscription.signingSecretMasked !== successSubscriptionPayload.subscription.signingSecretMasked ||
      successHistory.subscription.signingSecretMasked === successSigningSecret ||
      !successHistory.deliveries.some((delivery: any) => delivery.status === 'delivered')
    ) {
      console.error('❌ Success delivery history failed:', successHistory)
      process.exit(1)
    }

    const failureHistoryRes = await app.inject({
      method: 'GET',
      url: `/api/v1/webhooks/${failureSubscriptionId}/deliveries`,
    })
    const failureHistory = failureHistoryRes.json() as any

    if (
      failureHistoryRes.statusCode !== 200 ||
      failureHistory.subscription.subscriptionId !== failureSubscriptionId ||
      !failureHistory.deliveries.some((delivery: any) => delivery.status === 'failed')
    ) {
      console.error('❌ Failure delivery history failed:', failureHistory)
      process.exit(1)
    }

    console.log('✅ Delivery history shows delivered and failed webhook states')
    console.log()

    console.log('6. Stamping mismatch fixture...')
    const mismatchStampRes = await app.inject({
      method: 'POST',
      url: '/api/v1/stamp',
      payload: {
        txSignature: mismatchTxSignature,
        bundleId: mismatchBundleId,
        walletAddress: 'TestWallet456',
      },
    })
    const mismatchReceipt = mismatchStampRes.json() as any

    if (mismatchStampRes.statusCode !== 201 || !mismatchReceipt.receiptId || !mismatchReceipt.onChainMemo) {
      console.error('❌ Mismatch stamp failed:', mismatchReceipt)
      process.exit(1)
    }

    console.log('✅ Mismatch receipt issued:', mismatchReceipt.receiptId)
    console.log()

    console.log('7. Verifying mismatch status...')
    const mismatchVerifyRes = await app.inject({
      method: 'GET',
      url: `/api/v1/verify/${mismatchReceipt.receiptId}`,
    })
    const mismatchVerification = mismatchVerifyRes.json() as any

    if (
      mismatchVerifyRes.statusCode !== 200 ||
      mismatchVerification.hashMatches !== true ||
      mismatchVerification.memoMatches !== false ||
      mismatchVerification.verificationStatus !== 'MEMO_MISMATCH' ||
      mismatchVerification.verified !== false
    ) {
      console.error('❌ Mismatch verification failed:', mismatchVerification)
      process.exit(1)
    }

    console.log('✅ Mismatch status:', mismatchVerification.verificationStatus)
    console.log()

    console.log('8. Fetching receipts list...')
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/receipts',
    })
    const list = listRes.json() as any
    const listedReceipt = list.receipts.find((item: any) => item.receiptId === receipt.receiptId)

    if (
      listRes.statusCode !== 200 ||
      !listedReceipt ||
      listedReceipt.createdAt == null ||
      listedReceipt.walletAddress !== 'TestWallet123' ||
      listedReceipt.onChainMemo == null ||
      'tx_signature' in listedReceipt ||
      'created_at' in listedReceipt
    ) {
      console.error('❌ Receipts list failed:', list)
      process.exit(1)
    }

    console.log(`✅ Found ${list.count} receipts in DB`)
    console.log()

    console.log('🟢 All tests passed. Lumen Protocol is working.\n')
  } finally {
    await app.close()
  }
}

testFullFlow().catch(err => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})
