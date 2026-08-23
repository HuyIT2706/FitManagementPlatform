'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldAlert, LogOut, Home, KeyRound } from 'lucide-react';
import LogoApp from '../../../assets/imgs/logoApp.jpg';
import type { UserData } from '../../../interface';

interface AdminAccessDeniedProps {
  user?: UserData | null;
  onLogout: () => void;
}

const AdminAccessDenied = ({ user, onLogout }: AdminAccessDeniedProps) => {
  const roleLabel =
    user?.role === 'PT'
      ? 'Huấn Luyện Viên (Coach PT)'
      : user?.role === 'USER'
        ? 'Học Viên (Member)'
        : 'Chưa xác định';

  const homePath = user?.role === 'PT' ? '/pt' : '/home';
  const homeTitle = user?.role === 'PT' ? 'Về Bảng Điều Khiển HLV' : 'Về Trang Chủ Học Viên';

  return (
    <div
      className="min-h-screen bg-[#090d0b] text-[#dde4dd] flex flex-col items-center justify-center p-4 relative overflow-hidden"
      suppressHydrationWarning
    >
      {/* Subtle Background Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(244, 63, 94, 0.15) 0%, transparent 70%)',
        }}
      />

      <div className="bg-[#121a15] border border-rose-500/30 rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative z-10 backdrop-blur-xl animate-in fade-in zoom-in duration-200">
        {/* Header Icon + Logo */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.2)] shrink-0">
            <Image src={LogoApp} alt="NutriCore Logo" className="w-full h-full object-cover" priority />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
            <ShieldAlert size={32} />
          </div>
        </div>

        {/* Title & Error Code */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 text-[11px] font-extrabold uppercase tracking-wider border border-rose-500/30">
            Lỗi 403 • Quyền Truy Cập Bị Từ Chối
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Bạn Không Có Quyền Quản Trị Viên
          </h2>
          <p className="text-xs text-white/60 leading-relaxed px-2">
            Khu vực Quản trị hệ thống (Admin Portal) chỉ dành riêng cho tài khoản được cấp quyền Quản trị viên cấp cao của NutriCore.
          </p>
        </div>

        {/* Account Info Box */}
        {user && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center text-white/70">
              <span>Tài khoản hiện tại:</span>
              <strong className="text-white font-bold">{user.email || user.fullName || 'N/A'}</strong>
            </div>
            <div className="flex justify-between items-center text-white/70">
              <span>Vai trò hiện tại:</span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[11px]">
                {roleLabel}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <a
            href={homePath}
            className="w-full py-3 rounded-xl bg-[#10b981] text-[#003824] text-xs font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home size={16} />
            {homeTitle}
          </a>

          <div className="flex gap-3">
            <a
              href="/login"
              className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 text-xs font-bold hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <KeyRound size={15} />
              Đăng nhập tài khoản khác
            </a>

            <button
              type="button"
              suppressHydrationWarning
              onClick={onLogout}
              className="flex-1 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut size={15} />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccessDenied;
