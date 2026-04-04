import LumenLogo from '../../assets/LumenLogo.svg'
import { getRevealStyle, useScrollReveal } from './ScrollReveal'

export default function Footer() {
  const { ref, visible, reduceMotion } = useScrollReveal<HTMLElement>()

  const scrollToProtocol = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

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
          {['Protocol', 'Verify', 'GitHub'].map(link => (
            <a
              key={link}
              href={
                link === 'Verify'
                  ? '/verify'
                  : link === 'GitHub'
                    ? 'https://github.com/SimplyKairos/lumen-layer'
                    : '#how-it-works'
              }
              target={link === 'GitHub' ? '_blank' : undefined}
              rel={link === 'GitHub' ? 'noopener noreferrer' : undefined}
              onClick={link === 'Protocol' ? scrollToProtocol : undefined}
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
