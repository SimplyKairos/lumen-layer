import { useEffect, useState } from 'react'
import ProtocolPageShell, { protocolPageStyles } from '../components/protocol/ProtocolPageShell'
import StatusBadge from '../components/protocol/StatusBadge'
import {
  fetchRecentReceipts,
  fetchVerificationResult,
  normalizeProtocolError,
  type ProtocolReceipt,
  type VerificationStatus,
} from '../lib/protocol-api'
import { formatReceiptTime, truncateReceiptValue } from '../lib/receipt-format'

type ExplorerStatus = VerificationStatus | 'Status unavailable'

interface ExplorerRow extends ProtocolReceipt {
  verificationStatus: ExplorerStatus
}

export default function ReceiptsPage() {
  const [rows, setRows] = useState<ExplorerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const viewState = loading ? 'loading' : error ? 'error' : rows.length > 0 ? 'success' : 'empty'

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
        setError(
          normalizeProtocolError(
            err,
            "We couldn't load recent receipts. Return to the verifier or try again in a moment."
          )
        )
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
    <ProtocolPageShell>
      <section style={{
        ...protocolPageStyles.panel,
        padding: '48px',
        display: 'grid',
        gap: '16px',
      }}>
        <span style={protocolPageStyles.eyebrow}>Receipt explorer</span>
        <h1 style={protocolPageStyles.displayTitle}>Recent public receipts</h1>
        <p style={{ ...protocolPageStyles.body, maxWidth: '760px' }}>
          Browse recent protocol receipts and open a dedicated detail view for any public execution record.
        </p>
      </section>

      <section style={{ ...protocolPageStyles.panel, padding: '32px' }}>
        {viewState === 'loading' ? (
          <p style={protocolPageStyles.body}>Loading recent protocol receipts.</p>
        ) : null}

        {viewState === 'error' ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            <p style={protocolPageStyles.body}>{error}</p>
            <a href="/verify" style={protocolPageStyles.link}>Open the verifier</a>
          </div>
        ) : null}

        {viewState === 'empty' ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            <h2 style={protocolPageStyles.sectionTitle}>No receipts stamped yet</h2>
            <p style={{ ...protocolPageStyles.body, maxWidth: '720px' }}>
              Recent protocol receipts will appear here once transactions have been stamped. If you already have a receipt ID, use the verifier now.
            </p>
          </div>
        ) : null}

        {viewState === 'success' ? (
          <div style={{ display: 'grid' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 1fr 1.2fr 1.3fr 1.2fr 0.6fr',
              gap: '16px',
              padding: '0 16px 16px',
              borderBottom: '0.5px solid rgba(255,255,255,0.08)',
            }}>
              <span style={protocolPageStyles.label}>verificationStatus</span>
              <span style={protocolPageStyles.label}>createdAt</span>
              <span style={protocolPageStyles.label}>receiptId</span>
              <span style={protocolPageStyles.label}>txSignature</span>
              <span style={protocolPageStyles.label}>bundleId</span>
              <span style={protocolPageStyles.label}>slot</span>
            </div>

            {rows.map((row) => (
              <a
                key={row.receiptId}
                href={`/receipts/${encodeURIComponent(row.receiptId)}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.1fr 1fr 1.2fr 1.3fr 1.2fr 0.6fr',
                  gap: '16px',
                  alignItems: 'center',
                  padding: '18px 16px',
                  borderBottom: '0.5px solid rgba(255,255,255,0.08)',
                  textDecoration: 'none',
                  color: '#fff',
                  transition: 'background 0.2s ease',
                }}
              >
                <StatusBadge status={row.verificationStatus} />
                <span style={protocolPageStyles.monoCompact}>{formatReceiptTime(row.createdAt)}</span>
                <span style={protocolPageStyles.monoCompact} title={row.receiptId}>
                  {truncateReceiptValue(row.receiptId)}
                </span>
                <span style={protocolPageStyles.monoCompact} title={row.txSignature}>
                  {truncateReceiptValue(row.txSignature)}
                </span>
                <span style={protocolPageStyles.monoCompact} title={row.bundleId}>
                  {truncateReceiptValue(row.bundleId)}
                </span>
                <span style={protocolPageStyles.monoCompact}>{row.slot}</span>
              </a>
            ))}
          </div>
        ) : null}
      </section>
    </ProtocolPageShell>
  )
}
