import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-destructive text-destructive-foreground text-center py-2 text-sm flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
      <span>لا يوجد اتصال بالإنترنت — الوضع غير متصل</span>
    </div>
  );
};
