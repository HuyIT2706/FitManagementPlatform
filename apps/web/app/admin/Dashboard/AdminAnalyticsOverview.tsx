/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Shield,
  Dumbbell,
  Utensils,
  Flame,
  CalendarCheck,
  Target,
  RefreshCw,
  Activity,
  Clock,
} from 'lucide-react';
import apiClient from '../../../api/axios';
import { toast } from '../../../utils/toast';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalPts: number;
    totalAdmins: number;
    totalAccounts: number;
    totalExercises: number;
    totalFoods: number;
    totalMealLogs: number;
    totalWorkouts: number;
  };
  goalDistribution: Array<{
    goal: string;
    count: number;
  }>;
  recentUsers: Array<{
    id: string;
    fullName: string;
    email: string;
    role: string;
    avatarUrl?: string;
    createdAt: string;
  }>;
  recentApplications: Array<{
    id: string;
    fullName: string;
    email: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminAnalyticsOverview() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = () => {
    setLoading(true);
    apiClient
      .get<AnalyticsData>('/admin/analytics')
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading analytics:', err);
        setLoading(false);
        toast.error('Không thể tải dữ liệu báo cáo thống kê');
      });
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-white/60 font-medium">Đang tổng hợp dữ liệu báo cáo hệ thống...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-16 text-center bg-[#121a15] rounded-2xl border border-white/10">
        <Activity size={40} className="mx-auto text-white/30 mb-3" />
        <p className="text-sm font-bold text-white/80">Không có dữ liệu báo cáo</p>
      </div>
    );
  }

  const { overview, goalDistribution, recentUsers, recentApplications } = data;
  const totalGoalUsers = goalDistribution.reduce((acc, g) => acc + g.count, 0) || 1;

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Tổng Quan Hoạt Động Hệ Thống</h2>
          <p className="text-xs text-white/60">Dữ liệu thời gian thực được tổng hợp từ toàn bộ nền tảng FitManagement</p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-xs font-bold transition-colors cursor-pointer"
        >
          <RefreshCw size={15} />
          Làm Mới
        </button>
      </div>

      {/* Hero 6 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users */}
        <div className="p-5 rounded-2xl bg-[#121a15] border border-white/10 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/60">Tổng Học Viên</span>
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
              <Users size={16} />
            </div>
          </div>
          <strong className="text-3xl font-extrabold text-white block">{overview.totalUsers}</strong>
          <span className="text-[11px] text-[#10b981] font-medium block">
            {overview.totalAccounts > 0
              ? `${Math.round((overview.totalUsers / overview.totalAccounts) * 100)}% tổng tài khoản`
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
          <strong className="text-3xl font-extrabold text-[#10b981] block">{overview.totalPts}</strong>
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
          <strong className="text-3xl font-extrabold text-white block">{overview.totalExercises}</strong>
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
          <strong className="text-3xl font-extrabold text-white block">{overview.totalFoods}</strong>
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
          <strong className="text-3xl font-extrabold text-rose-400 block">{overview.totalMealLogs}</strong>
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
          <strong className="text-3xl font-extrabold text-purple-400 block">{overview.totalWorkouts}</strong>
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
          <strong className="text-3xl font-extrabold text-white block">{overview.totalAdmins}</strong>
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
          <strong className="text-3xl font-extrabold text-white block">{overview.totalAccounts}</strong>
          <span className="text-[11px] text-[#10b981] font-medium block">Hệ sinh thái toàn diện</span>
        </div>
      </div>

      {/* Goal Distribution Breakdown */}
      <div className="p-6 rounded-2xl bg-[#121a15] border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-white">
          <Target className="text-[#10b981]" size={20} />
          <h3 className="font-bold text-base">Phân Bổ Mục Tiêu Thể Hình Học Viên</h3>
        </div>

        <div className="space-y-3">
          {goalDistribution.length === 0 ? (
            <p className="text-xs text-white/40 italic">Chưa có dữ liệu mục tiêu học viên</p>
          ) : (
            goalDistribution.map((g) => {
              const label =
                g.goal === 'LOSE_WEIGHT'
                  ? 'Giảm Mỡ / Giảm Cân'
                  : g.goal === 'BUILD_MUSCLE'
                    ? 'Tăng Cơ / Xây Dựng Vóc Dáng'
                    : g.goal === 'MAINTAIN'
                      ? 'Duy Trì Vóc Dáng & Sức Khỏe'
                      : g.goal;
              const percent = Math.round((g.count / totalGoalUsers) * 100);

              return (
                <div key={g.goal} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-white/80">{label}</span>
                    <span className="font-bold text-[#10b981]">
                      {g.count} học viên ({percent}%)
                    </span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#10b981] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Activities Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: Recent Users */}
        <div className="p-6 rounded-2xl bg-[#121a15] border border-white/10 space-y-4 shadow-xl">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Users className="text-blue-400" size={18} />
            Học Viên Mới Đăng Ký
          </h3>

          <div className="divide-y divide-white/5">
            {recentUsers.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt={u.fullName} className="w-full h-full object-cover" />
                    ) : (
                      u.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <strong className="block text-white font-bold text-xs">{u.fullName}</strong>
                    <span className="text-white/40 text-[10px]">{u.email}</span>
                  </div>
                </div>

                <span className="text-white/40 text-[10px]">
                  {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Recent PT Applications */}
        <div className="p-6 rounded-2xl bg-[#121a15] border border-white/10 space-y-4 shadow-xl">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Clock className="text-amber-400" size={18} />
            Đơn Đăng Ký HLV Gần Đây
          </h3>

          <div className="divide-y divide-white/5">
            {recentApplications.map((app) => (
              <div key={app.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div>
                  <strong className="block text-white font-bold text-xs">{app.fullName}</strong>
                  <span className="text-white/40 text-[10px]">{app.email}</span>
                </div>

                <div className="text-right space-y-0.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold block ${
                      app.status === 'APPROVED'
                        ? 'bg-[#10b981]/20 text-[#10b981]'
                        : app.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {app.status === 'APPROVED' ? 'Đã duyệt' : app.status === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'}
                  </span>
                  <span className="text-white/40 text-[10px] block">
                    {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
