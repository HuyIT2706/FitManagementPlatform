'use client';
import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { type DailyFuelHeroCardProps } from '../../../interface';
export default function DailyFuelHeroCard({
  consumedCalo,
  targetCalo,
  remainingCalories,
  isSelectedDateToday,
  selectedDateFormatted,
}: DailyFuelHeroCardProps) {
  const [animatedCalo, setAnimatedCalo] = useState(0);
  useEffect(() => {
    setAnimatedCalo(0);
    const timer = setTimeout(() => {
      setAnimatedCalo(consumedCalo);
    }, 50);
    return () => clearTimeout(timer);
  }, [consumedCalo]);

  const safeTarget = targetCalo > 0 ? targetCalo : 2000;
  const rawPercentage = (consumedCalo / safeTarget) * 100;
  const percentage = Math.min(100, Math.max(0, (animatedCalo / safeTarget) * 100));
  const maxArcLength = 612.61;
  const fullCircumference = 816.814;
  const currentStrokeLength = (percentage / 100) * maxArcLength;

  return (
    <div className="bento-card col-span-1 md:col-span-8 p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden group border border-bento-border/60 rounded-3xl">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-light/5 rounded-full blur-[60px] pointer-events-none"></div>

      {/* Header */}
      <div className="w-full flex justify-between items-center mb-6 z-10">
        <div>
          <h2 className="font-headline-md text-xl md:text-2xl text-on-surface tracking-tight font-bold">
            CALO NẠP HÀNG NGÀY
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {isSelectedDateToday ? 'Hôm nay' : selectedDateFormatted}
          </p>
        </div>
        <Flame size={26} className="text-green-light" />
      </div>
      <div className="relative w-64 h-64 flex items-center justify-center z-10 my-4">
        <svg className="w-full h-full transform rotate-[135deg]" viewBox="0 0 280 280">
          <circle
            cx="140"
            cy="140"
            r="130"
            fill="none"
            stroke="#1f2937"
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
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-stats-xl text-4xl font-extrabold text-on-surface tracking-tighter">
            {consumedCalo}
          </span>
          <span className="font-label-lg text-sm text-on-surface-variant mt-1">kcal đã nạp</span>
          <span className="text-xs text-[#10b981] font-bold mt-0.5">
            {rawPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-3 w-full gap-4 mt-6 z-10 border-t border-bento-border/50 pt-6">
        <div className="flex flex-col items-center">
          <span className="font-headline-md text-xl font-bold text-on-surface">{remainingCalories}</span>
          <span className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider">Còn lại</span>
        </div>
        <div className="flex flex-col items-center border-l border-r border-bento-border/50">
          <span className="font-headline-md text-xl font-bold text-on-surface">{targetCalo}</span>
          <span className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider">Mục tiêu</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-headline-md text-xl font-bold text-on-surface">0</span>
          <span className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider">Đốt cháy</span>
        </div>
      </div>
    </div>
  );
}
