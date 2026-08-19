import React from 'react';
import { toPersianDigits } from '@/lib/formatters/currency';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: 'emerald' | 'amber' | 'blue' | 'rose';
  label?: string;
  showPercent?: boolean;
  height?: string;
}

export function ProgressBar({
  progress,
  color = 'emerald',
  label,
  showPercent = true,
  height = 'h-2.5',
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const colorStyles = {
    emerald: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    amber: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    blue: 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]',
    rose: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]',
  };

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs font-medium text-zinc-300 mb-1.5">
          {label && <span>{label}</span>}
          {showPercent && <span className="font-bold text-zinc-100">{toPersianDigits(clampedProgress)}٪</span>}
        </div>
      )}
      <div className={`w-full bg-zinc-800 rounded-full overflow-hidden ${height} p-0.5 border border-zinc-700/50`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorStyles[color]}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
