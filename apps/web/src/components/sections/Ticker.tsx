import { getRevealStyle, useScrollReveal } from './ScrollReveal'

const items = [
  'TEE-verified attestations',
  'On-chain memo anchoring',
  'BAM block engine',
  'Canonical receipt schema',
  'Live replay verifier',
  'Webhook embed API',
  'SHA-256 binding',
  'Anti-bundling enforcement',
  'Fair launch windows',
  'Apache-2.0 open standard',
]

export default function Ticker() {
  const { ref, visible, reduceMotion } = useScrollReveal<HTMLDivElement>()
  const doubled = [...items, ...items]

  return (
    <div
      ref={ref}
      style={{
        borderBottom: '0.5px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.01)',
        ...getRevealStyle({ visible, reduceMotion }),
      }}
    >
      <div style={{
        display: 'flex',
        animation: 'tickerScroll 26s linear infinite',
        whiteSpace: 'nowrap',
      }}>
        {doubled.map((item, i) => (
          <div key={i} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 36px',
            borderRight: '0.5px solid rgba(255,255,255,0.05)',
            fontFamily: "'DM Mono',monospace",
            fontSize: '10px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            flexShrink: 0,
          }}>
            <span style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'rgba(27,79,216,0.9)',
              display: 'block',
              flexShrink: 0,
              boxShadow: '0 0 6px rgba(27,79,216,0.6)',
            }} />
            {item}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
