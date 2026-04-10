import { useEffect, useState } from 'react'
import ProtocolPageShell, { protocolPageStyles } from '../components/protocol/ProtocolPageShell'
import {
  buildCreatorHref,
  buildLaunchHref,
  fetchLaunches,
  normalizeLaunchpadError,
  type LaunchStatus,
  type LumenLaunch,
} from '../lib/launchpad-api'
import { formatReceiptTime, truncateReceiptValue } from '../lib/receipt-format'

function formatProtectionWindow(seconds: number) {
  if (seconds % 3600 === 0) {
    return `${seconds / 3600}h protection window`
  }

  if (seconds % 60 === 0) {
    return `${seconds / 60}m protection window`
  }

  return `${seconds}s protection window`
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

function LaunchCard({ launch }: { launch: LumenLaunch }) {
  const trustContext = launch.status === 'live'
    ? 'Live trades from this launch stamp canonical Lumen receipts for public verification.'
    : 'Receipts begin once this launch moves live through the protocol trading path.'

  return (
    <article style={{
      display: 'grid',
      gap: '20px',
      padding: '28px',
      borderBottom: '0.5px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'grid', gap: '10px' }}>
          <a
            href={buildLaunchHref(launch.launchId)}
            style={{
              ...protocolPageStyles.sectionTitle,
              textDecoration: 'none',
            }}
          >
            {launch.tokenName}
          </a>
          <span style={protocolPageStyles.monoCompact}>{launch.tokenSymbol}</span>
        </div>

        <LaunchStatusBadge status={launch.status} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px 24px',
      }}>
        <div style={{ display: 'grid', gap: '8px' }}>
          <span style={protocolPageStyles.label}>Creator</span>
          <a href={buildCreatorHref(launch.creatorWallet)} style={protocolPageStyles.link}>
            {truncateReceiptValue(launch.creatorWallet)}
          </a>
        </div>

        <div style={{ display: 'grid', gap: '8px' }}>
          <span style={protocolPageStyles.label}>Protection window</span>
          <span style={protocolPageStyles.body}>{formatProtectionWindow(launch.launchWindowSeconds)}</span>
        </div>

        <div style={{ display: 'grid', gap: '8px' }}>
          <span style={protocolPageStyles.label}>Trust context</span>
          <span style={protocolPageStyles.body}>{trustContext}</span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        <span style={protocolPageStyles.monoCompact}>
          Alpha Vault {launch.alphaVaultMode} · {formatReceiptTime(launch.createdAt)}
        </span>
        <a href={buildLaunchHref(launch.launchId)} style={protocolPageStyles.link}>
          Open launch
        </a>
      </div>
    </article>
  )
}

export default function LaunchesPage() {
  const [launches, setLaunches] = useState<LumenLaunch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const viewState = loading ? 'loading' : error ? 'error' : launches.length > 0 ? 'success' : 'empty'

  useEffect(() => {
    let active = true

    async function loadLaunches() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetchLaunches()

        if (!active) {
          return
        }

        setLaunches(response.launches)
      } catch (err) {
        if (!active) {
          return
        }

        setLaunches([])
        setError(normalizeLaunchpadError(err))
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadLaunches()

    return () => {
      active = false
    }
  }, [])

  return (
    <ProtocolPageShell>
      <section style={{
        ...protocolPageStyles.panel,
        padding: '48px',
        display: 'grid',
        gap: '24px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '24px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'grid', gap: '16px', maxWidth: '760px' }}>
            <span style={protocolPageStyles.eyebrow}>Launchpad</span>
            <h1 style={protocolPageStyles.displayTitle}>Active fair launches</h1>
            <p style={protocolPageStyles.body}>
              Browse configured and live launches, inspect their protection windows, and open the public trust context for each launch.
            </p>
          </div>

          <a
            href="/launch/new"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              color: '#fff',
              background: 'rgba(27,79,216,0.16)',
              border: '0.5px solid rgba(27,79,216,0.42)',
              backdropFilter: 'blur(12px)',
              padding: '16px 22px',
              borderRadius: '18px',
              textDecoration: 'none',
              boxShadow: '0 0 20px rgba(27,79,216,0.12)',
            }}
          >
            Create Launch
          </a>
        </div>
      </section>

      <section style={{ ...protocolPageStyles.panel, padding: '20px 0' }}>
        {viewState === 'loading' ? (
          <div style={{ padding: '28px 32px' }}>
            <p style={protocolPageStyles.body}>Loading the public launch surface.</p>
          </div>
        ) : null}

        {viewState === 'error' ? (
          <div style={{ padding: '28px 32px', display: 'grid', gap: '12px' }}>
            <p style={{ ...protocolPageStyles.body, maxWidth: '760px' }}>{error}</p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a href="/launches" style={protocolPageStyles.link}>Refresh launches</a>
              <a href="/launch/new" style={protocolPageStyles.link}>Create Launch</a>
            </div>
          </div>
        ) : null}

        {viewState === 'empty' ? (
          <div style={{ padding: '28px 32px', display: 'grid', gap: '12px' }}>
            <h2 style={protocolPageStyles.sectionTitle}>No active launches yet</h2>
            <p style={{ ...protocolPageStyles.body, maxWidth: '760px' }}>
              Active fair launches will appear here as they open. If you're a creator, connect your wallet to configure a new launch.
            </p>
            <a href="/launch/new" style={protocolPageStyles.link}>Create Launch</a>
          </div>
        ) : null}

        {viewState === 'success' ? (
          <div style={{ display: 'grid' }}>
            {launches.map((launch) => (
              <LaunchCard key={launch.launchId} launch={launch} />
            ))}
          </div>
        ) : null}
      </section>
    </ProtocolPageShell>
  )
}
