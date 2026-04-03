export default function CTA() {
  return (
    <section style={{
      padding: '80px 46px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        bottom: '-180px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '800px',
        height: '500px',
        background: 'radial-gradient(ellipse, rgba(27,79,216,0.18) 0%, transparent 65%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />
      
      <p style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: '15px',
        letterSpacing: '4px',
        textTransform: 'uppercase',
        color: 'rgba(27,79,216,0.6)',
        marginBottom: '24px',
        position: 'relative',
        zIndex: 2,
      }}>
        The fairness standard for Solana
      </p>

      <h2 style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: 'clamp(44px, 6vw, 80px)',
        fontWeight: 800,
        letterSpacing: '-3px',
        lineHeight: 1.0,
        color: '#fff',
        marginBottom: '18px',
        position: 'relative',
        zIndex: 2,
      }}>
        Prove every execution.
      </h2>

      <p style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: '16px',
        fontWeight: 300,
        color: 'rgba(255,255,255,0.3)',
        marginBottom: '12px',
        position: 'relative',
        zIndex: 2,
      }}>
        The first launchpad where fairness is enforced, not promised.
      </p>

      <p style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: '10px',
        letterSpacing: '5px',
        textTransform: 'uppercase',
        color: 'rgb(255, 255, 255)',
        marginBottom: '52px',
        position: 'relative',
        zIndex: 2,
      }}>
        Clarity before capital.
      </p>

      <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <button style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '15px',
          fontWeight: 600,
          color: '#fff',
          background: '#1b4fd8',
          border: '0.5px solid rgba(100,150,255,0.3)',
          padding: '14px 36px',
          borderRadius: '40px',
          cursor: 'pointer',
          boxShadow: '0 0 50px rgba(27,79,216,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
          transition: 'all 0.2s',
        }}>
          Launch App
        </button>
        <button style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '15px',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.55)',
          background: 'rgba(255,255,255,0.04)',
          border: '0.5px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
          padding: '14px 36px',
          borderRadius: '40px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}>
          Embed in Your Wallet →
        </button>
      </div>
    </section>
  )
}
