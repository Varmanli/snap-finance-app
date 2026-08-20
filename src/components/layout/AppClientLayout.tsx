'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { DailyRecordModal } from '@/features/daily-record/DailyRecordModal';

export function AppClientLayout({ children }: { children: React.ReactNode }) {
  const [isQuickRecordOpen, setIsQuickRecordOpen] = useState(false);

  useEffect(() => {
    // Register Service Worker for offline PWA functionality
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('[PWA] Service Worker registered successfully:', reg.scope))
        .catch((err) => console.error('[PWA] Service Worker registration failed:', err));
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Header */}
      <Header onOpenQuickRecord={() => setIsQuickRecordOpen(true)} />

      <div className="flex flex-1 relative">
        {/* Desktop Sidebar (RTL: right side fixed) */}
        <Sidebar />

        {/* Main Content View with responsive padding: pb-24 on mobile for BottomNav */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Global Quick Record Modal */}
      <DailyRecordModal
        isOpen={isQuickRecordOpen}
        onClose={() => setIsQuickRecordOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new Event('db-updated'));
        }}
      />
    </div>
  );
}
