'use client';

import { Dumbbell } from 'lucide-react';
import type { PtWelcomeHeaderProps } from '../../../../interface';

const PtWelcomeHeader = ({
  coachName,
  todaySessionsCount,
  totalVipStudents = 0,
}: PtWelcomeHeaderProps) => {
  return (
    <section className="bento-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col gap-2.5 sm:gap-3 relative overflow-hidden border border-outline-variant/30">
      <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-primary/10 text-primary px-3 sm:px-3.5 py-1 rounded-full w-max border border-primary/30">
        <Dumbbell size={15} className="shrink-0" />
        <span className="font-label-sm text-[11px] sm:text-xs font-bold uppercase tracking-wider">
          Coach / Personal Trainer
        </span>
      </div>

      <h1 className="font-headline-md text-xl sm:text-2xl md:text-3xl font-extrabold text-on-surface">
        Chào {coachName}!
      </h1>
      <p className="text-on-surface-variant text-xs sm:text-sm font-medium leading-relaxed">
        Hôm nay bạn có{' '}
        <strong className="text-primary font-bold">{todaySessionsCount} ca dạy PT</strong> &amp;{' '}
        <strong className="text-on-surface font-bold">{totalVipStudents} học viên 1:1</strong> đang theo học
      </p>

      <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none"></div>
    </section>
  );
};

export default PtWelcomeHeader;
