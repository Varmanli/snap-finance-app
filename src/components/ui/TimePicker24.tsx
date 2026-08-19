'use client';

import React from 'react';
import { toPersianDigits } from '@/lib/formatters/currency';
import { Clock } from 'lucide-react';

interface TimePicker24Props {
  value: string; // "HH:mm" (24-hour format e.g. "07:30", "16:45")
  onChange: (timeValue: string) => void;
  label?: string;
  className?: string;
}

export function TimePicker24({ value, onChange, label, className = '' }: TimePicker24Props) {
  const [hourStr, minuteStr] = (value || '07:30').split(':');
  const selectedHour = parseInt(hourStr || '7', 10);
  const selectedMinute = parseInt(minuteStr || '30', 10);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 00, 05, 10 ... 55

  const handleHourChange = (newH: number) => {
    const h = String(newH).padStart(2, '0');
    const m = String(selectedMinute).padStart(2, '0');
    onChange(`${h}:${m}`);
  };

  const handleMinuteChange = (newM: number) => {
    const h = String(selectedHour).padStart(2, '0');
    const m = String(newM).padStart(2, '0');
    onChange(`${h}:${m}`);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-emerald-400" />
          {label}
        </label>
      )}
      <div className="flex items-center gap-1.5">
        {/* Hour Select (00-23) */}
        <select
          value={selectedHour}
          onChange={(e) => handleHourChange(Number(e.target.value))}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-bold text-zinc-100 focus:border-emerald-500 focus:outline-none cursor-pointer text-center"
        >
          {hours.map((h) => {
            const str = String(h).padStart(2, '0');
            return (
              <option key={h} value={h}>
                {toPersianDigits(str)}
              </option>
            );
          })}
        </select>

        <span className="font-bold text-zinc-500 text-sm">:</span>

        {/* Minute Select (00-55) */}
        <select
          value={selectedMinute}
          onChange={(e) => handleMinuteChange(Number(e.target.value))}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-bold text-zinc-100 focus:border-emerald-500 focus:outline-none cursor-pointer text-center"
        >
          {minutes.map((m) => {
            const str = String(m).padStart(2, '0');
            return (
              <option key={m} value={m}>
                {toPersianDigits(str)}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}
