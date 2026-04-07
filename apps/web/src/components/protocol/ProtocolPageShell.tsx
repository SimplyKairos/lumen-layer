import type { CSSProperties, ReactNode } from 'react'
import Footer from '../sections/Footer'
import Navbar from '../sections/Navbar'
import siteBg from '../../assets/SiteBG.png'

export const protocolPageStyles = {
  contentColumn: {
    maxWidth: '1120px',
    margin: '0 auto',
    display: 'grid',
    gap: '32px',
  } satisfies CSSProperties,
  panel: {
    background: 'rgba(8,18,35,0.74)',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: '28px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 22px 60px rgba(0,0,0,0.24)',
  } satisfies CSSProperties,
  eyebrow: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '12px',
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.56)',
  } satisfies CSSProperties,
  displayTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '44px',
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '-1.6px',
    color: '#fff',
  } satisfies CSSProperties,
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '20px',
    fontWeight: 700,
    lineHeight: 1.3,
    color: '#fff',
  } satisfies CSSProperties,
  body: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.68)',
  } satisfies CSSProperties,
  label: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.4,
    color: 'rgba(255,255,255,0.58)',
  } satisfies CSSProperties,
  mono: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: 1.6,
    color: '#fff',
    wordBreak: 'break-word',
  } satisfies CSSProperties,
  monoCompact: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: 1.6,
    color: '#fff',
    wordBreak: 'break-word',
  } satisfies CSSProperties,
  link: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.4,
    color: '#fff',
    textDecoration: 'none',
  } satisfies CSSProperties,
} as const

export default function ProtocolPageShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: '#03070f', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: `url(${siteBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.5,
        mixBlendMode: 'screen',
      }} />
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: 'rgba(3,7,15,0.9)',
      }} />

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
