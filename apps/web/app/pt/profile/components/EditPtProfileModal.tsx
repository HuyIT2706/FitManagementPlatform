'use client';

import { UserCheck, X, Check } from 'lucide-react';
import type { UserDataHome } from '../../../../interface';

interface EditPtProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserDataHome | null;
  fullName: string;
  setFullName: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  experienceYears: number;
  setExperienceYears: (val: number) => void;
  specialties: string[];
  setSpecialties: (val: string[]) => void;
  availableSpecialties: string[];
  saving: boolean;
  onSave: () => void;
}

const EditPtProfileModal = ({
  isOpen,
  onClose,
  userData,
  fullName,
  setFullName,
  bio,
  setBio,
  experienceYears,
  setExperienceYears,
  specialties,
  setSpecialties,
  availableSpecialties,
  saving,
  onSave,
}: EditPtProfileModalProps) => {
  if (!isOpen) return null;

  const toggleSpecialty = (spec: string) => {
    if (specialties.includes(spec)) {
      setSpecialties(specialties.filter((s) => s !== spec));
    } else {
      setSpecialties([...specialties, spec]);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12161f] border border-outline-variant/30 w-full max-w-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative max-h-[90vh] overflow-y-auto custom-scrollbar text-left">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30 shrink-0">
              <UserCheck size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base sm:text-lg text-white truncate">
                Cập nhật thông tin Hồ sơ HLV
              </h3>
              <p className="text-[11px] sm:text-xs text-on-surface-variant truncate">
                Chỉnh sửa họ tên, tiểu sử & chuyên môn huấn luyện
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Inputs */}
        <div className="space-y-3.5 sm:space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-on-surface">
              Họ & Tên HLV:
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-surface-bright/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white focus:border-primary outline-none transition-colors"
              placeholder={userData?.fullName || ''}
            />
          </div>

          {/* Experience Years */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-on-surface">
              Số năm kinh nghiệm:
            </label>
            <input
              type="number"
              min={0}
              max={50}
              placeholder="0"
              value={experienceYears === 0 ? '' : experienceYears}
              onChange={(e) =>
                setExperienceYears(e.target.value === '' ? 0 : Number(e.target.value))
              }
              className="w-full bg-surface-bright/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-extrabold text-primary focus:border-primary outline-none transition-colors"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-on-surface">
              Tiểu sử HLV (Bio):
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-surface-bright/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white/90 focus:border-primary outline-none leading-relaxed transition-colors resize-none"
              placeholder="Giới thiệu về chuyên môn & định hướng huấn luyện..."
            />
          </div>

          {/* Specialties */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-on-surface">
              Lĩnh vực Chuyên môn:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
              {availableSpecialties.map((spec) => {
                const isSelected = specialties.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialty(spec)}
                    className={`p-2.5 rounded-xl border text-xs font-extrabold text-left flex justify-between items-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/20 text-primary shadow-[0_0_10px_rgba(102,200,28,0.2)]'
                        : 'border-white/10 bg-surface-bright/30 text-on-surface-variant hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span>{spec}</span>
                    {isSelected && <Check size={14} className="text-primary stroke-[3] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 text-on-surface-variant hover:text-white text-xs font-bold transition-colors cursor-pointer text-center"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-dark-slate text-xs font-extrabold shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 text-center"
          >
            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi HLV'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPtProfileModal;
