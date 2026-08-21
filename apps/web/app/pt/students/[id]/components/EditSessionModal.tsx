'use client';

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

export default function EditSessionModal({
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
}: EditSessionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-dark-slate/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bento-card rounded-3xl p-6 md:p-8 max-w-md w-full border border-primary/30 space-y-6 shadow-2xl relative animate-fadeIn">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">
              settings
            </span>
            <h3 className="text-xl font-bold text-on-surface">
              Sửa Số Buổi & Gói Tập
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-white p-1 rounded-lg hover:bg-surface-bright cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-on-surface font-semibold mb-1">
              Gói tập PT
            </label>
            <input
              type="text"
              value={packageName}
              onChange={(e) => onPackageNameChange(e.target.value)}
              className="w-full bg-surface-bright border border-white/10 rounded-xl px-4 py-3 text-on-surface font-semibold focus:border-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-on-surface font-semibold mb-1">
                Tổng số buổi đăng ký
              </label>
              <input
                type="number"
                value={totalSessions}
                onChange={(e) => onTotalSessionsChange(Number(e.target.value))}
                className="w-full bg-surface-bright border border-white/10 rounded-xl px-4 py-3 text-on-surface font-extrabold focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-on-surface font-semibold mb-1">
                Số buổi còn lại
              </label>
              <input
                type="number"
                value={remainingSessions}
                onChange={(e) => onRemainingSessionsChange(Number(e.target.value))}
                className="w-full bg-surface-bright border border-white/10 rounded-xl px-4 py-3 text-on-surface font-extrabold text-primary focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-surface-bright text-on-surface font-bold hover:bg-surface-bright/70 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onSaveSessions}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-primary text-dark-slate font-extrabold shadow-[0_0_12px_rgba(102,200,28,0.4)] hover:bg-primary/90 cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
