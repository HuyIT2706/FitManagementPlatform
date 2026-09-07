'use client';

import { Dumbbell, Wheat, Droplet } from 'lucide-react';
import { type MacroCardsProps } from '../../../interface';

const MacroCards = ({
  consumedProtein,
  targetProtein,
  proteinPercentage,
  consumedCarbs,
  targetCarbs,
  carbsPercentage,
  consumedFat,
  targetFat,
  fatPercentage,
}: MacroCardsProps) => {
  return (
    <div className="col-span-1 md:col-span-4 flex flex-col gap-3 sm:gap-gutter">
      {/* Protein Card */}
      <div className="bento-card p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 relative overflow-hidden group border border-bento-border/60 rounded-2xl sm:rounded-3xl">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0086C9]"></div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#0086C9]/15 flex items-center justify-center text-[#0086C9] border border-[#0086C9]/30 shrink-0">
          <Dumbbell size={20} className="sm:w-[22px] sm:h-[22px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-end mb-1.5 sm:mb-2 gap-1">
            <span className="font-label-lg text-xs sm:text-sm text-on-surface-variant font-semibold truncate">Đạm (Protein)</span>
            <span className="font-headline-md text-base sm:text-lg font-bold text-on-surface shrink-0">
              {consumedProtein}
              <span className="text-on-surface-variant text-xs sm:text-sm font-normal">/{targetProtein}g</span>
            </span>
          </div>
          <div className="h-2 w-full bg-surface-bright rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0086C9] rounded-full shadow-[0_0_10px_rgba(0,134,201,0.5)] transition-all duration-500"
              style={{ width: `${proteinPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Carbs Card */}
      <div className="bento-card p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 relative overflow-hidden group border border-bento-border/60 rounded-2xl sm:rounded-3xl">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EF6820]"></div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#EF6820]/15 flex items-center justify-center text-[#EF6820] border border-[#EF6820]/30 shrink-0">
          <Wheat size={20} className="sm:w-[22px] sm:h-[22px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-end mb-1.5 sm:mb-2 gap-1">
            <span className="font-label-lg text-xs sm:text-sm text-on-surface-variant font-semibold truncate">Tinh bột (Carbs)</span>
            <span className="font-headline-md text-base sm:text-lg font-bold text-on-surface shrink-0">
              {consumedCarbs}
              <span className="text-on-surface-variant text-xs sm:text-sm font-normal">/{targetCarbs}g</span>
            </span>
          </div>
          <div className="h-2 w-full bg-surface-bright rounded-full overflow-hidden">
            <div
              className="h-full bg-[#EF6820] rounded-full shadow-[0_0_10px_rgba(239,104,32,0.5)] transition-all duration-500"
              style={{ width: `${carbsPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Fats Card */}
      <div className="bento-card p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 relative overflow-hidden group border border-bento-border/60 rounded-2xl sm:rounded-3xl">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F63D68]"></div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F63D68]/15 flex items-center justify-center text-[#F63D68] border border-[#F63D68]/30 shrink-0">
          <Droplet size={20} className="sm:w-[22px] sm:h-[22px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-end mb-1.5 sm:mb-2 gap-1">
            <span className="font-label-lg text-xs sm:text-sm text-on-surface-variant font-semibold truncate">Chất béo (Fats)</span>
            <span className="font-headline-md text-base sm:text-lg font-bold text-on-surface shrink-0">
              {consumedFat}
              <span className="text-on-surface-variant text-xs sm:text-sm font-normal">/{targetFat}g</span>
            </span>
          </div>
          <div className="h-2 w-full bg-surface-bright rounded-full overflow-hidden">
            <div
              className="h-full bg-[#F63D68] rounded-full shadow-[0_0_10px_rgba(246,61,104,0.5)] transition-all duration-500"
              style={{ width: `${fatPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroCards;
