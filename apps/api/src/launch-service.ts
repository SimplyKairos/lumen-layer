import { v4 as uuidv4 } from 'uuid'
import { db } from './db'
import {
  mapLaunchRowToLaunch,
  type LaunchCreateBody,
  type LaunchListResponse,
  type LaunchRow,
  type LumenLaunch,
} from './launch'
import {
  provisionAlphaVaultLinkage,
  type AlphaVaultServiceDependencies,
} from './alpha-vault-service'

const LIST_LAUNCHES_LIMIT = 50

export interface LaunchServiceDependencies extends AlphaVaultServiceDependencies {}

function upsertCreator(walletAddress: string, timestamp: number) {
  db.prepare(`
    INSERT INTO creators (
      wallet_address,
      total_launches,
      created_at,
      last_active
    ) VALUES (?, ?, ?, ?)
    ON CONFLICT(wallet_address) DO UPDATE SET
      total_launches = total_launches + 1,
      last_active = excluded.last_active
  `).run(walletAddress, 1, timestamp, timestamp)
}

export async function createLaunch(
  input: LaunchCreateBody,
  deps: LaunchServiceDependencies = {}
): Promise<LumenLaunch> {
  const launchId = uuidv4()
  const createdAt = Date.now()
  const alphaVault = await provisionAlphaVaultLinkage(
    {
      ...input,
      launchId,
    },
    deps
  )

  const row = db.transaction(() => {
    db.prepare(`
      INSERT INTO launches (
        id,
        token_name,
        token_symbol,
        token_mint,
        creator_wallet,
        description,
        image_url,
        liquidity_locked,
        lock_duration_days,
        max_wallet_cap,
        launch_window_seconds,
        status,
        bundler_alerts,
        holder_count,
        alpha_vault_address,
        alpha_vault_mode,
        alpha_vault_activation_at,
        dbc_config_address,
        dbc_pool_address,
        activated_at,
        created_at,
        launched_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      launchId,
      input.tokenName,
      input.tokenSymbol,
      null,
      input.creatorWallet,
      input.description ?? null,
      input.imageUrl ?? null,
      input.liquidityLocked ? 1 : 0,
      input.lockDurationDays ?? 0,
      input.maxWalletCap ?? null,
      input.launchWindowSeconds,
      'configured',
      0,
      0,
      alphaVault.alphaVaultAddress,
      alphaVault.alphaVaultMode,
      alphaVault.activationAt,
      null,
      null,
      null,
      createdAt,
      null
    )

    upsertCreator(input.creatorWallet, createdAt)

    return db.prepare(
      'SELECT * FROM launches WHERE id = ?'
    ).get(launchId) as LaunchRow | undefined
  })()

  if (!row) {
    throw new Error('launch_not_persisted')
  }

  return mapLaunchRowToLaunch(row)
}

export function listLaunches(): LaunchListResponse {
  const rows = db.prepare(`
    SELECT *
    FROM launches
    ORDER BY created_at DESC
    LIMIT ?
  `).all(LIST_LAUNCHES_LIMIT) as LaunchRow[]

  return {
    launches: rows.map(mapLaunchRowToLaunch),
    count: rows.length,
  }
}

export function getLaunchById(launchId: string): LumenLaunch | null {
  const row = db.prepare(
    'SELECT * FROM launches WHERE id = ?'
  ).get(launchId) as LaunchRow | undefined

  return row ? mapLaunchRowToLaunch(row) : null
}
