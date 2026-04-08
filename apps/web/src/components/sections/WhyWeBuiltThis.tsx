import { getRevealStyle, useScrollReveal } from './ScrollReveal'

const cards = [
  {
    num: 'Problem',
    title: 'Block builders are black boxes',
    desc: 'No trader can independently verify how their transaction was ordered or whether it was bundled against them. The block engine decides everything with zero accountability to the end user.',
  },
  {
    num: 'Primitive',
    title: 'BAM provides the execution-trust primitive',
    desc: "Jito BAM moves Solana toward attestable execution. It establishes the underlying trust direction for bundle-aware execution, even though public per-bundle BAM digests are not what Lumen exposes today.",
  },
  {
    num: 'Gap',
    title: 'No canonical receipt layer exists',
    desc: 'BAM produces attestations. No protocol standardizes them into a verifiable, embeddable receipt that wallets and custodians can consume and replay independently.',
  },
  {
    num: 'Solution',
    title: 'Lumen is that receipt layer',
    desc: 'We bind tx signatures to publicly available bundle execution context, anchor the hash on-chain via Solana memo, and expose a public verifier and open schema that platforms can replay independently.',
  },
]

export default function WhyWeBuiltThis() {
  const { ref, visible, reduceMotion } = useScrollReveal<HTMLDivElement>()

  return (
    <section id="why" style={{ padding: '80px 46px', position: 'relative', overflow: 'hidden' }}>
      <div
        ref={ref}
        style={{
          position: 'relative',
          zIndex: 2,
          ...getRevealStyle({ visible, reduceMotion }),
        }}
      >
        {/* Tag */}
        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '25px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '18px',
        }}>
          The problem
        </p>

        {/* Headline */}
        <h2 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 'clamp(36px, 4.5vw, 58px)',
          fontWeight: 800,
          letterSpacing: '-2px',
          lineHeight: 1.05,
          color: '#fff',
          marginBottom: '20px',
          maxWidth: '640px',
        }}>
          Solana has speed.<br />
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>It was missing proof.</span>
        </h2>

        {/* Body */}
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '17px',
          fontWeight: 300,
          color: 'rgb(255, 255, 255)',
          lineHeight: 1.8,
          maxWidth: '580px',
          marginBottom: '72px',
        }}>
          Every transaction on Solana passes through a block engine that decides ordering, bundling, and tip routing — with zero accountability to the trader. Bundlers front-run launches. Insiders get first block. Retail is always last. Jito BAM introduced the cryptographic primitive to fix this. Lumen builds the standard on top of it.
        </p>

        {/* Cards grid — glassmorphism, no hover effect */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}>
          {cards.map((card, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '36px 40px',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 40px rgba(0,0,0,0.3)',
              ...getRevealStyle({
                visible,
                reduceMotion,
                delay: i * 100,
                duration: 680,
                translateY: 18,
                blur: 4,
              }),
            }}>
              <p style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.55)',
                letterSpacing: '2px',
                marginBottom: '16px',
                textTransform: 'uppercase',
              }}>
                {card.num}
              </p>
              <h3 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '20px',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.4px',
                marginBottom: '12px',
                lineHeight: 1.2,
              }}>
                {card.title}
              </h3>
              <p style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '16px',
                fontWeight: 300,
                color: 'rgb(255, 255, 255)',
                lineHeight: 1.75,
              }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-24px) rotate(6deg); }
        }
      `}</style>
    </section>
  )
}
