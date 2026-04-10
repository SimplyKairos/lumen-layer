import { useEffect, useState } from 'react'
import ProtocolPageShell, { protocolPageStyles } from '../components/protocol/ProtocolPageShell'
import {
  buildCreatorHref,
  fetchCreatorProfile,
  fetchLaunch,
  normalizeLaunchpadError,
  type CreatorProfile,
  type LaunchStatus,
  type LumenLaunch,
} from '../lib/launchpad-api'
import { formatReceiptTime, formatTechnicalValue, truncateReceiptValue } from '../lib/receipt-format'

function formatProtectionWindow(seconds: number) {
  if (seconds % 3600 === 0) {
    return `${seconds / 3600} hours`
  }

  if (seconds % 60 === 0) {
    return `${seconds / 60} minutes`
  }

  return `${seconds} seconds`
}

function getLaunchStatusStyles(status: LaunchStatus) {
  if (status === 'live') {
    return {
      color: '#fff',
      background: 'rgba(27,79,216,0.18)',
      border: '0.5px solid rgba(27,79,216,0.42)',
    }
  }

  if (status === 'configured') {
    return {
      color: '#fff',
      background: 'rgba(255,255,255,0.08)',
      border: '0.5px solid rgba(255,255,255,0.12)',
    }
  }

  return {
    color: 'rgba(255,255,255,0.78)',
    background: 'rgba(209,75,100,0.14)',
    border: '0.5px solid rgba(209,75,100,0.36)',
  }
}

function LaunchStatusBadge({ status }: { status: LaunchStatus }) {
  const statusStyles = getLaunchStatusStyles(status)

  return (
    <span style={{
      ...protocolPageStyles.monoCompact,
      ...statusStyles,
      borderRadius: '999px',
      padding: '10px 14px',
      textTransform: 'uppercase',
      letterSpacing: '0.6px',
    }}>
      {status}
    </span>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gap: '8px' }}>
      <span style={protocolPageStyles.label}>{label}</span>
      <span style={protocolPageStyles.body}>{value}</span>
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: boolean | number | string | null | undefined
}) {
  return (
    <div style={{
      display: 'grid',
      gap: '8px',
      padding: '18px 0',
      borderTop: '0.5px solid rgba(255,255,255,0.08)',
    }}>
      <span style={protocolPageStyles.label}>{label}</span>
      <span style={protocolPageStyles.mono}>{formatTechnicalValue(value)}</span>
    </div>
  )
}

