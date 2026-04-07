import { useEffect, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import Footer from '../components/sections/Footer'
import Navbar from '../components/sections/Navbar'
import siteBg from '../assets/SiteBG.png'
import { fetchVerificationResult, type VerificationResult } from '../lib/protocol-api'

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

export default function VerifyPage() {
  const [receiptId, setReceiptId] = useState('')
  const [activeReceiptId, setActiveReceiptId] = useState('')
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initialReceiptId = new URLSearchParams(window.location.search).get('receiptId') ?? ''
    setReceiptId(initialReceiptId)

    if (!initialReceiptId) {
      return
    }

    void handleVerify(initialReceiptId)
  }, [])

  async function handleVerify(nextReceiptId: string) {
    const normalizedReceiptId = nextReceiptId.trim()

    if (!normalizedReceiptId) {
      setResult(null)
      setError(null)
      setActiveReceiptId('')
      return
    }

    const params = new URLSearchParams(window.location.search)
    params.set('receiptId', normalizedReceiptId)
    window.history.replaceState({}, '', `/verify?${params.toString()}`)

    setLoading(true)
    setError(null)
    setActiveReceiptId(normalizedReceiptId)

    try {
      const verificationResult = await fetchVerificationResult(normalizedReceiptId)
      setResult(verificationResult)
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await handleVerify(receiptId)
  }

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
          <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
            <section style={{
              ...panelStyle,
              padding: '48px',
              display: 'grid',
              gap: '32px',
            }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '12px',
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.56)',
                }}>
                  Public verifier
                </span>
                <h1 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '44px',
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '-1.6px',
                  color: '#fff',
                  maxWidth: '720px',
                }}>
                  Verify a public execution record
                </h1>
                <p style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.7)',
                  maxWidth: '720px',
                }}>
                  Enter a Lumen receipt ID to inspect receipt fields, anchor reference, and live verification diagnostics.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
                <label htmlFor="receiptId" style={labelStyle}>Receipt ID</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) auto',
                  gap: '16px',
                }}>
                  <input
                    id="receiptId"
                    name="receiptId"
                    value={receiptId}
                    onChange={(event) => setReceiptId(event.target.value)}
                    placeholder="Paste a Lumen receipt ID"
                    style={{
                      width: '100%',
                      minWidth: 0,
                      padding: '18px 20px',
                      borderRadius: '18px',
                      border: '0.5px solid rgba(255,255,255,0.12)',
                      background: 'rgba(3,7,15,0.64)',
                      color: '#fff',
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!receiptId.trim() || loading}
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#fff',
                      background: loading ? 'rgba(27,79,216,0.25)' : 'rgba(27,79,216,0.15)',
                      border: '0.5px solid rgba(27,79,216,0.45)',
                      backdropFilter: 'blur(12px)',
                      padding: '0 24px',
                      minHeight: '58px',
                      borderRadius: '18px',
                      cursor: loading ? 'wait' : 'pointer',
                      boxShadow: '0 0 20px rgba(27,79,216,0.12)',
                      transition: 'all 0.2s',
                      opacity: !receiptId.trim() && !loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? 'Verifying...' : 'Verify Receipt'}
                  </button>
                </div>
              </form>
            </section>

            <section style={{
              ...panelStyle,
              padding: '32px 48px',
              marginTop: '32px',
              display: 'grid',
              gap: '8px',
            }}>
              {!activeReceiptId && !loading && !result && !error ? (
                <>
                  <h2 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '20px',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: '#fff',
                  }}>
                    Ready to inspect
                  </h2>
                  <p style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: 1.6,
                    color: 'rgba(255,255,255,0.68)',
                  }}>
                    Paste a receipt ID to fetch the canonical receipt and replay its verification state against current protocol data.
                  </p>
                </>
              ) : null}

              {loading ? (
                <>
                  <h2 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '20px',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: '#fff',
                  }}>
                    Verifying receipt
                  </h2>
                  <p style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: 1.6,
                    color: 'rgba(255,255,255,0.68)',
                  }}>
                    Fetching the canonical receipt, anchor reference, and current verification diagnostics.
                  </p>
                </>
              ) : null}

              {!loading && error ? (
                <>
                  <h2 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '20px',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: '#fff',
                  }}>
                    Verification unavailable
                  </h2>
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
                  <span style={{
                    ...valueStyle,
                    color: 'rgba(209,75,100,0.95)',
                  }}>
                    {error}
                  </span>
                </>
              ) : null}

              {!loading && result ? (
                <div style={{ display: 'grid', gap: '24px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      <span style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '12px',
                        letterSpacing: '1.2px',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.56)',
                      }}>
                        Receipt result
                      </span>
                      <h2 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '20px',
                        fontWeight: 700,
                        lineHeight: 1.3,
                        color: '#fff',
                      }}>
                        {result.verificationStatus}
                      </h2>
                    </div>

                    <span style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '12px',
                      color: '#fff',
                      background: result.verificationStatus === 'VERIFIED'
                        ? 'rgba(27,79,216,0.22)'
                        : 'rgba(209,75,100,0.16)',
                      border: result.verificationStatus === 'VERIFIED'
                        ? '0.5px solid rgba(27,79,216,0.45)'
                        : '0.5px solid rgba(209,75,100,0.38)',
                      borderRadius: '999px',
                      padding: '10px 14px',
                    }}>
                      {result.attestationLevel}
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '0 24px',
                  }}>
                    <DetailRow label="verificationStatus" value={result.verificationStatus} />
                    <DetailRow label="attestationLevel" value={result.attestationLevel} />
                    <DetailRow label="txSignature" value={result.txSignature} />
                    <DetailRow label="bundleId" value={result.bundleId} />
                    <DetailRow label="slot" value={result.slot} />
                    <DetailRow label="confirmationStatus" value={result.confirmationStatus} />
                    <DetailRow label="receiptHash" value={result.receiptHash} />
                    <DetailRow label="onChainMemo" value={result.onChainMemo} />
                    <DetailRow label="hashMatches" value={result.hashMatches} />
                    <DetailRow label="memoMatches" value={result.memoMatches} />
                    <DetailRow label="createdAt" value={formatTimestamp(result.createdAt)} />
                    {result.walletAddress ? (
                      <DetailRow label="walletAddress" value={result.walletAddress} />
                    ) : null}
                  </div>
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
