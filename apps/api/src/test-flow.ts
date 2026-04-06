import 'dotenv/config'
import { buildServer } from './server'
import type { BundleLookupResult } from './bam-service'
import type {
  AnchorReceiptHashResult,
  MemoTransactionLookupResult,
} from './memo-service'

async function testFullFlow() {
  console.log('🔵 Starting Lumen Protocol test flow...\n')
  const txSignature = `test-sig-${Date.now()}`
  const bundleId = `test-bundle-${Date.now()}`
  const mismatchTxSignature = `test-sig-mismatch-${Date.now()}`
  const mismatchBundleId = `test-bundle-mismatch-${Date.now()}`
  const memoTransactions = new Map<string, MemoTransactionLookupResult>()
  let anchorCallCount = 0

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
  })

  try {
    console.log('1. Stamping a transaction...')
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

    console.log('✅ Receipt issued:', receipt.receiptId)
    console.log('   Hash:', receipt.receiptHash)
    console.log('   Level:', receipt.attestationLevel)
    console.log()

    console.log('2. Re-stamping to confirm idempotency...')
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

    console.log('✅ Duplicate stamp returned existing receipt')
    console.log()

    console.log('3. Verifying anchored receipt...')
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

    console.log('4. Stamping mismatch fixture...')
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

    console.log('5. Verifying mismatch status...')
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

    console.log('6. Fetching receipts list...')
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
