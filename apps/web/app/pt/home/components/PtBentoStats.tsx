'use client';

import { Star, Dumbbell, CalendarCheck, AlertTriangle } from 'lucide-react';
import type { PtBentoStatsProps } from '../../../../interface';

const PtBentoStats = ({
  totalVipStudents,
  todaySessionsCount,
  completedSessionsCount,
  totalPackageSessionsCount,
  warningsCount,
}: PtBentoStatsProps) => {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
      <div className="bento-card rounded-2xl p-5 border border-outline-variant/30 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-on-surface-variant text-xs font-semibold">Học viên VIP</span>
          <Star size={20} className="text-primary fill-primary/20 shrink-0" />
        </div>
        <div className="font-stat-lg text-2xl md:text-3xl font-bold text-on-surface mt-2">
          {totalVipStudents}
        </div>
      </div>

      <div className="bento-card rounded-2xl p-5 border border-outline-variant/30 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-on-surface-variant text-xs font-semibold">Ca dạy hôm nay</span>
          <Dumbbell size={20} className="text-primary shrink-0" />
        </div>
        <div className="font-stat-lg text-2xl md:text-3xl font-bold text-on-surface mt-2">
          {todaySessionsCount}
        </div>
      </div>

      <div className="bento-card rounded-2xl p-5 border border-outline-variant/30 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-on-surface-variant text-xs font-semibold">Đã dạy</span>
          <CalendarCheck size={20} className="text-primary shrink-0" />
        </div>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="font-stat-lg text-2xl md:text-3xl font-bold text-on-surface">
            {completedSessionsCount}
          </span>
          <span className="text-on-surface-variant text-xs font-medium">
            /{totalPackageSessionsCount} Buổi
          </span>
        </div>
      </div>

      <div className="bento-card rounded-2xl p-5 border border-orange-500/30 bg-orange-500/10 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-orange-400 text-xs font-semibold">Cảnh báo</span>
          <AlertTriangle size={20} className="text-orange-400 shrink-0" />
        </div>
        <div className="font-stat-lg text-2xl md:text-3xl font-bold text-orange-400 mt-2">
          {warningsCount}
        </div>
      </div>
    </section>
  );
};

export default PtBentoStats;
