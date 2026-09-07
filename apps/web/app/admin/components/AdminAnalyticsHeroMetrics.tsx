"use client";

import React from "react";
import {
  Users,
  UserCheck,
  Dumbbell,
  Utensils,
} from "lucide-react";
import type { AdminAnalyticsHeroMetricsProps } from "../../../interface";

const AdminAnalyticsHeroMetrics = ({
  overview,
}: AdminAnalyticsHeroMetricsProps) => {
  const {
    totalPts,
    totalExercises,
    totalFoods,
    totalAccounts,
  } = overview;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4" suppressHydrationWarning>
      {/* Card 1: Total Users */}
      <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#121a15] border border-white/10 space-y-2 sm:space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-white/60 truncate">
            Tổng người dùng
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center text-white/70 shrink-0">
            <Users size={15} />
          </div>
        </div>
        <strong className="text-2xl sm:text-3xl font-extrabold text-white block truncate">
          {totalAccounts}
        </strong>
        <span className="text-[10px] sm:text-[11px] text-red-400 font-medium block truncate">
          Người dùng trên hệ thống
        </span>
      </div>

      {/* Card 2: Total PTs */}
      <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#121a15] border border-[#10b981]/30 space-y-2 sm:space-y-3 relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.08)]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-[#10b981] truncate">
            Huấn Luyện Viên PT
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#10b981] shrink-0">
            <UserCheck size={15} />
          </div>
        </div>
        <strong className="text-2xl sm:text-3xl font-extrabold text-[#10b981] block truncate">
          {totalPts}
        </strong>
        <span className="text-[10px] sm:text-[11px] text-white/60 font-medium block truncate">
          Đang hoạt động trên sàn
        </span>
      </div>

      {/* Card 3: Exercises in DB */}
      <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#121a15] border border-white/10 space-y-2 sm:space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-white/60 truncate">
            Bài Tập
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
            <Dumbbell size={15} />
          </div>
        </div>
        <strong className="text-2xl sm:text-3xl font-extrabold text-white block truncate">
          {totalExercises}
        </strong>
        <span className="text-[10px] sm:text-[11px] text-blue-400 font-medium block truncate">
          Động tác chuẩn hóa
        </span>
      </div>

      {/* Card 4: Foods in DB */}
      <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#121a15] border border-white/10 space-y-2 sm:space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-white/60 truncate">
            Thực Phẩm
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
            <Utensils size={15} />
          </div>
        </div>
        <strong className="text-2xl sm:text-3xl font-extrabold text-white block truncate">
          {totalFoods}
        </strong>
        <span className="text-[10px] sm:text-[11px] text-amber-400 font-medium block truncate">
          Món ăn có tính Macro
        </span>
      </div>
    </div>
  );
};

export default AdminAnalyticsHeroMetrics;
