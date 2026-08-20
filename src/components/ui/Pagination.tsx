'use client';

import React from 'react';
import { formatNumber, toPersianDigits } from '@/lib/formatters/currency';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers array with optional ellipsis for large page counts
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-800/80 text-xs font-medium text-zinc-400">
      {/* Item Range Counter */}
      <div>
        نمایش <strong className="text-zinc-200">{formatNumber(startItem)}</strong> تا{' '}
        <strong className="text-zinc-200">{formatNumber(endItem)}</strong> از کل{' '}
        <strong className="text-emerald-400">{formatNumber(totalItems)}</strong> مورد
      </div>

      {/* Pagination Control Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Previous Page (RTL: ChevronRight points right to go back) */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="hidden sm:inline">قبلی</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 py-1 text-zinc-600">
                  ...
                </span>
              );
            }

            const isCurrent = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(page as number)}
                className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-950/50'
                    : 'border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {toPersianDigits(page as number)}
              </button>
            );
          })}
        </div>

        {/* Next Page (RTL: ChevronLeft points left to go forward) */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <span className="hidden sm:inline">بعدی</span>
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
