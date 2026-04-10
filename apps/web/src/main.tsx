import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LaunchpadPrivyProvider } from './lib/privy.tsx'
import CreatorProfilePage from './pages/CreatorProfile.tsx'
import LaunchDetailPage from './pages/LaunchDetail.tsx'
import LaunchesPage from './pages/Launches.tsx'
import NewLaunchPage from './pages/NewLaunch.tsx'
import ReceiptDetailPage from './pages/ReceiptDetail.tsx'
import ReceiptsPage from './pages/Receipts.tsx'
import VerifyPage from './pages/Verify.tsx'

const pathname = window.location.pathname
const receiptDetailMatch = pathname.match(/^\/receipts\/([^/]+)$/)
const launchDetailMatch = pathname.match(/^\/launches\/([^/]+)$/)
const creatorProfileMatch = pathname.match(/^\/creators\/([^/]+)$/)

function renderLaunchpadPage(pageNode: ReactNode) {
  return (
    <LaunchpadPrivyProvider>
      {pageNode}
    </LaunchpadPrivyProvider>
  )
}

const page =
  pathname === '/verify'
    ? <VerifyPage />
    : receiptDetailMatch
      ? <ReceiptDetailPage receiptId={decodeURIComponent(receiptDetailMatch[1])} />
    : pathname === '/launch/new'
      ? renderLaunchpadPage(<NewLaunchPage />)
    : launchDetailMatch
      ? renderLaunchpadPage(
          <LaunchDetailPage launchId={decodeURIComponent(launchDetailMatch[1])} />
        )
    : pathname === '/launches'
      ? renderLaunchpadPage(<LaunchesPage />)
    : creatorProfileMatch
      ? renderLaunchpadPage(
          <CreatorProfilePage walletAddress={decodeURIComponent(creatorProfileMatch[1])} />
        )
    : pathname === '/receipts'
      ? <ReceiptsPage />
      : <App />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {page}
  </StrictMode>,
)
