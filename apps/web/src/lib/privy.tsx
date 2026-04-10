import { createContext, useContext, type ReactNode } from 'react'
import { PrivyProvider } from '@privy-io/react-auth'
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana'

const PrivyAvailabilityContext = createContext(false)

export function usePrivyConfigured() {
  return useContext(PrivyAvailabilityContext)
}

export function LaunchpadPrivyProvider({ children }: { children: ReactNode }) {
  const appId = import.meta.env.VITE_PRIVY_APP_ID?.trim()
  const clientId = import.meta.env.VITE_PRIVY_CLIENT_ID?.trim()
  const isConfigured = Boolean(appId && clientId)

  if (!isConfigured) {
    return (
      <PrivyAvailabilityContext.Provider value={false}>
        {children}
      </PrivyAvailabilityContext.Provider>
    )
  }

  return (
    <PrivyAvailabilityContext.Provider value>
      <PrivyProvider
        appId={appId as string}
        clientId={clientId as string}
        config={{
          appearance: {
            walletChainType: 'solana-only',
          },
          externalWallets: {
            solana: {
              connectors: toSolanaWalletConnectors(),
            },
          },
          embeddedWallets: {
            solana: {
              createOnLogin: 'users-without-wallets',
            },
          },
        }}
      >
        {children}
      </PrivyProvider>
    </PrivyAvailabilityContext.Provider>
  )
}
