import 'dotenv/config'
import { buildServer } from './server'
import type { BundleLookupResult } from './bam-service'

async function testFullFlow() {
  console.log('🔵 Starting Lumen Protocol test flow...\n')
  const txSignature = `test-sig-${Date.now()}`
  const bundleId = `test-bundle-${Date.now()}`

  const app = buildServer({
    getBundleData: async (requestedBundleId): Promise<BundleLookupResult> => ({
      status: 'ok',
      data: {
        bundleId: requestedBundleId,
        slot: 324901882,
        confirmationStatus: 'confirmed',
        transactions: [txSignature],
      },
    }),
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

    if (stampRes.statusCode !== 201 || !receipt.receiptId) {
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

    console.log('3. Verifying receipt...')
    const verifyRes = await app.inject({
      method: 'GET',
      url: `/api/v1/verify/${receipt.receiptId}`,
    })
    const verification = verifyRes.json() as any

    if (verifyRes.statusCode !== 200 || verification.hashMatches !== true || verification.verified !== false) {
      console.error('❌ Verification failed:', verification)
      process.exit(1)
    }

    console.log('✅ Hash matches:', verification.hashMatches)
    console.log('✅ Verified flag remains:', verification.verified)
    console.log()

    console.log('4. Fetching receipts list...')
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
