'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { WeightEditModalProps } from '../../../interface';

export const WeightEditModal: React.FC<WeightEditModalProps> = ({
  isOpen,
  editMode,
  weightInput,
  isSaving,
  onWeightInputChange,
  onSave,
  onClose,
}) => {
  if (!isOpen || editMode === null) return null;

  const title =
    editMode === 'TARGET'
      ? 'Cân nặng mục tiêu'
      : editMode === 'INITIAL'
      ? 'Cân nặng ban đầu'
      : 'Ghi nhận cân nặng';

  const subtitle =
    editMode === 'TARGET'
      ? 'Thiết lập cân nặng bạn hướng tới'
      : editMode === 'INITIAL'
      ? 'Điều chỉnh mốc cân nặng khởi điểm'
      : 'Cập nhật số cân nặng mới nhất';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#141b17] border border-slate-200 dark:border-white/15 p-5 sm:p-6 shadow-2xl z-10 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {subtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-white/70 dark:hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={onSave} className="space-y-4 pt-1">
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                autoFocus
                required
                value={weightInput}
                onChange={(e) => onWeightInputChange(e.target.value)}
                placeholder="75.0"
                className="w-full h-14 px-4 pr-12 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-2xl font-black text-slate-900 dark:text-white outline-none focus:border-lime-500 text-center"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                kg
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSaving || !weightInput}
                className="flex-1 py-3 rounded-xl bg-[#82c91e] hover:bg-[#74b41a] active:scale-95 text-slate-950 text-xs font-extrabold transition-all disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu lại'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WeightEditModal;
