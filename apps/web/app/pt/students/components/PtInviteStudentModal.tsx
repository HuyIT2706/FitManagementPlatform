'use client';

import { UserPlus, Mail, Copy, Check, X } from 'lucide-react';
import type { PtInviteModalProps } from '../../../../interface';
import { useState } from 'react';

export default function PtInviteStudentModal({
  isOpen,
  studentEmail,
  packageName,
  totalSessions,
  sendingInvite,
  generatedInviteUrl,
  onClose,
  onStudentEmailChange,
  onPackageNameChange,
  onTotalSessionsChange,
  onSendInvite,
  onCopyInviteUrl,
}: PtInviteModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    onCopyInviteUrl();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#121620] border border-white/15 rounded-[32px] max-w-lg w-full p-6 md:p-8 space-y-6 text-white shadow-2xl relative cursor-default animate-in zoom-in-95 duration-200"
      >
        {/* Header Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng modal"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary border border-primary/40 flex items-center justify-center shrink-0">
            <UserPlus size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-white font-headline-md">
              Mời Học Viên Mới 1-1
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              Tạo đường link kích hoạt gói tập cho học viên của bạn.
            </p>
          </div>
        </div>

        {!generatedInviteUrl ? (
          <form onSubmit={onSendInvite} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-white/80">
                Email Học Viên (*):
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                />
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => onStudentEmailChange(e.target.value)}
                  placeholder="hocvien@gmail.com"
                  className="w-full bg-white/[0.05] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-white/80">Tên Gói Tập PT:</label>
              <input
                type="text"
                required
                value={packageName}
                onChange={(e) => onPackageNameChange(e.target.value)}
                placeholder="Gói PT VIP 1-1"
                className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-white/80">
                Tổng số buổi tập:
              </label>
              <input
                type="number"
                min={1}
                required
                value={totalSessions}
                onChange={(e) => onTotalSessionsChange(Number(e.target.value) || 12)}
                className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none font-bold text-primary"
              />
            </div>

            <button
              type="submit"
              disabled={sendingInvite}
              className="w-full bg-primary text-dark-slate font-extrabold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(102,200,28,0.4)] cursor-pointer disabled:opacity-50 mt-2"
            >
              {sendingInvite ? 'Đang tạo Link...' : 'Khởi Tạo Link Mời Học Viên'}
            </button>
          </form>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="bg-primary/10 border border-primary/30 p-4 rounded-2xl text-center space-y-2">
              <p className="text-xs text-primary font-bold">🎉 Khởi tạo Link thành công!</p>
              <p className="text-xs text-white/70">
                Hãy sao chép đường dẫn này và gửi cho học viên để liên kết trực tiếp với bạn.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={generatedInviteUrl}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-primary font-mono select-all outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2.5 bg-primary text-dark-slate font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Đã chép' : 'Sao chép'}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-surface-bright/40 text-white font-bold py-3 rounded-xl hover:bg-surface-bright transition-colors border border-white/10 cursor-pointer mt-2"
            >
              Hoàn tất
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
