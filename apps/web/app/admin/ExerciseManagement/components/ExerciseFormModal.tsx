'use client';

import React from 'react';
import { Dumbbell } from 'lucide-react';
import type { ExerciseFormModalProps } from '../../../../interface';

const ExerciseFormModal = ({
  isOpen,
  isEditing,
  submitting,
  name,
  category,
  equipment,
  primaryMuscles,
  instructions,
  setupUrl,
  startUrl,
  onNameChange,
  onCategoryChange,
  onEquipmentChange,
  onPrimaryMusclesChange,
  onInstructionsChange,
  onSetupUrlChange,
  onStartUrlChange,
  onClose,
  onSubmit,
}: ExerciseFormModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" suppressHydrationWarning>
      <div className="bg-[#121a15] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Dumbbell className="text-[#10b981]" size={20} />
          {isEditing ? 'Chỉnh Sửa Bài Tập' : 'Thêm Bài Tập Mới Vào CSDL'}
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-white/80 font-bold mb-1">Tên bài tập (*)</label>
            <input
              type="text"
              suppressHydrationWarning
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ví dụ: Barbell Bench Press"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/80 font-bold mb-1">Nhóm cơ chính</label>
              <select
                suppressHydrationWarning
                value={category}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full bg-[#1c2720] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
              >
                <option value="CHEST">Ngực (Chest)</option>
                <option value="BACK">Lưng (Back)</option>
                <option value="LEGS">Chân (Legs)</option>
                <option value="SHOULDERS">Vai (Shoulders)</option>
                <option value="ARMS">Tay (Arms)</option>
                <option value="ABS">Bụng (Abs)</option>
                <option value="CARDIO">Cardio</option>
                <option value="FULL_BODY">Toàn thân (Full Body)</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 font-bold mb-1">Thiết bị</label>
              <input
                type="text"
                suppressHydrationWarning
                value={equipment}
                onChange={(e) => onEquipmentChange(e.target.value)}
                placeholder="Barbell, Dumbbell, Machine..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 font-bold mb-1">Cơ tác động (phân tách dấu phẩy)</label>
            <input
              type="text"
              suppressHydrationWarning
              value={primaryMuscles}
              onChange={(e) => onPrimaryMusclesChange(e.target.value)}
              placeholder="Ví dụ: Ngực trên, Tay sau, Vai trước"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
            />
          </div>

          <div>
            <label className="block text-white/80 font-bold mb-1">URL Ảnh Setup / Bắt Đầu</label>
            <input
              type="text"
              suppressHydrationWarning
              value={setupUrl}
              onChange={(e) => onSetupUrlChange(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
            />
          </div>

          <div>
            <label className="block text-white/80 font-bold mb-1">URL Ảnh Động Tác / Kết Thúc</label>
            <input
              type="text"
              suppressHydrationWarning
              value={startUrl}
              onChange={(e) => onStartUrlChange(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
            />
          </div>

          <div>
            <label className="block text-white/80 font-bold mb-1">Hướng dẫn thực hiện (mỗi dòng 1 bước)</label>
            <textarea
              rows={3}
              suppressHydrationWarning
              value={instructions}
              onChange={(e) => onInstructionsChange(e.target.value)}
              placeholder="Bước 1: Nằm trên ghế..."
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
            {submitting ? 'Đang lưu...' : 'Lưu Bài Tập'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseFormModal;
