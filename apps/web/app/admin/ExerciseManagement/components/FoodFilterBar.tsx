'use client';

import React from 'react';
import { Search, RefreshCw } from 'lucide-react';
import type { FoodFilterBarProps } from '../../../../interface';

export default function FoodFilterBar({
  search,
  category,
  onSearchChange,
  onCategoryChange,
  onSearchSubmit,
  onRefresh,
}: FoodFilterBarProps) {
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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#121a15] p-4 rounded-2xl border border-white/10" suppressHydrationWarning>
      <div className="relative grow max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          suppressHydrationWarning
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
          placeholder="Tìm thực phẩm, món ăn theo tên..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:border-[#10b981] outline-none"
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
}
