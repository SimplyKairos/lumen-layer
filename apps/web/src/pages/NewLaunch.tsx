import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useWallets as useSolanaWallets } from '@privy-io/react-auth/solana'
import ProtocolPageShell, { protocolPageStyles } from '../components/protocol/ProtocolPageShell'
import {
  buildLaunchHref,
  createLaunch,
  normalizeLaunchpadError,
  type AlphaVaultMode,
  type LumenLaunch,
} from '../lib/launchpad-api'
import { usePrivyConfigured } from '../lib/privy'
import { formatReceiptTime, truncateReceiptValue } from '../lib/receipt-format'

type LaunchFormState = {
  tokenName: string
  tokenSymbol: string
  creatorWallet: string
  description: string
  imageUrl: string
  launchWindowSeconds: string
  alphaVaultMode: AlphaVaultMode
  maxWalletCap: string
  liquidityLocked: boolean
  lockDurationDays: string
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label htmlFor={htmlFor} style={protocolPageStyles.label}>
      {children}
    </label>
  )
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        minWidth: 0,
        padding: '18px 20px',
        borderRadius: '18px',
        border: '0.5px solid rgba(255,255,255,0.12)',
        background: 'rgba(3,7,15,0.64)',
        color: '#fff',
        fontFamily: props.type === 'number' ? "'DM Mono', monospace" : "'Outfit', sans-serif",
        fontSize: '14px',
        outline: 'none',
      }}
    />
  )
}

function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: '100%',
        minWidth: 0,
        minHeight: '132px',
        padding: '18px 20px',
        borderRadius: '18px',
        border: '0.5px solid rgba(255,255,255,0.12)',
        background: 'rgba(3,7,15,0.64)',
        color: '#fff',
        fontFamily: "'Outfit', sans-serif",
        fontSize: '14px',
        outline: 'none',
        resize: 'vertical',
      }}
    />
  )
}

function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        width: '100%',
        minWidth: 0,
        padding: '18px 20px',
        borderRadius: '18px',
        border: '0.5px solid rgba(255,255,255,0.12)',
        background: 'rgba(3,7,15,0.64)',
        color: '#fff',
        fontFamily: "'Outfit', sans-serif",
        fontSize: '14px',
        outline: 'none',
      }}
    />
  )
}

function ConfiguredWalletCard({
  onWalletAddress,
}: {
  onWalletAddress: (walletAddress: string | null) => void
}) {
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets, ready: walletsReady } = useSolanaWallets()
  const connectedWallet = wallets[0] ?? null

  useEffect(() => {
    onWalletAddress(connectedWallet?.address ?? null)
  }, [connectedWallet?.address, onWalletAddress])

  return (
    <div style={{ ...protocolPageStyles.panel, padding: '28px', display: 'grid', gap: '16px' }}>
      <div style={{ display: 'grid', gap: '10px' }}>
        <span style={protocolPageStyles.eyebrow}>Wallet connection</span>
        <h2 style={protocolPageStyles.sectionTitle}>Connect or create a wallet</h2>
        <p style={protocolPageStyles.body}>
          Wallet connection supports launch creation, but the launch configuration stays the focal point of this page.
        </p>
      </div>

      {!ready || !walletsReady ? (
        <p style={protocolPageStyles.body}>Preparing the wallet connection flow.</p>
      ) : connectedWallet ? (
        <div style={{ display: 'grid', gap: '12px' }}>
          <span style={protocolPageStyles.label}>Connected Solana wallet</span>
          <span style={protocolPageStyles.mono}>{truncateReceiptValue(connectedWallet.address)}</span>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {!authenticated ? (
              <button
                type="button"
                onClick={() => login()}
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#fff',
                  background: 'rgba(27,79,216,0.16)',
                  border: '0.5px solid rgba(27,79,216,0.42)',
                  padding: '14px 18px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                }}
              >
                Finish sign in
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => logout()}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: '#fff',
                background: 'rgba(255,255,255,0.06)',
                border: '0.5px solid rgba(255,255,255,0.12)',
                padding: '14px 18px',
                borderRadius: '16px',
                cursor: 'pointer',
              }}
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => login()}
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '14px',
            fontWeight: 600,
            color: '#fff',
            background: 'rgba(27,79,216,0.16)',
            border: '0.5px solid rgba(27,79,216,0.42)',
            padding: '16px 18px',
            borderRadius: '16px',
            cursor: 'pointer',
            justifySelf: 'start',
          }}
        >
          Connect or create wallet
        </button>
      )}
    </div>
  )
}

