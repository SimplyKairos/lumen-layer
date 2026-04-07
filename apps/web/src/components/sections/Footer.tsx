import LumenLogo from '../../assets/LumenLogo.svg'
import { getRevealStyle, useScrollReveal } from './ScrollReveal'

export default function Footer() {
  const { ref, visible, reduceMotion } = useScrollReveal<HTMLElement>()

  return (
    <footer
      ref={ref}
      style={{
        borderTop: '0.5px solid rgba(255,255,255,0.06)',
        padding: '48px 60px 40px',
        ...getRevealStyle({ visible, reduceMotion }),
      }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        marginBottom: '36px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifySelf: 'start' }}>
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
        <div style={{ display: 'flex', gap: '36px', justifySelf: 'center' }}>
          {['Verify', 'Receipts', 'GitHub'].map(link => (
            <a
              key={link}
              href={
                link === 'Verify'
                  ? '/verify'
                  : link === 'Receipts'
                    ? '/receipts'
                  : link === 'GitHub'
                    ? 'https://github.com/SimplyKairos/lumen-layer'
                    : '/'
              }
              target={link === 'GitHub' ? '_blank' : undefined}
              rel={link === 'GitHub' ? 'noopener noreferrer' : undefined}
              style={{
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
          justifySelf: 'end',
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
