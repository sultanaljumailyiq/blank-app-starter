import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('pwa-install-dismissed') === 'true');

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9998] bg-primary text-primary-foreground rounded-lg shadow-lg p-4 flex items-center justify-between max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <Download className="w-5 h-5 shrink-0" />
        <span className="text-sm">ثبّت التطبيق للوصول السريع</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={handleInstall} className="bg-primary-foreground text-primary px-3 py-1 rounded text-sm font-medium">
          تثبيت
        </button>
        <button onClick={handleDismiss} className="p-1 hover:opacity-70">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
