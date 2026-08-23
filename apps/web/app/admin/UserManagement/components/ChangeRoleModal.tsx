'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import type { AdminChangeRoleModalProps, AdminUserRole } from '../../../../interface';

const AdminChangeRoleModal = ({
  isOpen,
  user,
  targetRole,
  submitting,
  onRoleSelect,
  onClose,
  onSubmit,
}: AdminChangeRoleModalProps) => {
  if (!isOpen || !user) return null;

  const roles: AdminUserRole[] = ['USER', 'PT', 'ADMIN'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" suppressHydrationWarning>
      <div className="bg-[#121a15] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Shield className="text-[#10b981]" size={20} />
          Thay Đổi Phân Quyền Người Dùng
        </h3>

        <p className="text-xs text-white/70">
          Bạn đang thay đổi vai trò cho tài khoản: <strong className="text-white">{user.fullName}</strong> ({user.email})
        </p>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-white/80">Chọn phân quyền mới:</label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                suppressHydrationWarning
                onClick={() => onRoleSelect(r)}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  targetRole === r
                    ? 'bg-[#10b981] border-[#10b981] text-[#003824] shadow-md shadow-[#10b981]/20'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {r === 'USER' ? 'Học Viên' : r === 'PT' ? 'HLV PT' : 'Admin'}
              </button>
            ))}
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
            {submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminChangeRoleModal;
