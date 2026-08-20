'use client';

import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { StatTile } from '@/components/ui/StatTile';
import { GoalWidget } from '@/features/dashboard/GoalWidget';
import { DepreciationCard } from '@/features/dashboard/DepreciationCard';
import { TodaySummary } from '@/features/dashboard/TodaySummary';
import { ServiceAlerts } from '@/features/dashboard/ServiceAlerts';
import { SmartInsightsCard } from '@/features/dashboard/SmartInsightsCard';
import { PreShiftEstimatorCard } from '@/features/dashboard/PreShiftEstimatorCard';
import { DailyRecordModal } from '@/features/daily-record/DailyRecordModal';
import { calculateTrajectoryForecast } from '@/lib/calculations/trajectory';
import { calculateDepreciationFund, aggregateRecordsSummary } from '@/lib/calculations/financial';
import { getTodayISO } from '@/lib/formatters/jalali';
import { formatToman, formatNumber } from '@/lib/formatters/currency';
import {
  DollarSign,
  TrendingUp,
  Car,
  PiggyBank,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const [isQuickRecordOpen, setIsQuickRecordOpen] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleDbUpdated = () => setTick((t) => t + 1);
    window.addEventListener('db-updated', handleDbUpdated);
    return () => window.removeEventListener('db-updated', handleDbUpdated);
  }, []);

  // Fetch live data from Dexie IndexedDB
  const records = useLiveQuery(() => db.dailyRecords.toArray(), []) || [];
  const expenses = useLiveQuery(() => db.vehicleExpenses.toArray(), []) || [];
  const services = useLiveQuery(() => db.maintenanceServices.toArray(), []) || [];
  const capitalTxs = useLiveQuery(() => db.capitalTransactions.toArray(), []) || [];
  const settingsList = useLiveQuery(() => db.settings.toArray(), []) || [];
  const settings = settingsList[0] || {
    depreciationRate: 1800,
    targetDailyIncome: 2500000,
    targetDailyKm: 250,
    goalTargetAmount: 400000000,
    goalTargetDate: '2027-03-21',
  };

  // Find today's record
  const todayISO = getTodayISO();
  const todayRecord = records.find((r) => r.date === todayISO) || null;

  // Compute domain calculations
  const forecast = calculateTrajectoryForecast(records, capitalTxs, settings);
  const depreciationFund = calculateDepreciationFund(records, expenses, settings.depreciationRate);
  const aggregateStats = aggregateRecordsSummary(records, settings.depreciationRate);

  // Latest vehicle odometer reading
  const currentKm = records.length > 0
    ? Math.max(...records.map((r) => r.endKm || 0))
    : 100000;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Executive Welcome & Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 glass-card p-4 sm:p-5 border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-zinc-900 to-zinc-950">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-zinc-100 tracking-tight">
            داشبورد اجرایی سفیر‌حساب
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 sm:mt-1">
            تحلیل سود واقعی اقتصادی، مدیریت استهلاک و پایش آنلاین هدف ۴۰۰ میلیونی
          </p>
        </div>

        {/* Action Button hidden on mobile to avoid duplication with Header */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => setIsQuickRecordOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>ثبت شیفت جدید</span>
          </button>
        </div>
      </div>

      {/* 4 Executive KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile
          title="میانگین سود واقعی ۳۰ روز اخیر"
          value={formatToman(forecast.average30DayRealDailyProfit)}
          subtext="خالص واقعی پس از کسر استهلاک"
          icon={TrendingUp}
          color="emerald"
        />
        <StatTile
          title="موجود صندوق استهلاک"
          value={formatToman(depreciationFund.currentBalance)}
          subtext={`ذخیره به ازای ${formatNumber(depreciationFund.totalKmLogged)} کیلومتر`}
          icon={PiggyBank}
          color="amber"
        />
        <StatTile
          title="کارکرد کل ثبت شده"
          value={`${formatNumber(aggregateStats.totalDistanceKm)} کیلومتر`}
          subtext={`در ${formatNumber(aggregateStats.shiftCount)} شیفت کاری`}
          icon={Car}
          color="blue"
        />
        <StatTile
          title="کل سود واقعی ثبت شده"
          value={formatToman(aggregateStats.totalRealProfit)}
          subtext="سود خالص ماندگار کسب‌شده"
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Today's Shift Progress */}
      <TodaySummary
        todayRecord={todayRecord}
        targetDailyIncome={settings.targetDailyIncome}
        targetDailyKm={settings.targetDailyKm}
        depreciationRate={settings.depreciationRate}
        onOpenQuickRecord={() => setIsQuickRecordOpen(true)}
      />

      {/* 400M Toman Goal Forecast Widget */}
      <GoalWidget forecast={forecast} goalTargetAmount={settings.goalTargetAmount} />

      {/* 2-Column Grid: Smart Insights & Pre-Shift Estimator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <SmartInsightsCard records={records} depreciationRate={settings.depreciationRate} />
        <PreShiftEstimatorCard depreciationRate={settings.depreciationRate} />
      </div>

      {/* 2-Column Grid: Virtual Depreciation Fund & Vehicle Service Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <DepreciationCard fund={depreciationFund} depreciationRate={settings.depreciationRate} />
        <ServiceAlerts services={services} currentKm={currentKm} />
      </div>

      {/* Quick Daily Record Modal */}
      <DailyRecordModal
        isOpen={isQuickRecordOpen}
        onClose={() => setIsQuickRecordOpen(false)}
      />
    </div>
  );
}
