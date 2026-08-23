'use client';

import React from 'react';
import { Utensils } from 'lucide-react';
import type { FoodFormModalProps } from '../../../../interface';

const FoodFormModal = ({
  isOpen,
  isEditing,
  submitting,
  name,
  category,
  calo,
  protein,
  carbs,
  fat,
  fiber,
  image,
  onNameChange,
  onCategoryChange,
  onCaloChange,
  onProteinChange,
  onCarbsChange,
  onFatChange,
  onFiberChange,
  onImageChange,
  onClose,
  onSubmit,
}: FoodFormModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" suppressHydrationWarning>
      <div className="bg-[#121a15] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Utensils className="text-[#10b981]" size={20} />
          {isEditing ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Ăn Mới Vào CSDL'}
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-white/80 font-bold mb-1">Tên món ăn / Thực phẩm (*)</label>
            <input
              type="text"
              suppressHydrationWarning
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ví dụ: Ức gà áp chảo"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
            />
          </div>

          <div>
            <label className="block text-white/80 font-bold mb-1">Danh mục thực phẩm</label>
            <input
              type="text"
              suppressHydrationWarning
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              placeholder="Ví dụ: Thịt & Cá, Rau củ, Tinh bột..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[#10b981] font-bold mb-1">Calo (kcal)</label>
              <input
                type="number"
                suppressHydrationWarning
                value={calo}
                onChange={(e) => onCaloChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-[#10b981] outline-none"
              />
            </div>
            <div>
              <label className="block text-rose-400 font-bold mb-1">Protein (g)</label>
              <input
                type="number"
                suppressHydrationWarning
                value={protein}
                onChange={(e) => onProteinChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-[#10b981] outline-none"
              />
            </div>
            <div>
              <label className="block text-amber-400 font-bold mb-1">Carbs (g)</label>
              <input
                type="number"
                suppressHydrationWarning
                value={carbs}
                onChange={(e) => onCarbsChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-[#10b981] outline-none"
              />
            </div>
            <div>
              <label className="block text-blue-400 font-bold mb-1">Fat (g)</label>
              <input
                type="number"
                suppressHydrationWarning
                value={fat}
                onChange={(e) => onFatChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-[#10b981] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 font-bold mb-1">Chất xơ (Fiber / 100g)</label>
            <input
              type="number"
              suppressHydrationWarning
              value={fiber}
              onChange={(e) => onFiberChange(e.target.value)}
              placeholder="0"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
            />
          </div>

          <div>
            <label className="block text-white/80 font-bold mb-1">URL Hình Ảnh Món Ăn</label>
            <input
              type="text"
              suppressHydrationWarning
              value={image}
              onChange={(e) => onImageChange(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            suppressHydrationWarning
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 text-xs font-bold hover:bg-white/5 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-[#10b981] text-[#003824] text-xs font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.4)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            {submitting ? 'Đang lưu...' : 'Lưu Món Ăn'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodFormModal;
