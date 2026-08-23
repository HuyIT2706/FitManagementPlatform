'use client';

import { Dumbbell } from 'lucide-react';
import type { PtWelcomeHeaderProps } from '../../../../interface';

const PtWelcomeHeader = ({
  coachName,
  todaySessionsCount,
  pendingMealCount,
}: PtWelcomeHeaderProps) => {
  return (
    <section className="bento-card rounded-3xl p-6 md:p-8 flex flex-col gap-3 relative overflow-hidden border border-outline-variant/30">
      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1 rounded-full w-max border border-primary/30">
        <Dumbbell size={16} className="shrink-0" />
        <span className="font-label-sm text-xs font-bold uppercase tracking-wider">
          Coach / Personal Trainer
        </span>
      </div>

      <h1 className="font-headline-md text-2xl md:text-3xl font-extrabold text-on-surface">
        Chào {coachName}!
      </h1>
      <p className="text-on-surface-variant text-xs md:text-sm font-medium">
        Hôm nay bạn có{' '}
        <strong className="text-primary font-bold">{todaySessionsCount} ca dạy PT</strong> &amp;{' '}
        <strong className="text-orange-400 font-bold">{pendingMealCount} bữa ăn cần duyệt</strong>
      </p>

      <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none"></div>
    </section>
  );
};

export default PtWelcomeHeader;