function UnconfiguredWalletCard() {
  return (
    <div style={{ ...protocolPageStyles.panel, padding: '28px', display: 'grid', gap: '16px' }}>
      <div style={{ display: 'grid', gap: '10px' }}>
        <span style={protocolPageStyles.eyebrow}>Wallet connection</span>
        <h2 style={protocolPageStyles.sectionTitle}>Privy is not configured yet</h2>
        <p style={protocolPageStyles.body}>
          Add <span style={protocolPageStyles.monoCompact}>VITE_PRIVY_APP_ID</span> and <span style={protocolPageStyles.monoCompact}>VITE_PRIVY_CLIENT_ID</span> before browser QA. You can still enter a creator wallet manually.
        </p>
      </div>
    </div>
  )
}

export default function NewLaunchPage() {
  const privyConfigured = usePrivyConfigured()
  const [form, setForm] = useState<LaunchFormState>({
    tokenName: '',
    tokenSymbol: '',
    creatorWallet: '',
    description: '',
    imageUrl: '',
    launchWindowSeconds: '300',
    alphaVaultMode: 'FCFS',
    maxWalletCap: '',
    liquidityLocked: true,
    lockDurationDays: '30',
  })
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdLaunch, setCreatedLaunch] = useState<LumenLaunch | null>(null)

  useEffect(() => {
    if (!selectedWalletAddress || form.creatorWallet.trim()) {
      return
    }

    setForm((current) => ({
      ...current,
      creatorWallet: selectedWalletAddress,
    }))
  }, [selectedWalletAddress, form.creatorWallet])

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target
    const nextValue = event.target instanceof HTMLInputElement && event.target.type === 'checkbox'
      ? event.target.checked
      : value

    setForm((current) => ({
      ...current,
      [name]: nextValue,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const launchWindowSeconds = Number.parseInt(form.launchWindowSeconds, 10)
    const lockDurationDays = Number.parseInt(form.lockDurationDays, 10)
    const maxWalletCap = form.maxWalletCap.trim()
      ? Number.parseFloat(form.maxWalletCap)
      : null

    if (!Number.isFinite(launchWindowSeconds) || launchWindowSeconds <= 0) {
      setSubmitting(false)
      setError('Enter a valid protection window before creating the launch.')
      return
    }

    if (!Number.isFinite(lockDurationDays) || lockDurationDays < 0) {
      setSubmitting(false)
      setError('Enter a valid lock duration before creating the launch.')
      return
    }

    if (!form.creatorWallet.trim()) {
      setSubmitting(false)
      setError('Add a creator wallet before creating the launch.')
      return
    }

    try {
      const launch = await createLaunch({
        tokenName: form.tokenName.trim(),
        tokenSymbol: form.tokenSymbol.trim(),
        creatorWallet: form.creatorWallet.trim(),
        description: form.description.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        launchWindowSeconds,
        alphaVaultMode: form.alphaVaultMode,
        maxWalletCap,
        liquidityLocked: form.liquidityLocked,
        lockDurationDays,
      })

      setCreatedLaunch(launch)
    } catch (err) {
      setCreatedLaunch(null)
      setError(normalizeLaunchpadError(err, undefined, true))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtocolPageShell>
      <section style={{
        ...protocolPageStyles.panel,
        padding: '48px',
        display: 'grid',
        gap: '16px',
      }}>
        <span style={protocolPageStyles.eyebrow}>Launch configuration</span>
        <h1 style={protocolPageStyles.displayTitle}>Configure a public fair launch</h1>
        <p style={{ ...protocolPageStyles.body, maxWidth: '760px' }}>
          Define token identity, protection window, and the pre-live Alpha Vault setup before this launch moves into the public trading path.
        </p>
      </section>

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 0.9fr)',
        gap: '24px',
      }}>
        <form
          onSubmit={handleSubmit}
          style={{
            ...protocolPageStyles.panel,
            padding: '32px',
            display: 'grid',
            gap: '24px',
          }}
        >
          <div style={{ display: 'grid', gap: '12px' }}>
            <h2 style={protocolPageStyles.sectionTitle}>Launch configuration</h2>
            <p style={protocolPageStyles.body}>
              Set the identity, protection window, and trust-facing launch parameters that Phase 5 can support honestly today.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}>
            <div style={{ display: 'grid', gap: '10px' }}>
              <FieldLabel htmlFor="tokenName">Token name</FieldLabel>
              <TextInput
                id="tokenName"
                name="tokenName"
                value={form.tokenName}
                onChange={handleInputChange}
                placeholder="Lumen Fair Launch"
                required
              />
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
              <FieldLabel htmlFor="tokenSymbol">Token symbol</FieldLabel>
              <TextInput
                id="tokenSymbol"
                name="tokenSymbol"
                value={form.tokenSymbol}
                onChange={handleInputChange}
                placeholder="LUMEN"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            <FieldLabel htmlFor="creatorWallet">Creator wallet</FieldLabel>
            <TextInput
              id="creatorWallet"
              name="creatorWallet"
              value={form.creatorWallet}
              onChange={handleInputChange}
              placeholder="Enter the creator wallet address"
              required
            />
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            <FieldLabel htmlFor="description">Launch description</FieldLabel>
            <TextArea
              id="description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              placeholder="Describe the launch context"
            />
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            <FieldLabel htmlFor="imageUrl">Image URL</FieldLabel>
            <TextInput
              id="imageUrl"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleInputChange}
              placeholder="https://..."
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}>
            <div style={{ display: 'grid', gap: '10px' }}>
              <FieldLabel htmlFor="launchWindowSeconds">Protection window (seconds)</FieldLabel>
              <TextInput
                id="launchWindowSeconds"
                name="launchWindowSeconds"
                type="number"
                min="1"
                value={form.launchWindowSeconds}
                onChange={handleInputChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
              <FieldLabel htmlFor="alphaVaultMode">Alpha Vault mode</FieldLabel>
              <SelectInput
                id="alphaVaultMode"
                name="alphaVaultMode"
                value={form.alphaVaultMode}
                onChange={handleInputChange}
              >
                <option value="FCFS">FCFS</option>
                <option value="PRORATA">PRORATA</option>
              </SelectInput>
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
              <FieldLabel htmlFor="maxWalletCap">Max wallet cap</FieldLabel>
              <TextInput
                id="maxWalletCap"
                name="maxWalletCap"
                type="number"
                min="0"
                step="0.000001"
                value={form.maxWalletCap}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
              <FieldLabel htmlFor="lockDurationDays">Lock duration (days)</FieldLabel>
              <TextInput
                id="lockDurationDays"
                name="lockDurationDays"
                type="number"
                min="0"
                value={form.lockDurationDays}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#fff',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '14px',
          }}>
            <input
              type="checkbox"
              name="liquidityLocked"
              checked={form.liquidityLocked}
              onChange={handleInputChange}
            />
            Liquidity locked
          </label>

          {error ? (
            <p style={{ ...protocolPageStyles.body, color: '#ffd5dd' }}>{error}</p>
          ) : null}

          {createdLaunch ? (
            <div style={{
              display: 'grid',
              gap: '10px',
              padding: '18px 20px',
              borderRadius: '18px',
              border: '0.5px solid rgba(27,79,216,0.34)',
              background: 'rgba(27,79,216,0.1)',
            }}>
              <span style={protocolPageStyles.label}>Launch created</span>
              <span style={protocolPageStyles.body}>
                {createdLaunch.tokenName} entered the configured state at {formatReceiptTime(createdLaunch.createdAt)}.
              </span>
              <a href={buildLaunchHref(createdLaunch.launchId)} style={protocolPageStyles.link}>
                Open launch detail
              </a>
            </div>
          ) : null}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ ...protocolPageStyles.body, maxWidth: '420px' }}>
              Clarity before capital.
            </span>
            <button
              type="submit"
              disabled={submitting}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: '#fff',
                background: submitting ? 'rgba(27,79,216,0.24)' : 'rgba(27,79,216,0.16)',
                border: '0.5px solid rgba(27,79,216,0.42)',
                backdropFilter: 'blur(12px)',
                padding: '16px 22px',
                borderRadius: '18px',
                cursor: submitting ? 'wait' : 'pointer',
                boxShadow: '0 0 20px rgba(27,79,216,0.12)',
              }}
            >
              {submitting ? 'Creating launch...' : 'Create Launch'}
            </button>
          </div>
        </form>

        <div style={{ display: 'grid', gap: '24px', alignContent: 'start' }}>
          {privyConfigured ? (
            <ConfiguredWalletCard onWalletAddress={setSelectedWalletAddress} />
          ) : (
            <UnconfiguredWalletCard />
          )}

          <div style={{ ...protocolPageStyles.panel, padding: '28px', display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gap: '10px' }}>
              <span style={protocolPageStyles.eyebrow}>Alpha Vault setup</span>
              <h2 style={protocolPageStyles.sectionTitle}>Pre-live linkage summary</h2>
            </div>
            <p style={protocolPageStyles.body}>
              Phase 5a provisions the deterministic Alpha Vault linkage seam and stores it on the launch record before DBC activation.
            </p>
            <div style={{ display: 'grid', gap: '10px' }}>
              <span style={protocolPageStyles.label}>Selected mode</span>
              <span style={protocolPageStyles.mono}>{form.alphaVaultMode}</span>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              <span style={protocolPageStyles.label}>Protection window</span>
              <span style={protocolPageStyles.mono}>{form.launchWindowSeconds || '0'} seconds</span>
            </div>
          </div>
        </div>
      </section>
    </ProtocolPageShell>
  )
}
