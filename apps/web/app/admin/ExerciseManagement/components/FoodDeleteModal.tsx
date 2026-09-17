'use client';

import React from 'react';
import { Trash2, X } from 'lucide-react';
import type { FoodDeleteModalProps } from '../../../../interface';

const FoodDeleteModal = ({
  isOpen,
  food,
  submitting,
  onClose,
  onConfirm,
}: FoodDeleteModalProps) => {
  if (!isOpen || !food) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4" suppressHydrationWarning>
      <div className="bg-white dark:bg-[#121a15] border border-rose-500/40 rounded-2xl w-full max-w-md p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-slate-900 dark:text-white shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-white/10">
          <h3 className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <Trash2 size={20} className="shrink-0" />
            <span>Xóa Món Ăn Khỏi Thư Viện</span>
          </h3>
          <button
            type="button"
            suppressHydrationWarning
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-white/40 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0 -mr-1"
            title="Đóng"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed">
          Bạn có chắc chắn muốn xóa món ăn <strong className="text-slate-900 dark:text-white">{food.name}</strong>?
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            suppressHydrationWarning
            onClick={onClose}
            className="w-full sm:flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer text-center"
          >
            Hủy
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={onConfirm}
            disabled={submitting}
            className="w-full sm:flex-1 py-2.5 rounded-xl bg-rose-600 dark:bg-rose-500 text-white text-xs font-bold shadow-sm dark:shadow-[0_0_12px_rgba(244,63,94,0.4)] cursor-pointer text-center"
          >
            {submitting ? 'Đang xóa...' : 'Xác Nhận Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodDeleteModal;
