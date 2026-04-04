import { db } from './db'
import { computeReceiptHash } from './receipt'

export interface VerificationResult {
  verified: boolean
  receiptId: string
  txSignature: string
  bundleId: string
  slot: number
  confirmationStatus: string
  attestationLevel: string
  onChainMemo: string | null
  createdAt: number
  error?: string
}

// Verify a receipt by ID
export async function verifyReceipt(receiptId: string): Promise<VerificationResult | null> {
  const receipt = db.prepare('SELECT * FROM receipts WHERE id = ?').get(receiptId) as any

  if (!receipt) return null

  // Recompute hash and verify it matches
  const recomputedHash = computeReceiptHash(
    receipt.tx_signature,
    receipt.bundle_id,
    receipt.slot
  )

  const verified = recomputedHash === receipt.receipt_hash

  return {
    verified,
    receiptId: receipt.id,
    txSignature: receipt.tx_signature,
    bundleId: receipt.bundle_id,
    slot: receipt.slot,
    confirmationStatus: receipt.confirmation_status,
    attestationLevel: receipt.attestation_level,
    onChainMemo: receipt.on_chain_memo,
    createdAt: receipt.created_at,
  }
}