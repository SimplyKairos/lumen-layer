import 'dotenv/config'

const BASE_URL = 'http://localhost:3001'

async function testFullFlow() {
  console.log('🔵 Starting Lumen Protocol test flow...\n')

  // Step 1 — Issue a receipt
  console.log('1. Stamping a transaction...')
  const stampRes = await fetch(`${BASE_URL}/api/v1/stamp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      txSignature: `test-sig-${Date.now()}`,
      bundleId: `test-bundle-${Date.now()}`,
      slot: 324901882,
      confirmationStatus: 'confirmed',
      walletAddress: 'TestWallet123',
    }),
  })

  const receipt = await stampRes.json() as any

  if (!receipt.receiptId) {
    console.error('❌ Stamp failed:', receipt)
    process.exit(1)
  }

  console.log('✅ Receipt issued:', receipt.receiptId)
  console.log('   Hash:', receipt.receiptHash)
  console.log('   Level:', receipt.attestationLevel)
  console.log()

  // Step 2 — Verify the receipt
  console.log('2. Verifying receipt...')
  const verifyRes = await fetch(`${BASE_URL}/api/v1/verify/${receipt.receiptId}`)
  const verification = await verifyRes.json() as any

  if (!verification.verified) {
    console.error('❌ Verification failed:', verification)
    process.exit(1)
  }

  console.log('✅ Verified:', verification.verified)
  console.log('   Slot:', verification.slot)
  console.log()

  // Step 3 — List receipts
  console.log('3. Fetching receipts list...')
  const listRes = await fetch(`${BASE_URL}/api/v1/receipts`)
  const list = await listRes.json() as any

  console.log(`✅ Found ${list.count} receipts in DB`)
  console.log()

  console.log('🟢 All tests passed. Lumen Protocol is working.\n')
}

testFullFlow().catch(err => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})