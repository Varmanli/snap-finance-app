'use client';

import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { DepreciationFundSummary } from '@/types';
import { formatToman, formatNumber } from '@/lib/formatters/currency';
import { PiggyBank, ShieldCheck, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface DepreciationCardProps {
  fund: DepreciationFundSummary;
  depreciationRate: number;
}

export function DepreciationCard({ fund, depreciationRate }: DepreciationCardProps) {
  const isHealthy = fund.currentBalance > 0;

  return (
    <Card className="border-amber-500/20">
      <CardHeader>
        <CardTitle className="amber-gradient-text">
          <PiggyBank className="h-5 w-5 text-amber-400 shrink-0" />
          <span>صندوق استهلاک مجازی خودرو</span>
        </CardTitle>
        <span
          className={`self-start sm:self-auto text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${
            isHealthy
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
        >
          {isHealthy ? 'تراز مثبت صندوق' : 'کسری موجودی صندوق'}
        </span>
      </CardHeader>

      <div className="space-y-3.5">
        {/* Main Balance Display - Mobile Stacked Responsive Layout */}
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-zinc-900 to-zinc-950 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-400">موجودی فعلی ذخیره استهلاک</span>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">{formatToman(fund.currentBalance)}</div>
          </div>
          <div className="text-right sm:text-left text-[11px] text-zinc-400 space-y-0.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
            <div>نرخ استهلاک: <span className="font-bold text-zinc-200">{formatNumber(depreciationRate)} تومان/کیلومتر</span></div>
            <div>مسافت کل ثبت‌شده: <span className="font-bold text-zinc-200">{formatNumber(fund.totalKmLogged)} کیلومتر</span></div>
          </div>
        </div>

        {/* Accrued vs Spent Breakdown */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 flex items-center gap-2.5">
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] sm:text-[11px] text-zinc-400 truncate">کل ذخیره واریز شده</div>
              <div className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5 truncate">{formatToman(fund.accruedFund)}</div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 flex items-center gap-2.5">
            <div className="p-1.5 sm:p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
              <ArrowDownRight className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] sm:text-[11px] text-zinc-400 truncate">برداشت برای تعمیرات</div>
              <div className="text-xs sm:text-sm font-bold text-rose-400 mt-0.5 truncate">{formatToman(fund.spentFromFund)}</div>
            </div>
          </div>
        </div>

        <p className="text-[10px] sm:text-[11px] text-zinc-500 flex items-start gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <span>این صندوق با هر کیلومتر کارکرد به طور خودکار شارژ شده و هزینه قطعات پرداختی از صندوق از آن کسر می‌شود.</span>
        </p>
      </div>
    </Card>
  );
}
