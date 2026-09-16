/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, LogOut, User, ChevronDown, ShieldCheck, Sun, Moon } from 'lucide-react';
import LogoApp from '../../assets/imgs/logoApp.jpg';
import type { UserData } from '../../interface';
import { getAvatarUrl } from '../../utils/avatar';
import { useTheme } from '../../context/ThemeContext';

export interface HeaderProps {
  userData?: UserData | null;
  onLogout: () => void;
}

const Header = ({ userData, onLogout }: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
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
    return 'Người dùng';
  };

  const homeHref = getHomeHref();
  const profileHref = getProfileHref();

  const isPt = userData?.role === 'PT' || pathname.startsWith('/pt');
  const isAdmin = userData?.role === 'ADMIN' || pathname.startsWith('/admin');

  const ptNavItems = [
    { label: 'Trang chủ', href: '/pt', icon: 'home', isActive: pathname === '/pt' },
    { label: 'Lịch dạy', href: '/pt/schedule', icon: 'calendar_today', isActive: pathname.startsWith('/pt/schedule') },
    { label: 'Học viên', href: '/pt/students', icon: 'group', isActive: pathname.startsWith('/pt/students') },
    { label: 'Tôi', href: '/pt/profile', icon: 'person', isActive: pathname.startsWith('/pt/profile') },
  ];

  const userNavItems = [
    { label: 'Nhật ký', href: '/home', icon: 'style', isActive: pathname === '/home' || pathname.startsWith('/add-meal') },
    { label: 'Tập luyện', href: '/training', icon: 'directions_run', isActive: pathname.startsWith('/training') },
    { label: 'Lịch sử', href: '/history', icon: 'explore', isActive: pathname.startsWith('/history') },
    { label: 'Tôi', href: '/profile', icon: 'person', isActive: pathname.startsWith('/profile') },
  ];

  const navItems = isAdmin ? [] : isPt ? ptNavItems : userNavItems;

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
      <header className="hidden md:flex justify-between items-center px-container-padding py-stack-sm w-full bg-white dark:bg-[#121926] backdrop-blur-xl border-b border-slate-200 dark:border-white/10 sticky top-0 z-50 transition-colors duration-200 relative shadow-xs">
        {/* Brand App Logo & Name (Clickable link to Role Home) */}
        <Link
          href={homeHref}
          className="flex items-center gap-3.5 group cursor-pointer hover:opacity-90 transition-all shrink-0"
          title="Về trang chủ NutriCore"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <Image
              src={LogoApp}
              alt="NutriCore Logo"
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-xl font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">
              NutriCore
            </span>
          </div>
        </Link>

        {/* Center Navigation Bar (Desktop / Laptop) */}
        {navItems.length > 0 && (
          <nav className="absolute left-1/2 -translate-x-1/2 flex items-center justify-between w-[320px] md:w-[360px] lg:w-[420px]">
            {navItems.map((item) => {
              const isActive = item.isActive;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all relative flex items-center gap-2 group cursor-pointer ${
                    isActive
                      ? 'text-primary font-bold'
                      : 'text-slate-900 dark:text-on-surface-variant hover:text-primary dark:hover:text-on-surface font-semibold'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[18px] transition-transform group-hover:scale-110"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>

                  {/* Active highlight pill */}
                  {isActive ? (
                    <span className="absolute inset-0 rounded-full bg-green-light/15 border border-green-light/30 shadow-xs z-0 pointer-events-none" />
                  ) : (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-full h-[1.5px] bg-slate-400 dark:bg-white/40 transition-all duration-300 ease-out z-20 pointer-events-none" />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Section: Notification Bell + User Profile Capsule with Dropdown */}
        <div className="flex gap-3 items-center shrink-0">
          {/* Circular Badge Notification Bell Button */}
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-light/10 border border-green-200 dark:border-green-light/30 text-green-600 dark:text-green-light hover:bg-green-100 dark:hover:bg-green-light/20 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
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
                className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/15 hover:border-primary/40 transition-all cursor-pointer shadow-xs group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-surface-bright overflow-hidden border border-primary/40 shrink-0">
                  <img
                    className="object-cover w-full h-full"
                    src={getAvatarUrl(userData.avatarUrl)}
                    alt="Avatar"
                  />
                </div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-on-surface max-w-[140px] truncate">
                  {userData.fullName || 'Thành viên'}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-slate-500 dark:text-on-surface-variant transition-transform duration-200 shrink-0 ${
                    isUserMenuOpen ? 'rotate-180 text-primary' : 'group-hover:text-slate-900 dark:group-hover:text-on-surface'
                  }`}
                />
              </button>

              {/* Popover Dropdown Menu (Desktop) */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#121620] backdrop-blur-xl border border-slate-200 dark:border-white/15 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  {/* User Profile Header in Dropdown */}
                  <div className="p-2.5 border-b border-slate-100 dark:border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-surface-bright overflow-hidden border border-primary/40 shrink-0">
                      <img
                        className="object-cover w-full h-full"
                        src={getAvatarUrl(userData.avatarUrl)}
                        alt="Avatar"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-on-surface truncate">
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
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-on-surface hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                  >
                    <User size={16} className="text-primary shrink-0" />
                    <span>Thông tin tài khoản</span>
                  </button>

                  {/* Option 2: Chuyển giao diện Sáng / Tối (theo yêu cầu ở màn hình laptop) */}
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={(e) => {
                      toggleTheme(e);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-on-surface hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-green-50 dark:bg-green-light/10 border border-green-200 dark:border-green-light/30 text-green-600 dark:text-green-light flex items-center justify-center shrink-0">
                        {isDark ? (
                          <Sun size={14} className="text-green-600 dark:text-green-light shrink-0" />
                        ) : (
                          <Moon size={14} className="text-green-600 dark:text-green-light shrink-0" />
                        )}
                      </div>
                      <span>{isDark ? 'Giao diện Sáng' : 'Giao diện Tối'}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-light/10 text-green-700 dark:text-green-light font-bold border border-green-200 dark:border-green-light/30">
                      {isDark ? 'Sáng' : 'Tối'}
                    </span>
                  </button>

                  {/* Option 3: Đăng xuất */}
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                  >
                    <LogOut size={16} className="text-red-500 shrink-0" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Mobile Header Bar */}
      <div className="md:hidden flex justify-between items-center px-container-padding py-3.5 w-full sticky top-0 z-50 bg-white dark:bg-[#121926] backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-xs">
        {/* Mobile Brand Link */}
        <Link
          href={homeHref}
          className="flex items-center gap-2.5 group cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 shadow-sm">
            <Image
              src={LogoApp}
              alt="NutriCore Logo"
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              NutriCore
            </span>
          </div>
        </Link>

        {/* Right Buttons on Mobile */}
        <div className="flex items-center gap-2">
          {/* Mobile Theme Toggle right next to Bell button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-light/10 border border-green-200 dark:border-green-light/30 text-green-600 dark:text-green-light hover:bg-green-100 dark:hover:bg-green-light/20 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-sm"
            aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
            title={isDark ? "Chế độ sáng" : "Chế độ tối"}
          >
            {isDark ? (
              <Sun size={15} className="text-green-600 dark:text-green-light" />
            ) : (
              <Moon size={15} className="text-green-600 dark:text-green-light" />
            )}
          </button>

          <button
            type="button"
            className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-light/10 border border-green-200 dark:border-green-light/30 text-green-600 dark:text-green-light flex items-center justify-center transition-all cursor-pointer hover:bg-green-100 dark:hover:bg-green-light/20 shadow-sm"
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
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/15 cursor-pointer shadow-sm"
              >
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-surface-bright overflow-hidden border border-primary/30 shrink-0">
                  <img
                    className="object-cover w-full h-full"
                    src={getAvatarUrl(userData.avatarUrl)}
                    alt="Avatar"
                  />
                </div>
                <ChevronDown
                  size={13}
                  className={`text-slate-500 dark:text-on-surface-variant transition-transform duration-200 ${
                    isUserMenuOpen ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>

              {/* Popover Dropdown Menu (Mobile) */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 max-w-[calc(100vw-32px)] bg-white dark:bg-[#121620] backdrop-blur-xl border border-slate-200 dark:border-white/15 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <div className="p-2 border-b border-slate-100 dark:border-white/10">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-on-surface truncate">
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
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-on-surface hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                  >
                    <User size={15} className="text-primary shrink-0" />
                    <span>Thông tin tài khoản</span>
                  </button>

                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                  >
                    <LogOut size={15} className="text-red-500 shrink-0" />
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
