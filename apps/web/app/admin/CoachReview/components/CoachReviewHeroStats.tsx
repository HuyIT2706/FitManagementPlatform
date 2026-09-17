'use client';

import React from 'react';
import type { CoachReviewHeroStatsProps } from '../../../../interface';

const CoachReviewHeroStats = ({ stats }: CoachReviewHeroStatsProps) => {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4" suppressHydrationWarning>
      {/* 1. Total Users */}
      <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#121a15] border border-slate-200 dark:border-white/10 space-y-1 shadow-xs dark:shadow-none transition-colors duration-200">
        <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-white/60 truncate block">Tổng Học Viên / User</span>
        <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white block truncate">{stats?.totalUsers ?? 0}</strong>
        <span className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-[#10b981] font-medium truncate block">Tài khoản trên hệ thống</span>
      </div>

      {/* 2. Pending Applications with Ping Dot */}
      <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#121a15] border border-amber-400/40 dark:border-amber-500/30 relative overflow-hidden space-y-1 shadow-xs dark:shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-colors duration-200">
        <span className="text-[11px] sm:text-xs font-semibold text-amber-700 dark:text-amber-300 truncate block">Đơn chờ duyệt HLV</span>
        <strong className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 block truncate">{stats?.pendingApps ?? 0}</strong>
        <span className="text-[10px] sm:text-[11px] text-amber-700/70 dark:text-amber-200/70 font-medium truncate block">Cần Admin phản hồi</span>
        {Boolean(stats?.pendingApps && stats.pendingApps > 0) && (
          <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500 animate-ping" />
        )}
      </div>

      {/* 3. Approved PTs */}
      <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#121a15] border border-emerald-500/40 dark:border-[#10b981]/30 space-y-1 shadow-xs dark:shadow-none transition-colors duration-200">
        <span className="text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-[#10b981] truncate block">HLV PT Đã Phê Duyệt</span>
        <strong className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-[#10b981] block truncate">{stats?.totalPts ?? 0}</strong>
        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-white/60 font-medium truncate block">Đang giảng dạy 1:1</span>
      </div>

      {/* 4. Rejected Applications */}
      <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#121a15] border border-rose-400/40 dark:border-rose-500/30 space-y-1 shadow-xs dark:shadow-none transition-colors duration-200">
        <span className="text-[11px] sm:text-xs font-semibold text-rose-600 dark:text-rose-400 truncate block">Đơn bị từ chối</span>
        <strong className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 block truncate">{stats?.rejectedApps ?? 0}</strong>
        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-white/60 font-medium truncate block">Chưa đủ điều kiện bằng cấp</span>
      </div>
    </section>
  );
};

export default CoachReviewHeroStats;
