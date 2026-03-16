import { useEffect, useState } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showRestored, setShowRestored] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowRestored(true)
      setTimeout(() => setShowRestored(false), 3000)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setShowRestored(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && !showRestored) return null

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium transition-all duration-300 ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-destructive text-destructive-foreground'
      }`}
      dir="rtl"
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>تم استعادة الاتصال بالإنترنت</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>لا يوجد اتصال بالإنترنت — يعمل في الوضع المحلي</span>
        </>
      )}
    </div>
  )
}
