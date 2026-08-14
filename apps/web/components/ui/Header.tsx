/* eslint-disable @next/next/no-img-element */
import React from "react";
import type { UserData } from "../../interface";

export interface HeaderProps {
  userData?: UserData | null;
  onLogout: () => void;
}

export default function Header({ userData, onLogout }: HeaderProps) {
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
            <span className="font-headline-md text-xl font-bold text-on-surface tracking-tight">FitManagementPlatform</span>
            <span className="text-xs text-primary font-semibold">Member Badge</span>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button className="p-2.5 hover:bg-surface-bright/30 rounded-full text-on-surface-variant transition-colors cursor-pointer" aria-label="Thông báo">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <button onClick={onLogout} className="p-2.5 hover:bg-surface-bright/30 rounded-full text-red-400 hover:text-red-500 transition-colors cursor-pointer" aria-label="Đăng xuất">
            <span className="material-symbols-outlined text-[20px]">logout</span>
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
            <span className="font-headline-md text-base font-bold text-on-surface -mt-0.5 truncate max-w-40">{userData?.fullName || 'Thành viên'}</span>
          </div>
        </div>
        <button onClick={onLogout} className="p-2 rounded-full bg-surface-bright/30 border border-white/10 text-red-400 hover:text-red-500 transition-colors cursor-pointer" aria-label="Đăng xuất">
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </>
  );
}
