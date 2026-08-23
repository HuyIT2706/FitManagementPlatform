'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AdminUsersPaginationProps } from '../../../../interface';

export default function AdminUsersPagination({
  total,
  currentCount,
  page,
  totalPages,
  onPageChange,
}: AdminUsersPaginationProps) {
  return (
    <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
      <span>
        Hiển thị <strong>{currentCount}</strong> / <strong>{total}</strong> tài khoản (Trang {page}/{totalPages})
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
