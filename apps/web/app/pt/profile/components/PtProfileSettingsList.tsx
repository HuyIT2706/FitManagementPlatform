'use client';

import { useState } from 'react';
import { User, Lock, LogOut, ChevronRight, Sun, Moon } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import { useTheme } from '../../../../context/ThemeContext';
import type { PtProfileSettingsListProps } from '../../../../interface';

const PtProfileSettingsList = ({
  onLogout,
  onOpenEditProfile,
}: PtProfileSettingsListProps) => {
  const { isDark, toggleTheme } = useTheme();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <>
      <div className="bento-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-outline-variant/30 space-y-2.5 sm:space-y-3 bg-white dark:bg-[#121620]/80">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-on-surface px-1">Cài đặt tài khoản</h3>

        <div className="space-y-2">
          {/* Thông tin cá nhân Coach */}
          <button
            type="button"
            onClick={onOpenEditProfile}
            className="w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-surface-bright/30 border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-surface-bright/50 hover:border-primary/30 transition-all cursor-pointer text-slate-800 dark:text-white"
          >
            <span className="flex items-center gap-2.5 sm:gap-3">
              <User size={18} className="text-primary-dark dark:text-primary shrink-0" />
              Thông tin cá nhân Coach
            </span>
            <ChevronRight size={18} className="text-slate-400 dark:text-on-surface-variant shrink-0" />
          </button>

          {/* Đổi mật khẩu */}
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-surface-bright/30 border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-surface-bright/50 hover:border-primary/30 transition-all cursor-pointer text-slate-800 dark:text-white"
          >
            <span className="flex items-center gap-2.5 sm:gap-3">
              <Lock size={18} className="text-primary-dark dark:text-primary shrink-0" />
              Đổi mật khẩu
            </span>
            <ChevronRight size={18} className="text-slate-400 dark:text-on-surface-variant shrink-0" />
          </button>

          {/* Chế độ giao diện (Laptop / Desktop) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="hidden md:flex w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-surface-bright/30 border border-slate-200 dark:border-white/5 items-center justify-between text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-surface-bright/50 hover:border-primary/30 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2.5 sm:gap-3 text-slate-800 dark:text-on-surface">
              <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-light/10 border border-green-200 dark:border-green-light/30 text-green-600 dark:text-green-light flex items-center justify-center shrink-0 shadow-xs">
                {isDark ? (
                  <Sun size={16} className="text-green-600 dark:text-green-light" />
                ) : (
                  <Moon size={16} className="text-green-600 dark:text-green-light" />
                )}
              </div>
              <span className="font-bold">Chế độ giao diện: {isDark ? 'Tối' : 'Sáng'}</span>
            </span>
            <div
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                isDark ? 'bg-primary/30 border border-primary/50' : 'bg-slate-300 border border-slate-400/50'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  isDark ? 'translate-x-5 bg-primary' : 'translate-x-0 bg-white'
                }`}
              />
            </div>
          </button>

          {/* Đăng xuất */}
          <button
            type="button"
            onClick={onLogout}
            className="w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-between text-xs sm:text-sm font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors cursor-pointer"
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
