import type { CSSProperties } from 'react'
import type { VerificationStatus } from '../../lib/protocol-api'

type BadgeStatus = VerificationStatus | 'Status unavailable'

type BadgeTheme = {
  background: string
  border: string
  color: string
}

const verifiedAccent = '#1b4fd8'
const destructiveAccent = '#d14b64'

function getTheme(status: BadgeStatus): BadgeTheme {
  if (status === 'VERIFIED') {
    return {
      background: 'rgba(27,79,216,0.22)',
      border: '0.5px solid rgba(27,79,216,0.45)',
      color: verifiedAccent,
    }
  }

  if (
    status === 'MEMO_MISMATCH' ||
    status === 'HASH_MISMATCH' ||
    status === 'ANCHOR_NOT_FOUND' ||
    status === 'ANCHOR_LOOKUP_FAILED'
  ) {
    return {
      background: 'rgba(209,75,100,0.16)',
      border: '0.5px solid rgba(209,75,100,0.38)',
      color: destructiveAccent,
    }
  }

  return {
    background: 'rgba(255,255,255,0.08)',
    border: '0.5px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.84)',
  }
}

export default function StatusBadge({ status }: { status: BadgeStatus }) {
  const theme = getTheme(status)

  const style = {
    fontFamily: "'DM Mono', monospace",
    fontSize: '12px',
    color: theme.color,
    background: theme.background,
    border: theme.border,
    borderRadius: '999px',
    padding: '10px 14px',
    width: 'fit-content',
  } satisfies CSSProperties

  return <span style={style}>{status}</span>
}
