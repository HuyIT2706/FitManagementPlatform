/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Header from "../../../components/ui/Header";
import PTBottomNavBar from "../../../components/navigation/PTBottomNavBar";
import apiClient from "../../../api/axios";
import type { UserDataHome } from "../../../interface";
import type { PTCodeQrData } from "@repo/types";
import { toast } from "../../../utils/toast";

export default function PTProfilePage() {
  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [codeQrData, setCodeQrData] = useState<PTCodeQrData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get<UserDataHome>("/users/me"),
      apiClient.get<PTCodeQrData>("/pt/code-qr"),
    ])
      .then(([userRes, qrRes]) => {
        setUserData(userRes.data);
        setCodeQrData(qrRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    window.location.href = "/login";
  };

  const handleCopyPtCode = () => {
    const code = codeQrData?.ptCode || "PT-HUY066";
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép Mã PT (${code}) vào bộ nhớ tạm!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const ptCode = codeQrData?.ptCode || "PT-HUY066";
  const qrUrl =
    codeQrData?.qrCodeUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://fitmanagement.app/bind?ptCode=${ptCode}`;

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-4xl mx-auto px-container-padding mt-4 md:mt-8 space-y-6">
        {/* PT Profile Hero Card */}
        <div className="bento-card rounded-3xl p-6 md:p-8 space-y-6 border border-outline-variant/30 text-center relative overflow-hidden">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-primary shadow-[0_0_20px_rgba(102,200,28,0.4)]">
            {userData?.avatarUrl ? (
              <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-green-light text-dark-slate flex items-center justify-center text-3xl font-extrabold">
                {userData?.fullName?.charAt(0) || "P"}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold font-headline-md text-on-surface">
              {userData?.fullName || "Coach Bùi Văn Huy"}
            </h1>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/30 inline-block">
              Senior Personal Trainer
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
            <div>
              <span className="text-xl font-bold text-on-surface block">10</span>
              <span className="text-xs text-on-surface-variant">Học viên VIP</span>
            </div>
            <div>
              <span className="text-xl font-bold text-primary block">150+</span>
              <span className="text-xs text-on-surface-variant">Giờ huấn luyện</span>
            </div>
            <div>
              <span className="text-xl font-bold text-orange-400 block">4.9 ★</span>
              <span className="text-xs text-on-surface-variant">Đánh giá</span>
            </div>
          </div>
        </div>

        {/* PT Unique Code & QR Code Card */}
        <div className="bento-card rounded-3xl p-6 md:p-8 border border-primary/30 space-y-6 bg-primary/5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-primary/15 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-primary/30">
                <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                Mã Định Danh PT Coach
              </div>
              <h3 className="text-xl font-bold text-on-surface">
                Mã PT & QR Code Liên Kết 1-1
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 font-medium max-w-md">
                Cho học viên quét mã QR hoặc gõ Mã PT này khi đăng ký/liên kết tài khoản để kết nối trực tiếp với Coach.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-3 rounded-2xl border border-white/20 shadow-lg self-center sm:self-auto shrink-0 text-center">
              <img src={qrUrl} alt="PT QR Code" className="w-32 h-32 mx-auto rounded-lg" />
              <span className="text-[10px] text-gray-800 font-extrabold block mt-1">
                {ptCode}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-white/10">
            <div className="flex-1 bg-surface-bright/60 border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between w-full">
              <span className="text-xs text-on-surface-variant font-medium">Mã PT của bạn:</span>
              <strong className="text-lg font-extrabold text-primary tracking-wider">{ptCode}</strong>
            </div>

            <button
              onClick={handleCopyPtCode}
              className="w-full sm:w-auto px-6 py-3 bg-primary text-dark-slate rounded-2xl font-extrabold text-xs shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
              Sao chép Mã PT
            </button>
          </div>
        </div>

        {/* Account settings */}
        <div className="bento-card rounded-3xl p-6 border border-outline-variant/30 space-y-3">
          <h3 className="text-base font-bold text-on-surface px-1">Cài đặt tài khoản</h3>

          <div className="space-y-2">
            <button className="w-full p-4 rounded-2xl bg-surface-bright/30 border border-white/5 flex items-center justify-between text-sm font-semibold hover:bg-surface-bright/50 transition-colors cursor-pointer">
              <span className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">person</span>
                Thông tin cá nhân Coach
              </span>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </button>

            <button className="w-full p-4 rounded-2xl bg-surface-bright/30 border border-white/5 flex items-center justify-between text-sm font-semibold hover:bg-surface-bright/50 transition-colors cursor-pointer">
              <span className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">lock</span>
                Đổi mật khẩu
              </span>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between text-sm font-bold hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <span className="material-symbols-outlined">logout</span>
                Đăng xuất tài khoản PT
              </span>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </main>

      <PTBottomNavBar activeTab="profile" />
    </div>
  );
}
