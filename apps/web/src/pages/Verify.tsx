import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import ProtocolPageShell, { protocolPageStyles } from '../components/protocol/ProtocolPageShell'
import StatusBadge from '../components/protocol/StatusBadge'
import {
  fetchVerificationResult,
  type VerificationResult,
} from '../lib/protocol-api'
import { formatReceiptTime, formatTechnicalValue } from '../lib/receipt-format'

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

export default function VerifyPage() {
  const [receiptId, setReceiptId] = useState('')
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const viewState = loading ? 'loading' : error ? 'error' : result ? 'success' : 'idle'

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
    const params = new URLSearchParams(window.location.search)

    if (!normalizedReceiptId) {
      params.delete('receiptId')
      const query = params.toString()
      window.history.replaceState({}, '', query ? `/verify?${query}` : '/verify')
      setResult(null)
      setError(null)
      return
    }

    params.set('receiptId', normalizedReceiptId)
    window.history.replaceState({}, '', `/verify?${params.toString()}`)

    setLoading(true)
    setError(null)

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
    <ProtocolPageShell>
      <section style={{
        ...protocolPageStyles.panel,
        padding: '48px',
        display: 'grid',
        gap: '32px',
      }}>
        <div style={{ display: 'grid', gap: '16px' }}>
          <span style={protocolPageStyles.eyebrow}>Public verifier</span>
          <h1 style={{ ...protocolPageStyles.displayTitle, maxWidth: '720px' }}>
            Verify a public execution record
          </h1>
          <p style={{ ...protocolPageStyles.body, maxWidth: '720px' }}>
            Enter a Lumen receipt ID to inspect receipt fields, anchor reference, and live verification diagnostics.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <label htmlFor="receiptId" style={protocolPageStyles.label}>Receipt ID</label>
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
        ...protocolPageStyles.panel,
        padding: '32px 48px',
        display: 'grid',
        gap: '16px',
      }}>
        {viewState === 'idle' ? (
          <>
            <h2 style={protocolPageStyles.sectionTitle}>Ready to inspect</h2>
            <p style={protocolPageStyles.body}>
              Paste a receipt ID to fetch the canonical receipt and replay its verification state against current protocol data.
            </p>
          </>
        ) : null}

        {viewState === 'loading' ? (
          <>
            <h2 style={protocolPageStyles.sectionTitle}>Verifying receipt</h2>
            <p style={protocolPageStyles.body}>
              Fetching the canonical receipt, anchor reference, and current verification diagnostics.
            </p>
          </>
        ) : null}

        {viewState === 'error' ? (
          <>
            <h2 style={protocolPageStyles.sectionTitle}>Verification unavailable</h2>
            <p style={{ ...protocolPageStyles.body, maxWidth: '720px' }}>{error}</p>
            <a href="/receipts" style={protocolPageStyles.link}>Open recent receipts</a>
          </>
        ) : null}

        {viewState === 'success' && result ? (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'grid', gap: '10px' }}>
                <span style={protocolPageStyles.eyebrow}>Receipt result</span>
                <StatusBadge status={result.verificationStatus} />
              </div>

              <span style={{
                ...protocolPageStyles.monoCompact,
                color: '#fff',
                background: 'rgba(255,255,255,0.08)',
                border: '0.5px solid rgba(255,255,255,0.12)',
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
              <DetailRow label="createdAt" value={formatReceiptTime(result.createdAt)} />
              {result.walletAddress ? (
                <DetailRow label="walletAddress" value={result.walletAddress} />
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </ProtocolPageShell>
  )
}
