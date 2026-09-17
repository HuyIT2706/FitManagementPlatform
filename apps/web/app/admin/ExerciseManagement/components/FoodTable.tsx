/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Utensils, Flame, Edit2, Trash2 } from 'lucide-react';
import type { FoodTableProps } from '../../../../interface';
import AppLoading from '../../../../components/ui/AppLoading';

const FoodTable = ({
  foods,
  loading,
  onEdit,
  onDelete,
}: FoodTableProps) => {
  return (
    <div className="bg-white dark:bg-[#121a15] rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs dark:shadow-xl transition-colors duration-200" suppressHydrationWarning>
      <div className="overflow-x-auto [&&::-webkit-scrollbar]:h-1.5 [&&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&&::-webkit-scrollbar-thumb]:bg-white/20 [&&::-webkit-scrollbar-thumb]:rounded-full">
        <table className="w-full text-left text-xs text-slate-900 dark:text-white min-w-[650px]">
          <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-white/60 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-white/10">
            <tr>
              <th className="px-4 sm:px-6 py-3 sm:py-4">Món Ăn</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4">Danh Mục</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4">Năng Lượng (100g)</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4">Thành Phần Dinh Dưỡng</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 sm:px-6 py-8 text-center text-slate-500 dark:text-white/50">
                  <AppLoading size="sm" message="Đang tải danh sách món ăn..." />
                </td>
              </tr>
            ) : foods.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 sm:px-6 py-12 text-center text-slate-500 dark:text-white/50">
                  Không tìm thấy món ăn nào
                </td>
              </tr>
            ) : (
              foods.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                  {/* Column 1: Image & Name */}
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-[150px] sm:min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shrink-0 flex items-center justify-center text-slate-400 dark:text-white/40">
                        {f.imageUrl ? (
                          <img src={f.imageUrl} alt={f.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                        ) : (
                          <Utensils size={18} className="sm:w-5 sm:h-5" />
                        )}
                      </div>
                      <div className="max-w-[200px]">
                        <strong className="block text-slate-900 dark:text-white font-bold truncate text-xs sm:text-sm">{f.name}</strong>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Category */}
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300/60 dark:border-amber-500/30">
                      {f.category || 'Chung'}
                    </span>
                  </td>

                  {/* Column 3: Calories */}
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-extrabold text-emerald-600 dark:text-[#10b981] text-xs sm:text-sm">
                      <Flame size={15} />
                      {f.caloriesPer100g} kcal
                    </div>
                  </td>

                  {/* Column 4: Macro Pills */}
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold text-[10px] border border-rose-200 dark:border-rose-500/30">
                        P: {f.proteinPer100g}g
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-[10px] border border-amber-200 dark:border-amber-500/30">
                        C: {f.carbsPer100g}g
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold text-[10px] border border-blue-200 dark:border-blue-500/30">
                        F: {f.fatPer100g}g
                      </span>
                      {f.fiberPer100g ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-500/30">
                          Xơ: {f.fiberPer100g}g
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {/* Column 5: Action Buttons */}
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => onEdit(f)}
                        className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/25 hover:border-blue-300 dark:hover:border-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                        title="Chỉnh sửa món ăn"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => onDelete(f)}
                        className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/25 hover:border-rose-300 dark:hover:border-rose-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                        title="Xóa món ăn"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FoodTable;
