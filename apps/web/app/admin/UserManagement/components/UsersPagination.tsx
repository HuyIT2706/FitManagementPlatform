'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AdminUsersPaginationProps } from '../../../../interface';

const AdminUsersPagination = ({
  total,
  currentCount,
  page,
  totalPages,
  onPageChange,
}: AdminUsersPaginationProps) => {
  return (
    <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-xs text-slate-600 dark:text-white/60" suppressHydrationWarning>
      <span className="text-center sm:text-left">
        Hiển thị <strong className="text-slate-900 dark:text-white">{currentCount}</strong> / <strong className="text-slate-900 dark:text-white">{total}</strong> tài khoản (Trang {page}/{totalPages})
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          suppressHydrationWarning
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          suppressHydrationWarning
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default AdminUsersPagination;
