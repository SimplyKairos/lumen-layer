import { useEffect, useState } from 'react'
import LumenLogo from '../../assets/LumenLogo.svg'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const goTo = (path: string) => {
    window.location.assign(path)
  }

  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleNavClick = (label: string) => {
    if (label === 'Protocol') {
      scrollTo('how-it-works')
      return
    }

    if (label === 'Verify') {
      goTo('/verify')
      return
    }

    if (label === 'Docs') {
      openExternal('https://github.com/SimplyKairos/lumen-layer')
      return
    }

    if (label === 'Receipts') {
      goTo('/receipts')
    }
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '22px 64px',
      background: scrolled ? 'rgba(3,7,15,0.6)' : 'transparent',
      WebkitBackdropFilter: 'blur(24px)',
      transition: 'all 0.4s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={LumenLogo} alt="Lumen" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '24px', color: '#fff', letterSpacing: '-0.3px' }}>Lumen</span>
      </div>

      {/* Nav links — contained pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'rgba(255,255,255,0.05)',
        border: '0.5px rgba(255,255,255,0.08)',
        borderRadius: '40px',
        padding: '4px 6px',
        backdropFilter: 'blur(12px)',
      }}>
        {[
          { label: 'Protocol', id: 'how-it-works' },
          { label: 'Verify', id: 'verify' },
          { label: 'Docs', id: 'docs' },
          { label: 'Receipts', id: 'explorer' },
        ].map(({ label, id }) => (
          <button
            key={id}
            onClick={() => handleNavClick(label)}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '13px',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.45)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '7px 16px',
              borderRadius: '40px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
              e.currentTarget.style.background = 'none'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <button style={{
        fontFamily: "'Outfit',sans-serif", fontSize: '14px', fontWeight: 600, color: '#fff',
        background: 'rgba(27,79,216,0.15)', border: '0.5px solid rgba(27,79,216,0.45)',
        backdropFilter: 'blur(12px)', padding: '10px 24px', borderRadius: '40px',
        cursor: 'pointer', boxShadow: '0 0 20px rgba(27,79,216,0.12)', transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(27,79,216,0.28)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(27,79,216,0.3)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(27,79,216,0.15)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(27,79,216,0.12)' }}
      >
      Launchpad →
      </button>
    </nav>
  )
}
