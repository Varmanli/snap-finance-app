'use client';

import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { DailyRecord } from '@/types';
import { calculateShiftSummary } from '@/lib/calculations/financial';
import { formatToman, formatNumber, toPersianDigits } from '@/lib/formatters/currency';
import { formatTime24 } from '@/lib/formatters/jalali';
import { Car, Clock, Zap, DollarSign, ArrowUpLeft } from 'lucide-react';

interface TodaySummaryProps {
  todayRecord: DailyRecord | null;
  targetDailyIncome: number;
  targetDailyKm: number;
  depreciationRate: number;
  onOpenQuickRecord: () => void;
}

export function TodaySummary({
  todayRecord,
  targetDailyIncome,
  targetDailyKm,
  depreciationRate,
  onOpenQuickRecord,
}: TodaySummaryProps) {
  if (!todayRecord) {
    return (
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-zinc-900 to-zinc-950">
        <div className="text-center py-6 space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Car className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-100">هنوز شیفت کاری امروز ثبت نشده است</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            با ثبت اطلاعات کیلومتر و درآمد امروز، سود واقعی خالص و استهلاک خودرو به طور زنده محاسبه می‌شود.
          </p>

          <button
            onClick={onOpenQuickRecord}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
          >
            <span>ثبت سریع شیفت امروز</span>
            <ArrowUpLeft className="h-4 w-4" />
          </button>
        </div>
      </Card>
    );
  }

  const summary = calculateShiftSummary(todayRecord, depreciationRate);
  const incomeProgress = Math.min(100, Math.round((todayRecord.grossIncome / targetDailyIncome) * 100));
  const kmProgress = Math.min(100, Math.round((todayRecord.distanceKm / targetDailyKm) * 100));

  return (
    <Card className="border-emerald-500/30">
      <CardHeader>
        <CardTitle className="text-emerald-400">
          <DollarSign className="h-5 w-5" />
          خلاصه شیفت کاری امروز
        </CardTitle>
        <span className="text-xs font-semibold text-zinc-400">
          {formatTime24(todayRecord.startTime)} تا {formatTime24(todayRecord.endTime)} ({toPersianDigits(Math.round(todayRecord.durationMinutes / 60))} ساعت)
        </span>
      </CardHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
          <div className="text-[11px] text-zinc-400">درآمد ناخالص اسنپ</div>
          <div className="text-base font-bold text-zinc-100 mt-1">{formatToman(todayRecord.grossIncome)}</div>
          <div className="text-[10px] text-emerald-400 mt-1">{toPersianDigits(incomeProgress)}٪ هدف روزانه</div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
          <div className="text-[11px] text-zinc-400">مسافت طی شده</div>
          <div className="text-base font-bold text-zinc-100 mt-1">{formatNumber(todayRecord.distanceKm)} کیلومتر</div>
          <div className="text-[10px] text-amber-400 mt-1">{toPersianDigits(kmProgress)}٪ سقف مسافت</div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
          <div className="text-[11px] text-zinc-400">هزینه نقدی + استهلاک</div>
          <div className="text-base font-bold text-rose-400 mt-1">
            {formatToman(summary.cashExpenses + summary.depreciation)}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">
            (استهلاک: {formatToman(summary.depreciation)})
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3">
          <div className="text-[11px] font-semibold text-emerald-300">سود واقعی اقتصادی</div>
          <div className="text-lg font-black text-emerald-400 mt-1">{formatToman(summary.realProfit)}</div>
          <div className="text-[10px] text-emerald-400/80 mt-1">خالص ماندگار</div>
        </div>
      </div>
    </Card>
  );
}
