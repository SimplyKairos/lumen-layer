import { useEffect, useState } from 'react'
import ProtocolPageShell, { protocolPageStyles } from '../components/protocol/ProtocolPageShell'
import StatusBadge from '../components/protocol/StatusBadge'
import {
  buildVerifyHref,
  fetchVerificationResult,
  normalizeProtocolError,
  type VerificationResult,
} from '../lib/protocol-api'
import { formatReceiptTime, formatTechnicalValue } from '../lib/receipt-format'

function SummaryItem({
  label,
  value,
}: {
  label: string
  value: boolean | number | string | null | undefined
}) {
  return (
    <div style={{ display: 'grid', gap: '8px' }}>
      <span style={protocolPageStyles.label}>{label}</span>
      <span style={protocolPageStyles.mono}>{formatTechnicalValue(value)}</span>
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

export default function ReceiptDetailPage({ receiptId }: { receiptId: string }) {
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const viewState = loading ? 'loading' : error ? 'error' : 'success'

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
        setError(normalizeProtocolError(err))
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
    <ProtocolPageShell>
      <section style={{
        ...protocolPageStyles.panel,
        padding: '48px',
        display: 'grid',
        gap: '20px',
      }}>
        <div style={{ display: 'grid', gap: '16px' }}>
          <span style={protocolPageStyles.eyebrow}>Receipt detail</span>
          <h1 style={protocolPageStyles.displayTitle}>Public receipt detail</h1>
          <p style={{ ...protocolPageStyles.body, maxWidth: '720px' }}>
            Inspect the canonical receipt and current verification diagnostics for this public execution record.
          </p>
        </div>

        {viewState === 'loading' ? (
          <p style={protocolPageStyles.body}>Loading receipt details from the protocol API.</p>
        ) : null}

        {viewState === 'error' ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            <p style={{ ...protocolPageStyles.body, maxWidth: '720px' }}>{error}</p>
            <a href="/receipts" style={protocolPageStyles.link}>Return to the recent receipts list</a>
          </div>
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
              <StatusBadge status={result.verificationStatus} />
              <a href={buildVerifyHref(result.receiptId)} style={protocolPageStyles.link}>
                Open this receipt in the verifier
              </a>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
            }}>
              <SummaryItem label="verificationStatus" value={result.verificationStatus} />
              <SummaryItem label="attestationLevel" value={result.attestationLevel} />
              <SummaryItem label="createdAt" value={formatReceiptTime(result.createdAt)} />
              <SummaryItem label="onChainMemo" value={result.onChainMemo} />
            </div>
          </div>
        ) : null}
      </section>

      {viewState === 'success' && result ? (
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          <div style={{ ...protocolPageStyles.panel, padding: '32px' }}>
            <h2 style={{ ...protocolPageStyles.sectionTitle, marginBottom: '16px' }}>
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

          <div style={{ ...protocolPageStyles.panel, padding: '32px' }}>
            <h2 style={{ ...protocolPageStyles.sectionTitle, marginBottom: '16px' }}>
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
    </ProtocolPageShell>
  )
}
