import { buildReceipt, type LumenReceipt } from './receipt'
import { getBundleData, type BundleLookupResult } from './bam-service'

export interface StampRequestInput {
  txSignature: string
  bundleId: string
  walletAddress?: string | null
}

export interface StampServiceDependencies {
  getBundleData?: (bundleId: string) => Promise<BundleLookupResult>
}

export type StampResult =
  | {
      ok: true
      receipt: LumenReceipt
    }
  | {
      ok: false
      statusCode: 503 | 422
      error: 'bundle_status_unavailable' | 'tx_signature_not_in_bundle'
      retryable: boolean
    }

export async function createStampedReceipt(
  input: StampRequestInput,
  deps: StampServiceDependencies = {}
): Promise<StampResult> {
  const bundleLookup = await (deps.getBundleData ?? getBundleData)(input.bundleId)

  if (bundleLookup.status !== 'ok') {
    return {
      ok: false,
      statusCode: 503,
      error: 'bundle_status_unavailable',
      retryable: true,
    }
  }

  if (!bundleLookup.data.transactions.includes(input.txSignature)) {
    return {
      ok: false,
      statusCode: 422,
      error: 'tx_signature_not_in_bundle',
      retryable: false,
    }
  }

  return {
    ok: true,
    receipt: buildReceipt(
      input.txSignature,
      bundleLookup.data.bundleId,
      bundleLookup.data.slot,
      bundleLookup.data.confirmationStatus,
      input.walletAddress ?? undefined
    ),
  }
}
