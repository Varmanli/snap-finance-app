'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { db } from '@/lib/db/dexie';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { JalaliDatePicker } from '@/components/ui/JalaliDatePicker';
import { PersianNumberInput } from '@/components/ui/PersianNumberInput';
import { Badge } from '@/components/ui/Badge';
import { VehicleExpense, VehicleExpenseCategory } from '@/types';
import { formatToman, formatNumber } from '@/lib/formatters/currency';
import { formatJalaliDate, getTodayISO } from '@/lib/formatters/jalali';
import { Receipt, Plus, PiggyBank, Trash2, ShieldCheck } from 'lucide-react';

const CATEGORY_NAMES: Record<VehicleExpenseCategory, string> = {
  engine_oil: 'روغن موتور',
  filters: 'فیلترها',
  brake_pads: 'لنت ترمز',
  timing_belt: 'تسمه تایم',
  tires: 'لاستیک‌ها',
  spark_plugs: 'شمع و وایر',
  suspension: 'جلوبندی و کمک‌فنر',
  general_repair: 'تعمیرات عمومی',
  other: 'سایر هزینه‌ها',
};

export default function ExpensesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const expenses = useLiveQuery(() => db.vehicleExpenses.orderBy('date').reverse().toArray(), []) || [];

  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const paidFromFundTotal = expenses
    .filter((e) => e.paidFromDepreciationFund)
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const paidOutOfPocketTotal = totalSpent - paidFromFundTotal;

  const handleDeleteExpense = (id?: number) => {
    if (!id) return;
    toast('آیا از حذف این هزینه اطمینان دارید؟', {
      action: {
        label: 'حذف قطعی',
        onClick: async () => {
          await db.vehicleExpenses.delete(id);
          toast.success('هزینه خودرو با موفقیت حذف شد.');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-amber-400" />
            هزینه‌ها و تعمیرات خودرو
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            ثبت هزینه‌های قطعات و تعمیرگاه همراه با امکان برداشت از صندوق استهلاک
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 px-4 py-2 text-xs font-bold text-zinc-950 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>ثبت هزینه جدید</span>
        </button>
      </div>

      {/* Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-xs text-zinc-400">مجموع کل هزینه‌های خودرو</div>
          <div className="text-lg font-bold text-zinc-100 mt-1">{formatToman(totalSpent)}</div>
          <div className="text-[10px] text-zinc-500 mt-1">{formatNumber(expenses.length)} مورد ثبت‌شده</div>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
          <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            پرداخت شده از صندوق استهلاک
          </div>
          <div className="text-lg font-black text-emerald-400 mt-1">{formatToman(paidFromFundTotal)}</div>
          <div className="text-[10px] text-emerald-500/80 mt-1">بدون فشار به سود خالص روزانه</div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
          <div className="text-xs font-semibold text-amber-300 flex items-center gap-1">
            <PiggyBank className="h-3.5 w-3.5" />
            پرداخت مستقیم از جیب
          </div>
          <div className="text-lg font-black text-amber-400 mt-1">{formatToman(paidOutOfPocketTotal)}</div>
          <div className="text-[10px] text-amber-500/80 mt-1">هزینه‌های جاری بدون پوشش صندوق</div>
        </div>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>سوابق هزینه و تعمیرات ({expenses.length})</CardTitle>
        </CardHeader>

        {expenses.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">
            هنوز هیچ هزینه خودرویی ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400">
                <tr>
                  <th className="p-3">تاریخ</th>
                  <th className="p-3">دسته‌بندی</th>
                  <th className="p-3">کیلومتر</th>
                  <th className="p-3">مبلغ (تومان)</th>
                  <th className="p-3 text-center">منبع پرداخت</th>
                  <th className="p-3">توضیحات</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {expenses.map((exp) => (
                  <tr key={exp.id || exp.createdAt} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-3 font-semibold text-zinc-100">{formatJalaliDate(exp.date)}</td>
                    <td className="p-3 font-medium text-amber-400">
                      {CATEGORY_NAMES[exp.category] || exp.category}
                    </td>
                    <td className="p-3 text-zinc-300">{formatNumber(exp.km)} کیلومتر</td>
                    <td className="p-3 font-bold text-zinc-100">{formatToman(exp.amount)}</td>
                    <td className="p-3 text-center">
                      {exp.paidFromDepreciationFund ? (
                        <Badge variant="emerald">صندوق استهلاک</Badge>
                      ) : (
                        <Badge variant="amber">پرداخت از جیب</Badge>
                      )}
                    </td>
                    <td className="p-3 text-zinc-400 max-w-xs truncate">{exp.notes || '-'}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="rounded p-1 text-zinc-500 hover:bg-rose-500/20 hover:text-rose-400 transition-colors cursor-pointer"
                        title="حذف هزینه"
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

      {/* New Expense Modal */}
      <ExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

function ExpenseModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [date, setDate] = useState(getTodayISO());
  const [km, setKm] = useState<number>(100000);
  const [category, setCategory] = useState<VehicleExpenseCategory>('engine_oil');
  const [amount, setAmount] = useState<number>(0);
  const [paidFromDepreciationFund, setPaidFromDepreciationFund] = useState<boolean>(true);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.warning('لطفاً مبلغ پرداختی را وارد کنید.');
      return;
    }

    const newExpense: VehicleExpense = {
      date,
      km,
      category,
      amount,
      paidFromDepreciationFund,
      notes,
      createdAt: new Date().toISOString(),
    };

    await db.vehicleExpenses.add(newExpense);
    toast.success('هزینه خودرو با موفقیت ثبت شد.');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ثبت هزینه جدید خودرو">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <JalaliDatePicker
            label="تاریخ پرداخت (شمسی)"
            value={date}
            onChange={setDate}
          />

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">کیلومتر خودرو</label>
            <PersianNumberInput
              value={km}
              onChange={setKm}
              placeholder="مثلا ۱۰۶,۰۰۰"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">دسته‌بندی هزینه</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as VehicleExpenseCategory)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-amber-400 mb-1">مبلغ پرداختی (تومان)</label>
          <PersianNumberInput
            value={amount}
            onChange={setAmount}
            placeholder="مثلا ۷۵۰,۰۰۰"
            className="w-full rounded-lg border border-amber-500/40 bg-zinc-950 px-3 py-2 text-base font-bold text-amber-400 focus:border-amber-400 focus:outline-none"
            required
          />
        </div>

        {/* Paid from Depreciation Fund Toggle */}
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3">
          <input
            type="checkbox"
            id="paidFromFund"
            checked={paidFromDepreciationFund}
            onChange={(e) => setPaidFromDepreciationFund(e.target.checked)}
            className="h-4 w-4 accent-amber-500 rounded cursor-pointer"
          />
          <label htmlFor="paidFromFund" className="text-xs font-medium text-amber-200 cursor-pointer">
            پرداخت از محل ذخیره صندوق استهلاک (کسر خودکار از موجودی صندوق)
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">توضیحات و تعمیرگاه</label>
          <input
            type="text"
            placeholder="مثلا تعویض روغن بهران در تعویض روغنی احمد"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            انصراف
          </button>
          <button
            type="submit"
            className="rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2 font-bold text-zinc-950 cursor-pointer transition-all"
          >
            ثبت هزینه
          </button>
        </div>
      </form>
    </Modal>
  );
}
