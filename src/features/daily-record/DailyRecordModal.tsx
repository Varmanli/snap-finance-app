'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { JalaliDatePicker } from '@/components/ui/JalaliDatePicker';
import { TimePicker24 } from '@/components/ui/TimePicker24';
import { db } from '@/lib/db/dexie';
import { getTodayISO, formatJalaliDate } from '@/lib/formatters/jalali';
import { formatToman, formatNumber, toPersianDigits } from '@/lib/formatters/currency';
import { calculateShiftSummary } from '@/lib/calculations/financial';
import { DailyRecord } from '@/types';
import { Calculator, DollarSign, Fuel, Car, Smile, Zap, Navigation, CheckCircle2 } from 'lucide-react';

interface DailyRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DailyRecordModal({ isOpen, onClose, onSuccess }: DailyRecordModalProps) {
  const [date, setDate] = useState(getTodayISO());
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('16:30');
  const [startKm, setStartKm] = useState<number>(100000);
  const [shiftKm, setShiftKm] = useState<number>(220); // Primary shift distance input
  const [grossIncome, setGrossIncome] = useState<number>(0);
  const [fuelExpense, setFuelExpense] = useState<number>(0);
  const [parkingExpense, setParkingExpense] = useState<number>(0);
  const [tollExpense, setTollExpense] = useState<number>(0);
  const [carwashExpense, setCarwashExpense] = useState<number>(0);
  const [otherExpenses, setOtherExpenses] = useState<number>(0);
  const [fatigueLevel, setFatigueLevel] = useState<number>(5);
  const [moodLevel, setMoodLevel] = useState<number>(7);
  const [notes, setNotes] = useState('');
  const [depreciationRate, setDepreciationRate] = useState<number>(1800);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load last odometer reading & depreciation rate from settings
  useEffect(() => {
    if (isOpen) {
      async function initForm() {
        const settings = await db.settings.get(1);
        if (settings) {
          setDepreciationRate(settings.depreciationRate || 1800);
        }

        // Fetch latest endKm from last record
        const latestRecord = await db.dailyRecords.orderBy('endKm').last();
        if (latestRecord && latestRecord.endKm) {
          setStartKm(latestRecord.endKm);
        } else {
          setStartKm(100000);
        }
      }
      initForm();
    }
  }, [isOpen]);

  // Derived values
  const distanceKm = Math.max(0, shiftKm || 0);
  const calculatedEndKm = (startKm || 0) + distanceKm;

  // Live calculations preview
  const summary = calculateShiftSummary(
    {
      grossIncome: grossIncome || 0,
      fuelExpense: fuelExpense || 0,
      parkingExpense: parkingExpense || 0,
      tollExpense: tollExpense || 0,
      carwashExpense: carwashExpense || 0,
      otherExpenses: otherExpenses || 0,
      distanceKm,
    },
    depreciationRate
  );

