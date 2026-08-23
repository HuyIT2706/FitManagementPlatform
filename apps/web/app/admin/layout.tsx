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
import AdminLoading from './components/AdminLoading';
import AdminAccessDenied from './components/AdminAccessDenied';
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
    return <AdminLoading fullScreen size="lg" message="Đang xác thực quyền Quản trị viên..." />;
  }

  if (isAuthorized === false) {
    return <AdminAccessDenied user={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-[#090d0b] text-[#dde4dd] font-sans pb-24" suppressHydrationWarning>
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0e1511]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between" suppressHydrationWarning>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)] shrink-0">
            <Image
              src={LogoApp}
              alt="NutriCore Logo"
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">NutriCore Admin</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            suppressHydrationWarning
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <section className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 overflow-x-auto shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 min-w-[170px] py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  item.isActive
                    ? 'bg-[#10b981] text-[#003824] shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {item.label}
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
