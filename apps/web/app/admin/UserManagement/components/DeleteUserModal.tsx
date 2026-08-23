'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { AdminDeleteUserModalProps } from '../../../../interface';

const AdminDeleteUserModal = ({
  isOpen,
  user,
  submitting,
  onClose,
  onConfirm,
}: AdminDeleteUserModalProps) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" suppressHydrationWarning>
      <div className="bg-[#121a15] border border-rose-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
          <AlertTriangle size={22} />
          Xác Nhận Xóa Tài Khoản
        </h3>

        <p className="text-xs text-white/70 leading-relaxed">
          Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản <strong className="text-white">{user.fullName}</strong> ({user.email})? Toàn bộ nhật ký bài tập và dữ liệu liên quan sẽ bị xóa khỏi hệ thống.
        </p>

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
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-[0_0_12px_rgba(244,63,94,0.4)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            {submitting ? 'Đang xóa...' : 'Xác Nhận Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDeleteUserModal;
