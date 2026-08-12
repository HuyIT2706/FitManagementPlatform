/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Header from "../../../components/ui/Header";
import PTBottomNavBar from "../../../components/navigation/PTBottomNavBar";
import apiClient from "../../../api/axios";
import type { UserDataHome } from "../../../interface";

export default function PTStudentsPage() {
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

      <main className="max-w-7xl mx-auto px-container-padding mt-4 md:mt-8 space-y-6">
        <div className="bento-card rounded-3xl p-6 md:p-8 space-y-4 border border-outline-variant/30">
          <h1 className="text-2xl md:text-3xl font-extrabold font-headline-md text-on-surface">
            Danh sách Học viên phụ trách
          </h1>
          <p className="text-sm text-on-surface-variant font-medium">
            Quản lý danh sách học viên kèm PT, theo dõi tiến độ tập luyện và chỉ số InBody.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {[
            {
              name: "Bùi Văn Huy",
              pkg: "VIP Package",
              remaining: 8,
              total: 12,
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            },
            {
              name: "Nguyễn Văn A",
              pkg: "Standard Package",
              remaining: 5,
              total: 10,
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            },
            {
              name: "Trần Thị B",
              pkg: "VIP Package",
              remaining: 12,
              total: 36,
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
            },
            {
              name: "Lê Văn C",
              pkg: "Standard Package",
              remaining: 2,
              total: 12,
              avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
            },
          ].map((student, idx) => (
            <div
              key={idx}
              className="bento-card rounded-2xl p-5 border border-outline-variant/30 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-base">{student.name}</h4>
                    <span className="text-xs text-on-surface-variant font-medium">
                      {student.pkg}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-primary block">
                    {student.remaining}/{student.total}
                  </span>
                  <span className="text-xs text-on-surface-variant">Buổi còn lại</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-around">
                <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">compare</span>
                  Before/After
                </button>
                <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">monitor_weight</span>
                  InBody
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <PTBottomNavBar activeTab="students" />
    </div>
  );
}
