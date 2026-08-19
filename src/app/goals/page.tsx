'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { JalaliDatePicker } from '@/components/ui/JalaliDatePicker';
import { CapitalTransaction, PersonalGoal } from '@/types';
import { calculateTrajectoryForecast } from '@/lib/calculations/trajectory';
import { formatToman, formatNumber } from '@/lib/formatters/currency';
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

  const handleDeleteCapitalTx = async (id?: number) => {
    if (!id) return;
    if (confirm('آیا از حذف این تراکنش صندوق اطمینان دارید؟')) {
      await db.capitalTransactions.delete(id);
    }
  };

  const handleDeleteGoal = async (id?: number) => {
    if (!id) return;
    if (confirm('آیا از حذف این هدف شخصی اطمینان دارید؟')) {
      await db.personalGoals.delete(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5 border-emerald-500/30">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-400" />
            سرمایه و اهداف مالی / شخصی
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            پایش آنلاین پیشرفت هدف خرید خودروی جدید و مدیریت تعادل کار و زندگی
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCapitalModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 px-3.5 py-2 text-xs font-bold text-zinc-950 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>واریز/برداشت صندوق پس‌انداز</span>
          </button>
        </div>
      </div>

      {/* Financial Master Goal Card */}
      <Card className="border-emerald-500/30">
        <CardHeader>
          <CardTitle className="emerald-gradient-text">
            هدف مالی خرید خودرو (۴۰۰ میلیون تومان)
          </CardTitle>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            {forecast.goalProgressPercent}% پیشرفت
          </span>
        </CardHeader>

        <div className="space-y-4">
          <ProgressBar progress={forecast.goalProgressPercent} color="emerald" height="h-3.5" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
              <div className="text-xs text-zinc-400">کل پس‌انداز جمع‌آوری شده</div>
              <div className="text-lg font-black text-emerald-400 mt-1">
                {formatToman(forecast.currentTotalSavings)}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
              <div className="text-xs text-zinc-400">مبلغ باقیمانده تا هدف</div>
              <div className="text-lg font-black text-amber-400 mt-1">
                {formatToman(forecast.remainingGoalAmount)}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
              <div className="text-xs text-zinc-400">تاریخ تخمینی تکمیل هدف</div>
              <div className="text-base font-bold text-zinc-100 mt-1">
                {forecast.projectedCompletionDate || 'در حال محاسبه...'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid: Capital Transactions Log & Personal Balance Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capital Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>تراکنش‌های صندوق پس‌انداز ({capitalTxs.length})</CardTitle>
          </CardHeader>

          {capitalTxs.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              هنوز تراکنشی در صندوق پس‌انداز ثبت نشده است.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs text-zinc-300">
                <thead className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400">
                  <tr>
                    <th className="p-2.5">تاریخ</th>
                    <th className="p-2.5">نوع</th>
                    <th className="p-2.5">مبلغ</th>
                    <th className="p-2.5">توضیحات</th>
                    <th className="p-2.5 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {capitalTxs.map((tx) => (
                    <tr key={tx.id || tx.createdAt} className="hover:bg-zinc-900/50">
                      <td className="p-2.5 font-semibold text-zinc-200">{formatJalaliDate(tx.date)}</td>
                      <td className="p-2.5">
                        {tx.type === 'deposit' ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <ArrowUpRight className="h-3.5 w-3.5" /> واریز
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <ArrowDownLeft className="h-3.5 w-3.5" /> برداشت
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-bold text-zinc-100">{formatToman(tx.amount)}</td>
                      <td className="p-2.5 text-zinc-400 max-w-xs truncate">{tx.note || '-'}</td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => handleDeleteCapitalTx(tx.id)}
                          className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Personal Time & Work-Life Balance Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-purple-400">
              <Heart className="h-5 w-5" />
              اهداف تعادل کار و زندگی هفتگی
            </CardTitle>
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
            >
              + افزودن هدف
            </button>
          </CardHeader>

          <div className="space-y-4">
            {personalGoals.map((goal) => {
              const pct = Math.min(100, Math.round((goal.loggedMinutes / goal.targetWeeklyMinutes) * 100));
              return (
                <div key={goal.id || goal.title} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-zinc-100">{goal.title}</div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-purple-400 font-semibold">
                        {Math.round(goal.loggedMinutes / 60)} / {Math.round(goal.targetWeeklyMinutes / 60)} ساعت
                      </span>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-zinc-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <ProgressBar progress={pct} color="blue" showPercent={true} height="h-2" />
                  <p className="text-[11px] text-zinc-400">{goal.notes}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Add Capital Transaction Modal */}
      <CapitalModal isOpen={isCapitalModalOpen} onClose={() => setIsCapitalModalOpen(false)} />
      {/* Add Personal Goal Modal */}
      <PersonalGoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} />
    </div>
  );
}

function CapitalModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [date, setDate] = useState(getTodayISO());
  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const tx: CapitalTransaction = {
      date,
      type,
      amount,
      note,
      createdAt: new Date().toISOString(),
    };

    await db.capitalTransactions.add(tx);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ثبت تراکنش صندوق پس‌انداز">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">نوع تراکنش</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="deposit">واریز به پس‌انداز (+)</option>
              <option value="withdrawal">برداشت از پس‌انداز (-)</option>
            </select>
          </div>

          <JalaliDatePicker
            label="تاریخ تراکنش (شمسی)"
            value={date}
            onChange={setDate}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-emerald-400 mb-1">مبلغ (تومان)</label>
          <input
            type="number"
            step="100000"
            placeholder="مثلا ۵,۰۰۰,۰۰۰ تومان"
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-lg border border-emerald-500/40 bg-zinc-950 px-3 py-2 text-base font-bold text-emerald-400 focus:border-emerald-400 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">توضیحات</label>
          <input
            type="text"
            placeholder="مثلا واریز از درآمد هفته یا برداشت برای پیش‌پرداخت"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors"
          >
            انصراف
          </button>
          <button
            type="submit"
            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-sm font-bold text-zinc-950 transition-all cursor-pointer"
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
  const [targetWeeklyMinutes, setTargetWeeklyMinutes] = useState(180);
  const [loggedMinutes, setLoggedMinutes] = useState(60);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const goal: PersonalGoal = {
      title,
      targetWeeklyMinutes,
      loggedMinutes,
      notes,
    };

    await db.personalGoals.add(goal);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="افزودن هدف شخصی هفتگی">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">عنوان هدف شخصی</label>
          <input
            type="text"
            placeholder="مثلا ورزش هفتگی، استراحت، زمان با خانواده"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">هدف هفتگی (دقیقه)</label>
            <input
              type="number"
              step="30"
              value={targetWeeklyMinutes}
              onChange={(e) => setTargetWeeklyMinutes(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">زمان انجام‌شده (دقیقه)</label>
            <input
              type="number"
              step="15"
              value={loggedMinutes}
              onChange={(e) => setLoggedMinutes(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">توضیحات برنامه</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors"
          >
            انصراف
          </button>
          <button
            type="submit"
            className="rounded-xl bg-purple-500 hover:bg-purple-400 px-5 py-2 text-sm font-bold text-zinc-950 transition-all cursor-pointer"
          >
            افزودن هدف
          </button>
        </div>
      </form>
    </Modal>
  );
}
