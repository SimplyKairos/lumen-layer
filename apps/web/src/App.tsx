import { useEffect } from 'react'
import Navbar from './components/sections/Navbar'
import Hero from './components/sections/Hero'
import Ticker from './components/sections/Ticker'
import Stats from './components/sections/Stats'
import WhyWeBuiltThis from './components/sections/WhyWeBuiltThis'
import HowItWorks from './components/sections/HowItWorks'
import CTA from './components/sections/CTA'
import Footer from './components/sections/Footer'
import siteBg from './assets/SiteBG.png'

export default function App() {
  useEffect(() => {
    const els = document.querySelectorAll('.fade-up')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
        }
      })
    }, { threshold: 0.12 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <div style={{ background: '#03070f', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `url(${siteBg})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.5, mixBlendMode: 'screen',
      }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'rgba(3,7,15,0.9)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <Hero />
        <Ticker />
        <Stats />
        <WhyWeBuiltThis />
        <HowItWorks />
        <CTA />
        <Footer />
      </div>
    </div>
  )
}