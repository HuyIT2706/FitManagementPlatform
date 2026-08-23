/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Dumbbell, Edit2, Trash2 } from 'lucide-react';
import type { ExerciseTableProps } from '../../../../interface';

export default function ExerciseTable({
  exercises,
  loading,
  onEdit,
  onDelete,
}: ExerciseTableProps) {
  return (
    <div className="bg-[#121a15] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-white">
          <thead className="bg-white/5 text-white/60 uppercase font-semibold text-[10px] tracking-wider border-b border-white/10">
            <tr>
              <th className="px-6 py-4">Bài Tập</th>
              <th className="px-6 py-4">Nhóm Cơ</th>
              <th className="px-6 py-4">Thiết Bị</th>
              <th className="px-6 py-4">Hướng Dẫn Thực Hiện</th>
              <th className="px-6 py-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                  <div className="w-6 h-6 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Đang tải danh sách bài tập...
                </td>
              </tr>
            ) : exercises.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                  Không tìm thấy bài tập nào
                </td>
              </tr>
            ) : (
              exercises.map((ex) => (
                <tr key={ex.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Column 1: Image & Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0 flex items-center justify-center text-white/40">
                        {ex.setupImageUrl || ex.startImageUrl ? (
                          <img
                            src={ex.setupImageUrl || ex.startImageUrl}
                            alt={ex.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Dumbbell size={20} />
                        )}
                      </div>
                      <div className="max-w-[220px]">
                        <strong className="block text-white font-bold truncate">{ex.name}</strong>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {ex.primaryMuscles && ex.primaryMuscles.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full min-w-[100px] text-ms font-bold bg-[#10b981]/15 text-[#10b981] border capitalize border-[#10b981]/30">
                        {ex.primaryMuscles.join(', ')}
                      </span>
                    )}
                  </td>

                  {/* Column 3: Equipment */}
                  <td className="px-6 py-4">
                    <span className="text-white/80 font-medium capitalize">{ex.equipment || 'Bodyweight'}</span>
                  </td>

                  {/* Column 4: Instructions */}
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-white/60 line-clamp-2 text-[11px]">
                      {ex.instructions && ex.instructions.length > 0
                        ? ex.instructions.join(' ')
                        : 'Chưa có hướng dẫn chi tiết'}
                    </p>
                  </td>

                  {/* Column 5: Action Buttons */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(ex)}
                        className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/25 hover:border-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                        title="Chỉnh sửa bài tập"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(ex)}
                        className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/25 hover:border-rose-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
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
}
