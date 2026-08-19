'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { DailyRecord, VehicleExpense } from '@/types';
import { calculateShiftSummary } from '@/lib/calculations/financial';
import { formatJalaliShort } from '@/lib/formatters/jalali';
import { formatToman, formatNumber } from '@/lib/formatters/currency';
import { BarChart3, PieChart as PieIcon, Activity } from 'lucide-react';

interface FinancialChartsProps {
  records: DailyRecord[];
  expenses: VehicleExpense[];
  depreciationRate: number;
}

export function FinancialCharts({ records, expenses, depreciationRate }: FinancialChartsProps) {
  // Sort records chronologically
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 1. Chart Data: Income vs Real Profit Timeline
  const timelineData = sortedRecords.slice(-14).map((rec) => {
    const summary = calculateShiftSummary(rec, depreciationRate);
    return {
      date: formatJalaliShort(rec.date),
      grossIncome: rec.grossIncome,
      realProfit: summary.realProfit,
      cashExpenses: summary.cashExpenses,
      depreciation: summary.depreciation,
      distanceKm: rec.distanceKm,
    };
  });

  // 2. Chart Data: Expenses Breakdown (Cash expenses + Vehicle repair expenses)
  let totalFuel = 0;
  let totalParking = 0;
  let totalTolls = 0;
  let totalCarwash = 0;
  let totalOther = 0;
  let totalVehicleRepairs = 0;

  for (const r of records) {
    totalFuel += r.fuelExpense || 0;
    totalParking += r.parkingExpense || 0;
    totalTolls += r.tollExpense || 0;
    totalCarwash += r.carwashExpense || 0;
    totalOther += r.otherExpenses || 0;
  }

  for (const e of expenses) {
    totalVehicleRepairs += e.amount || 0;
  }

  const pieData = [
    { name: 'بنزین و سوخت', value: totalFuel, color: '#f59e0b' },
    { name: 'تعمیرات و قطعات', value: totalVehicleRepairs, color: '#ef4444' },
    { name: 'کارواش و نظافت', value: totalCarwash, color: '#3b82f6' },
    { name: 'پارکینگ و عوارض', value: totalParking + totalTolls, color: '#8b5cf6' },
    { name: 'سایر هزینه‌ها', value: totalOther, color: '#6b7280' },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      {/* 1. Timeline Chart: Gross Income vs Real Economic Profit */}
      <Card className="border-emerald-500/20">
        <CardHeader>
          <CardTitle className="emerald-gradient-text">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            روند درآمد ناخالص در برابر سود واقعی اقتصادی (۱۴ شیفت اخیر)
          </CardTitle>
        </CardHeader>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                tickFormatter={(val) => `${Math.round(val / 1000)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-zinc-700 bg-zinc-900/95 p-3 text-xs shadow-xl space-y-1">
                        <div className="font-bold text-zinc-100 mb-1">{label}</div>
                        <div className="text-zinc-300">درآمد ناخالص: <span className="font-bold text-zinc-100">{formatToman(data.grossIncome)}</span></div>
                        <div className="text-amber-400">هزینه نقدی: <span className="font-bold">{formatToman(data.cashExpenses)}</span></div>
                        <div className="text-rose-400">استهلاک: <span className="font-bold">{formatToman(data.depreciation)}</span></div>
                        <div className="text-emerald-400 font-bold border-t border-zinc-800 pt-1 mt-1">
                          سود واقعی خالص: {formatToman(data.realProfit)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="grossIncome"
                name="درآمد ناخالص"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorGross)"
              />
              <Area
                type="monotone"
                dataKey="realProfit"
                name="سود واقعی"
                stroke="#34d399"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorProfit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2. Grid of 2 Charts: Distance Bar Chart & Expenses Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distance Bar Chart */}
        <Card className="border-amber-500/20">
          <CardHeader>
            <CardTitle className="amber-gradient-text">
              <Activity className="h-5 w-5 text-amber-400" />
              توزیع مسافت طی‌شده (کیلومتر روزانه)
            </CardTitle>
          </CardHeader>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  formatter={(value: any) => [`${formatNumber(value)} کیلومتر`, 'مسافت طی شده']}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '0.75rem' }}
                />
                <Bar dataKey="distanceKm" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Expenses Pie Chart */}
        <Card className="border-rose-500/20">
          <CardHeader>
            <CardTitle className="text-rose-400">
              <PieIcon className="h-5 w-5" />
              تفکیک کلی هزینه‌های خودرو و رانندگی
            </CardTitle>
          </CardHeader>

          <div className="h-64 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-zinc-500">هنوز هزینه‌ای ثبت نشده است.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatToman(Number(val))}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '0.75rem' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
