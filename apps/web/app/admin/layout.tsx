'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import LogoApp from '../../assets/imgs/logoApp.jpg';
import {
  LogOut,
  BarChart3,
  FileText,
  Users,
  Dumbbell,
} from 'lucide-react';

import { useState, useEffect } from 'react';
import AppLoading from '../../components/ui/AppLoading';
import AccessDenied from '../../components/ui/AccessDenied';
import apiClient from '../../api/axios';
import type { UserData } from '../../interface';

const AdminLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  useEffect(() => {
    apiClient
      .get<UserData>('/users/me')
      .then((res) => {
        setCurrentUser(res.data);
        if (res.data?.role === 'ADMIN') {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      })
      .catch(() => {
        setIsAuthorized(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  };

  const navItems = [
    {
      label: 'Tổng Quan Hệ Thống',
      href: '/admin',
      icon: BarChart3,
      isActive: pathname === '/admin',
    },
    {
      label: 'Xét Duyệt Đơn PT',
      href: '/admin/CoachReview',
      icon: FileText,
      isActive: pathname.startsWith('/admin/CoachReview'),
    },
    {
      label: 'Quản Lý Người Dùng',
      href: '/admin/UserManagement',
      icon: Users,
      isActive: pathname.startsWith('/admin/UserManagement'),
    },
    {
      label: 'Thư Viện Bài Tập & Món Ăn',
      href: '/admin/ExerciseManagement',
      icon: Dumbbell,
      isActive: pathname.startsWith('/admin/ExerciseManagement'),
    },
  ];

  if (isAuthorized === null) {
    return <AppLoading fullScreen size="lg" message="Đang xác thực quyền Quản trị viên..." />;
  }

  if (isAuthorized === false) {
    return (
      <AccessDenied
        requiredRole="ADMIN"
        currentUser={currentUser}
        onLogout={handleLogout}
        title="Không Đủ Quyền Quản Trị Viên"
        message="Khu vực Quản trị hệ thống (Admin Portal) chỉ dành riêng cho tài khoản Quản trị viên cấp cao của NutriCore."
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090d0b] text-[#dde4dd] font-sans pb-24" suppressHydrationWarning>
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0e1511]/90 backdrop-blur-md border-b border-white/10 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between" suppressHydrationWarning>
        <Link
          href="/admin"
          className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer hover:opacity-90 transition-all min-w-0"
          title="Về trang chủ Admin"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)] shrink-0 group-hover:scale-105 transition-transform">
            <Image
              src={LogoApp}
              alt="NutriCore Logo"
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-white tracking-wide group-hover:text-primary transition-colors truncate">
              NutriCore Admin
            </h1>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            suppressHydrationWarning
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span className="hidden xs:inline sm:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 mt-4 sm:mt-6 space-y-4 sm:space-y-6">
        {/* Navigation Tabs Bar */}
        <section className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 overflow-x-auto shadow-lg [&&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex-1 min-w-[140px] sm:min-w-[170px] py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  item.isActive
                    ? 'bg-[#10b981] text-[#003824] shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={15} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </section>

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
