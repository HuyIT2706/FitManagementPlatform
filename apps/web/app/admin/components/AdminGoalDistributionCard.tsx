'use client';

import React from 'react';
import { Target } from 'lucide-react';
import type { AdminGoalDistributionCardProps } from '../../../interface';

const AdminGoalDistributionCard = ({
  goalDistribution,
}: AdminGoalDistributionCardProps) => {
  const totalGoalUsers =
    goalDistribution.reduce((acc, g) => acc + g.count, 0) || 1;

  return (
    <div className="p-6 rounded-2xl bg-[#121a15] border border-white/10 space-y-4 shadow-xl" suppressHydrationWarning>
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
  );
};

export default AdminGoalDistributionCard;
