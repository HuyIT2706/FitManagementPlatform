'use client';

import { useEffect, useState } from 'react';
import { Flame, Plus, Trash2 } from 'lucide-react';
import { type DailyFuelHeroCardProps } from '../../../interface';

const DailyFuelHeroCard = ({
  consumedCalo,
  targetCalo,
  remainingCalories,
  burnedCalories = 0,
  activities = [],
  isSelectedDateToday,
  selectedDateFormatted,
  isFutureDate = false,
  onOpenBurnModal,
  onDeleteActivity,
}: DailyFuelHeroCardProps) => {
  const [animatedCalo, setAnimatedCalo] = useState(0);

  useEffect(() => {
    const resetTimer = window.setTimeout(() => setAnimatedCalo(0), 0);
    const timer = window.setTimeout(() => {
      setAnimatedCalo(consumedCalo);
    }, 50);
    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(timer);
    };
  }, [consumedCalo]);

  const safeTarget = targetCalo > 0 ? targetCalo : 2000;
  const effectiveBudget = safeTarget + Math.max(0, burnedCalories);
  const rawPercentage = (consumedCalo / effectiveBudget) * 100;
  const percentage = Math.min(
    100,
    Math.max(0, (animatedCalo / effectiveBudget) * 100),
  );
  const maxArcLength = 612.61;
  const fullCircumference = 816.814;
  const currentStrokeLength = (percentage / 100) * maxArcLength;

  return (
    <div className="bento-card col-span-1 md:col-span-8 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden group border border-bento-border/60 rounded-3xl">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-green-light/5 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="w-full flex justify-between items-center gap-3 mb-4 sm:mb-6 z-10">
        <div>
          <h2 className="font-headline-md text-lg sm:text-xl md:text-2xl text-on-surface tracking-tight font-bold">
            CALO NẠP HÀNG NGÀY
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {isSelectedDateToday ? 'Hôm nay' : selectedDateFormatted}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenBurnModal && !isFutureDate && (
            <button
              type="button"
              onClick={onOpenBurnModal}
              className="px-3 py-1.5 rounded-full bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 text-orange-600 dark:text-orange-400 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Tiêu hao</span>
            </button>
          )}
          <Flame size={22} className="text-green-light shrink-0" />
        </div>
      </div>

      {/* Radial Arc */}
      <div className="relative w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center z-10 my-2 sm:my-4">
        <svg className="w-full h-full transform rotate-[135deg]" viewBox="0 0 280 280">
          <circle
            cx="140"
            cy="140"
            r="130"
            fill="none"
            stroke="currentColor"
            className="text-slate-200 dark:text-[#1f2937]"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${maxArcLength} ${fullCircumference}`}
            strokeDashoffset="0"
          />
          {animatedCalo > 0 && (
            <circle
              className="progress-ring__circle"
              cx="140"
              cy="140"
              r="130"
              fill="none"
              stroke="#10b981"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${currentStrokeLength} ${fullCircumference}`}
              strokeDashoffset="0"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.6))',
                transition: 'stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          )}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="font-stats-xl text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tighter">
            {Math.round(consumedCalo)}
          </span>
          <span className="font-label-lg text-xs sm:text-sm text-on-surface-variant mt-1">
            kcal đã nạp
          </span>
          <span className="text-xs text-[#10b981] font-bold mt-0.5">
            {rawPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-3 w-full gap-2 sm:gap-4 mt-4 sm:mt-6 z-10 border-t border-bento-border/50 pt-4 sm:pt-6">
        <div className="flex flex-col items-center text-center">
          <span className="font-headline-md text-base sm:text-xl font-bold text-on-surface">
            {Math.round(remainingCalories)}
          </span>
          <span className="font-label-lg text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wider">
            Còn lại
          </span>
        </div>

        <div className="flex flex-col items-center text-center border-l border-r border-bento-border/50 px-1">
          <span className="font-headline-md text-base sm:text-xl font-bold text-on-surface">
            {Math.round(targetCalo)}
          </span>
          <span className="font-label-lg text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wider">
            Mục tiêu
          </span>
          {burnedCalories > 0 && (
            <span className="text-[10px] text-orange-500 font-semibold mt-0.5">
              +{Math.round(burnedCalories)} đốt
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={!onOpenBurnModal || isFutureDate}
          onClick={onOpenBurnModal}
          className="flex flex-col items-center text-center group/burn rounded-xl py-0.5 hover:bg-orange-500/5 transition-colors cursor-pointer disabled:cursor-default"
        >
          <span
            className={`font-headline-md text-base sm:text-xl font-bold ${
              burnedCalories > 0
                ? 'text-orange-500 dark:text-orange-400'
                : 'text-on-surface'
            }`}
          >
            {Math.round(burnedCalories)}
          </span>
          <span className="font-label-lg text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wider flex items-center gap-0.5 group-hover/burn:text-orange-500 transition-colors">
            Đốt cháy
          </span>
        </button>
      </div>

      {/* Logged Burned Activities Strip */}
      {activities.length > 0 && (
        <div className="w-full mt-4 pt-3 border-t border-bento-border/40 z-10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-on-surface-variant flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Hoạt động tiêu hao ({activities.length})
            </span>
            {onOpenBurnModal && !isFutureDate && (
              <button
                type="button"
                onClick={onOpenBurnModal}
                className="text-orange-500 hover:underline font-bold cursor-pointer"
              >
                + Thêm
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs"
              >
                <span className="font-bold text-on-surface truncate max-w-[140px]">
                  {act.activityName}
                </span>
                {act.durationMinutes && (
                  <span className="text-[11px] text-on-surface-variant">
                    {act.durationMinutes}p
                  </span>
                )}
                <span className="font-extrabold text-orange-600 dark:text-orange-400">
                  -{Math.round(act.caloriesBurned)} kcal
                </span>
                {onDeleteActivity && (
                  <button
                    type="button"
                    onClick={() => onDeleteActivity(act.id)}
                    aria-label={`Xóa ${act.activityName}`}
                    className="w-5 h-5 rounded-full hover:bg-rose-500/15 text-on-surface-variant hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyFuelHeroCard;
