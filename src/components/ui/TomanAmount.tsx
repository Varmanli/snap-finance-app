import React from 'react';
import { formatNumber } from '@/lib/formatters/currency';
import { TomanIcon } from '@/components/ui/TomanIcon';

interface TomanAmountProps {
  amount: number;
  className?: string;
  iconClassName?: string;
  showIcon?: boolean;
}

export function TomanAmount({
  amount,
  className = '',
  iconClassName = 'h-3.5 w-3.5 text-current',
  showIcon = true,
}: TomanAmountProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span>{formatNumber(amount)}</span>
      {showIcon && <TomanIcon className={`shrink-0 ${iconClassName}`} />}
    </span>
  );
}

export { TomanIcon };
