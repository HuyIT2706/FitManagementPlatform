'use client';

import React from 'react';
import { UserCheck, UserX } from 'lucide-react';
import type { CoachReviewActionModalProps } from '../../../../interface';

const CoachReviewActionModal = ({
  isOpen,
  application,
  action,
  actionNote,
  submitting,
  onNoteChange,
  onClose,
  onSubmit,
}: CoachReviewActionModalProps) => {
  if (!isOpen || !application || !action) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" suppressHydrationWarning>
      <div className="bg-[#121a15] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-bold flex items-center gap-2">
          {action === 'APPROVE' ? (
            <>
              <UserCheck className="text-[#10b981]" size={22} />
              Xác nhận Phê duyệt HLV PT
            </>
          ) : (
            <>
              <UserX className="text-rose-400" size={22} />
              Xác nhận Từ chối Đơn HLV
            </>
          )}
        </h3>

        <p className="text-xs text-white/70 leading-relaxed">
          {action === 'APPROVE'
            ? `Bạn đang chuẩn bị phê duyệt tài khoản ${application.fullName} (${application.email}) thành Huấn luyện viên PT chính thức.`
            : `Bạn đang từ chối đơn đăng ký PT của ${application.fullName}. Vui lòng nhập lý do bên dưới để gửi thông báo.`}
        </p>

        <div>
          <label className="block text-xs font-semibold text-white/80 mb-1">
            Ghi chú / Nhận xét của Admin:
          </label>
          <textarea
            rows={3}
            suppressHydrationWarning
            value={actionNote}
            onChange={(e) => onNoteChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#10b981] outline-none"
            placeholder="Nhập lý do hoặc nhận xét..."
          />
        </div>

        <div className="flex gap-3 pt-2 border-t border-white/10">
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
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-opacity flex items-center justify-center gap-1 cursor-pointer ${
              action === 'APPROVE'
                ? 'bg-[#10b981] text-[#003824] shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
            }`}
          >
            {submitting ? 'Đang xử lý...' : action === 'APPROVE' ? 'Xác nhận Phê Duyệt' : 'Xác nhận Từ Chối'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachReviewActionModal;
