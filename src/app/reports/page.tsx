'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { FinancialCharts } from '@/features/reports/FinancialCharts';
import { aggregateRecordsSummary } from '@/lib/calculations/financial';
import { formatToman, formatNumber } from '@/lib/formatters/currency';
import { BarChart3, TrendingUp, Calendar, Zap, DollarSign } from 'lucide-react';

export default function ReportsPage() {
  const records = useLiveQuery(() => db.dailyRecords.toArray(), []) || [];
  const expenses = useLiveQuery(() => db.vehicleExpenses.toArray(), []) || [];
  const settingsList = useLiveQuery(() => db.settings.toArray(), []) || [];
  const depreciationRate = settingsList[0]?.depreciationRate || 1800;

  const aggregate = aggregateRecordsSummary(records, depreciationRate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-5 border-emerald-500/30">
        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-400" />
          تحلیل‌های دیداری و گزارش‌های مالی
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          روند مقایسه‌ای درآمد ناخالص در برابر سود واقعی خالص، توزیع مسافت و تفکیک هزینه‌ها
        </p>
      </div>

      {/* Analytics KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4">
          <div className="text-xs text-zinc-400">میانگین درآمد شیفت</div>
          <div className="text-lg font-bold text-zinc-100 mt-1">{formatToman(aggregate.avgIncomePerShift)}</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-xs text-zinc-400">میانگین سود واقعی شیفت</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">{formatToman(aggregate.avgRealProfitPerShift)}</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-xs text-zinc-400">میانگین کیلومتر شیفت</div>
          <div className="text-lg font-bold text-amber-400 mt-1">{formatNumber(aggregate.avgKmPerShift)} کیلومتر</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-xs text-zinc-400">کل استهلاک محاسبه‌شده</div>
          <div className="text-lg font-bold text-rose-400 mt-1">{formatToman(aggregate.totalDepreciation)}</div>
        </div>
      </div>

      {/* Interactive Charts Component */}
      <FinancialCharts records={records} expenses={expenses} depreciationRate={depreciationRate} />
    </div>
  );
}
