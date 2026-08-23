'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LibraryPaginationProps } from '../../../../interface';

const LibraryPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: LibraryPaginationProps) => {
  return (
    <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60" suppressHydrationWarning>
      <span>
        Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          suppressHydrationWarning
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          suppressHydrationWarning
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default LibraryPagination;
