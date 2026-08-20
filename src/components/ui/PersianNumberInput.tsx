'use client';

import React, { useState, useEffect } from 'react';
import { formatNumber, parsePersianNumber } from '@/lib/formatters/currency';

interface PersianNumberInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  autoFocus?: boolean;
}

export function PersianNumberInput({
  value,
  onChange,
  placeholder = '۰',
  className = '',
  required = false,
  autoFocus = false,
}: PersianNumberInputProps) {
  const [displayValue, setDisplayValue] = useState(() => (value ? formatNumber(value) : ''));

  useEffect(() => {
    if (value === 0 && displayValue === '') return;
    const currentParsed = parsePersianNumber(displayValue);
    if (currentParsed !== value) {
      setDisplayValue(value ? formatNumber(value) : '');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawText = e.target.value;
    if (!rawText.trim()) {
      setDisplayValue('');
      onChange(0);
      return;
    }

    const numericVal = parsePersianNumber(rawText);
    setDisplayValue(numericVal ? formatNumber(numericVal) : '');
    onChange(numericVal);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      required={required}
      autoFocus={autoFocus}
    />
  );
}
