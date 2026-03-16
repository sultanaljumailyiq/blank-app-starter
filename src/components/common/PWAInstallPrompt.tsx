import { useEffect, useState } from 'react'
import { X, Download, Share } from 'lucide-react'

const DISMISSED_KEY = 'sdc_pwa_prompt_dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if already dismissed
    if (localStorage.getItem(DISMISSED_KEY)) return

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    if (ios) {
      // Show iOS instructions after 3s
      setTimeout(() => setShowPrompt(true), 3000)
    }

    // Listen for Android/Chrome install event
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem(DISMISSED_KEY, '1')
  }

  if (isInstalled || !showPrompt) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[9998] rounded-xl border border-border bg-card shadow-lg p-4 flex items-start gap-3"
      dir="rtl"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Download className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm">ثبّت التطبيق</p>
        {isIOS ? (
          <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
            اضغط على <Share className="inline h-3.5 w-3.5 mx-0.5" /> ثم اختر{' '}
            <strong>"إضافة إلى الشاشة الرئيسية"</strong> لتثبيت Smart Dental
          </p>
        ) : (
          <p className="text-muted-foreground text-xs mt-1">
            ثبّت Smart Dental على شاشتك الرئيسية للوصول السريع
          </p>
        )}

        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            تثبيت الآن
          </button>
        )}
      </div>

      <button
        onClick={handleDismiss}
        className="shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="إغلاق"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
