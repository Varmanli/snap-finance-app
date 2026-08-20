'use client';

import React from 'react';
import { formatJalaliDate, getTodayISO } from '@/lib/formatters/jalali';
import { InstallPWAButton } from '@/components/layout/InstallPWAButton';
import { PlusCircle, Car, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenQuickRecord: () => void;
}

export function Header({ onOpenQuickRecord }: HeaderProps) {
  const todayJalali = formatJalaliDate(getTodayISO());

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
        {/* Brand & Date */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-zinc-950 shadow-md shadow-emerald-950/50 shrink-0">
            <Car className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-lg font-bold text-zinc-100 tracking-tight whitespace-nowrap">
                سفیر‌حساب <span className="text-xs text-emerald-400 font-normal hidden sm:inline">(اسنپ)</span>
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3 w-3" />
                آفلاین و محلی
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400">{todayJalali}</p>
          </div>
        </div>

        {/* Quick Action CTA Button & PWA Install Prompt */}
        <div className="flex items-center gap-2 shrink-0">
          <InstallPWAButton />

          <button
            onClick={onOpenQuickRecord}
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all duration-200 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-zinc-950 shadow-lg shadow-emerald-950/60 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline">ثبت شیفت جدید</span>
            <span className="sm:hidden">ثبت شیفت</span>
          </button>
        </div>
      </div>
    </header>
  );
}
