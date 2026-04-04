import 'dotenv/config'
import { Connection } from '@solana/web3.js'

const RPC_URL = process.env.SOLANA_NETWORK === 'devnet'
  ? process.env.HELIUS_RPC_DEVNET!
  : process.env.HELIUS_RPC_MAINNET!

export const connection = new Connection(RPC_URL, 'confirmed')

const JITO_URL = process.env.JITO_BLOCK_ENGINE_URL || 'https://mainnet.block-engine.jito.wtf'

export interface BundleData {
  bundleId: string
  slot: number
  confirmationStatus: string
  transactions: string[]
}

export async function getBundleData(bundleId: string): Promise<BundleData | null> {
  try {
    const response = await fetch(`${JITO_URL}/api/v1/bundles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBundleStatuses',
        params: [[bundleId]],
      }),
    })

    const json = await response.json() as any

    if (json.error) {
      console.error('Jito error:', json.error)
      return null
    }

    const result = json?.result?.value?.[0]
    if (!result) return null

    return {
      bundleId: result.bundle_id,
      slot: result.slot,
      confirmationStatus: result.confirmation_status,
      transactions: result.transactions,
    }
  } catch (err) {
    console.error('getBundleData error:', err)
    return null
  }
}

export async function submitBundle(transactions: string[]): Promise<string | null> {
  try {
    const response = await fetch(`${JITO_URL}/api/v1/bundles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sendBundle',
        params: [transactions],
      }),
    })

    const json = await response.json() as any
    if (json.error) {
      console.error('Jito submit error:', json.error)
      return null
    }

    return json.result
  } catch (err) {
    console.error('submitBundle error:', err)
    return null
  }
}