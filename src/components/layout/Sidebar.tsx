'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Wrench,
  Receipt,
  Target,
  BarChart3,
  Settings,
  Flame,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'داشبورد اصلی', icon: LayoutDashboard },
  { href: '/records', label: 'شیفت‌های کاری', icon: CalendarDays },
  { href: '/vehicle', label: 'وضعیت خودرو و قطعات', icon: Wrench },
  { href: '/expenses', label: 'هزینه‌های خودرو', icon: Receipt },
  { href: '/goals', label: 'سرمایه و اهداف مالی', icon: Target },
  { href: '/reports', label: 'گزارش‌ها و نمودارها', icon: BarChart3 },
  { href: '/settings', label: 'تنظیمات و پشتیبان‌گیری', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname ? pathname.startsWith(href) : false;
  };

  return (
    <aside className="hidden md:flex w-64 flex-col border-l border-zinc-800 bg-zinc-950/60 p-4 shrink-0">
      <div className="mb-6 flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20">
        <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
        <span className="text-xs font-medium text-amber-300">محاسبه دقیق سود واقعی</span>
      </div>

      <nav className="flex-1 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-950/20'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-emerald-400' : 'text-zinc-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info inside Sidebar */}
      <div className="mt-auto border-t border-zinc-800 pt-4 text-center">
        <p className="text-[11px] text-zinc-500">نسخه ۱.۰.۰ | محلی و بدون اینترنت</p>
        <p className="text-[10px] text-zinc-600 mt-0.5">ذخیره‌سازی داده در مرورگر (Dexie.js)</p>
      </div>
    </aside>
  );
}
