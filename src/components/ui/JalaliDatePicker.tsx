'use client';

import React from 'react';
import {
  isoToJalaliParts,
  jalaliPartsToISO,
  PERSIAN_MONTH_NAMES,
} from '@/lib/formatters/jalali';
import { toPersianDigits } from '@/lib/formatters/currency';
import { Calendar } from 'lucide-react';

interface JalaliDatePickerProps {
  value: string; // ISO date format "YYYY-MM-DD"
  onChange: (isoValue: string) => void;
  label?: string;
  className?: string;
}

export function JalaliDatePicker({ value, onChange, label, className = '' }: JalaliDatePickerProps) {
  const { jy, jm, jd } = isoToJalaliParts(value);

  // Available Jalali Years (e.g. 1400 to 1408)
  const years = [1400, 1401, 1402, 1403, 1404, 1405, 1406, 1407, 1408];
  const daysInMonth = jm <= 6 ? 31 : jm <= 11 ? 30 : 29;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleYearChange = (newJy: number) => {
    const newIso = jalaliPartsToISO(newJy, jm, Math.min(jd, jm <= 6 ? 31 : jm <= 11 ? 30 : 29));
    onChange(newIso);
  };

  const handleMonthChange = (newJm: number) => {
    const maxDays = newJm <= 6 ? 31 : newJm <= 11 ? 30 : 29;
    const newJd = Math.min(jd, maxDays);
    const newIso = jalaliPartsToISO(jy, newJm, newJd);
    onChange(newIso);
  };

  const handleDayChange = (newJd: number) => {
    const newIso = jalaliPartsToISO(jy, jm, newJd);
    onChange(newIso);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-emerald-400" />
          {label}
        </label>
      )}
      <div className="grid grid-cols-3 gap-2">
        {/* Day Select */}
        <select
          value={jd}
          onChange={(e) => handleDayChange(Number(e.target.value))}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-2 text-xs font-bold text-zinc-100 focus:border-emerald-500 focus:outline-none cursor-pointer"
        >
          {days.map((d) => (
            <option key={d} value={d}>
              {toPersianDigits(d)}
            </option>
          ))}
        </select>

        {/* Month Select */}
        <select
          value={jm}
          onChange={(e) => handleMonthChange(Number(e.target.value))}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-2 py-2 text-xs font-bold text-zinc-100 focus:border-emerald-500 focus:outline-none cursor-pointer"
        >
          {PERSIAN_MONTH_NAMES.map((name, idx) => (
            <option key={idx + 1} value={idx + 1}>
              {name}
            </option>
          ))}
        </select>

        {/* Year Select */}
        <select
          value={jy}
          onChange={(e) => handleYearChange(Number(e.target.value))}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-2 py-2 text-xs font-bold text-zinc-100 focus:border-emerald-500 focus:outline-none cursor-pointer"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {toPersianDigits(y)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
