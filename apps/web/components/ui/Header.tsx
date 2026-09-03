/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, User, ChevronDown, ShieldCheck } from 'lucide-react';
import LogoApp from '../../assets/imgs/logoApp.jpg';
import type { UserData } from '../../interface';
import { getAvatarUrl } from '../../utils/avatar';

export interface HeaderProps {
  userData?: UserData | null;
  onLogout: () => void;
}

const Header = ({ userData, onLogout }: HeaderProps) => {
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideDesktop = desktopMenuRef.current?.contains(target);
      const isInsideMobile = mobileMenuRef.current?.contains(target);
      if (!isInsideDesktop && !isInsideMobile) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getHomeHref = () => {
    if (userData?.role === 'ADMIN') return '/admin';
    if (userData?.role === 'PT') return '/pt';
    return '/home';
  };

  const getProfileHref = () => {
    if (userData?.role === 'ADMIN') return '/admin';
    if (userData?.role === 'PT') return '/pt/profile';
    return '/profile';
  };

  const getRoleLabel = () => {
    if (userData?.role === 'ADMIN') return 'Quản trị viên';
    if (userData?.role === 'PT') return 'Huấn luyện viên (PT)';
    return 'Học viên NutriCore';
  };

  const homeHref = getHomeHref();
  const profileHref = getProfileHref();

  const handleProfileClick = () => {
    setIsUserMenuOpen(false);
    router.push(profileHref);
  };

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    onLogout();
  };

  return (
    <>
      {/* TopAppBar (Desktop) */}
      <header className="hidden md:flex justify-between items-center px-container-padding py-stack-sm w-full bg-surface-dim/80 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-50 transition-colors duration-200">
        {/* Brand App Logo & Name (Clickable link to Role Home) */}
        <Link
          href={homeHref}
          className="flex items-center gap-3.5 group cursor-pointer hover:opacity-90 transition-all"
          title="Về trang chủ NutriCore"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:scale-105 transition-transform">
            <Image
              src={LogoApp}
              alt="NutriCore Logo"
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-xl font-extrabold text-on-surface tracking-tight group-hover:text-primary transition-colors">
              NutriCore
            </span>
          </div>
        </Link>

        {/* Right Section: Notification Bell + User Profile Capsule with Dropdown */}
        <div className="flex gap-3 items-center">
          {/* Circular Badge Notification Bell Button */}
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-green-light/10 border border-green-light/30 text-green-light hover:bg-green-light/20 flex items-center justify-center transition-all cursor-pointer shadow-[0_0_10px_rgba(102,200,28,0.2)] hover:scale-105 active:scale-95"
            aria-label="Thông báo"
          >
            <Bell size={18} />
          </button>

          {/* User Info Capsule Button with Popover Dropdown */}
          {userData && (
            <div ref={desktopMenuRef} className="relative">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/15 hover:border-primary/40 transition-all cursor-pointer shadow-sm group"
              >
                <div className="w-8 h-8 rounded-full bg-surface-bright overflow-hidden border border-primary/40 shrink-0">
                  <img
                    className="object-cover w-full h-full"
                    src={getAvatarUrl(userData.avatarUrl)}
                    alt="Avatar"
                  />
                </div>
                <span className="text-xs font-extrabold text-white max-w-[140px] truncate">
                  {userData.fullName || 'Thành viên'}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-white/60 transition-transform duration-200 shrink-0 ${
                    isUserMenuOpen ? 'rotate-180 text-primary' : 'group-hover:text-white'
                  }`}
                />
              </button>

              {/* Popover Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#121620]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  {/* User Profile Header in Dropdown */}
                  <div className="p-2.5 border-b border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-bright overflow-hidden border border-primary/40 shrink-0">
                      <img
                        className="object-cover w-full h-full"
                        src={getAvatarUrl(userData.avatarUrl)}
                        alt="Avatar"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">
                        {userData.fullName || 'Thành viên'}
                      </h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        <ShieldCheck size={12} className="text-primary shrink-0" />
                        <span className="text-[11px] font-semibold text-primary truncate">
                          {getRoleLabel()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Option 1: Thông tin tài khoản */}
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-left"
                  >
                    <User size={16} className="text-primary shrink-0" />
                    <span>Thông tin tài khoản</span>
                  </button>

                  {/* Option 2: Đăng xuất */}
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                  >
                    <LogOut size={16} className="text-red-400 shrink-0" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Mobile Header Bar */}
      <div className="md:hidden flex justify-between items-center px-container-padding py-3.5 w-full sticky top-0 z-50 bg-dark-slate/90 backdrop-blur-xl border-b border-white/5">
        {/* Mobile Brand Link */}
        <Link
          href={homeHref}
          className="flex items-center gap-2.5 group cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <Image
              src={LogoApp}
              alt="NutriCore Logo"
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-base font-extrabold text-white tracking-tight">
              NutriCore
            </span>
          </div>
        </Link>

        {/* Right Buttons on Mobile */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-green-light/10 border border-green-light/30 text-green-light flex items-center justify-center transition-all cursor-pointer"
            aria-label="Thông báo"
          >
            <Bell size={15} />
          </button>

          {userData && (
            <div ref={mobileMenuRef} className="relative">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-white/[0.05] border border-white/15 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-surface-bright overflow-hidden border border-primary/30 shrink-0">
                  <img
                    className="object-cover w-full h-full"
                    src={getAvatarUrl(userData.avatarUrl)}
                    alt="Avatar"
                  />
                </div>
                <ChevronDown
                  size={13}
                  className={`text-white/60 transition-transform duration-200 ${
                    isUserMenuOpen ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>

              {/* Popover Dropdown Menu (Mobile) */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-[#121620]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <div className="p-2 border-b border-white/10">
                    <h4 className="text-xs font-bold text-white truncate">
                      {userData.fullName || 'Thành viên'}
                    </h4>
                    <span className="text-[11px] font-semibold text-primary">
                      {getRoleLabel()}
                    </span>
                  </div>

                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-left"
                  >
                    <User size={15} className="text-primary shrink-0" />
                    <span>Thông tin tài khoản</span>
                  </button>

                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                  >
                    <LogOut size={15} className="text-red-400 shrink-0" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
