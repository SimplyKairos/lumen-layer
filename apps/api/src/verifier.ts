import { db } from './db'
import {
  computeReceiptHash,
  mapReceiptRowToReceipt,
  type ReceiptRow,
  receiptSchema,
} from './receipt'

export interface VerificationResult {
  verified: boolean
  hashMatches: boolean
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

export const verificationResultSchema = {
  type: 'object',
  additionalProperties: false,
  required: [...receiptSchema.required, 'hashMatches'],
  properties: {
    ...receiptSchema.properties,
    hashMatches: { type: 'boolean' },
    error: { type: 'string' },
  },
} as const

// Verify a receipt by ID
export async function verifyReceipt(receiptId: string): Promise<VerificationResult | null> {
  const receipt = db.prepare('SELECT * FROM receipts WHERE id = ?').get(receiptId) as ReceiptRow | undefined

  if (!receipt) return null

  const recomputedHash = computeReceiptHash(
    receipt.tx_signature,
    receipt.bundle_id,
    receipt.slot
  )

  const hashMatches = recomputedHash === receipt.receipt_hash
  const mappedReceipt = mapReceiptRowToReceipt(receipt)

  return {
    ...mappedReceipt,
    verified: false,
    hashMatches,
    ...(hashMatches ? {} : { error: 'receipt_hash_mismatch' }),
  }
}
