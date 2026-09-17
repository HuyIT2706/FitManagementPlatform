'use client';

import React from 'react';
import { Shield, X } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4" suppressHydrationWarning>
      <div className="bg-white dark:bg-[#121a15] border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-md p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-slate-900 dark:text-white shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-white/10">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Shield className="text-emerald-600 dark:text-[#10b981] shrink-0" size={20} />
            <span>Thay Đổi Phân Quyền Người Dùng</span>
          </h3>
          <button
            type="button"
            suppressHydrationWarning
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-white/40 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0 -mr-1"
            title="Đóng"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed">
          Bạn đang thay đổi vai trò cho tài khoản: <strong className="text-slate-900 dark:text-white">{user.fullName}</strong> ({user.email})
        </p>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-white/80">Chọn phân quyền mới:</label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                suppressHydrationWarning
                onClick={() => onRoleSelect(r)}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  targetRole === r
                    ? 'bg-[#10b981] border-[#10b981] text-[#003824] shadow-sm shadow-[#10b981]/20'
                    : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {r === 'USER' ? 'Học Viên' : r === 'PT' ? 'HLV PT' : 'Admin'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            suppressHydrationWarning
            onClick={onClose}
            className="w-full sm:flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer text-center"
          >
            Hủy
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={onSubmit}
            disabled={submitting}
            className="w-full sm:flex-1 py-2.5 rounded-xl bg-[#10b981] text-[#003824] text-xs font-extrabold shadow-sm dark:shadow-[0_0_12px_rgba(16,185,129,0.4)] hover:opacity-90 transition-opacity cursor-pointer text-center"
          >
            {submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminChangeRoleModal;
