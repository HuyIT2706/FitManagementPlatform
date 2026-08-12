/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Header from "../../../components/ui/Header";
import PTBottomNavBar from "../../../components/navigation/PTBottomNavBar";
import apiClient from "../../../api/axios";
import type { UserDataHome } from "../../../interface";

export default function PTProfilePage() {
  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<UserDataHome>("/users/me")
      .then((res) => {
        setUserData(res.data);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-4xl mx-auto px-container-padding mt-4 md:mt-8 space-y-6">
        {/* PT Profile Card */}
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