export default function LaunchDetailPage({ launchId }: { launchId: string }) {
  const [launch, setLaunch] = useState<LumenLaunch | null>(null)
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const viewState = loading ? 'loading' : error ? 'error' : 'success'

  useEffect(() => {
    let active = true

    async function loadLaunch() {
      setLoading(true)
      setError(null)

      try {
        const nextLaunch = await fetchLaunch(launchId)

        if (!active) {
          return
        }

        setLaunch(nextLaunch)

        try {
          const nextCreator = await fetchCreatorProfile(nextLaunch.creatorWallet)

          if (active) {
            setCreatorProfile(nextCreator)
          }
        } catch {
          if (active) {
            setCreatorProfile(null)
          }
        }
      } catch (err) {
        if (!active) {
          return
        }

        setLaunch(null)
        setCreatorProfile(null)
        setError(normalizeLaunchpadError(err))
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadLaunch()

    return () => {
      active = false
    }
  }, [launchId])

  return (
    <ProtocolPageShell>
      <section style={{
        ...protocolPageStyles.panel,
        padding: '48px',
        display: 'grid',
        gap: '24px',
      }}>
        <div style={{ display: 'grid', gap: '16px' }}>
          <span style={protocolPageStyles.eyebrow}>Launch detail</span>
          <h1 style={protocolPageStyles.displayTitle}>
            {launch ? launch.tokenName : 'Public launch detail'}
          </h1>
          <p style={{ ...protocolPageStyles.body, maxWidth: '760px' }}>
            Inspect the protection window, creator trust context, and technical launch metadata for this public launch surface.
          </p>
        </div>

        {viewState === 'loading' ? (
          <p style={protocolPageStyles.body}>Loading launch details from the protocol API.</p>
        ) : null}

        {viewState === 'error' ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            <p style={{ ...protocolPageStyles.body, maxWidth: '760px' }}>{error}</p>
            <a href="/launches" style={protocolPageStyles.link}>Return to the active launches list</a>
          </div>
        ) : null}

        {viewState === 'success' && launch ? (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'grid', gap: '10px' }}>
                <span style={protocolPageStyles.monoCompact}>{launch.tokenSymbol}</span>
                <a href={buildCreatorHref(launch.creatorWallet)} style={protocolPageStyles.link}>
                  Creator {truncateReceiptValue(launch.creatorWallet)}
                </a>
              </div>

              <LaunchStatusBadge status={launch.status} />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
            }}>
              <SummaryItem
                label="Protection window"
                value={formatProtectionWindow(launch.launchWindowSeconds)}
              />
              <SummaryItem
                label="Trust context"
                value={
                  launch.status === 'live'
                    ? 'Live trades now issue canonical Lumen receipts through the public receipt pipeline.'
                    : 'This launch is pre-live. The protection surface is configured, and receipts begin once trading is active.'
                }
              />
              <SummaryItem
                label="Alpha Vault"
                value={`${launch.alphaVaultMode} linkage ${launch.alphaVaultAddress ? 'configured' : 'pending'}`}
              />
            </div>
          </div>
        ) : null}
      </section>

      {viewState === 'success' && launch ? (
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          <div style={{ ...protocolPageStyles.panel, padding: '32px' }}>
            <h2 style={{ ...protocolPageStyles.sectionTitle, marginBottom: '16px' }}>
              Launch configuration and fairness context
            </h2>
            <DetailRow label="launchWindowSeconds" value={launch.launchWindowSeconds} />
            <DetailRow label="alphaVaultMode" value={launch.alphaVaultMode} />
            <DetailRow label="liquidityLocked" value={launch.liquidityLocked} />
            <DetailRow label="lockDurationDays" value={launch.lockDurationDays} />
            <DetailRow label="maxWalletCap" value={launch.maxWalletCap} />
            <DetailRow label="description" value={launch.description} />
          </div>

          <div style={{ ...protocolPageStyles.panel, padding: '32px' }}>
            <h2 style={{ ...protocolPageStyles.sectionTitle, marginBottom: '16px' }}>
              Creator trust context
            </h2>
            <DetailRow
              label="creatorWallet"
              value={creatorProfile?.displayName || launch.creatorWallet}
            />
            <DetailRow label="launchCount" value={creatorProfile?.launchCount ?? 'Loading'} />
            <DetailRow label="receiptCount" value={creatorProfile?.receiptCount ?? 'Loading'} />
            <DetailRow
              label="successfulLaunches"
              value={creatorProfile?.successfulLaunches ?? 'Loading'}
            />
            <DetailRow
              label="reputationScore"
              value={creatorProfile?.reputationScore ?? 'Loading'}
            />
          </div>

          <div style={{ ...protocolPageStyles.panel, padding: '32px' }}>
            <h2 style={{ ...protocolPageStyles.sectionTitle, marginBottom: '16px' }}>
              Technical launch metadata
            </h2>
            <DetailRow label="launchId" value={launch.launchId} />
            <DetailRow label="tokenMint" value={launch.tokenMint} />
            <DetailRow label="alphaVaultAddress" value={launch.alphaVaultAddress} />
            <DetailRow label="dbcConfigAddress" value={launch.dbcConfigAddress} />
            <DetailRow label="dbcPoolAddress" value={launch.dbcPoolAddress} />
            <DetailRow label="createdAt" value={formatReceiptTime(launch.createdAt)} />
            <DetailRow label="activatedAt" value={formatTechnicalValue(launch.activatedAt)} />
            <DetailRow label="launchedAt" value={formatTechnicalValue(launch.launchedAt)} />
          </div>
        </section>
      ) : null}
    </ProtocolPageShell>
  )
}
