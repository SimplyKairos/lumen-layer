const stats = [
  { num: '89%', label: 'Solana stake secured\nby Jito validators' },
  { num: '<1s', label: 'Receipt generation\nand on-chain anchoring' },
  { num: '∞', label: 'Replayable verifications\npermanently on-chain' },
  { num: '0', label: 'Trust assumptions.\nOpen schema. Public verifier.' },
]

export default function Stats() {
  return (
    <div className="fade-up" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      borderTop: '0.5px solid rgba(255,255,255,0.06)',
      borderBottom: '0.5px solid rgba(255,255,255,0.06)',
      background: 'rgba(255,255,255,0.02)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          padding: '36px 48px',
          borderRight: i < 3 ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
          transition: 'background 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{
            fontFamily: "'Outfit',sans-serif",
            fontSize: '40px',
            fontWeight: 800,
            letterSpacing: '-2px',
            color: '#fff',
            lineHeight: 1,
            marginBottom: '10px',
          }}>
            {s.num}
          </div>
          <div style={{
            fontFamily: "'Outfit',sans-serif",
            fontSize: '13px',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.32)',
            lineHeight: 1.65,
            whiteSpace: 'pre-line',
          }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}