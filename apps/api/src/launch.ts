export const alphaVaultModes = ['FCFS', 'PRORATA'] as const
export type AlphaVaultMode = (typeof alphaVaultModes)[number]

export const launchStatuses = ['pending', 'configured', 'active'] as const
export type LaunchStatus = (typeof launchStatuses)[number]

export interface LaunchCreateBody {
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

export interface LaunchRow {
  id: string
  token_name: string
  token_symbol: string
  token_mint: string | null
  creator_wallet: string
  description: string | null
  image_url: string | null
  liquidity_locked: number | boolean | null
  lock_duration_days: number | null
  max_wallet_cap: number | null
  launch_window_seconds: number
  status: LaunchStatus
  bundler_alerts: number
  holder_count: number
  alpha_vault_address: string | null
  alpha_vault_mode: AlphaVaultMode | null
  alpha_vault_activation_at: number | null
  dbc_config_address: string | null
  dbc_pool_address: string | null
  activated_at: number | null
  created_at: number
  launched_at: number | null
}

const nullableStringSchema = { type: ['string', 'null'] } as const
const nullableIntegerSchema = { type: ['integer', 'null'] } as const
const nullableNumberSchema = { type: ['number', 'null'] } as const

export const launchCreateBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'tokenName',
    'tokenSymbol',
    'creatorWallet',
    'launchWindowSeconds',
    'alphaVaultMode',
  ],
  properties: {
    tokenName: { type: 'string', minLength: 1 },
    tokenSymbol: { type: 'string', minLength: 1 },
    creatorWallet: { type: 'string', minLength: 1 },
    launchWindowSeconds: { type: 'integer', minimum: 1 },
    alphaVaultMode: { type: 'string', enum: [...alphaVaultModes] },
    description: nullableStringSchema,
    imageUrl: nullableStringSchema,
    maxWalletCap: nullableNumberSchema,
    liquidityLocked: { type: 'boolean' },
    lockDurationDays: nullableIntegerSchema,
  },
} as const

export const launchParamsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['launchId'],
  properties: {
    launchId: { type: 'string', minLength: 1 },
  },
} as const

export const launchSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'launchId',
    'tokenName',
    'tokenSymbol',
    'tokenMint',
    'creatorWallet',
    'description',
    'imageUrl',
    'liquidityLocked',
    'lockDurationDays',
    'maxWalletCap',
    'launchWindowSeconds',
    'status',
    'alphaVaultMode',
    'alphaVaultAddress',
    'alphaVaultActivationAt',
    'dbcConfigAddress',
    'dbcPoolAddress',
    'activatedAt',
    'createdAt',
    'launchedAt',
  ],
  properties: {
    launchId: { type: 'string', minLength: 1 },
    tokenName: { type: 'string', minLength: 1 },
    tokenSymbol: { type: 'string', minLength: 1 },
    tokenMint: nullableStringSchema,
    creatorWallet: { type: 'string', minLength: 1 },
    description: nullableStringSchema,
    imageUrl: nullableStringSchema,
    liquidityLocked: { type: 'boolean' },
    lockDurationDays: { type: 'integer' },
    maxWalletCap: nullableNumberSchema,
    launchWindowSeconds: { type: 'integer' },
    status: { type: 'string', enum: [...launchStatuses] },
    alphaVaultMode: { type: 'string', enum: [...alphaVaultModes] },
    alphaVaultAddress: nullableStringSchema,
    alphaVaultActivationAt: nullableIntegerSchema,
    dbcConfigAddress: nullableStringSchema,
    dbcPoolAddress: nullableStringSchema,
    activatedAt: nullableIntegerSchema,
    createdAt: { type: 'integer' },
    launchedAt: nullableIntegerSchema,
  },
} as const

export const launchListSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['launches', 'count'],
  properties: {
    launches: {
      type: 'array',
      items: launchSchema,
    },
    count: { type: 'integer' },
  },
} as const

export function mapLaunchRowToLaunch(row: LaunchRow): LumenLaunch {
  return {
    launchId: row.id,
    tokenName: row.token_name,
    tokenSymbol: row.token_symbol,
    tokenMint: row.token_mint,
    creatorWallet: row.creator_wallet,
    description: row.description,
    imageUrl: row.image_url,
    liquidityLocked: Boolean(row.liquidity_locked),
    lockDurationDays: row.lock_duration_days ?? 0,
    maxWalletCap: row.max_wallet_cap,
    launchWindowSeconds: row.launch_window_seconds,
    status: row.status ?? 'configured',
    alphaVaultMode: row.alpha_vault_mode ?? 'FCFS',
    alphaVaultAddress: row.alpha_vault_address,
    alphaVaultActivationAt: row.alpha_vault_activation_at,
    dbcConfigAddress: row.dbc_config_address,
    dbcPoolAddress: row.dbc_pool_address,
    activatedAt: row.activated_at,
    createdAt: row.created_at,
    launchedAt: row.launched_at,
  }
}
