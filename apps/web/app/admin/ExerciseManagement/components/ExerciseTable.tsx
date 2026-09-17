/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Dumbbell, Edit2, Trash2 } from 'lucide-react';
import type { ExerciseTableProps } from '../../../../interface';
import AppLoading from '../../../../components/ui/AppLoading';

const ExerciseTable = ({
  exercises,
  loading,
  onEdit,
  onDelete,
}: ExerciseTableProps) => {
  return (
    <div className="bg-white dark:bg-[#121a15] rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs dark:shadow-xl transition-colors duration-200" suppressHydrationWarning>
      <div className="overflow-x-auto [&&::-webkit-scrollbar]:h-1.5 [&&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&&::-webkit-scrollbar-thumb]:bg-white/20 [&&::-webkit-scrollbar-thumb]:rounded-full">
        <table className="w-full text-left text-xs text-slate-900 dark:text-white min-w-[650px]">
          <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-white/60 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-white/10">
            <tr>
              <th className="px-4 sm:px-6 py-3 sm:py-4">Bài Tập</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4">Nhóm Cơ</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4">Thiết Bị</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4">Hướng Dẫn Thực Hiện</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 sm:px-6 py-8 text-center text-slate-500 dark:text-white/50">
                  <AppLoading size="sm" message="Đang tải danh sách bài tập..." />
                </td>
              </tr>
            ) : exercises.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 sm:px-6 py-12 text-center text-slate-500 dark:text-white/50">
                  Không tìm thấy bài tập nào
                </td>
              </tr>
            ) : (
              exercises.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                  {/* Column 1: Image & Name */}
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-[150px] sm:min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shrink-0 flex items-center justify-center text-slate-400 dark:text-white/40">
                        {ex.setupImageUrl || ex.startImageUrl ? (
                          <img
                            src={ex.setupImageUrl || ex.startImageUrl}
                            alt={ex.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Dumbbell size={18} className="sm:w-5 sm:h-5" />
                        )}
                      </div>
                      <div className="max-w-[220px]">
                        <strong className="block text-slate-900 dark:text-white font-bold truncate text-xs sm:text-sm">{ex.name}</strong>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    {ex.primaryMuscles && ex.primaryMuscles.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full min-w-[80px] text-xs font-bold bg-emerald-50 dark:bg-[#10b981]/15 text-emerald-700 dark:text-[#10b981] border capitalize border-emerald-300/60 dark:border-[#10b981]/30">
                        {ex.primaryMuscles.join(', ')}
                      </span>
                    )}
                  </td>

                  {/* Column 3: Equipment */}
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className="text-slate-700 dark:text-white/80 font-medium capitalize text-xs">{ex.equipment || 'Bodyweight'}</span>
                  </td>

                  {/* Column 4: Instructions */}
                  <td className="px-4 sm:px-6 py-3 sm:py-4 max-w-xs">
                    <p className="text-slate-500 dark:text-white/60 line-clamp-2 text-[11px]">
                      {ex.instructions && ex.instructions.length > 0
                        ? ex.instructions.join(' ')
                        : 'Chưa có hướng dẫn chi tiết'}
                    </p>
                  </td>

                  {/* Column 5: Action Buttons */}
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => onEdit(ex)}
                        className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/25 hover:border-blue-300 dark:hover:border-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                        title="Chỉnh sửa bài tập"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => onDelete(ex)}
                        className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/25 hover:border-rose-300 dark:hover:border-rose-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                        title="Xóa bài tập"
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

export default ExerciseTable;
