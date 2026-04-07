import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ReceiptDetailPage from './pages/ReceiptDetail.tsx'
import ReceiptsPage from './pages/Receipts.tsx'
import VerifyPage from './pages/Verify.tsx'

const pathname = window.location.pathname
const receiptDetailMatch = pathname.match(/^\/receipts\/([^/]+)$/)

const page =
  pathname === '/verify'
    ? <VerifyPage />
    : receiptDetailMatch
      ? <ReceiptDetailPage receiptId={decodeURIComponent(receiptDetailMatch[1])} />
    : pathname === '/receipts'
      ? <ReceiptsPage />
      : <App />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {page}
  </StrictMode>,
)
