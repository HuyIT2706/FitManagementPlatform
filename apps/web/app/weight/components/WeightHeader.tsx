'use client';

import React from 'react';
import { ChevronLeft, Plus } from 'lucide-react';
import type { WeightHeaderProps } from '../../../interface';

export const WeightHeader: React.FC<WeightHeaderProps> = ({
  onBack,
  onOpenAddModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c120e]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 py-3.5 flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer text-slate-800 dark:text-white"
        aria-label="Quay lại"
      >
        <ChevronLeft size={24} className="stroke-[2.5]" />
      </button>

      <h1 className="text-lg sm:text-xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
        Theo dõi cân nặng
      </h1>

      <button
        type="button"
        onClick={onOpenAddModal}
        className="w-10 h-10 rounded-full bg-lime-500/15 text-lime-600 dark:text-lime-400 flex items-center justify-center hover:bg-lime-500/25 active:scale-95 transition-all cursor-pointer"
        title="Ghi nhận cân nặng mới"
      >
        <Plus size={20} className="stroke-[2.5]" />
      </button>
    </header>
  );
};

export default WeightHeader;
