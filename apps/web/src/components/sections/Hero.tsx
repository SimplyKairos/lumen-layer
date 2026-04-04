import { useEffect, useRef } from 'react'
import object3D from '../../assets/3DObject.svg'

export default function Hero() {
  const objRef = useRef<HTMLImageElement>(null)
  let frame = 0
  let animId: number

  useEffect(() => {
    const animate = () => {
      frame++
      if (objRef.current) {
        const y = Math.sin(frame * 0.016) * 20
        const r = Math.sin(frame * 0.010) * 8
        const s = 1 + Math.sin(frame * 0.013) * 0.025
        objRef.current.style.transform = `translateY(${y}px) rotate(${r}deg) scale(${s})`
      }
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!objRef.current) return
      const dx = (e.clientX / window.innerWidth - 0.5) * 30
      const dy = (e.clientY / window.innerHeight - 0.5) * 15
      objRef.current.style.marginLeft = `${dx}px`
      objRef.current.style.marginTop = `${dy}px`
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const goTo = (path: string) => {
    window.location.assign(path)
  }

  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
   <section id="hero" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: '0 0 80px 64px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background glow */}
      <div style={{
        position: 'absolute',
        right: '5%',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '650px',
        height: '650px',
        background: 'radial-gradient(ellipse, rgba(27,79,216,0.18) 0%, rgba(10,30,100,0.08) 50%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '1000px',
        height: '500px',
        background: 'radial-gradient(ellipse at top, rgba(27,79,216,0.07) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Left content */}
<div style={{ maxWidth: '900px', position: 'relative', zIndex: 2, transform: 'translateY(-90px)',}}>
        {/* Headline */}
        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 'clamp(50px, 5.5vw, 75px)',
          fontWeight: 800,
          lineHeight: 1.0,
          letterSpacing: '-2.5px',
          color: '#fff',
          marginBottom: '24px',
        }}>
          Execution fairness,<br />
          verified on-chain.
        </h1>

        {/* Subline */}
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '18px',
          fontWeight: 300,
          color: 'rgba(255,255,255,0.38)',
          lineHeight: 1.75,
          marginBottom: '16px',
          maxWidth: '440px',
        }}>
        Lumen is the open receipt standard for Solana. Every stamped transaction binds execution to bundle context and anchors a replayable proof on-chain.
        </p>

        {/* Proof-Strip */}
        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '12px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'rgb(255, 255, 255)',
          marginBottom: '44px',
        }}>
Open schema · Bundle-aware · On-chain anchored · Public verifiable        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          {/* Primary — solid */}
          <button style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '15px',
            fontWeight: 600,
            color: '#fff',
            background: '#1b4fd8',
            border: '0.5px solid rgba(100,150,255,0.3)',
            padding: '13px 30px',
            borderRadius: '40px',
            cursor: 'pointer',
            boxShadow: '0 0 40px rgba(27,79,216,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
            transition: 'all 0.2s',
            letterSpacing: '0.1px',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#2560e8'
              e.currentTarget.style.boxShadow = '0 0 60px rgba(27,79,216,0.5), inset 0 1px 0 rgba(255,255,255,0.15)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#1b4fd8'
              e.currentTarget.style.boxShadow = '0 0 40px rgba(27,79,216,0.35), inset 0 1px 0 rgba(255,255,255,0.15)'
            }}
            onClick={() => goTo('/verify')}
          >
            Verify a Trade
          </button>

          {/* Ghost — glassmorphism */}
          <button style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '15px',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.6)',
            background: 'rgba(255,255,255,0.04)',
            border: '0.5px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            padding: '13px 30px',
            borderRadius: '40px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
            }}
            onClick={() => openExternal('https://github.com/SimplyKairos/lumen-layer')}
          >
            Read the Docs →
          </button>
        </div>
      </div>

      {/* Powered by — bottom right */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        right: '64px',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px',
      }}>
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '15px',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.52)',
        }}>Powered by</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {[
            { name: 'Jito', url: 'https://jito.wtf/favicon.ico' },
            { name: 'Helius', url: 'https://helius.dev/favicon.ico' },
            { name: 'Solana', url: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png' },
          ].map(({ name, url }) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src={url} alt={name} style={{ width: '16px', height: '16px', opacity: 0.5, borderRadius: '4px' }} />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.28)' }}>{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MASSIVE full bleed 3D object */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '900px', height: '900px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 0,
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse, rgba(27,79,216,0.25) 0%, rgba(10,30,100,0.1) 45%, transparent 70%)', filter: 'blur(60px)', borderRadius: '50%' }} />
        <img ref={objRef} src={object3D} alt="" style={{ width: '860px', height: '860px', objectFit: 'contain', filter: 'drop-shadow(0 0 120px rgba(27,79,216,0.7)) drop-shadow(0 0 40px rgba(27,79,216,0.4))', opacity: 0.5, transition: 'margin 0.15s ease-out' }} />
      </div>

      {/* Gradient overlays for text readability */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(3,7,15,0.95) 0%, rgba(3,7,15,0.7) 40%, rgba(3,7,15,0.1) 70%, transparent 100%)', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,7,15,0.9) 0%, transparent 50%)', zIndex: 1, pointerEvents: 'none' }} />

      <style>{`
        @keyframes badgePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.65); }
        }
      `}</style>
    </section>
  )
}