  // Duration calculation in 24-hour mode
  const getDurationMinutes = () => {
    try {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      let mins = endH * 60 + endM - (startH * 60 + startM);
      if (mins < 0) mins += 24 * 60; // Cross midnight
      return mins;
    } catch {
      return 480;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (distanceKm <= 0) {
      alert('لطفاً مسافت طی شده این شیفت را وارد کنید.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newRecord: DailyRecord = {
        date,
        startTime,
        endTime,
        durationMinutes: getDurationMinutes(),
        startKm,
        endKm: calculatedEndKm,
        distanceKm,
        grossIncome: grossIncome || 0,
        fuelExpense: fuelExpense || 0,
        parkingExpense: parkingExpense || 0,
        tollExpense: tollExpense || 0,
        carwashExpense: carwashExpense || 0,
        otherExpenses: otherExpenses || 0,
        fatigueLevel,
        moodLevel,
        notes,
        createdAt: new Date().toISOString(),
      };

      await db.dailyRecords.add(newRecord);

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save daily record:', err);
      alert('خطا در ذخیره‌سازی اطلاعات شیفت.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ثبت سریع شیفت کاری اسنپ" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Live Economic Profit Highlight Card */}
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 p-3.5 sm:p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-emerald-900/40 pb-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Calculator className="h-4 w-4" />
              پیش‌نمایش زنده محاسبه سود واقعی شیفت
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">{formatJalaliDate(date)}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
              <div className="text-[10px] sm:text-[11px] text-zinc-400 truncate">مسافت طی شده</div>
              <div className="text-xs sm:text-sm font-black text-zinc-100 mt-0.5 truncate">
                {formatNumber(distanceKm)} کیلومتر
              </div>
            </div>

            <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
              <div className="text-[10px] sm:text-[11px] text-zinc-400 truncate">هزینه نقدی روزانه</div>
              <div className="text-xs sm:text-sm font-black text-amber-400 mt-0.5 truncate">
                {formatToman(summary.cashExpenses)}
              </div>
            </div>

            <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
              <div className="text-[10px] sm:text-[11px] text-zinc-400 truncate">استهلاک مجازی</div>
              <div className="text-xs sm:text-sm font-black text-rose-400 mt-0.5 truncate">
                {formatToman(summary.depreciation)}
              </div>
            </div>

            <div className="bg-emerald-950/90 p-2.5 rounded-xl border border-emerald-500/40">
              <div className="text-[10px] sm:text-[11px] text-emerald-300 font-bold truncate">سود واقعی اقتصادی</div>
              <div className="text-xs sm:text-sm font-black text-emerald-400 mt-0.5 truncate">
                {formatToman(summary.realProfit)}
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Dates, Times & Distance Input Flow */}
        <div className="space-y-3.5 bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-800/80">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Car className="h-4 w-4 text-emerald-400" />
              تاریخ، زمان و مسافت کاری
            </span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              پایان کیلومتر: {formatNumber(calculatedEndKm)}
            </span>
          </h3>

          {/* Full-width Shamsi Date Picker */}
          <JalaliDatePicker
            label="تاریخ شیفت کاری (شمسی)"
            value={date}
            onChange={setDate}
          />

          {/* 2-Column Start & End 24-Hour Shift Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TimePicker24
              label="ساعت شروع شیفت (۲۴ ساعته)"
              value={startTime}
              onChange={setStartTime}
            />
            <TimePicker24
              label="ساعت پایان شیفت (۲۴ ساعته)"
              value={endTime}
              onChange={setEndTime}
            />
          </div>

          {/* Simplified Distance Flow: Shift Distance (Primary Input) & Start/End Km */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                کیلومتر شروع (آخرین کارکرد)
              </label>
              <input
                type="number"
                value={startKm || ''}
                onChange={(e) => setStartKm(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-bold text-zinc-300 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-400 mb-1 flex items-center gap-1">
                <Navigation className="h-3.5 w-3.5 text-amber-400" />
                مسافت طی‌شده شیفت (کیلومتر)
              </label>
              <input
                type="number"
                step="5"
                placeholder="مثلاً ۲۲۰ کیلومتر"
                value={shiftKm || ''}
                onChange={(e) => setShiftKm(Number(e.target.value))}
                className="w-full rounded-xl border border-amber-500/50 bg-zinc-950 px-3 py-2 text-sm font-black text-amber-400 text-center focus:border-amber-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                کیلومتر پایان (محاسبه خودکار)
              </label>
              <div className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-xs font-bold text-emerald-400 text-center">
                {formatNumber(calculatedEndKm)} کیلومتر
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Financials (Gross & Cash Expenses) */}
        <div className="space-y-3.5 bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-800/80">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            درآمد ناخالص و هزینه‌های نقدی شیفت (تومان)
          </h3>

          <div>
            <label className="block text-xs font-bold text-emerald-400 mb-1">
              درآمد ناخالص اسنپ + انعام (تومان)
            </label>
            <input
              type="number"
              step="50000"
              placeholder="مثلا ۲,۵۰۰,۰۰۰ تومان"
              value={grossIncome || ''}
              onChange={(e) => setGrossIncome(Number(e.target.value))}
              className="w-full rounded-xl border border-emerald-500/50 bg-zinc-950 px-4 py-2.5 text-base font-black text-emerald-400 text-center focus:border-emerald-400 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1 flex items-center gap-1">
                <Fuel className="h-3 w-3 text-amber-400" /> بنزین / گاز
              </label>
              <input
                type="number"
                step="10000"
                placeholder="۰ تومان"
                value={fuelExpense || ''}
                onChange={(e) => setFuelExpense(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">پارکینگ</label>
              <input
                type="number"
                step="5000"
                placeholder="۰ تومان"
                value={parkingExpense || ''}
                onChange={(e) => setParkingExpense(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">عوارض بزرگراه</label>
              <input
                type="number"
                step="5000"
                placeholder="۰ تومان"
                value={tollExpense || ''}
                onChange={(e) => setTollExpense(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">کارواش</label>
              <input
                type="number"
                step="10000"
                placeholder="۰ تومان"
                value={carwashExpense || ''}
                onChange={(e) => setCarwashExpense(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="col-span-2 sm:col-span-2">
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">سایر هزینه‌های نقدی</label>
              <input
                type="number"
                step="10000"
                placeholder="۰ تومان"
                value={otherExpenses || ''}
                onChange={(e) => setOtherExpenses(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Fatigue & Mood Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-800/80">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-400" /> میزان خستگی
              </label>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                {toPersianDigits(fatigueLevel)} از ۱۰
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={fatigueLevel}
              onChange={(e) => setFatigueLevel(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1">
                <Smile className="h-3.5 w-3.5 text-emerald-400" /> روحیه و انرژی
              </label>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {toPersianDigits(moodLevel)} از ۱۰
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={moodLevel}
              onChange={(e) => setMoodLevel(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
            />
          </div>
        </div>

        {/* Section 4: Notes */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">توضیحات و یادداشت شیفت (اختیاری)</label>
          <input
            type="text"
            placeholder="مثلا: مسیرهای پرترافیک آزادی، هوای بارانی"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Full-width Sticky Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 py-3 text-sm font-bold text-zinc-950 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
            <span>{isSubmitting ? 'در حال ثبت...' : 'ثبت نهایی شیفت کاری'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
