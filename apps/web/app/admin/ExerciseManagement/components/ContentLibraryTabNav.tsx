'use client';

import React from 'react';
import { Dumbbell, Utensils, Plus } from 'lucide-react';
import type { ContentLibraryTabNavProps } from '../../../../interface';

export default function ContentLibraryTabNav({
  activeTab,
  exTotal,
  foodTotal,
  onTabChange,
  onOpenAddModal,
}: ContentLibraryTabNavProps) {
  return (
    <div className="flex items-center justify-between gap-4 bg-[#121a15] p-3 rounded-2xl border border-white/10">
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
        <button
          type="button"
          onClick={() => onTabChange('EXERCISES')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'EXERCISES'
              ? 'bg-[#10b981] text-[#003824] shadow-md shadow-[#10b981]/20'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Dumbbell size={16} />
          Thư Viện Bài Tập ({exTotal})
        </button>

        <button
          type="button"
          onClick={() => onTabChange('FOODS')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'FOODS'
              ? 'bg-[#10b981] text-[#003824] shadow-md shadow-[#10b981]/20'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Utensils size={16} />
          Thư Viện Món Ăn ({foodTotal})
        </button>
      </div>

      <button
        type="button"
        onClick={onOpenAddModal}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10b981] text-[#003824] text-xs font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:opacity-90 transition-opacity cursor-pointer shrink-0"
      >
        <Plus size={16} />
        {activeTab === 'EXERCISES' ? 'Thêm Bài Tập Mới' : 'Thêm Món Ăn Mới'}
      </button>
    </div>
  );
}
