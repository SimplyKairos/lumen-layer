import type { CSSProperties, ReactNode } from 'react'
import Footer from '../sections/Footer'
import Navbar from '../sections/Navbar'
import siteBg from '../../assets/SiteBG.jpg'

export const protocolPageStyles = {
  contentColumn: {
    maxWidth: '1120px',
    margin: '0 auto',
    display: 'grid',
    gap: '32px',
  } satisfies CSSProperties,
  panel: {
    background: 'rgba(255,255,255,0.03)',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    boxShadow: '0 4px 40px rgba(0,0,0,0.3)',
  } satisfies CSSProperties,
  eyebrow: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
    letterSpacing: '2.5px',
    textTransform: 'uppercase',
    color: 'rgba(27,79,216,0.8)',
  } satisfies CSSProperties,
  displayTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '44px',
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-1.6px',
    color: '#fff',
  } satisfies CSSProperties,
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '18px',
    fontWeight: 700,
    lineHeight: 1.3,
    color: '#fff',
  } satisfies CSSProperties,
  body: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '15px',
    fontWeight: 300,
    lineHeight: 1.7,
    color: 'rgba(255,255,255,0.4)',
  } satisfies CSSProperties,
  label: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '9px',
    fontWeight: 400,
    lineHeight: 1.4,
    color: 'rgba(255,255,255,0.22)',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
  } satisfies CSSProperties,
  mono: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.55)',
    wordBreak: 'break-word',
  } satisfies CSSProperties,
  monoCompact: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '11px',
    fontWeight: 400,
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.45)',
    wordBreak: 'break-word',
  } satisfies CSSProperties,
  link: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '11px',
    fontWeight: 400,
    lineHeight: 1.4,
    color: 'rgba(74,158,255,0.7)',
    textDecoration: 'none',
    letterSpacing: '0.5px',
  } satisfies CSSProperties,
} as const

export default function ProtocolPageShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      {/* Background image — full site */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: `url(${siteBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
      }} />

      {/* Dark overlay — light enough to keep background visible */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: 'rgba(3,7,15,0.72)',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />

        <main style={{ padding: '140px 24px 80px' }}>
          <div style={protocolPageStyles.contentColumn}>
            {children}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
