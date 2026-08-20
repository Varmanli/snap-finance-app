'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  isoToJalaliParts,
  jalaliPartsToISO,
  formatJalaliDate,
  getTodayISO,
  PERSIAN_MONTH_NAMES,
} from '@/lib/formatters/jalali';
import { toPersianDigits } from '@/lib/formatters/currency';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, CalendarDays } from 'lucide-react';

interface JalaliDatePickerProps {
  value: string; // ISO date format "YYYY-MM-DD"
  onChange: (isoValue: string) => void;
  label?: string;
  className?: string;
}

const WEEKDAY_NAMES = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export function JalaliDatePicker({ value, onChange, label, className = '' }: JalaliDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedParts = isoToJalaliParts(value || getTodayISO());
  const [navJy, setNavJy] = useState(selectedParts.jy);
  const [navJm, setNavJm] = useState(selectedParts.jm);

  // Sync nav state when value prop changes externally
  useEffect(() => {
    const parts = isoToJalaliParts(value || getTodayISO());
    setNavJy(parts.jy);
    setNavJm(parts.jm);
  }, [value]);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInNavMonth = navJm <= 6 ? 31 : navJm <= 11 ? 30 : 29;

  // Calculate day of week for 1st day of navJm/navJy
  const firstDayISO = jalaliPartsToISO(navJy, navJm, 1);
  const firstDayDate = new Date(firstDayISO);
  // Saturday = 0 in Persian calendar offset
  const jsDay = firstDayDate.getDay(); // 0 is Sunday, 6 is Saturday
  const startingDayOffset = (jsDay + 1) % 7;

  const years = [1400, 1401, 1402, 1403, 1404, 1405, 1406, 1407, 1408];

  const handlePrevMonth = () => {
    if (navJm === 1) {
      setNavJm(12);
      setNavJy(navJy - 1);
    } else {
      setNavJm(navJm - 1);
    }
  };

  const handleNextMonth = () => {
    if (navJm === 12) {
      setNavJm(1);
      setNavJy(navJy + 1);
    } else {
      setNavJm(navJm + 1);
    }
  };

  const handleSelectDay = (dayNum: number) => {
    const newIso = jalaliPartsToISO(navJy, navJm, dayNum);
    onChange(newIso);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const todayISO = getTodayISO();
    onChange(todayISO);
    const parts = isoToJalaliParts(todayISO);
    setNavJy(parts.jy);
    setNavJm(parts.jm);
    setIsOpen(false);
  };

  const handleSelectYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yIso = yesterday.toISOString().split('T')[0];
    onChange(yIso);
    const parts = isoToJalaliParts(yIso);
    setNavJy(parts.jy);
    setNavJm(parts.jm);
    setIsOpen(false);
  };

  const isToday = (dayNum: number) => {
    const currentISO = jalaliPartsToISO(navJy, navJm, dayNum);
    return currentISO === getTodayISO();
  };

  const isSelected = (dayNum: number) => {
    return (
      selectedParts.jy === navJy &&
      selectedParts.jm === navJm &&
      selectedParts.jd === dayNum
    );
  };

  return (
    <div ref={containerRef} className={`relative space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <CalendarIcon className="h-3.5 w-3.5 text-emerald-400" />
          {label}
        </label>
      )}

      {/* Persian Labs Style Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-bold text-zinc-100 hover:border-emerald-500/50 hover:bg-zinc-900/80 transition-all cursor-pointer shadow-sm"
      >
        <span className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-emerald-400">{formatJalaliDate(value)}</span>
        </span>

        <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
          تغییر تاریخ
        </span>
      </button>

      {/* Persian Labs UI Shamsi Popover Calendar Grid */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl border border-zinc-800 bg-zinc-950 p-3.5 shadow-2xl shadow-black/80 space-y-3 animate-modal">
          {/* Header Navigation */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-1">
              {/* Select Month */}
              <select
                value={navJm}
                onChange={(e) => setNavJm(Number(e.target.value))}
                className="bg-zinc-900 text-xs font-bold text-zinc-200 border border-zinc-800 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {PERSIAN_MONTH_NAMES.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>

              {/* Select Year */}
              <select
                value={navJy}
                onChange={(e) => setNavJy(Number(e.target.value))}
                className="bg-zinc-900 text-xs font-bold text-zinc-200 border border-zinc-800 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {toPersianDigits(y)}
                  </option>
                ))}
              </select>
            </div>

            {/* Chevron Controls (RTL: ChevronRight goes to next month in past, ChevronLeft to next month in future) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all cursor-pointer"
                title="ماه قبلی"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all cursor-pointer"
                title="ماه بعدی"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={handleSelectToday}
              className="flex-1 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer text-center"
            >
              امروز
            </button>
            <button
              type="button"
              onClick={handleSelectYesterday}
              className="flex-1 py-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 transition-all cursor-pointer text-center"
            >
              دیروز
            </button>
          </div>

          {/* Weekday Labels Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-zinc-500 pb-1">
            {WEEKDAY_NAMES.map((w, idx) => (
              <span key={idx} className={idx === 6 ? 'text-rose-400' : ''}>
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Empty slots for starting day offset */}
            {Array.from({ length: startingDayOffset }).map((_, idx) => (
              <span key={`empty-${idx}`} />
            ))}

            {/* Day Buttons */}
            {Array.from({ length: daysInNavMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const selected = isSelected(dayNum);
              const today = isToday(dayNum);

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold transition-all cursor-pointer ${
                    selected
                      ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-950/60 scale-105'
                      : today
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100'
                  }`}
                >
                  {toPersianDigits(dayNum)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
