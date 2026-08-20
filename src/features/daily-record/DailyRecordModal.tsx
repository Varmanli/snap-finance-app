'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { JalaliDatePicker } from '@/components/ui/JalaliDatePicker';
import { TimePicker24 } from '@/components/ui/TimePicker24';
import { PersianNumberInput } from '@/components/ui/PersianNumberInput';
import { db } from '@/lib/db/dexie';
import { getTodayISO, formatJalaliDate } from '@/lib/formatters/jalali';
import { formatToman, formatNumber } from '@/lib/formatters/currency';
import { calculateShiftSummary } from '@/lib/calculations/financial';
import { DailyRecord } from '@/types';
import { DollarSign, Fuel, Navigation, CheckCircle2, Calendar, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';

interface DailyRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  recordToEdit?: DailyRecord | null;
}

export function DailyRecordModal({ isOpen, onClose, onSuccess, recordToEdit }: DailyRecordModalProps) {
  const [date, setDate] = useState(getTodayISO());
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
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
  const [showExpensesGrid, setShowExpensesGrid] = useState(false);
  const [depreciationRate, setDepreciationRate] = useState<number>(1800);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!recordToEdit;

  // Populate form fields on edit or reset on create
  useEffect(() => {
    if (isOpen) {
      async function initForm() {
        const settings = await db.settings.get(1);
        if (settings) {
          setDepreciationRate(settings.depreciationRate || 1800);
        }

        if (recordToEdit) {
          setDate(recordToEdit.date);
          setStartTime(recordToEdit.startTime);
          setEndTime(recordToEdit.endTime);
          setStartKm(recordToEdit.startKm);
          setShiftKm(recordToEdit.distanceKm);
          setGrossIncome(recordToEdit.grossIncome);
          setFuelExpense(recordToEdit.fuelExpense || 0);
          setParkingExpense(recordToEdit.parkingExpense || 0);
          setTollExpense(recordToEdit.tollExpense || 0);
          setCarwashExpense(recordToEdit.carwashExpense || 0);
          setOtherExpenses(recordToEdit.otherExpenses || 0);
          if ((recordToEdit.fuelExpense || 0) + (recordToEdit.parkingExpense || 0) + (recordToEdit.tollExpense || 0) + (recordToEdit.carwashExpense || 0) > 0) {
            setShowExpensesGrid(true);
          }
        } else {
          // New shift mode
          setDate(getTodayISO());
          setStartTime('07:30');
          setEndTime('16:30');
          setGrossIncome(0);
          setFuelExpense(0);
          setParkingExpense(0);
          setTollExpense(0);
          setCarwashExpense(0);
          setOtherExpenses(0);
          setShowExpensesGrid(false);

          // Fetch latest endKm from last record
          const latestRecord = await db.dailyRecords.orderBy('endKm').last();
          if (latestRecord && latestRecord.endKm) {
            setStartKm(latestRecord.endKm);
          } else {
            setStartKm(100000);
          }
        }
      }
      initForm();
    }
  }, [isOpen, recordToEdit]);

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
      toast.warning('لطفاً مسافت طی شده این شیفت را وارد کنید.');
      return;
    }

    setIsSubmitting(true);
    try {
      const recordPayload: Omit<DailyRecord, 'id'> = {
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
        fatigueLevel: recordToEdit?.fatigueLevel || 5,
        moodLevel: recordToEdit?.moodLevel || 7,
        notes: recordToEdit?.notes || '',
        createdAt: recordToEdit?.createdAt || new Date().toISOString(),
      };

      if (recordToEdit && recordToEdit.id) {
        await db.dailyRecords.update(recordToEdit.id, recordPayload);
        toast.success('شیفت کاری با موفقیت ویرایش شد.');
      } else {
        await db.dailyRecords.add(recordPayload);
        toast.success('شیفت کاری جدید با موفقیت ثبت شد.');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save daily record:', err);
      toast.error('خطا در ذخیره‌سازی اطلاعات شیفت.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isToday = date === getTodayISO();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'ویرایش شیفت کاری ثبت‌شده' : 'ثبت سریع شیفت کاری (< ۳۰ ثانیه)'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Modern & Compact Date / Time Bar */}
        <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-zinc-200">
                تاریخ: <span className="text-emerald-400 font-extrabold">{formatJalaliDate(date)}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setDate(getTodayISO());
                  setShowCustomDatePicker(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isToday
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-950/50'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                امروز
              </button>

              <button
                type="button"
                onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 cursor-pointer"
              >
                تغییر تاریخ
              </button>
            </div>
          </div>

          {showCustomDatePicker && (
            <div className="pt-2 border-t border-zinc-800/80">
              <JalaliDatePicker
                label="انتخاب تاریخ شمسی شیفت"
                value={date}
                onChange={(newDate) => {
                  setDate(newDate);
                  setShowCustomDatePicker(false);
                }}
              />
            </div>
          )}

          {/* Compact 2-Column 24-Hour Shift Time Row */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <TimePicker24
              label="ساعت شروع شیفت"
              value={startTime}
              onChange={setStartTime}
            />
            <TimePicker24
              label="ساعت پایان شیفت"
              value={endTime}
              onChange={setEndTime}
            />
          </div>
        </div>

        {/* 2. Step 1: Distance & Odometer (One Main Input) */}
        <div className="bg-zinc-950/60 p-3.5 rounded-2xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
            <span className="flex items-center gap-1">
              <Navigation className="h-3.5 w-3.5 text-amber-400" />
              شروع: <strong className="text-zinc-200">{formatNumber(startKm)}</strong> کیلومتر
            </span>
            <span>
              پایان (خودکار): <strong className="text-emerald-400">{formatNumber(calculatedEndKm)}</strong> کیلومتر
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-400 mb-1">
              مسافت کارکرد امروز (کیلومتر)
            </label>
            <PersianNumberInput
              value={shiftKm}
              onChange={setShiftKm}
              placeholder="مثلاً ۲۲۰"
              className="w-full rounded-xl border border-amber-500/50 bg-zinc-950 px-4 py-2.5 text-base font-black text-amber-400 text-center focus:border-amber-400 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* 3. Step 2: Gross Income (Primary Focus) */}
        <div className="bg-gradient-to-r from-emerald-950/30 via-zinc-900 to-zinc-950 p-4 rounded-2xl border border-emerald-500/40">
          <label className="block text-xs font-extrabold text-emerald-400 mb-1.5 text-center flex items-center justify-center gap-1.5">
            <DollarSign className="h-4 w-4" />
            درآمد ناخالص اسنپ (تومان)
          </label>
          <PersianNumberInput
            value={grossIncome}
            onChange={setGrossIncome}
            placeholder="مثلا ۲,۵۰۰,۰۰۰"
            className="w-full rounded-xl border border-emerald-500 bg-zinc-950 px-4 py-3 text-lg font-black text-emerald-400 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            required
          />
        </div>

        {/* 4. Step 3: Expenses (Collapsible / Compact Grid) */}
        <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setShowExpensesGrid(!showExpensesGrid)}
            className="w-full flex items-center justify-between text-xs font-bold text-zinc-300 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Fuel className="h-4 w-4 text-amber-400" />
              هزینه‌های نقدی روزانه (بنزین، پارکینگ، عوارض، کارواش)
            </span>
            <span className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
              {summary.cashExpenses > 0 ? formatToman(summary.cashExpenses) : 'اختیاری (۰ تومان)'}
              {showExpensesGrid ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          </button>

          {showExpensesGrid && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-zinc-800 mt-2.5">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">بنزین / گاز</label>
                <PersianNumberInput
                  value={fuelExpense}
                  onChange={setFuelExpense}
                  placeholder="۰"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">پارکینگ</label>
                <PersianNumberInput
                  value={parkingExpense}
                  onChange={setParkingExpense}
                  placeholder="۰"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">عوارض</label>
                <PersianNumberInput
                  value={tollExpense}
                  onChange={setTollExpense}
                  placeholder="۰"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">کارواش / سایر</label>
                <PersianNumberInput
                  value={carwashExpense}
                  onChange={setCarwashExpense}
                  placeholder="۰"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* 5. Clean 2x2 Floating Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-center">
          <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
            <div className="text-[10px] text-zinc-400">مسافت</div>
            <div className="text-xs font-extrabold text-zinc-200 mt-0.5">
              {formatNumber(distanceKm)} کیلومتر
            </div>
          </div>

          <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
            <div className="text-[10px] text-zinc-400">استهلاک</div>
            <div className="text-xs font-extrabold text-rose-400 mt-0.5">
              {formatToman(summary.depreciation)}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
            <div className="text-[10px] text-zinc-400">هزینه نقدی</div>
            <div className="text-xs font-extrabold text-amber-400 mt-0.5">
              {formatToman(summary.cashExpenses)}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40">
            <div className="text-[10px] text-emerald-300 font-bold">سود خالص نهایی</div>
            <div className="text-xs font-black text-emerald-400 mt-0.5">
              {formatToman(summary.realProfit)}
            </div>
          </div>
        </div>

        {/* 6. Sticky Emerald Submit Button */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 py-3 text-sm font-black text-zinc-950 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer disabled:opacity-50"
          >
            {isEditMode ? <Edit3 className="h-5 w-5 stroke-[2.5]" /> : <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />}
            <span>{isSubmitting ? 'در حال ذخیره‌سازی...' : isEditMode ? 'ذخیره تغییرات شیفت' : 'ثبت نهایی شیفت'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
