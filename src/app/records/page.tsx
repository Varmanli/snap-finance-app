'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { calculateShiftSummary, aggregateRecordsSummary } from '@/lib/calculations/financial';
import { formatJalaliDate, getPersianDayName, formatTime24 } from '@/lib/formatters/jalali';
import { formatToman, formatNumber, toPersianDigits } from '@/lib/formatters/currency';
import { DailyRecordModal } from '@/features/daily-record/DailyRecordModal';
import { DailyRecord } from '@/types';
import { Calendar, Search, Trash2, Plus, Zap, Smile } from 'lucide-react';

export default function RecordsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const records = useLiveQuery(() => db.dailyRecords.orderBy('date').reverse().toArray(), []) || [];
  const settingsList = useLiveQuery(() => db.settings.toArray(), []) || [];
  const depreciationRate = settingsList[0]?.depreciationRate || 1800;

  const filteredRecords = records.filter((r) => {
    if (!searchTerm) return true;
    const jalaliStr = formatJalaliDate(r.date);
    return r.date.includes(searchTerm) || jalaliStr.includes(searchTerm) || (r.notes && r.notes.includes(searchTerm));
  });

  const aggregate = aggregateRecordsSummary(filteredRecords, depreciationRate);

  const handleDeleteRecord = async (id?: number) => {
    if (!id) return;
    if (confirm('آیا از حذف این شیفت کاری اطمینان دارید؟')) {
      await db.dailyRecords.delete(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-400" />
            تاریخچه شیفت‌های کاری اسنپ
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            ثبت سوابق کیلومتر، درآمد ناخالص، هزینه‌های نقدی و استهلاک هر شیفت
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 px-4 py-2 text-xs font-bold text-zinc-950 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>ثبت شیفت جدید</span>
        </button>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
          <div className="text-[11px] text-zinc-400">تعداد شیفت‌های ثبت‌شده</div>
          <div className="text-base font-bold text-zinc-100 mt-1">{formatNumber(aggregate.shiftCount)} شیفت</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
          <div className="text-[11px] text-zinc-400">کل مسافت ثبت‌شده</div>
          <div className="text-base font-bold text-amber-400 mt-1">{formatNumber(aggregate.totalDistanceKm)} کیلومتر</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
          <div className="text-[11px] text-zinc-400">مجموع درآمد ناخالص</div>
          <div className="text-base font-bold text-zinc-100 mt-1">{formatToman(aggregate.totalGrossIncome)}</div>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
          <div className="text-[11px] font-semibold text-emerald-300">مجموع سود واقعی خالص</div>
          <div className="text-base font-black text-emerald-400 mt-1">{formatToman(aggregate.totalRealProfit)}</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-3 top-3 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="جستجو در تاریخ یا یادداشت‌های شیفت..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pr-10 pl-4 py-2.5 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* Records Table / List */}
      <Card>
        <CardHeader>
          <CardTitle>فهرست شیفت‌های کاری ({filteredRecords.length})</CardTitle>
        </CardHeader>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-sm">
            هیچ شیفت کاری با مشخصات وارد شده یافت نشد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400">
                <tr>
                  <th className="p-3">تاریخ و روز</th>
                  <th className="p-3">زمان</th>
                  <th className="p-3">مسافت (کیلومتر)</th>
                  <th className="p-3">درآمد ناخالص</th>
                  <th className="p-3">هزینه نقدی</th>
                  <th className="p-3">استهلاک</th>
                  <th className="p-3">سود واقعی خالص</th>
                  <th className="p-3 text-center">روحیه / خستگی</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredRecords.map((r) => {
                  const summary = calculateShiftSummary(r, depreciationRate);
                  const dayName = getPersianDayName(r.date);

                  return (
                    <tr key={r.id || r.date} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="p-3 font-semibold text-zinc-100">
                        {formatJalaliDate(r.date)} <span className="text-[11px] text-zinc-500">({dayName})</span>
                      </td>
                      <td className="p-3 text-zinc-400 font-medium">
                        {formatTime24(r.startTime)} تا {formatTime24(r.endTime)} ({toPersianDigits(Math.round(r.durationMinutes / 60))} ساعت)
                      </td>
                      <td className="p-3 font-medium text-amber-300">
                        {formatNumber(r.distanceKm)} کیلومتر
                        <div className="text-[10px] text-zinc-500">{formatNumber(r.startKm)} → {formatNumber(r.endKm)}</div>
                      </td>
                      <td className="p-3 font-bold text-zinc-100">{formatToman(r.grossIncome)}</td>
                      <td className="p-3 text-amber-400">{formatToman(summary.cashExpenses)}</td>
                      <td className="p-3 text-rose-400">{formatToman(summary.depreciation)}</td>
                      <td className="p-3 font-black text-emerald-400">{formatToman(summary.realProfit)}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            <Zap className="h-3 w-3" /> {r.fatigueLevel}
                          </span>
                          <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            <Smile className="h-3 w-3" /> {r.moodLevel}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteRecord(r.id)}
                          className="rounded p-1 text-zinc-500 hover:bg-rose-500/20 hover:text-rose-400 transition-colors cursor-pointer"
                          title="حذف شیفت"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <DailyRecordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
