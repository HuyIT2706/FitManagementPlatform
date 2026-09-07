'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import type { ExerciseDeleteModalProps } from '../../../../interface';

const ExerciseDeleteModal = ({
  isOpen,
  exercise,
  submitting,
  onClose,
  onConfirm,
}: ExerciseDeleteModalProps) => {
  if (!isOpen || !exercise) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4" suppressHydrationWarning>
      <div className="bg-[#121a15] border border-rose-500/30 rounded-2xl w-full max-w-md p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-white shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <h3 className="text-base sm:text-lg font-bold text-rose-400 flex items-center gap-2">
          <Trash2 size={20} className="shrink-0" />
          <span>Xóa Bài Tập Khỏi Thư Viện</span>
        </h3>
        <p className="text-xs text-white/70 leading-relaxed">
          Bạn có chắc chắn muốn xóa bài tập <strong className="text-white">{exercise.name}</strong>?
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            suppressHydrationWarning
            onClick={onClose}
            className="w-full sm:flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 text-xs font-bold hover:bg-white/5 cursor-pointer text-center"
          >
            Hủy
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={onConfirm}
            disabled={submitting}
            className="w-full sm:flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-[0_0_12px_rgba(244,63,94,0.4)] cursor-pointer text-center"
          >
            {submitting ? 'Đang xóa...' : 'Xác Nhận Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDeleteModal;
