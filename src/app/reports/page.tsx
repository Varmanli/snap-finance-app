'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { FinancialCharts } from '@/features/reports/FinancialCharts';
import { aggregateRecordsSummary } from '@/lib/calculations/financial';
import { formatToman, formatNumber } from '@/lib/formatters/currency';
import { isoToJalaliParts, PERSIAN_MONTH_NAMES } from '@/lib/formatters/jalali';
import { BarChart3, Filter, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const records = useLiveQuery(() => db.dailyRecords.toArray(), []) || [];
  const expenses = useLiveQuery(() => db.vehicleExpenses.toArray(), []) || [];
  const settingsList = useLiveQuery(() => db.settings.toArray(), []) || [];
  const depreciationRate = settingsList[0]?.depreciationRate || 1800;

  // Filter records & expenses by Jalali month
  const filteredRecords = records.filter((r) => {
    if (selectedMonth === 'all') return true;
    const { jm } = isoToJalaliParts(r.date);
    return jm === Number(selectedMonth);
  });

  const filteredExpenses = expenses.filter((e) => {
    if (selectedMonth === 'all') return true;
    const { jm } = isoToJalaliParts(e.date);
    return jm === Number(selectedMonth);
  });

  const aggregate = aggregateRecordsSummary(filteredRecords, depreciationRate);

  return (
    <div className="space-y-6">
      {/* Header & Jalali Month Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-4 sm:p-5 border-emerald-500/30">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>تحلیل‌های دیداری و گزارش‌های مالی</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">
            روند مقایسه‌ای درآمد ناخالص در برابر سود واقعی خالص، توزیع مسافت و تفکیک هزینه‌ها
          </p>
        </div>

        {/* Jalali Month Selector */}
        <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-xl border border-zinc-800 shrink-0 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-xs text-zinc-400 whitespace-nowrap">فیلتر ماه:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none cursor-pointer w-full"
          >
            <option value="all">همه ماه‌های سال (کل سوابق)</option>
            {PERSIAN_MONTH_NAMES.map((name, index) => (
              <option key={name} value={String(index + 1)}>
                ماه {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4">
          <div className="text-xs text-zinc-400">میانگین درآمد شیفت</div>
          <div className="text-lg font-bold text-zinc-100 mt-1">{formatToman(aggregate.avgIncomePerShift)}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">{formatNumber(aggregate.shiftCount)} شیفت در این بازه</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-xs text-zinc-400">میانگین سود واقعی شیفت</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">{formatToman(aggregate.avgRealProfitPerShift)}</div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">خالص ماندگار</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-xs text-zinc-400">میانگین کیلومتر شیفت</div>
          <div className="text-lg font-bold text-amber-400 mt-1">{formatNumber(aggregate.avgKmPerShift)} کیلومتر</div>
          <div className="text-[10px] text-amber-500/80 mt-0.5">کل پیمایش: {formatNumber(aggregate.totalDistanceKm)} ک‌م</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-xs text-zinc-400">کل استهلاک این بازه</div>
          <div className="text-lg font-bold text-rose-400 mt-1">{formatToman(aggregate.totalDepreciation)}</div>
          <div className="text-[10px] text-rose-500/80 mt-0.5">ذخیره شده در صندوق</div>
        </div>
      </div>

      {/* Interactive Charts Component */}
      <FinancialCharts records={filteredRecords} expenses={filteredExpenses} depreciationRate={depreciationRate} />
    </div>
  );
}
