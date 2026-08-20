'use client';

import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { DailyRecord } from '@/types';
import { calculateSmartInsights } from '@/lib/calculations/insights';
import { formatToman, formatNumber, toPersianDigits } from '@/lib/formatters/currency';
import { Lightbulb, Sparkles, Clock, Award, TrendingUp } from 'lucide-react';

interface SmartInsightsCardProps {
  records: DailyRecord[];
  depreciationRate: number;
}

export function SmartInsightsCard({ records, depreciationRate }: SmartInsightsCardProps) {
  const insights = calculateSmartInsights(records, depreciationRate);

  if (records.length === 0) return null;

  return (
    <Card className="border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-zinc-950 to-zinc-950">
      <CardHeader>
        <CardTitle className="text-purple-400">
          <Lightbulb className="h-5 w-5 text-purple-400 shrink-0" />
          <span>تحلیل هوشمند سودآورترین روزها و ساعات کاری</span>
        </CardTitle>
        <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 whitespace-nowrap">
          بر اساس {toPersianDigits(records.length)} شیفت
        </span>
      </CardHeader>

      <div className="space-y-4">
        {/* Top 2 KPI Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Best Day Card */}
          <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-purple-300">سودآورترین روز هفته</div>
              <div className="text-sm font-bold text-zinc-100 mt-0.5">
                {insights.bestDay ? (
                  <>
                    روزهای <span className="text-emerald-400">{insights.bestDay.dayName}</span> (
                    {formatToman(insights.bestDay.avgProfitPerHour)}/ساعت)
                  </>
                ) : (
                  'در حال جمع‌آوری داده...'
                )}
              </div>
            </div>
          </div>

          {/* Best Time Slot Card */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-emerald-300">بهترین بازه زمانی شیفت</div>
              <div className="text-sm font-bold text-zinc-100 mt-0.5">
                {insights.bestTimeSlot ? (
                  <>
                    {insights.bestTimeSlot.slotName} ({formatToman(insights.bestTimeSlot.avgProfitPerHour)}/ساعت)
                  </>
                ) : (
                  'در حال جمع‌آوری داده...'
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Insights Bullet List */}
        <div className="space-y-2 pt-1 border-t border-zinc-800/80">
          {insights.insightMessages.map((msg, index) => (
            <div key={index} className="flex items-start gap-2 text-xs text-zinc-300 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/60">
              <Sparkles className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
              <span>{msg}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
