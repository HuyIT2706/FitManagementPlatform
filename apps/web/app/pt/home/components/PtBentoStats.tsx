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
    <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
      <div className="bento-card rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-outline-variant/30 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-1">
          <span className="text-on-surface-variant text-[11px] sm:text-xs font-semibold truncate">Học viên VIP</span>
          <Star size={18} className="text-primary fill-primary/20 shrink-0" />
        </div>
        <div className="font-stat-lg text-xl sm:text-2xl md:text-3xl font-bold text-on-surface mt-2 truncate">
          {totalVipStudents}
        </div>
      </div>

      <div className="bento-card rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-outline-variant/30 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-1">
          <span className="text-on-surface-variant text-[11px] sm:text-xs font-semibold truncate">Ca dạy hôm nay</span>
          <Dumbbell size={18} className="text-primary shrink-0" />
        </div>
        <div className="font-stat-lg text-xl sm:text-2xl md:text-3xl font-bold text-on-surface mt-2 truncate">
          {todaySessionsCount}
        </div>
      </div>

      <div className="bento-card rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-outline-variant/30 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-1">
          <span className="text-on-surface-variant text-[11px] sm:text-xs font-semibold truncate">Đã dạy</span>
          <CalendarCheck size={18} className="text-primary shrink-0" />
        </div>
        <div className="flex items-baseline gap-1 mt-2 flex-wrap">
          <span className="font-stat-lg text-xl sm:text-2xl md:text-3xl font-bold text-on-surface truncate">
            {completedSessionsCount}
          </span>
          <span className="text-on-surface-variant text-[10px] sm:text-xs font-medium truncate">
            /{totalPackageSessionsCount} Buổi
          </span>
        </div>
      </div>

      <div className="bento-card rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-orange-500/30 bg-orange-500/10 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-1">
          <span className="text-orange-400 text-[11px] sm:text-xs font-semibold truncate">Cảnh báo</span>
          <AlertTriangle size={18} className="text-orange-400 shrink-0" />
        </div>
        <div className="font-stat-lg text-xl sm:text-2xl md:text-3xl font-bold text-orange-400 mt-2 truncate">
          {warningsCount}
        </div>
      </div>
    </section>
  );
};

export default PtBentoStats;
