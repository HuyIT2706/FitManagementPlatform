'use client';

import React from 'react';
import { UserCheck, Award, Dumbbell, Users } from 'lucide-react';
import type { AdminPtPerformanceCardProps } from '../../../interface';

const AdminPtPerformanceCard = ({
  ptPerformance = [],
}: AdminPtPerformanceCardProps) => {
  return (
    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white dark:bg-[#121a15] border border-slate-200 dark:border-white/10 space-y-4 shadow-xs dark:shadow-none transition-colors duration-200">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-[#10b981]/20 flex items-center justify-center text-emerald-600 dark:text-[#10b981]">
            <Award size={16} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Hiệu Suất Huấn Luyện Viên PT
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-white/60">
              Top các HLV có lượng học viên và buổi dạy tích cực nhất
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-600 dark:text-[#10b981] bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          {ptPerformance.length} HLV
        </span>
      </div>

      {/* List */}
      {ptPerformance.length === 0 ? (
        <div className="py-8 text-center text-slate-400 dark:text-white/40 text-xs">
          Chưa có huấn luyện viên nào được kích hoạt hoặc nhận học viên.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {ptPerformance.map((pt, index) => (
            <div
              key={pt.ptId}
              className="py-3 sm:py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] -mx-2 px-2 rounded-xl transition-colors"
            >
              {/* Left: Rank & PT info */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                    index === 0
                      ? 'bg-amber-400 text-amber-950 shadow-xs'
                      : index === 1
                      ? 'bg-slate-300 text-slate-800'
                      : index === 2
                      ? 'bg-amber-700/40 text-amber-200'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/50'
                  }`}
                >
                  {index + 1}
                </div>

                {pt.avatarUrl ? (
                  <img
                    src={pt.avatarUrl}
                    alt={pt.fullName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-[#10b981] font-bold text-xs shrink-0">
                    {pt.fullName?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {pt.fullName}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-white/40 truncate">
                    {pt.email}
                  </div>
                </div>
              </div>

              {/* Right: Metrics */}
              <div className="flex items-center gap-3 sm:gap-5 shrink-0 text-right">
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                    <Users size={13} className="text-emerald-500" />
                    {pt.activeStudentsCount}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-white/50">Học viên</div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1 font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                    <Dumbbell size={13} className="text-blue-500" />
                    {pt.workoutCount}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-white/50">Lịch tập</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPtPerformanceCard;
