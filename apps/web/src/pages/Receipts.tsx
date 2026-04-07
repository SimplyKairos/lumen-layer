import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import Footer from '../components/sections/Footer'
import Navbar from '../components/sections/Navbar'
import siteBg from '../assets/SiteBG.png'
import {
  fetchRecentReceipts,
  fetchVerificationResult,
  type ProtocolReceipt,
  type VerificationStatus,
} from '../lib/protocol-api'

type ExplorerStatus = VerificationStatus | 'Status unavailable'

interface ExplorerRow extends ProtocolReceipt {
  verificationStatus: ExplorerStatus
}

const panelStyle = {
  background: 'rgba(8,18,35,0.74)',
  border: '0.5px solid rgba(255,255,255,0.08)',
  borderRadius: '28px',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 22px 60px rgba(0,0,0,0.24)',
} satisfies CSSProperties

const headerLabelStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: 1.4,
  color: 'rgba(255,255,255,0.58)',
} satisfies CSSProperties

const monoValueStyle = {
  fontFamily: "'DM Mono', monospace",
  fontSize: '12px',
  color: '#fff',
  lineHeight: 1.6,
} satisfies CSSProperties

function formatTimestamp(value: number) {
  return new Date(value).toLocaleString()
}

function truncateValue(value: string, start = 12, end = 10) {
  if (value.length <= start + end + 3) {
    return value
  }

  return `${value.slice(0, start)}...${value.slice(-end)}`
}

export default function ReceiptsPage() {
  const [rows, setRows] = useState<ExplorerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadReceipts() {
      setLoading(true)
      setError(null)

      try {
        const { receipts } = await fetchRecentReceipts()
        const statuses = await Promise.all(
          receipts.map(async (receipt) => {
            try {
              const verification = await fetchVerificationResult(receipt.receiptId)
              return verification.verificationStatus
            } catch {
              return 'Status unavailable' as const
            }
          })
        )

        if (!active) {
          return
        }

        setRows(receipts.map((receipt, index) => ({
          ...receipt,
          verificationStatus: statuses[index],
        })))
      } catch (err) {
        if (!active) {
          return
        }

        setRows([])
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadReceipts()

    return () => {
      active = false
    }
  }, [])

  return (
    <div style={{ background: '#03070f', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: `url(${siteBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.5,
        mixBlendMode: 'screen',
      }} />
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: 'rgba(3,7,15,0.9)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />

        <main style={{ padding: '140px 24px 80px' }}>
          <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'grid', gap: '32px' }}>
            <section style={{
              ...panelStyle,
              padding: '48px',
              display: 'grid',
              gap: '16px',
            }}>
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '12px',
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.56)',
              }}>
                Receipt explorer
              </span>
              <h1 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '44px',
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '-1.6px',
                color: '#fff',
              }}>
                Recent public receipts
              </h1>
              <p style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
                maxWidth: '760px',
              }}>
                Browse recent protocol receipts and open a dedicated detail view for any public execution record.
              </p>
            </section>

            <section style={{ ...panelStyle, padding: '32px' }}>
              {loading ? (
                <p style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.68)',
                }}>
                  Loading recent protocol receipts.
                </p>
              ) : null}

              {!loading && error ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  <p style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: 1.6,
                    color: 'rgba(255,255,255,0.68)',
                  }}>
                    We couldn't load recent receipts. Try again in a moment, or verify a specific receipt directly.
                  </p>
                  <span style={{ ...monoValueStyle, color: 'rgba(209,75,100,0.95)' }}>{error}</span>
                  <a
                    href="/verify"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: 1.4,
                      color: '#fff',
                      textDecoration: 'none',
                    }}
                  >
                    Open the verifier
                  </a>
                </div>
              ) : null}

              {!loading && !error && rows.length === 0 ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  <h2 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '20px',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: '#fff',
                  }}>
                    No receipts stamped yet
                  </h2>
                  <p style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: 1.6,
                    color: 'rgba(255,255,255,0.68)',
                    maxWidth: '720px',
                  }}>
                    Recent protocol receipts will appear here once transactions have been stamped. If you already have a receipt ID, use the verifier now.
                  </p>
                </div>
              ) : null}

              {!loading && !error && rows.length > 0 ? (
                <div style={{ display: 'grid' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.1fr 1fr 1.2fr 1.3fr 1.2fr 0.6fr',
                    gap: '16px',
                    padding: '0 16px 16px',
                    borderBottom: '0.5px solid rgba(255,255,255,0.08)',
                  }}>
                    <span style={headerLabelStyle}>verificationStatus</span>
                    <span style={headerLabelStyle}>createdAt</span>
                    <span style={headerLabelStyle}>receiptId</span>
                    <span style={headerLabelStyle}>txSignature</span>
                    <span style={headerLabelStyle}>bundleId</span>
                    <span style={headerLabelStyle}>slot</span>
                  </div>

                  {rows.map((row) => (
                    <a
                      key={row.receiptId}
                      href={`/receipts/${encodeURIComponent(row.receiptId)}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.1fr 1fr 1.2fr 1.3fr 1.2fr 0.6fr',
                        gap: '16px',
                        padding: '18px 16px',
                        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
                        textDecoration: 'none',
                        color: '#fff',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <span style={{
                        ...monoValueStyle,
                        color: row.verificationStatus === 'VERIFIED'
                          ? '#8fb1ff'
                          : row.verificationStatus === 'Status unavailable'
                            ? 'rgba(255,255,255,0.64)'
                            : '#ff8ea6',
                      }}>
                        {row.verificationStatus}
                      </span>
                      <span style={monoValueStyle}>{formatTimestamp(row.createdAt)}</span>
                      <span style={monoValueStyle} title={row.receiptId}>{truncateValue(row.receiptId)}</span>
                      <span style={monoValueStyle} title={row.txSignature}>{truncateValue(row.txSignature)}</span>
                      <span style={monoValueStyle} title={row.bundleId}>{truncateValue(row.bundleId)}</span>
                      <span style={monoValueStyle}>{row.slot}</span>
                    </a>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
