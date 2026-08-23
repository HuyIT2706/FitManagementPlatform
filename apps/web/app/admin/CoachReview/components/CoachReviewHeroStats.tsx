'use client';

import React from 'react';
import type { CoachReviewHeroStatsProps } from '../../../../interface';

const CoachReviewHeroStats = ({ stats }: CoachReviewHeroStatsProps) => {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4" suppressHydrationWarning>
      {/* 1. Total Users */}
      <div className="p-5 rounded-2xl bg-[#121a15] border border-white/10 space-y-1">
        <span className="text-xs font-semibold text-white/60">Tổng Học Viên / User</span>
        <strong className="text-3xl font-extrabold text-white block">{stats?.totalUsers ?? 0}</strong>
        <span className="text-[11px] text-[#10b981] font-medium">Tài khoản trên hệ thống</span>
      </div>

      {/* 2. Pending Applications with Ping Dot */}
      <div className="p-5 rounded-2xl bg-[#121a15] border border-amber-500/30 relative overflow-hidden space-y-1 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
        <span className="text-xs font-semibold text-amber-300">Đơn chờ duyệt HLV</span>
        <strong className="text-3xl font-extrabold text-amber-400 block">{stats?.pendingApps ?? 0}</strong>
        <span className="text-[11px] text-amber-200/70 font-medium">Cần Admin phản hồi</span>
        {Boolean(stats?.pendingApps && stats.pendingApps > 0) && (
          <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
        )}
      </div>

      {/* 3. Approved PTs */}
      <div className="p-5 rounded-2xl bg-[#121a15] border border-[#10b981]/30 space-y-1">
        <span className="text-xs font-semibold text-[#10b981]">HLV PT Đã Phê Duyệt</span>
        <strong className="text-3xl font-extrabold text-[#10b981] block">{stats?.totalPts ?? 0}</strong>
        <span className="text-[11px] text-white/60 font-medium">Đang giảng dạy 1:1</span>
      </div>

      {/* 4. Rejected Applications */}
      <div className="p-5 rounded-2xl bg-[#121a15] border border-rose-500/30 space-y-1">
        <span className="text-xs font-semibold text-rose-400">Đơn bị từ chối</span>
        <strong className="text-3xl font-extrabold text-rose-400 block">{stats?.rejectedApps ?? 0}</strong>
        <span className="text-[11px] text-white/60 font-medium">Chưa đủ điều kiện bằng cấp</span>
      </div>
    </section>
  );
};

export default CoachReviewHeroStats;
