import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx'
import { OfflineIndicator } from './components/common/OfflineIndicator.tsx'
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <OfflineIndicator />
      <App />
      <PWAInstallPrompt />
    </ErrorBoundary>
  </StrictMode>,
)
