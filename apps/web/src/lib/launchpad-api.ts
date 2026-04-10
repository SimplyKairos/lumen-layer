export type LaunchStatus = 'pending' | 'configured' | 'live'
export type AlphaVaultMode = 'FCFS' | 'PRORATA'

export interface LumenLaunch {
  launchId: string
  tokenName: string
  tokenSymbol: string
  tokenMint: string | null
  creatorWallet: string
  description: string | null
  imageUrl: string | null
  liquidityLocked: boolean
  lockDurationDays: number
  maxWalletCap: number | null
  launchWindowSeconds: number
  status: LaunchStatus
  alphaVaultMode: AlphaVaultMode
  alphaVaultAddress: string | null
  alphaVaultActivationAt: number | null
  dbcConfigAddress: string | null
  dbcPoolAddress: string | null
  activatedAt: number | null
  createdAt: number
  launchedAt: number | null
}

export interface LaunchListResponse {
  launches: LumenLaunch[]
  count: number
}

export interface CreateLaunchInput {
  tokenName: string
  tokenSymbol: string
  creatorWallet: string
  launchWindowSeconds: number
  alphaVaultMode: AlphaVaultMode
  description?: string | null
  imageUrl?: string | null
  maxWalletCap?: number | null
  liquidityLocked?: boolean
  lockDurationDays?: number | null
}

export interface CreatorRecentLaunch {
  launchId: string
  tokenName: string
  status: LaunchStatus
  createdAt: number
  launchWindowSeconds: number
}

export interface CreatorProfile {
  walletAddress: string
  displayName: string | null
  twitterHandle: string | null
  verified: boolean
  launchCount: number
  receiptCount: number
  successfulLaunches: number
  reputationScore: number
  recentLaunches: CreatorRecentLaunch[]
}

interface ApiErrorPayload {
  error?: string
}

const defaultLaunchpadError =
  "We couldn't load this launch surface right now. Refresh the page or return to the active launches list and try again."

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : window.location.origin)
}

async function fetchLaunchpadJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, init)

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

export function fetchLaunches() {
  return fetchLaunchpadJson<LaunchListResponse>('/api/v1/launches')
}

export function fetchLaunch(launchId: string) {
  return fetchLaunchpadJson<LumenLaunch>(`/api/v1/launches/${encodeURIComponent(launchId)}`)
}

export function createLaunch(input: CreateLaunchInput) {
  return fetchLaunchpadJson<LumenLaunch>('/api/v1/launch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
}

export function fetchCreatorProfile(walletAddress: string) {
  return fetchLaunchpadJson<CreatorProfile>(
    `/api/v1/creators/${encodeURIComponent(walletAddress)}`
  )
}

export function buildLaunchHref(launchId: string) {
  return `/launches/${encodeURIComponent(launchId)}`
}

export function buildCreatorHref(walletAddress: string) {
  return `/creators/${encodeURIComponent(walletAddress)}`
}

export function normalizeLaunchpadError(
  error: unknown,
  fallback = defaultLaunchpadError,
  preferApiMessage = false
) {
  const apiMessage = error instanceof Error ? error.message.trim() : ''

  if (preferApiMessage && apiMessage) {
    return apiMessage
  }

  return fallback
}
