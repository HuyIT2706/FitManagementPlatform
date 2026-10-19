'use client';

import React from 'react';
import { Pencil } from 'lucide-react';
import type { WeightSummaryCardProps } from '../../../interface';

export const WeightSummaryCard: React.FC<WeightSummaryCardProps> = ({
  initialWeight,
  currentWeight,
  targetWeight,
  onEditInitial,
  onEditCurrent,
  onEditTarget,
}) => {
  return (
    <section className="bg-white dark:bg-[#141b17] rounded-3xl border border-slate-200/80 dark:border-white/10 p-5 shadow-xs transition-colors">
      <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-white/10 text-center">
        {/* Ban đầu */}
        <div
          onClick={onEditInitial}
          className="px-2 group cursor-pointer hover:opacity-80 transition-opacity"
          title="Nhấn để sửa cân nặng ban đầu"
        >
          <div className="flex items-center justify-center gap-1 text-slate-800 dark:text-white font-bold text-sm mb-1.5">
            <span>Ban đầu</span>
            <Pencil size={13} className="text-slate-600 dark:text-slate-300 stroke-[2.2]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {initialWeight > 0 ? `${initialWeight}kg` : '--'}
          </div>
        </div>

        {/* Hiện tại */}
        <div
          onClick={onEditCurrent}
          className="px-2 group cursor-pointer hover:opacity-80 transition-opacity"
          title="Nhấn để ghi nhận cân nặng hiện tại"
        >
          <div className="flex items-center justify-center gap-1 text-slate-800 dark:text-white font-bold text-sm mb-1.5">
            <span>Hiện tại</span>
            <Pencil size={13} className="text-slate-600 dark:text-slate-300 stroke-[2.2]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {currentWeight > 0 ? `${currentWeight}kg` : '--'}
          </div>
        </div>

        {/* Mục tiêu */}
        <div
          onClick={onEditTarget}
          className="px-2 group cursor-pointer hover:opacity-80 transition-opacity"
          title="Nhấn để sửa cân nặng mục tiêu"
        >
          <div className="flex items-center justify-center gap-1 text-slate-800 dark:text-white font-bold text-sm mb-1.5">
            <span>Mục tiêu</span>
            <Pencil size={13} className="text-slate-600 dark:text-slate-300 stroke-[2.2]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {targetWeight > 0 ? `${targetWeight}kg` : '--'}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeightSummaryCard;
