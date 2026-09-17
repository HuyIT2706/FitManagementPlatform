'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { FoodFilterBarProps } from '../../../../interface';
import AppSearchInput from '../../../../components/ui/AppSearchInput';

const FoodFilterBar = ({
  search,
  category,
  onSearchChange,
  onCategoryChange,
  onSearchSubmit,
  onRefresh,
}: FoodFilterBarProps) => {
  const categories = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'Thịt & Cá', label: 'Thịt & Cá' },
    { id: 'Rau củ', label: 'Rau củ' },
    { id: 'Cơm & Tinh bột', label: 'Cơm & Tinh bột' },
    { id: 'Trứng & Sữa', label: 'Trứng & Sữa' },
    { id: 'Trái cây', label: 'Trái cây' },
    { id: 'Đồ uống', label: 'Đồ uống' },
    { id: 'Món ăn khác', label: 'Món khác' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-[#121a15] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs dark:shadow-none transition-colors duration-200" suppressHydrationWarning>
      <div className="grow max-w-md">
        <AppSearchInput
          size="sm"
          value={search}
          onChange={onSearchChange}
          onSubmit={onSearchSubmit}
          placeholder="Tìm thực phẩm, món ăn theo tên..."
          variant="filled"
        />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto [&&::-webkit-scrollbar]:hidden [scrollbar-width:none]" suppressHydrationWarning>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            suppressHydrationWarning
            onClick={() => onCategoryChange(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              category === cat.id
                ? 'bg-[#10b981] text-[#003824] shadow-sm shadow-[#10b981]/20'
                : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}

        <button
          type="button"
          suppressHydrationWarning
          onClick={onRefresh}
          className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white cursor-pointer ml-auto shrink-0"
          title="Làm mới danh sách"
        >
          <RefreshCw size={15} />
        </button>
      </div>
    </div>
  );
};

export default FoodFilterBar;
