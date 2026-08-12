/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Header from "../../../components/ui/Header";
import PTBottomNavBar from "../../../components/navigation/PTBottomNavBar";
import apiClient from "../../../api/axios";
import type { UserDataHome } from "../../../interface";

export default function PTSchedulePage() {
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
            Lịch dạy của Coach
          </h1>
          <p className="text-sm text-on-surface-variant font-medium">
            Quản lý tất cả ca dạy PT và lịch hẹn huấn luyện với học viên trong tuần.
          </p>
        </div>

        {/* Schedule List */}
        <div className="space-y-3">
          {[
            { time: "08:00 - 09:00", name: "Bùi Văn Huy", focus: "Legs & Glutes Power", status: "Sắp diễn ra" },
            { time: "10:00 - 11:00", name: "Nguyễn Văn A", focus: "Chest & Triceps", status: "Sắp diễn ra" },
            { time: "14:00 - 15:00", name: "Trần Thị B", focus: "Full Body HIIT", status: "Sắp diễn ra" },
            { time: "16:30 - 17:30", name: "Lê Văn C", focus: "Back & Core Hypertrophy", status: "Sắp diễn ra" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bento-card rounded-2xl p-5 border border-outline-variant/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="bg-surface-bright rounded-xl p-3 text-center min-w-[90px] border border-white/10">
                  <span className="text-xs font-bold text-primary">{item.time}</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-base">{item.name}</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">{item.focus}</p>
                </div>
              </div>
              <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/30">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </main>

      <PTBottomNavBar activeTab="schedule" />
    </div>
  );
}
