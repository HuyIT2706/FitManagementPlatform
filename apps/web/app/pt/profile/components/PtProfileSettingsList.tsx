'use client';

import { User, Lock, LogOut, ChevronRight } from 'lucide-react';

interface PtProfileSettingsListProps {
  onLogout: () => void;
}

export default function PtProfileSettingsList({ onLogout }: PtProfileSettingsListProps) {
  return (
    <div className="bento-card rounded-3xl p-6 border border-outline-variant/30 space-y-3">
      <h3 className="text-base font-bold text-on-surface px-1">Cài đặt tài khoản</h3>

      <div className="space-y-2">
        <button
          type="button"
          suppressHydrationWarning
          className="w-full p-4 rounded-2xl bg-surface-bright/30 border border-white/5 flex items-center justify-between text-sm font-semibold hover:bg-surface-bright/50 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-3">
            <User size={18} className="text-primary" />
            Thông tin cá nhân Coach
          </span>
          <ChevronRight size={18} className="text-on-surface-variant" />
        </button>

        <button
          type="button"
          suppressHydrationWarning
          className="w-full p-4 rounded-2xl bg-surface-bright/30 border border-white/5 flex items-center justify-between text-sm font-semibold hover:bg-surface-bright/50 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-3">
            <Lock size={18} className="text-primary" />
            Đổi mật khẩu
          </span>
          <ChevronRight size={18} className="text-on-surface-variant" />
        </button>

        <button
          type="button"
          suppressHydrationWarning
          onClick={onLogout}
          className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between text-sm font-bold hover:bg-red-500/20 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-3">
            <LogOut size={18} />
            Đăng xuất tài khoản PT
          </span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
