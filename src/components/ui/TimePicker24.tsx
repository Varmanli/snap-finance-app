'use client';

import React, { useState, useRef, useEffect } from 'react';
import { toPersianDigits } from '@/lib/formatters/currency';
import { formatTime24 } from '@/lib/formatters/jalali';
import { Clock, Check } from 'lucide-react';

interface TimePicker24Props {
  value: string; // "HH:mm" (24-hour format e.g. "07:30", "16:45")
  onChange: (timeValue: string) => void;
  label?: string;
  className?: string;
  presetTimes?: string[];
}

export function TimePicker24({
  value,
  onChange,
  label,
  className = '',
  presetTimes = ['07:00', '07:30', '08:00', '16:00', '16:30', '17:00'],
}: TimePicker24Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hourStr, minuteStr] = (value || '07:30').split(':');
  const selectedHour = parseInt(hourStr || '7', 10);
  const selectedMinute = parseInt(minuteStr || '30', 10);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 00, 05, 10 ... 55

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handlePresetSelect = (preset: string) => {
    onChange(preset);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-emerald-400" />
          {label}
        </label>
      )}

      {/* Persian Labs Style Time Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-bold text-zinc-100 hover:border-emerald-500/50 hover:bg-zinc-900/80 transition-all cursor-pointer shadow-sm"
      >
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-emerald-400 font-mono text-sm tracking-wider">
            {formatTime24(value || '07:30')}
          </span>
        </span>

        <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
          تغییر زمان
        </span>
      </button>

      {/* Persian Labs UI Time Picker Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-zinc-800 bg-zinc-950 p-3.5 shadow-2xl shadow-black/80 space-y-3 animate-modal">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <span className="text-xs font-bold text-zinc-200">انتخاب ساعت و دقیقه</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>

          {/* Preset Chips */}
          {presetTimes && presetTimes.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] text-zinc-400">زمان‌های پرکاربرد:</div>
              <div className="flex flex-wrap gap-1.5">
                {presetTimes.map((preset) => {
                  const isCurrent = value === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-500 text-zinc-950'
                          : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                      }`}
                    >
                      {formatTime24(preset)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hour and Minute Selectors */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-zinc-800/80">
            {/* Hour Selector */}
            <div className="space-y-1">
              <label className="block text-[10px] text-zinc-400 text-center">ساعت (۲۴ ساعته)</label>
              <select
                value={selectedHour}
                onChange={(e) => handleHourChange(Number(e.target.value))}
                size={5}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-1 text-xs font-bold text-zinc-100 focus:border-emerald-500 focus:outline-none cursor-pointer scrollbar-thin text-center"
              >
                {hours.map((h) => {
                  const str = String(h).padStart(2, '0');
                  return (
                    <option
                      key={h}
                      value={h}
                      className="py-1 rounded cursor-pointer hover:bg-emerald-500/20"
                    >
                      {toPersianDigits(str)}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Minute Selector */}
            <div className="space-y-1">
              <label className="block text-[10px] text-zinc-400 text-center">دقیقه</label>
              <select
                value={selectedMinute}
                onChange={(e) => handleMinuteChange(Number(e.target.value))}
                size={5}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-1 text-xs font-bold text-zinc-100 focus:border-emerald-500 focus:outline-none cursor-pointer scrollbar-thin text-center"
              >
                {minutes.map((m) => {
                  const str = String(m).padStart(2, '0');
                  return (
                    <option
                      key={m}
                      value={m}
                      className="py-1 rounded cursor-pointer hover:bg-emerald-500/20"
                    >
                      {toPersianDigits(str)}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
