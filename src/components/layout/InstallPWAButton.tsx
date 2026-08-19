'use client';

import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';

export function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="h-3.5 w-3.5" />
        نصب شده
      </span>
    );
  }

  if (!deferredPrompt) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 active:scale-95 px-3 py-1.5 text-xs font-bold text-teal-300 border border-teal-500/30 transition-all cursor-pointer shadow-sm"
      title="نصب مستقیم برنامه روی صفحه اصلی"
    >
      <Download className="h-3.5 w-3.5 stroke-[2.5]" />
      <span>نصب اپلیکیشن</span>
    </button>
  );
}
