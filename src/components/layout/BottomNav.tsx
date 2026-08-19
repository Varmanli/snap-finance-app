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
} from 'lucide-react';

const MOBILE_NAV = [
  { href: '/', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/records', label: 'شیفت‌ها', icon: CalendarDays },
  { href: '/vehicle', label: 'خودرو', icon: Wrench },
  { href: '/expenses', label: 'هزینه‌ها', icon: Receipt },
  { href: '/goals', label: 'اهداف', icon: Target },
  { href: '/reports', label: 'گزارش', icon: BarChart3 },
  { href: '/settings', label: 'تنظیمات', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname ? pathname.startsWith(href) : false;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-lg px-1 py-2">
      <div className="flex items-center justify-around">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-center transition-all duration-150 ${
                active ? 'text-emerald-400 font-bold scale-105' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-emerald-400' : 'text-zinc-400'}`} />
              <span className="text-[10px] mt-0.5 whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
