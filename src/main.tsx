import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { OfflineIndicator } from './components/common/OfflineIndicator'
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <OfflineIndicator />
      <App />
      <PWAInstallPrompt />
    </ErrorBoundary>
  </StrictMode>,
)
