'use client';

import React from 'react';
import type { CoachReviewFilterBarProps, AdminFilterStatus } from '../../../../interface';
import AppSearchInput from '../../../../components/ui/AppSearchInput';

const CoachReviewFilterBar = ({
  filterStatus,
  pendingCount,
  searchTerm,
  onFilterChange,
  onSearchChange,
}: CoachReviewFilterBarProps) => {
  const statusList: AdminFilterStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

  return (
    <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-[#121a15] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs dark:shadow-none transition-colors duration-200" suppressHydrationWarning>
      {/* Status Filter Tabs */}
      <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 overflow-x-auto w-full sm:w-auto [&&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {statusList.map((st) => (
          <button
            key={st}
            type="button"
            suppressHydrationWarning
            onClick={() => onFilterChange(st)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              filterStatus === st
                ? st === 'PENDING'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : st === 'APPROVED'
                    ? 'bg-[#10b981] text-[#003824] shadow-sm'
                    : st === 'REJECTED'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
            }`}
          >
            {st === 'PENDING'
              ? `Chờ duyệt (${pendingCount})`
              : st === 'APPROVED'
                ? 'Đã duyệt'
                : st === 'REJECTED'
                  ? 'Đã từ chối'
                  : 'Tất cả'}
          </button>
        ))}
      </div>

      {/* Search Box */}
      <div className="w-full sm:w-72" suppressHydrationWarning>
        <AppSearchInput
          size="sm"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Tìm theo tên HLV hoặc email..."
          variant="filled"
        />
      </div>
    </section>
  );
};

export default CoachReviewFilterBar;
