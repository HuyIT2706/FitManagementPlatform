/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import type { UserData } from '../../interface';

export interface HeaderProps {
  userData?: UserData | null;
  onLogout: () => void;
}

const Header = ({ userData, onLogout }: HeaderProps) => {
  return (
    <>
      {/* TopAppBar (Desktop) */}
      <header className="hidden md:flex justify-between items-center px-container-padding py-stack-sm w-full bg-surface-dim/80 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-50 transition-colors duration-200">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-bright overflow-hidden border border-outline-variant/30">
            {userData?.avatarUrl ? (
              <img className="object-cover w-full h-full" src={userData.avatarUrl} alt="Avatar" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-green-light text-dark-slate font-bold">
                {userData?.fullName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-xl font-bold text-on-surface tracking-tight">
              NutriCore
            </span>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          {/* Circular Badge Notification Bell Button (Style like Image 2) */}
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-green-light/10 border border-green-light/30 text-green-light hover:bg-green-light/20 flex items-center justify-center transition-all cursor-pointer shadow-[0_0_10px_rgba(102,200,28,0.2)]"
            aria-label="Thông báo"
          >
            <Bell size={18} />
          </button>

          {/* Circular Badge Logout Button (Style like Image 2) */}
          <button
            type="button"
            onClick={onLogout}
            className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all cursor-pointer shadow-[0_0_10px_rgba(248,113,113,0.2)]"
            aria-label="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Header Bar */}
      <div className="md:hidden flex justify-between items-center px-container-padding py-4 w-full sticky top-0 z-50 bg-dark-slate/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-bright overflow-hidden border border-outline-variant/30 relative">
            {userData?.avatarUrl ? (
              <img className="object-cover w-full h-full" src={userData.avatarUrl} alt="Avatar" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-green-light text-dark-slate font-bold">
                {userData?.fullName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border border-dark-slate"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-label-lg text-xs text-on-surface-variant">Xin chào,</span>
            <span className="font-headline-md text-base font-bold text-on-surface -mt-0.5 truncate max-w-40">
              {userData?.fullName || 'Thành viên'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-green-light/10 border border-green-light/30 text-green-light flex items-center justify-center transition-all cursor-pointer"
            aria-label="Thông báo"
          >
            <Bell size={16} />
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:text-red-300 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
