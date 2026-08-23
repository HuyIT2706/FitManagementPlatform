'use client';

import React from 'react';
import {
  Users,
  UserCheck,
  Shield,
  Dumbbell,
  Utensils,
  Flame,
  CalendarCheck,
  Activity,
} from 'lucide-react';
import type { AdminAnalyticsHeroMetricsProps } from '../../../../interface';

export default function AdminAnalyticsHeroMetrics({ overview }: AdminAnalyticsHeroMetricsProps) {
  const {
    totalUsers,
    totalPts,
    totalExercises,
    totalFoods,
    totalMealLogs,
    totalWorkouts,
    totalAdmins,
    totalAccounts,
  } = overview;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Users */}
      <div className="p-5 rounded-2xl bg-[#121a15] border border-white/10 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/60">Tổng Học Viên</span>
          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
            <Users size={16} />
          </div>
        </div>
        <strong className="text-3xl font-extrabold text-white block">{totalUsers}</strong>
        <span className="text-[11px] text-[#10b981] font-medium block">
          {totalAccounts > 0
            ? `${Math.round((totalUsers / totalAccounts) * 100)}% tổng tài khoản`
            : '100%'}
        </span>
      </div>

      {/* Card 2: Total PTs */}
      <div className="p-5 rounded-2xl bg-[#121a15] border border-[#10b981]/30 space-y-3 relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.08)]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#10b981]">Huấn Luyện Viên PT</span>
          <div className="w-8 h-8 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#10b981]">
            <UserCheck size={16} />
          </div>
        </div>
        <strong className="text-3xl font-extrabold text-[#10b981] block">{totalPts}</strong>
        <span className="text-[11px] text-white/60 font-medium block">Đang hoạt động trên sàn</span>
      </div>

      {/* Card 3: Exercises in DB */}
      <div className="p-5 rounded-2xl bg-[#121a15] border border-white/10 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/60">CSDL Bài Tập</span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Dumbbell size={16} />
          </div>
        </div>
        <strong className="text-3xl font-extrabold text-white block">{totalExercises}</strong>
        <span className="text-[11px] text-blue-400 font-medium block">Động tác chuẩn hóa</span>
      </div>

      {/* Card 4: Foods in DB */}
      <div className="p-5 rounded-2xl bg-[#121a15] border border-white/10 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/60">CSDL Thực Phẩm</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Utensils size={16} />
          </div>
        </div>
        <strong className="text-3xl font-extrabold text-white block">{totalFoods}</strong>
        <span className="text-[11px] text-amber-400 font-medium block">Món ăn có tính Macro</span>
      </div>

      {/* Card 5: Meal Logs */}
      <div className="p-5 rounded-2xl bg-[#121a15] border border-white/10 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/60">Lượt Ghi Bữa Ăn</span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
            <Flame size={16} />
          </div>
        </div>
        <strong className="text-3xl font-extrabold text-rose-400 block">{totalMealLogs}</strong>
        <span className="text-[11px] text-white/60 font-medium block">Nhật ký dinh dưỡng</span>
      </div>

      {/* Card 6: Workouts Scheduled */}
      <div className="p-5 rounded-2xl bg-[#121a15] border border-white/10 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/60">Lịch Tập PT Đã Giao</span>
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <CalendarCheck size={16} />
          </div>
        </div>
        <strong className="text-3xl font-extrabold text-purple-400 block">{totalWorkouts}</strong>
        <span className="text-[11px] text-white/60 font-medium block">Giáo án cá nhân 1:1</span>
      </div>

      {/* Card 7: Admin Accounts */}
      <div className="p-5 rounded-2xl bg-[#121a15] border border-white/10 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/60">Quản Trị Viên</span>
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Shield size={16} />
          </div>
        </div>
        <strong className="text-3xl font-extrabold text-white block">{totalAdmins}</strong>
        <span className="text-[11px] text-white/60 font-medium block">Quyền quản trị cấp cao</span>
      </div>

      {/* Card 8: Total System Accounts */}
      <div className="p-5 rounded-2xl bg-[#121a15] border border-white/10 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/60">Tổng Tài Khoản Sàn</span>
          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
            <Activity size={16} />
          </div>
        </div>
        <strong className="text-3xl font-extrabold text-white block">{totalAccounts}</strong>
        <span className="text-[11px] text-[#10b981] font-medium block">Hệ sinh thái toàn diện</span>
      </div>
    </div>
  );
}
