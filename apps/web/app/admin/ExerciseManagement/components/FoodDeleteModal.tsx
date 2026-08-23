'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import type { FoodDeleteModalProps } from '../../../../interface';

export default function FoodDeleteModal({
  isOpen,
  food,
  submitting,
  onClose,
  onConfirm,
}: FoodDeleteModalProps) {
  if (!isOpen || !food) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#121a15] border border-rose-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl">
        <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
          <Trash2 size={20} />
          Xóa Món Ăn Khỏi Thư Viện
        </h3>
        <p className="text-xs text-white/70">
          Bạn có chắc chắn muốn xóa món ăn <strong className="text-white">{food.name}</strong>?
        </p>
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 text-xs font-bold hover:bg-white/5 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-[0_0_12px_rgba(244,63,94,0.4)] cursor-pointer"
          >
            {submitting ? 'Đang xóa...' : 'Xác Nhận Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}
