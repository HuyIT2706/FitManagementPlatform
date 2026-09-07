'use client';

import { useState } from 'react';
import { User, Lock, LogOut, ChevronRight } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

interface PtProfileSettingsListProps {
  onLogout: () => void;
  onOpenEditProfile?: () => void;
}

const PtProfileSettingsList = ({
  onLogout,
  onOpenEditProfile,
}: PtProfileSettingsListProps) => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <>
      <div className="bento-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-outline-variant/30 space-y-2.5 sm:space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-on-surface px-1">Cài đặt tài khoản</h3>

        <div className="space-y-2">
          {/* Thông tin cá nhân Coach */}
          <button
            type="button"
            onClick={onOpenEditProfile}
            className="w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-surface-bright/30 border border-white/5 flex items-center justify-between text-xs sm:text-sm font-semibold hover:bg-surface-bright/50 hover:border-primary/30 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2.5 sm:gap-3">
              <User size={18} className="text-primary shrink-0" />
              Thông tin cá nhân Coach
            </span>
            <ChevronRight size={18} className="text-on-surface-variant shrink-0" />
          </button>

          {/* Đổi mật khẩu */}
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-surface-bright/30 border border-white/5 flex items-center justify-between text-xs sm:text-sm font-semibold hover:bg-surface-bright/50 hover:border-primary/30 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2.5 sm:gap-3">
              <Lock size={18} className="text-primary shrink-0" />
              Đổi mật khẩu
            </span>
            <ChevronRight size={18} className="text-on-surface-variant shrink-0" />
          </button>

          {/* Đăng xuất */}
          <button
            type="button"
            onClick={onLogout}
            className="w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between text-xs sm:text-sm font-bold hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5 sm:gap-3">
              <LogOut size={18} className="shrink-0" />
              Đăng xuất tài khoản PT
            </span>
            <ChevronRight size={18} className="shrink-0" />
          </button>
        </div>
      </div>

      {/* Floating Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default PtProfileSettingsList;
