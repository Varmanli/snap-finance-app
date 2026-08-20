'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { db } from '@/lib/db/dexie';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { JalaliDatePicker } from '@/components/ui/JalaliDatePicker';
import { PersianNumberInput } from '@/components/ui/PersianNumberInput';
import { CapitalTransaction, PersonalGoal } from '@/types';
import { calculateTrajectoryForecast } from '@/lib/calculations/trajectory';
import { formatToman, formatNumber, toPersianDigits } from '@/lib/formatters/currency';
import { formatJalaliDate, getTodayISO } from '@/lib/formatters/jalali';
import { Target, ArrowUpRight, ArrowDownLeft, Plus, Clock, Trash2, Heart } from 'lucide-react';

export default function GoalsPage() {
  const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const capitalTxs = useLiveQuery(() => db.capitalTransactions.orderBy('date').reverse().toArray(), []) || [];
  const personalGoals = useLiveQuery(() => db.personalGoals.toArray(), []) || [];
  const records = useLiveQuery(() => db.dailyRecords.toArray(), []) || [];
  const settingsList = useLiveQuery(() => db.settings.toArray(), []) || [];
  const settings = settingsList[0] || { goalTargetAmount: 400000000, goalTargetDate: '2027-03-21', depreciationRate: 1800 };

  const forecast = calculateTrajectoryForecast(records, capitalTxs, settings);

  const handleDeleteCapitalTx = (id?: number) => {
    if (!id) return;
    toast('آیا از حذف این تراکنش صندوق اطمینان دارید؟', {
      action: {
        label: 'حذف قطعی',
        onClick: async () => {
          await db.capitalTransactions.delete(id);
          toast.success('تراکنش صندوق با موفقیت حذف شد.');
        },
      },
      cancel: {
        label: 'انصراف',
        onClick: () => {},
      },
    });
  };

  const handleDeleteGoal = (id?: number) => {
    if (!id) return;
    toast('آیا از حذف این هدف شخصی اطمینان دارید؟', {
      action: {
        label: 'حذف قطعی',
        onClick: async () => {
          await db.personalGoals.delete(id);
          toast.success('هدف شخصی حذف گردید.');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 glass-card p-4 sm:p-5 border-emerald-500/30">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>سرمایه و اهداف مالی / شخصی</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">
            پایش آنلاین پیشرفت هدف خرید خودروی جدید و مدیریت تعادل کار و زندگی
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsCapitalModalOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 px-3 py-2 text-xs font-bold text-zinc-950 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>واریز/برداشت صندوق</span>
          </button>

          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          >
            <Heart className="h-4 w-4 text-rose-400" />
            <span>هدف شخصی جدید</span>
          </button>
        </div>
      </div>

      {/* Main 400M Target Progress Card */}
      <Card className="border-emerald-500/30">
        <CardHeader>
          <CardTitle className="emerald-gradient-text">
            هدف مالی بزرگ: خرید خودروی جدید (۴۰۰,۰۰۰,۰۰۰ تومان)
          </CardTitle>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {toPersianDigits(forecast.goalProgressPercent)}٪ تحقق یافته
          </span>
        </CardHeader>

        <div className="space-y-6">
          <ProgressBar
            progress={forecast.goalProgressPercent}
            color="emerald"
            label={`کل پس‌انداز موجود صندوق: ${formatToman(forecast.currentTotalSavings)}`}
            showPercent={true}
            height="h-4"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="text-xs text-zinc-400">تاریخ تخمینی تحقق هدف</div>
              <div className="text-base font-bold text-zinc-100 mt-1">
                {forecast.projectedCompletionDate || 'در حال محاسبه...'}
              </div>
              {forecast.projectedDaysRemaining !== null && forecast.projectedDaysRemaining > 0 && (
                <div className="text-xs text-emerald-400 mt-1">
                  {formatNumber(forecast.projectedDaysRemaining)} روز کاری دیگر
                </div>
              )}
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="text-xs text-zinc-400">میانگین پس‌انداز ۳۰ روز اخیر</div>
              <div className="text-base font-bold text-amber-400 mt-1">
                {formatToman(forecast.average30DayRealDailyProfit)} / روز
              </div>
              <div className="text-xs text-zinc-500 mt-1">بر اساس سود واقعی خالص</div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="text-xs text-zinc-400">پس‌انداز مورد نیاز تا ددلاین</div>
              <div className="text-base font-bold text-blue-400 mt-1">
                {formatToman(forecast.requiredDailySavingsToDeadline)} / روز
              </div>
              <div className="text-xs text-zinc-500 mt-1">هدف زمان‌بندی: ۱ فروردین ۱۴۰۶</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2-Column Section: Capital Transactions & Personal Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capital Savings Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>تراکنش‌های صندوق پس‌انداز ({capitalTxs.length})</CardTitle>
          </CardHeader>

          {capitalTxs.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              هنوز هیچ تراکنشی ثبت نشده است.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {capitalTxs.map((tx) => (
                <div key={tx.id || tx.createdAt} className="p-3 flex items-center justify-between hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl border ${
                        tx.type === 'deposit'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {tx.type === 'deposit' ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-200">
                        {tx.type === 'deposit' ? 'واریز به صندوق' : 'برداشت از صندوق'}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {formatJalaliDate(tx.date)} {tx.note && `• ${tx.note}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold ${
                        tx.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'deposit' ? '+' : '-'}{formatToman(tx.amount)}
                    </span>
                    <button
                      onClick={() => handleDeleteCapitalTx(tx.id)}
                      className="rounded p-1 text-zinc-500 hover:bg-rose-500/20 hover:text-rose-400 transition-colors cursor-pointer"
                      title="حذف تراکنش"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Personal Work-Life Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-rose-400">
              <Heart className="h-4 w-4 text-rose-400" />
              اهداف تعادل کار و زندگی ({personalGoals.length})
            </CardTitle>
          </CardHeader>

          {personalGoals.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              هنوز هیچ هدف شخصی ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-4">
              {personalGoals.map((goal) => {
                const percent = Math.min(
                  100,
                  Math.round(((goal.loggedMinutes || 0) / (goal.targetWeeklyMinutes || 1)) * 100)
                );

                return (
                  <div key={goal.id || goal.title} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-zinc-200">{goal.title}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-amber-400" />
                          {toPersianDigits(goal.loggedMinutes || 0)} / {toPersianDigits(goal.targetWeeklyMinutes)} دقیقه
                        </span>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="rounded p-1 text-zinc-500 hover:bg-rose-500/20 hover:text-rose-400 transition-colors cursor-pointer"
                          title="حذف هدف"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <ProgressBar progress={percent} color="amber" showPercent={true} height="h-2" />
                    {goal.notes && <p className="text-[10px] text-zinc-500">{goal.notes}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Capital Modal */}
      <CapitalTxModal isOpen={isCapitalModalOpen} onClose={() => setIsCapitalModalOpen(false)} />

      {/* Personal Goal Modal */}
      <PersonalGoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} />
    </div>
  );
}

function CapitalTxModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [date, setDate] = useState(getTodayISO());
  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.warning('لطفاً مبلغ تراکنش را وارد کنید.');
      return;
    }

    const tx: CapitalTransaction = {
      date,
      type,
      amount,
      note,
      createdAt: new Date().toISOString(),
    };

    await db.capitalTransactions.add(tx);
    toast.success('تراکنش صندوق با موفقیت ثبت شد.');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ثبت تراکنش صندوق پس‌انداز">
      <form onSubmit={handleSubmit} className="space-y-4">
        <JalaliDatePicker label="تاریخ تراکنش (شمسی)" value={date} onChange={setDate} />

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">نوع تراکنش</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('deposit')}
              className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                type === 'deposit'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              واریز به صندوق (+)
            </button>
            <button
              type="button"
              onClick={() => setType('withdrawal')}
              className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                type === 'withdrawal'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              برداشت از صندوق (-)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-amber-400 mb-1">مبلغ تراکنش (تومان)</label>
          <PersianNumberInput
            value={amount}
            onChange={setAmount}
            placeholder="مثلا ۵,۰۰۰,۰۰۰"
            className="w-full rounded-lg border border-amber-500/40 bg-zinc-950 px-3 py-2 text-base font-bold text-amber-400 focus:border-amber-400 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">توضیحات تراکنش (اختیاری)</label>
          <input
            type="text"
            placeholder="مثلا واریز سود هفته دوم اسفند"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800"
          >
            انصراف
          </button>
          <button
            type="submit"
            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2 font-bold text-zinc-950 cursor-pointer"
          >
            ثبت تراکنش
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PersonalGoalModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [targetWeeklyMinutes, setTargetWeeklyMinutes] = useState<number>(180);
  const [loggedMinutes, setLoggedMinutes] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warning('لطفاً عنوان هدف را وارد کنید.');
      return;
    }

    const goal: PersonalGoal = {
      title,
      targetWeeklyMinutes,
      loggedMinutes,
      notes,
    };

    await db.personalGoals.add(goal);
    toast.success('هدف شخصی جدید با موفقیت اضافه شد.');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تعریف هدف تعادل کار و زندگی">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">عنوان هدف شخصی</label>
          <input
            type="text"
            placeholder="مثلا ورزش و پیاده‌روی هفتگی"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">هدف هفتگی (دقیقه)</label>
            <PersianNumberInput
              value={targetWeeklyMinutes}
              onChange={setTargetWeeklyMinutes}
              placeholder="مثلا ۱۸۰"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">انجام شده (دقیقه)</label>
            <PersianNumberInput
              value={loggedMinutes}
              onChange={setLoggedMinutes}
              placeholder="مثلا ۶۰"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">توضیحات و زمان‌بندی (اختیاری)</label>
          <input
            type="text"
            placeholder="مثلا ۳ روز در هفته بعد از شیفت کاری"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800"
          >
            انصراف
          </button>
          <button
            type="submit"
            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2 font-bold text-zinc-950 cursor-pointer"
          >
            ذخیره هدف
          </button>
        </div>
      </form>
    </Modal>
  );
}
