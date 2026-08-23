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
    <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121a15] p-4 rounded-2xl border border-white/10" suppressHydrationWarning>
      {/* Status Filter Tabs */}
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto w-full sm:w-auto">
        {statusList.map((st) => (
          <button
            key={st}
            type="button"
            suppressHydrationWarning
            onClick={() => onFilterChange(st)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filterStatus === st
                ? st === 'PENDING'
                  ? 'bg-amber-400 text-dark-slate shadow-md'
                  : st === 'APPROVED'
                    ? 'bg-[#10b981] text-[#003824] shadow-md'
                    : st === 'REJECTED'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-white text-black shadow-md'
                : 'text-white/60 hover:text-white'
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
