'use client';

import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TomanAmount } from '@/components/ui/TomanAmount';
import { TrajectoryForecast } from '@/types';
import { formatToman, formatNumber } from '@/lib/formatters/currency';
import { Target, Calendar, TrendingUp, Sparkles } from 'lucide-react';

interface GoalWidgetProps {
  forecast: TrajectoryForecast;
  goalTargetAmount: number;
}

export function GoalWidget({ forecast, goalTargetAmount }: GoalWidgetProps) {
  return (
    <Card className="relative overflow-hidden border-emerald-500/20">
      <CardHeader>
        <CardTitle className="emerald-gradient-text">
          <Target className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>هدف بزرگ مالی: خرید خودروی جدید</span>
        </CardTitle>
        <span className="self-start sm:self-auto text-[11px] sm:text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap flex items-center gap-1">
          <span>هدف:</span>
          <TomanAmount amount={goalTargetAmount} iconClassName="h-3.5 w-3.5 text-emerald-400" />
        </span>
      </CardHeader>

      <div className="space-y-4">
        {/* Progress Bar */}
        <ProgressBar
          progress={forecast.goalProgressPercent}
          color="emerald"
          label={`کل پس‌انداز موجود: ${formatToman(forecast.currentTotalSavings)}`}
          showPercent={true}
          height="h-3"
        />

        {/* 3 Grid Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
          {/* Projected Date */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-zinc-400 truncate">تاریخ تخمینی تحقق هدف</div>
              <div className="text-xs sm:text-sm font-bold text-zinc-100 mt-0.5 truncate">
                {forecast.projectedCompletionDate || 'در حال محاسبه...'}
              </div>
              {forecast.projectedDaysRemaining !== null && forecast.projectedDaysRemaining > 0 && (
                <div className="text-[10px] text-emerald-400 mt-0.5 truncate">
                  ({formatNumber(forecast.projectedDaysRemaining)} روز کاری دیگر)
                </div>
              )}
            </div>
          </div>

          {/* 30-Day Moving Average */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-zinc-400 truncate">میانگین پس‌انداز ۳۰ روز اخیر</div>
              <div className="text-xs sm:text-sm font-bold text-amber-400 mt-0.5 truncate flex items-center gap-1">
                <TomanAmount amount={forecast.average30DayRealDailyProfit} iconClassName="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[10px] text-zinc-400">/ روز</span>
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5 truncate">بر اساس سود واقعی خالص</div>
            </div>
          </div>

          {/* Required Daily Savings to Deadline */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-zinc-400 truncate">پس‌انداز مورد نیاز تا ددلاین</div>
              <div className="text-xs sm:text-sm font-bold text-blue-400 mt-0.5 truncate flex items-center gap-1">
                <TomanAmount amount={forecast.requiredDailySavingsToDeadline} iconClassName="h-3.5 w-3.5 text-blue-400" />
                <span className="text-[10px] text-zinc-400">/ روز</span>
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5 truncate">هدف زمان‌بندی: ۱ فروردین ۱۴۰۶</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
