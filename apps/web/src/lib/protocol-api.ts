export type ReceiptAttestationLevel = 'BUNDLE_VERIFIED' | 'BAM_ATTESTED'

export type VerificationStatus =
  | 'UNANCHORED'
  | 'VERIFIED'
  | 'HASH_MISMATCH'
  | 'MEMO_MISMATCH'
  | 'ANCHOR_NOT_FOUND'
  | 'ANCHOR_LOOKUP_FAILED'

export interface ProtocolReceipt {
  receiptId: string
  txSignature: string
  bundleId: string
  slot: number
  confirmationStatus: string
  receiptHash: string
  onChainMemo: string | null
  attestationLevel: ReceiptAttestationLevel
  walletAddress: string | null
  verified: boolean
  createdAt: number
}

export interface VerificationResult extends ProtocolReceipt {
  verificationStatus: VerificationStatus
  hashMatches: boolean
  memoMatches: boolean
  error?: string
}

export interface ReceiptListItem extends ProtocolReceipt {
  verificationStatus: VerificationStatus
}

export interface ReceiptListResponse {
  receipts: ReceiptListItem[]
  count: number
}

interface ApiErrorPayload {
  error?: string
}

const defaultReceiptError =
  "We couldn't load that receipt. Check the ID and try again, or return to the recent receipts list."

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : window.location.origin)
}

async function fetchProtocolJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`)

  if (!response.ok) {
    let payload: ApiErrorPayload | null = null

    try {
      payload = await response.json() as ApiErrorPayload
    } catch {
      payload = null
    }

    throw new Error(payload?.error || `Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function fetchVerificationResult(receiptId: string) {
  return fetchProtocolJson<VerificationResult>(`/api/v1/verify/${encodeURIComponent(receiptId)}`)
}

export function fetchRecentReceipts() {
  return fetchProtocolJson<ReceiptListResponse>('/api/v1/receipts')
}

export function buildVerifyHref(receiptId: string) {
  return `/verify?receiptId=${encodeURIComponent(receiptId)}`
}

export function normalizeProtocolError(
  error: unknown,
  fallback = defaultReceiptError,
  preferApiMessage = false
) {
  const apiMessage = error instanceof Error ? error.message.trim() : ''

  if (preferApiMessage && apiMessage) {
    return apiMessage
  }

  return fallback
}
