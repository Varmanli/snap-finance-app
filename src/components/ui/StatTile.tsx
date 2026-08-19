import React from 'react';

interface StatTileProps {
  title: string;
  value: string;
  subtext?: string;
  icon: React.ElementType;
  trend?: 'positive' | 'negative' | 'neutral';
  color?: 'emerald' | 'amber' | 'blue' | 'purple' | 'zinc';
}

export function StatTile({
  title,
  value,
  subtext,
  icon: Icon,
  trend = 'neutral',
  color = 'emerald',
}: StatTileProps) {
  const iconBg = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    zinc: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  };

  return (
    <div className="glass-card p-3.5 sm:p-4 flex flex-col justify-between space-y-2.5 relative overflow-hidden">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] sm:text-xs font-semibold text-zinc-400 truncate">{title}</span>
        <div className={`p-1.5 sm:p-2 rounded-xl border ${iconBg[color]} shrink-0`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
      <div>
        <div className="text-base sm:text-xl lg:text-2xl font-black tracking-tight text-zinc-100 whitespace-nowrap overflow-hidden text-ellipsis">
          {value}
        </div>
        {subtext && <p className="text-[10px] sm:text-xs text-zinc-400 mt-1 truncate">{subtext}</p>}
      </div>
    </div>
  );
}
