/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Utensils, Flame, Edit2, Trash2 } from 'lucide-react';
import type { FoodTableProps } from '../../../../interface';

import AdminLoading from '../../components/AdminLoading';

const FoodTable = ({
  foods,
  loading,
  onEdit,
  onDelete,
}: FoodTableProps) => {
  return (
    <div className="bg-[#121a15] rounded-2xl border border-white/10 overflow-hidden shadow-xl" suppressHydrationWarning>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-white">
          <thead className="bg-white/5 text-white/60 uppercase font-semibold text-[10px] tracking-wider border-b border-white/10">
            <tr>
              <th className="px-6 py-4">Món Ăn</th>
              <th className="px-6 py-4">Danh Mục</th>
              <th className="px-6 py-4">Năng Lượng (100g)</th>
              <th className="px-6 py-4">Thành Phần Dinh Dưỡng</th>
              <th className="px-6 py-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-white/50">
                  <AdminLoading size="sm" message="Đang tải danh sách món ăn..." />
                </td>
              </tr>
            ) : foods.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                  Không tìm thấy món ăn nào
                </td>
              </tr>
            ) : (
              foods.map((f) => (
                <tr key={f.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Column 1: Image & Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0 flex items-center justify-center text-white/40">
                        {f.imageUrl ? (
                          <img src={f.imageUrl} alt={f.name} className="w-full h-full object-cover" />
                        ) : (
                          <Utensils size={20} />
                        )}
                      </div>
                      <div className="max-w-[200px]">
                        <strong className="block text-white font-bold truncate">{f.name}</strong>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Category */}
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      {f.category || 'Chung'}
                    </span>
                  </td>

                  {/* Column 3: Calories */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-extrabold text-[#10b981] text-sm">
                      <Flame size={15} />
                      {f.caloriesPer100g} kcal
                    </div>
                  </td>

                  {/* Column 4: Macro Pills */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 font-bold text-[10px] border border-rose-500/30">
                        P: {f.proteinPer100g}g
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                        C: {f.carbsPer100g}g
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 font-bold text-[10px] border border-blue-500/30">
                        F: {f.fatPer100g}g
                      </span>
                      {f.fiberPer100g ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                          Xơ: {f.fiberPer100g}g
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {/* Column 5: Action Buttons */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => onEdit(f)}
                        className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/25 hover:border-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                        title="Chỉnh sửa món ăn"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => onDelete(f)}
                        className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/25 hover:border-rose-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
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
