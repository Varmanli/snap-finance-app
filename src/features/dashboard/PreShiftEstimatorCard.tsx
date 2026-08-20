'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { PersianNumberInput } from '@/components/ui/PersianNumberInput';
import { TomanAmount, TomanIcon } from '@/components/ui/TomanAmount';
import { formatNumber } from '@/lib/formatters/currency';
import { Calculator, Fuel, ShieldAlert, ArrowLeftRight, CheckCircle2 } from 'lucide-react';

interface PreShiftEstimatorCardProps {
  depreciationRate: number;
}

export function PreShiftEstimatorCard({ depreciationRate }: PreShiftEstimatorCardProps) {
  const [plannedKm, setPlannedKm] = useState<number>(200);
  const [targetNetProfit, setTargetNetProfit] = useState<number>(1500000);

  const km = Math.max(0, plannedKm || 0);
  const estimatedDepreciation = km * (depreciationRate || 1800);
  // Estimate fuel: 8.5L per 100km @ 3,000 Toman per Liter
  const estimatedFuelCost = Math.round((km / 100) * 8.5 * 3000);
  const requiredGrossIncome = (targetNetProfit || 0) + estimatedDepreciation + estimatedFuelCost;

  return (
    <Card className="border-teal-500/30 bg-gradient-to-br from-teal-950/20 via-zinc-950 to-zinc-950">
      <CardHeader>
        <CardTitle className="text-teal-400">
          <Calculator className="h-5 w-5 text-teal-400 shrink-0" />
          <span>ماشین‌حساب تخمین هوشمند قبل از شروع شیفت</span>
        </CardTitle>
        <span className="text-xs font-bold text-teal-300 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20 whitespace-nowrap">
          پیش‌بینی درآمد و هزینه‌ها
        </span>
      </CardHeader>

      <div className="space-y-4">
        {/* Interactive Inputs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800">
            <label className="block text-xs font-bold text-amber-400 mb-1">
              مسافت تخمینی امروز (کیلومتر)
            </label>
            <PersianNumberInput
              value={plannedKm}
              onChange={setPlannedKm}
              placeholder="مثلا ۲۰۰"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-bold text-zinc-100 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800">
            <label className="block text-xs font-bold text-emerald-400 mb-1">
              سود خالص دلخواه امروز (تومان)
            </label>
            <PersianNumberInput
              value={targetNetProfit}
              onChange={setTargetNetProfit}
              placeholder="مثلا ۱,۵۰۰,۰۰۰"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-bold text-emerald-400 focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Calculated Results 3-Tile Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Estimated Depreciation */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-center">
            <div className="text-[10px] text-zinc-400 flex items-center justify-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
              استهلاک خودرو ({formatNumber(depreciationRate)} ت/ک‌م)
            </div>
            <div className="text-xs sm:text-sm font-bold text-rose-400 mt-1">
              <TomanAmount amount={estimatedDepreciation} iconClassName="h-3.5 w-3.5 text-rose-400" />
            </div>
          </div>

          {/* Estimated Fuel */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-center">
            <div className="text-[10px] text-zinc-400 flex items-center justify-center gap-1">
              <Fuel className="h-3.5 w-3.5 text-amber-400" />
              هزینه سوخت تخمینی (~۸.۵ لتر)
            </div>
            <div className="text-xs sm:text-sm font-bold text-amber-400 mt-1">
              <TomanAmount amount={estimatedFuelCost} iconClassName="h-3.5 w-3.5 text-amber-400" />
            </div>
          </div>

          {/* Required Gross Income */}
          <div className="rounded-xl border border-teal-500/40 bg-teal-950/30 p-3 text-center">
            <div className="text-[10px] text-teal-300 font-bold flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
              حداقل درآمد ناخالص پیشنهادی
            </div>
            <div className="text-xs sm:text-sm font-black text-teal-400 mt-1">
              <TomanAmount amount={requiredGrossIncome} iconClassName="h-4 w-4 text-teal-400" />
            </div>
          </div>
        </div>

        <p className="text-[10px] text-zinc-500 flex items-center gap-1">
          <ArrowLeftRight className="h-3.5 w-3.5 text-teal-400 shrink-0" />
          برای کسب سود خالص <TomanAmount amount={targetNetProfit} className="text-zinc-300" /> پس از کسر استهلاک و سوخت، باید حداقل <TomanAmount amount={requiredGrossIncome} className="text-teal-400" /> درآمد اسنپ کسب کنید.
        </p>
      </div>
    </Card>
  );
}
