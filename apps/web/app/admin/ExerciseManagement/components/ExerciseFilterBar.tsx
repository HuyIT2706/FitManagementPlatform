'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { ExerciseFilterBarProps } from '../../../../interface';
import AppSearchInput from '../../../../components/ui/AppSearchInput';

const ExerciseFilterBar = ({
  search,
  category,
  onSearchChange,
  onCategoryChange,
  onSearchSubmit,
  onRefresh,
}: ExerciseFilterBarProps) => {
  const categories = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'CHEST', label: 'Ngực' },
    { id: 'BACK', label: 'Lưng' },
    { id: 'LEGS', label: 'Chân' },
    { id: 'SHOULDERS', label: 'Vai' },
    { id: 'ARMS', label: 'Tay' },
    { id: 'ABS', label: 'Bụng' },
    { id: 'CARDIO', label: 'Cardio' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#121a15] p-4 rounded-2xl border border-white/10" suppressHydrationWarning>
      <div className="grow max-w-md">
        <AppSearchInput
          size="sm"
          value={search}
          onChange={onSearchChange}
          onSubmit={onSearchSubmit}
          placeholder="Tìm bài tập theo tên hoặc thiết bị..."
          variant="filled"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto" suppressHydrationWarning>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            suppressHydrationWarning
            onClick={() => onCategoryChange(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              category === cat.id
                ? 'bg-[#10b981] text-[#003824] shadow-md shadow-[#10b981]/20'
                : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}

        <button
          type="button"
          suppressHydrationWarning
          onClick={onRefresh}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white cursor-pointer ml-auto shrink-0"
          title="Làm mới danh sách"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
};

export default ExerciseFilterBar;
