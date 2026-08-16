'use client';

import { Dumbbell, Bell, LogOut, ChevronRight, User } from 'lucide-react';

interface ProfileSettingsListProps {
  onLogout: () => void;
  onEditProfile?: () => void;
}

export default function ProfileSettingsList({
  onLogout,
  onEditProfile,
}: ProfileSettingsListProps) {
  return (
    <section className="bento-card rounded-2xl flex flex-col p-2 border border-outline-variant/30 mt-4">
      {/* Edit Profile */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={onEditProfile}
        className="flex items-center justify-between p-4 hover:bg-surface-bright/40 rounded-xl transition-colors cursor-pointer group text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 group-hover:bg-green-light/10 transition-colors shrink-0">
            <User
              size={20}
              className="text-on-surface group-hover:text-green-light transition-colors"
            />
          </div>
          <div>
            <div className="text-sm font-bold text-on-surface">Thông tin cá nhân</div>
            <div className="text-xs font-medium text-on-surface-variant mt-0.5">
              Chỉnh sửa tên, ảnh đại diện, chiều cao, cân nặng
            </div>
          </div>
        </div>
        <ChevronRight size={18} className="text-on-surface-variant" />
      </button>

      <div className="w-full h-px bg-white/5"></div>

      {/* Package Management */}
      <button
        type="button"
        suppressHydrationWarning
        className="flex items-center justify-between p-4 hover:bg-surface-bright/40 rounded-xl transition-colors cursor-pointer group text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 group-hover:bg-green-light/10 transition-colors shrink-0">
            <Dumbbell
              size={20}
              className="text-on-surface group-hover:text-green-light transition-colors"
            />
          </div>
          <div>
            <div className="text-sm font-bold text-on-surface">Quản lý Gói tập</div>
            <div className="text-xs font-medium text-on-surface-variant mt-0.5">
              Gói PT 1:1 - Đã kích hoạt
            </div>
          </div>
        </div>
        <ChevronRight size={18} className="text-on-surface-variant" />
      </button>

      <div className="w-full h-px bg-white/5"></div>

      {/* Notifications Settings */}
      <button
        type="button"
        suppressHydrationWarning
        className="flex items-center justify-between p-4 hover:bg-surface-bright/40 rounded-xl transition-colors cursor-pointer group text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 group-hover:bg-green-light/10 transition-colors shrink-0">
            <Bell
              size={20}
              className="text-on-surface group-hover:text-green-light transition-colors"
            />
          </div>
          <div className="text-sm font-bold text-on-surface">Cài đặt thông báo</div>
        </div>
        <ChevronRight size={18} className="text-on-surface-variant" />
      </button>

      <div className="w-full h-px bg-white/5"></div>

      {/* Logout */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={onLogout}
        className="flex items-center justify-between p-4 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer w-full text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
            <LogOut size={20} className="text-red-400" />
          </div>
          <div className="text-sm font-bold text-red-400">Đăng xuất</div>
        </div>
        <ChevronRight size={18} className="text-red-400" />
      </button>
    </section>
  );
}
