import React from 'react';
import { Settings2, X } from 'lucide-react';

interface EditSessionModalProps {
  isOpen: boolean;
  packageName: string;
  totalSessions: number;
  remainingSessions: number;
  saving: boolean;
  onClose: () => void;
  onPackageNameChange: (val: string) => void;
  onTotalSessionsChange: (val: number) => void;
  onRemainingSessionsChange: (val: number) => void;
  onSaveSessions: () => void;
}

const EditSessionModal = ({
  isOpen,
  packageName,
  totalSessions,
  remainingSessions,
  saving,
  onClose,
  onPackageNameChange,
  onTotalSessionsChange,
  onRemainingSessionsChange,
  onSaveSessions,
}: EditSessionModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-[200] flex items-center justify-center p-3 sm:p-4 cursor-pointer animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#121620] rounded-2xl sm:rounded-[32px] p-4 sm:p-6 md:p-8 max-w-md w-full border border-white/15 space-y-4 sm:space-y-6 shadow-2xl relative cursor-default animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/20 text-primary border border-primary/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(102,200,28,0.2)]">
              <Settings2 size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-xl font-bold text-white tracking-tight truncate">
                Sửa Số Buổi & Gói Tập
              </h3>
              <p className="text-[11px] sm:text-xs text-white/50 mt-0.5 truncate">
                Cập nhật thông tin gói tập của học viên
              </p>
            </div>
          </div>

          <button
            type="button"
            suppressHydrationWarning
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Fields */}
        <div className="space-y-3.5 sm:space-y-4 text-xs">
          <div>
            <label className="block text-white/80 font-semibold mb-1.5">
              Gói tập PT
            </label>
            <input
              type="text"
              value={packageName}
              onChange={(e) => onPackageNameChange(e.target.value)}
              placeholder="VD: Gói PT 1:1"
              className="w-full bg-white/[0.05] border border-white/15 rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
            <div>
              <label className="block text-white/80 font-semibold mb-1.5 truncate">
                Tổng số buổi
              </label>
              <input
                type="number"
                placeholder="0"
                value={totalSessions === 0 ? '' : totalSessions}
                onChange={(e) =>
                  onTotalSessionsChange(e.target.value === '' ? 0 : Number(e.target.value))
                }
                className="w-full bg-white/[0.05] border border-white/15 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base font-extrabold text-white text-center focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-white/80 font-semibold mb-1.5 truncate">
                Số buổi còn lại
              </label>
              <input
                type="number"
                placeholder="0"
                value={remainingSessions === 0 ? '' : remainingSessions}
                onChange={(e) =>
                  onRemainingSessionsChange(e.target.value === '' ? 0 : Number(e.target.value))
                }
                className="w-full bg-white/[0.05] border border-white/15 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base font-extrabold text-primary text-center focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              suppressHydrationWarning
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition-colors cursor-pointer text-center"
            >
              Hủy
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={onSaveSessions}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-primary text-dark-slate font-extrabold text-xs shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 text-center"
            >
              {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSessionModal;
