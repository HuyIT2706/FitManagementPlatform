"use client";

import React from "react";
import Image from "next/image";
import {
  ShieldAlert,
  Home,
  KeyRound,
  LogOut,
  Dumbbell,
  UserCheck,
} from "lucide-react";
import LogoApp from "../../assets/imgs/logoApp.jpg";
import type { UserData } from "../../interface";

export interface AccessDeniedProps {
  requiredRole?: "ADMIN" | "PT" | "USER";
  currentUser?: UserData | null;
  onLogout?: () => void;
  title?: string;
  message?: string;
}

const AccessDenied = ({
  requiredRole = "ADMIN",
  currentUser,
  onLogout,
  title,
  message,
}: AccessDeniedProps) => {
  const currentRole = currentUser?.role;

  const currentRoleLabel =
    currentRole === "ADMIN"
      ? "Quản Trị Viên (Admin)"
      : currentRole === "PT"
        ? "Huấn Luyện Viên (Coach PT)"
        : currentRole === "USER"
          ? "Học Viên (Member)"
          : "Chưa xác định";

  const requiredRoleLabel =
    requiredRole === "ADMIN"
      ? "Quản Trị Viên (Admin)"
      : requiredRole === "PT"
        ? "Huấn Luyện Viên (Coach PT)"
        : "Học Viên (Member)";

  // Determine appropriate destination for current user
  const userHomePath =
    currentRole === "ADMIN" ? "/admin" : currentRole === "PT" ? "/pt" : "/home";

  const userHomeLabel =
    currentRole === "ADMIN"
      ? "Về Bảng Điều Khiển Admin"
      : currentRole === "PT"
        ? "Về Không Gian Huấn Luyện Viên (PT)"
        : "Về Không Gian Học Viên";

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("jwt_token");
      window.location.href = "/login";
    }
  };

  const defaultTitle = `Không Đủ Thẩm Quyền Truy Cập`;
  const defaultMessage = `Trang này dành riêng cho vai trò ${requiredRoleLabel}. Tài khoản của bạn hiện tại không được cấp phép để truy cập khu vực này.`;

  return (
    <div
      className="min-h-screen bg-[#090d0b] text-[#dde4dd] flex flex-col items-center justify-center p-4 relative overflow-hidden"
      suppressHydrationWarning
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(244, 63, 94, 0.15) 0%, transparent 70%)",
        }}
      />

      <div className="bg-[#121a15] border border-rose-500/30 rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative z-10 backdrop-blur-xl animate-in fade-in zoom-in duration-200">
        {/* Header Icons + Logo */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-4xl overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.2)] shrink-0">
            <Image
              src={LogoApp}
              alt="NutriCore Logo"
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>

        {/* Title & Error Message */}
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white tracking-tight">
            {title || defaultTitle}
          </h2>
          <p className="text-xs text-red-400 leading-relaxed px-2">
            {message || defaultMessage}
          </p>
        </div>

        {/* Account Info Box */}
        {currentUser && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center text-white/70">
              <span>Tài khoản hiện tại:</span>
              <strong className="text-white font-bold">
                {currentUser.email || currentUser.fullName || "N/A"}
              </strong>
            </div>
            <div className="flex justify-between items-center text-white/70">
              <span>Vai trò hiện tại:</span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[11px]">
                {currentRoleLabel}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <a
            href={userHomePath}
            className="flex-1 py-2.5 rounded-xl bg-[#10b981] text-[#003824] text-xs font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
          >
            {currentRole === "PT" ? (
              <Dumbbell size={16} />
            ) : currentRole === "USER" ? (
              <UserCheck size={16} />
            ) : (
              <Home size={16} />
            )}
            {userHomeLabel}
          </a>

          <button
            type="button"
            suppressHydrationWarning
            onClick={handleLogoutClick}
            className="flex-1 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={15} />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
