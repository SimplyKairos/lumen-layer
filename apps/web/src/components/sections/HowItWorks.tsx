import layers from '../../assets/Layers.svg'

const steps = [
  {
    idx: '01',
    title: 'Bundle ingestion via Jito block engine',
    desc: 'Your transaction is submitted as a Jito bundle. The BAM node — running inside an AMD SEV-SNP Trusted Execution Environment — privately sequences and simulates the bundle, producing a cryptographic commitment to the exact ordering logic applied. This attestation is hardware-backed and cannot be forged.',
    code: `POST /api/v1/stamp
{ txSignature, bundleId, slot }
→ bundle ingested via Jito block engine`,
  },
  {
    idx: '02',
    title: 'Receipt construction and on-chain anchoring',
    desc: 'Lumen fetches bundle status via getBundleStatuses — extracting bundleId, slot, and confirmationStatus. We compute SHA-256(txSignature ‖ bundleId ‖ slot) and write the resulting digest as a Solana memo transaction. The receipt is now immutable, permissionless, and permanently anchored to canonical chain state.',
    code: `sha256(txSig ‖ bundleId ‖ slot)
→ receiptHash: a3f8c2...e91b4d
→ memo: anchored on-chain ✓`,
  },
  {
    idx: '03',
    title: 'Trustless public verification',
    desc: 'Any observer can submit a receiptId to the Lumen verifier. We recompute the hash against live chain data, confirm it matches the on-chain memo, and return a verification response. No trust in Lumen is required at any point. The proof is self-contained and replayable forever.',
    code: `GET /api/v1/verify/:receiptId
→ { verified: true,
    attestationLevel: "BUNDLE_VERIFIED",
    slot, explorer }`,
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '80px 46px', position: 'relative', overflow: 'hidden' }}>

      {/* Layers image — right side, blue tinted */}
      <img
        src={layers}
        alt=""
        style={{
          position: 'absolute',
          right: '-80px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '480px',
          opacity: 0.2,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }}
      />

      <div className="fade-up" style={{ position: 'relative', zIndex: 2 }}>
        {/* Tag */}
        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '25px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'rgba(27,79,216,0.7)',
          marginBottom: '18px',
        }}>
          Protocol mechanics
        </p>

        {/* Headline */}
        <h2 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 'clamp(36px, 4.5vw, 58px)',
          fontWeight: 800,
          letterSpacing: '-2px',
          lineHeight: 1.05,
          color: '#fff',
          marginBottom: '72px',
          maxWidth: '540px',
        }}>
          Three primitives.<br />
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>One trustless proof.</span>
        </h2>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr',
              gap: '40px',
              padding: '36px 0',
              borderBottom: i < steps.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
              alignItems: 'start',
            }}>
              {/* Index circle */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '1.3px rgba(255, 255, 255, 0.37)',
                background: 'rgba(254, 254, 254, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '4px',
              }}>
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '16px',
                  color: 'rgb(255, 255, 255)',
                }}>
                  {step.idx}
                </span>
              </div>

              {/* Content */}
              <div>
                <h3 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '25px',
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '-0.5px',
                  marginBottom: '14px',
                  lineHeight: 1.2,
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '17px',
                  fontWeight: 300,
                  color: 'rgb(255, 255, 255)',
                  lineHeight: 1.8,
                  marginBottom: '24px',
                  maxWidth: '600px',
                }}>
                  {step.desc}
                </p>

                {/* Code block — glassmorphism */}
                <div style={{
                  background: 'rgba(254, 254, 254, 0.05)',
                  border: '0.5px rgba(255, 255, 255, 0.37)',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.55)',
                  lineHeight: 1.8,
                  whiteSpace: 'pre',
                  backdropFilter: 'blur(8px)',
                  boxShadow: 'inset 0 1px 0 rgba(27,79,216,0.1)',
                  maxWidth: '520px',
                }}>
                  {step.code}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
