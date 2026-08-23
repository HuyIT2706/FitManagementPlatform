'use client';

import React from 'react';
import { Search } from 'lucide-react';
import type { CoachReviewFilterBarProps, AdminFilterStatus } from '../../../../interface';

export default function CoachReviewFilterBar({
  filterStatus,
  pendingCount,
  searchTerm,
  onFilterChange,
  onSearchChange,
}: CoachReviewFilterBarProps) {
  const statusList: AdminFilterStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

  return (
    <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121a15] p-4 rounded-2xl border border-white/10">
      {/* Status Filter Tabs */}
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto w-full sm:w-auto">
        {statusList.map((st) => (
          <button
            key={st}
            type="button"
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
      <div className="relative w-full sm:w-72">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên HLV hoặc email..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:border-[#10b981] outline-none"
        />
      </div>
    </section>
  );
}
