import { useEffect, useState } from 'react'
import ProtocolPageShell, { protocolPageStyles } from '../components/protocol/ProtocolPageShell'
import {
  buildLaunchHref,
  fetchCreatorProfile,
  normalizeLaunchpadError,
  type CreatorProfile,
  type LaunchStatus,
} from '../lib/launchpad-api'
import { formatReceiptTime, truncateReceiptValue } from '../lib/receipt-format'

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

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ ...protocolPageStyles.panel, padding: '24px', display: 'grid', gap: '8px' }}>
      <span style={protocolPageStyles.label}>{label}</span>
      <span style={protocolPageStyles.sectionTitle}>{value}</span>
    </div>
  )
}

export default function CreatorProfilePage({ walletAddress }: { walletAddress: string }) {
  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const viewState = loading ? 'loading' : error ? 'error' : 'success'

  useEffect(() => {
    let active = true

    async function loadProfile() {
      setLoading(true)
      setError(null)

      try {
        const nextProfile = await fetchCreatorProfile(walletAddress)

        if (!active) {
          return
        }

        setProfile(nextProfile)
      } catch (err) {
        if (!active) {
          return
        }

        setProfile(null)
        setError(normalizeLaunchpadError(err))
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      active = false
    }
  }, [walletAddress])

  return (
    <ProtocolPageShell>
      <section style={{
        ...protocolPageStyles.panel,
        padding: '48px',
        display: 'grid',
        gap: '24px',
      }}>
        <div style={{ display: 'grid', gap: '16px' }}>
          <span style={protocolPageStyles.eyebrow}>Creator profile</span>
          <h1 style={protocolPageStyles.displayTitle}>
            {profile?.displayName || 'Public creator trust profile'}
          </h1>
          <p style={{ ...protocolPageStyles.body, maxWidth: '760px' }}>
            Review creator identity, receipt count, launch history, and the trust signals Lumen can support honestly at this phase.
          </p>
        </div>

        {viewState === 'loading' ? (
          <p style={protocolPageStyles.body}>Loading creator trust context.</p>
        ) : null}

        {viewState === 'error' ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            <p style={{ ...protocolPageStyles.body, maxWidth: '760px' }}>{error}</p>
            <a href="/launches" style={protocolPageStyles.link}>Return to the active launches list</a>
          </div>
        ) : null}

        {viewState === 'success' && profile ? (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ display: 'grid', gap: '10px' }}>
              <span style={protocolPageStyles.label}>Creator identity</span>
              <span style={protocolPageStyles.mono}>{truncateReceiptValue(profile.walletAddress)}</span>
              <span style={protocolPageStyles.body}>
                {profile.verified ? 'Verified creator profile' : 'Public creator profile'}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}>
              <SummaryCard label="Launch count" value={profile.launchCount} />
              <SummaryCard label="Receipt count" value={profile.receiptCount} />
              <SummaryCard label="Successful launches" value={profile.successfulLaunches} />
              <SummaryCard label="Reputation score" value={profile.reputationScore} />
            </div>
          </div>
        ) : null}
      </section>

      {viewState === 'success' && profile ? (
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
          gap: '24px',
        }}>
          <div style={{ ...protocolPageStyles.panel, padding: '32px', display: 'grid', gap: '18px' }}>
            <h2 style={protocolPageStyles.sectionTitle}>Launch history</h2>

            {profile.recentLaunches.length === 0 ? (
              <p style={protocolPageStyles.body}>
                This creator does not have public launch history yet.
              </p>
            ) : (
              profile.recentLaunches.map((launch) => (
                <article
                  key={launch.launchId}
                  style={{
                    display: 'grid',
                    gap: '14px',
                    paddingTop: '18px',
                    borderTop: '0.5px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}>
                    <a href={buildLaunchHref(launch.launchId)} style={{
                      ...protocolPageStyles.sectionTitle,
                      textDecoration: 'none',
                    }}>
                      {launch.tokenName}
                    </a>
                    <LaunchStatusBadge status={launch.status} />
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '12px 24px',
                  }}>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      <span style={protocolPageStyles.label}>Created</span>
                      <span style={protocolPageStyles.body}>{formatReceiptTime(launch.createdAt)}</span>
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      <span style={protocolPageStyles.label}>Protection window</span>
                      <span style={protocolPageStyles.body}>{launch.launchWindowSeconds} seconds</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <div style={{ ...protocolPageStyles.panel, padding: '32px', display: 'grid', gap: '16px' }}>
            <h2 style={protocolPageStyles.sectionTitle}>Trust context</h2>
            <p style={protocolPageStyles.body}>
              Receipt count and launch history are the strongest public trust signals this creator surface can support in Phase 5. Bundler detection and enforcement remain outside this phase.
            </p>
            <div style={{ display: 'grid', gap: '10px' }}>
              <span style={protocolPageStyles.label}>Twitter</span>
              <span style={protocolPageStyles.mono}>{profile.twitterHandle || '—'}</span>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              <span style={protocolPageStyles.label}>Display name</span>
              <span style={protocolPageStyles.mono}>{profile.displayName || '—'}</span>
            </div>
          </div>
        </section>
      ) : null}
    </ProtocolPageShell>
  )
}
