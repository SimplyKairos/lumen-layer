import 'dotenv/config'
import { Connection } from '@solana/web3.js'

const RPC_URL = process.env.SOLANA_NETWORK === 'devnet'
  ? process.env.HELIUS_RPC_DEVNET!
  : process.env.HELIUS_RPC_MAINNET!

export const connection = new Connection(RPC_URL, 'confirmed')

export interface BundleData {
  bundleId: string
  slot: number
  confirmationStatus: string
  transactions: string[]
}

// Fetch bundle status from Jito block engine
export async function getBundleData(bundleId: string): Promise<BundleData | null> {
  // TODO Week 1 — call getBundleStatuses via jito-ts
  return null
}

// Submit a transaction as a Jito bundle
export async function submitBundle(transactions: string[]): Promise<string | null> {
  // TODO Week 1 — submit bundle via jito-ts
  return null
}