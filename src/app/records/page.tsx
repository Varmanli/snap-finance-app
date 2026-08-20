'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { db } from '@/lib/db/dexie';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { calculateShiftSummary, aggregateRecordsSummary } from '@/lib/calculations/financial';
import { formatJalaliDate, getPersianDayName, formatTime24 } from '@/lib/formatters/jalali';
import { formatToman, formatNumber, toPersianDigits } from '@/lib/formatters/currency';
import { DailyRecordModal } from '@/features/daily-record/DailyRecordModal';
import { DailyRecord } from '@/types';
import { Calendar, Search, Trash2, Edit3, Plus, Zap, Smile } from 'lucide-react';

export default function RecordsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<DailyRecord | null>(null);

  const records = useLiveQuery(() => db.dailyRecords.orderBy('date').reverse().toArray(), []) || [];
  const settingsList = useLiveQuery(() => db.settings.toArray(), []) || [];
  const depreciationRate = settingsList[0]?.depreciationRate || 1800;

  const filteredRecords = records.filter((r) => {
    if (!searchTerm) return true;
    const jalaliStr = formatJalaliDate(r.date);
    return r.date.includes(searchTerm) || jalaliStr.includes(searchTerm) || (r.notes && r.notes.includes(searchTerm));
  });

  const aggregate = aggregateRecordsSummary(filteredRecords, depreciationRate);

  const handleOpenCreate = () => {
    setRecordToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: DailyRecord) => {
    setRecordToEdit(record);
    setIsModalOpen(true);
  };

  const handleDeleteRecord = (id?: number) => {
    if (!id) return;
    toast('آیا از حذف این شیفت کاری اطمینان دارید؟', {
      action: {
        label: 'حذف قطعی',
        onClick: async () => {
          await db.dailyRecords.delete(id);
          toast.success('شیفت کاری با موفقیت حذف شد.');
        },
      },
      cancel: {
        label: 'انصراف',
        onClick: () => {},
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>تاریخچه شیفت‌های کاری اسنپ</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            ثبت سوابق کیلومتر، درآمد ناخالص، هزینه‌های نقدی و استهلاک هر شیفت
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 px-4 py-2 text-xs font-bold text-zinc-950 transition-all cursor-pointer shrink-0"
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

      {/* Records Section */}
      <Card>
        <CardHeader>
          <CardTitle>فهرست شیفت‌های کاری ({filteredRecords.length})</CardTitle>
        </CardHeader>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-sm">
            هیچ شیفت کاری با مشخصات وارد شده یافت نشد.
          </div>
        ) : (
          <>
            {/* Mobile View: Cards List (< md) */}
            <div className="block md:hidden space-y-3">
              {filteredRecords.map((r) => {
                const summary = calculateShiftSummary(r, depreciationRate);
                const dayName = getPersianDayName(r.date);

                return (
                  <div
                    key={r.id || r.date}
                    className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-3.5 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                      <div>
                        <div className="text-xs font-bold text-zinc-100">
                          {formatJalaliDate(r.date)} <span className="text-[11px] text-zinc-500">({dayName})</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {formatTime24(r.startTime)} تا {formatTime24(r.endTime)} ({toPersianDigits(Math.round(r.durationMinutes / 60))} ساعت)
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="rounded-lg p-1.5 bg-zinc-900 text-zinc-300 hover:text-emerald-400 border border-zinc-800 transition-colors"
                          title="ویرایش"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(r.id)}
                          className="rounded-lg p-1.5 bg-zinc-900 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/60">
                        <div className="text-[10px] text-zinc-400">مسافت شیفت</div>
                        <div className="font-bold text-amber-300 mt-0.5">{formatNumber(r.distanceKm)} کیلومتر</div>
                        <div className="text-[9px] text-zinc-500">{formatNumber(r.startKm)} → {formatNumber(r.endKm)}</div>
                      </div>

                      <div className="bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/60">
                        <div className="text-[10px] text-zinc-400">درآمد ناخالص</div>
                        <div className="font-bold text-zinc-100 mt-0.5">{formatToman(r.grossIncome)}</div>
                      </div>

                      <div className="bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/60">
                        <div className="text-[10px] text-zinc-400">هزینه + استهلاک</div>
                        <div className="font-bold text-rose-400 mt-0.5">{formatToman(summary.cashExpenses + summary.depreciation)}</div>
                      </div>

                      <div className="bg-emerald-950/60 p-2 rounded-xl border border-emerald-500/30">
                        <div className="text-[10px] text-emerald-300 font-bold">سود واقعی خالص</div>
                        <div className="font-black text-emerald-400 mt-0.5">{formatToman(summary.realProfit)}</div>
                      </div>
                    </div>

                    {r.notes && (
                      <div className="text-[11px] text-zinc-400 bg-zinc-900/40 p-2 rounded-lg border border-zinc-800/50">
                        {r.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Full Table (>= md) */}
            <div className="hidden md:block overflow-x-auto">
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
                              <Zap className="h-3 w-3" /> {toPersianDigits(r.fatigueLevel)}
                            </span>
                            <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              <Smile className="h-3 w-3" /> {toPersianDigits(r.moodLevel)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(r)}
                              className="rounded p-1 text-zinc-400 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors cursor-pointer"
                              title="ویرایش شیفت"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(r.id)}
                              className="rounded p-1 text-zinc-500 hover:bg-rose-500/20 hover:text-rose-400 transition-colors cursor-pointer"
                              title="حذف شیفت"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      <DailyRecordModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setRecordToEdit(null);
        }}
        recordToEdit={recordToEdit}
      />
    </div>
  );
}
