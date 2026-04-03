import LumenLogo from '../../assets/LumenLogo.svg'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '0.5px solid rgba(255,255,255,0.06)',
      padding: '48px 60px 40px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '36px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={LumenLogo} alt="Lumen" style={{ width: '22px', height: '22px', objectFit: 'contain', opacity: 0.5 }} />
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '14px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.51)',
          }}>
            Lumen · @LumenLayer
          </span>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: '36px' }}>
          {['How it works', 'Verify', 'Docs', 'GitHub'].map(link => (
            <a key={link} href="#" style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '13px',
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.51)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.22)')}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Right */}
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.51)',
          letterSpacing: '0.5px',
        }}>
          Apache-2.0 · Built on Jito BAM · Solana
        </span>
      </div>

      <div style={{
        borderTop: '0.5px solid rgba(255,255,255,0.04)',
        paddingTop: '24px',
        textAlign: 'center',
      }}>
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '10px',
          color: 'rgb(255, 255, 255)',
          letterSpacing: '1.5px',
        }}>
          © 2026 Lumen Protocol. Clarity before capital.
        </span>
      </div>
    </footer>
  )
}
