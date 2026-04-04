import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'

export interface LumenReceipt {
  receiptId: string
  txSignature: string
  bundleId: string
  slot: number
  confirmationStatus: string
  receiptHash: string
  onChainMemo: string | null
  attestationLevel: 'BUNDLE_VERIFIED' | 'BAM_ATTESTED'
  walletAddress: string | null
  verified: boolean
  createdAt: number
}

// Compute SHA-256 hash of tx signature + bundle data
export function computeReceiptHash(
  txSignature: string,
  bundleId: string,
  slot: number
): string {
  return crypto
    .createHash('sha256')
    .update(`${txSignature}${bundleId}${slot}`)
    .digest('hex')
}

// Build a receipt object
export function buildReceipt(
  txSignature: string,
  bundleId: string,
  slot: number,
  confirmationStatus: string,
  walletAddress?: string
): LumenReceipt {
  const receiptHash = computeReceiptHash(txSignature, bundleId, slot)

  return {
    receiptId: uuidv4(),
    txSignature,
    bundleId,
    slot,
    confirmationStatus,
    receiptHash,
    onChainMemo: null,
    attestationLevel: 'BUNDLE_VERIFIED',
    walletAddress: walletAddress || null,
    verified: true,
    createdAt: Date.now(),
  }
}