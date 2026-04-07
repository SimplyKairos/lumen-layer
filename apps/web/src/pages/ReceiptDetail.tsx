import Footer from '../components/sections/Footer'
import Navbar from '../components/sections/Navbar'
import siteBg from '../assets/SiteBG.png'
import { fetchVerificationResult, type VerificationResult } from '../lib/protocol-api'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

const panelStyle = {
  background: 'rgba(8,18,35,0.74)',
  border: '0.5px solid rgba(255,255,255,0.08)',
  borderRadius: '28px',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 22px 60px rgba(0,0,0,0.24)',
} satisfies CSSProperties

const labelStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: 1.4,
  color: 'rgba(255,255,255,0.58)',
} satisfies CSSProperties

const valueStyle = {
  fontFamily: "'DM Mono', monospace",
  fontSize: '13px',
  fontWeight: 400,
  lineHeight: 1.6,
  color: '#fff',
  wordBreak: 'break-word',
} satisfies CSSProperties

function formatValue(value: boolean | number | string | null | undefined) {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  if (value === null || value === undefined || value === '') {
    return '—'
  }

  return String(value)
}

function formatTimestamp(value: number) {
  return new Date(value).toLocaleString()
}

function SummaryItem({
  label,
  value,
}: {
  label: string
  value: boolean | number | string | null | undefined
}) {
  return (
    <div style={{ display: 'grid', gap: '8px' }}>
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>{formatValue(value)}</span>
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
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>{formatValue(value)}</span>
    </div>
  )
}

export default function ReceiptDetailPage({ receiptId }: { receiptId: string }) {
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadReceipt() {
      setLoading(true)
      setError(null)

      try {
        const verificationResult = await fetchVerificationResult(receiptId)

        if (!active) {
          return
        }

        setResult(verificationResult)
      } catch (err) {
        if (!active) {
          return
        }

        setResult(null)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadReceipt()

    return () => {
      active = false
    }
  }, [receiptId])

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
              gap: '20px',
            }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '12px',
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.56)',
                }}>
                  Receipt detail
                </span>
                <h1 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '44px',
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '-1.6px',
                  color: '#fff',
                }}>
                  Public receipt detail
                </h1>
                <p style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.7)',
                  maxWidth: '720px',
                }}>
                  Inspect the canonical receipt and current verification diagnostics for this public execution record.
                </p>
              </div>

              {loading ? (
                <p style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.68)',
                }}>
                  Loading receipt details from the protocol API.
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
                    maxWidth: '720px',
                  }}>
                    We couldn't load that receipt. Check the ID and try again, or return to the recent receipts list.
                  </p>
                  <span style={{ ...valueStyle, color: 'rgba(209,75,100,0.95)' }}>{error}</span>
                </div>
              ) : null}

              {!loading && result ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '24px',
                }}>
                  <SummaryItem label="verificationStatus" value={result.verificationStatus} />
                  <SummaryItem label="attestationLevel" value={result.attestationLevel} />
                  <SummaryItem label="createdAt" value={formatTimestamp(result.createdAt)} />
                  <SummaryItem label="onChainMemo" value={result.onChainMemo} />
                </div>
              ) : null}
            </section>

            {!loading && result ? (
              <section style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
              }}>
                <div style={{ ...panelStyle, padding: '32px' }}>
                  <h2 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '20px',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: '#fff',
                    marginBottom: '16px',
                  }}>
                    Canonical Receipt
                  </h2>
                  <DetailRow label="receiptId" value={result.receiptId} />
                  <DetailRow label="txSignature" value={result.txSignature} />
                  <DetailRow label="bundleId" value={result.bundleId} />
                  <DetailRow label="slot" value={result.slot} />
                  <DetailRow label="confirmationStatus" value={result.confirmationStatus} />
                  <DetailRow label="receiptHash" value={result.receiptHash} />
                  <DetailRow label="walletAddress" value={result.walletAddress} />
                </div>

                <div style={{ ...panelStyle, padding: '32px' }}>
                  <h2 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '20px',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: '#fff',
                    marginBottom: '16px',
                  }}>
                    Verification Diagnostics
                  </h2>
                  <DetailRow label="verificationStatus" value={result.verificationStatus} />
                  <DetailRow label="hashMatches" value={result.hashMatches} />
                  <DetailRow label="memoMatches" value={result.memoMatches} />
                  <DetailRow label="onChainMemo" value={result.onChainMemo} />
                  <DetailRow label="error" value={result.error} />
                </div>
              </section>
            ) : null}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
