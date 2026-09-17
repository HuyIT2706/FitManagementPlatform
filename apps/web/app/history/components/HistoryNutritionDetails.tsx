'use client';

import { CheckCircle2, Coffee, Sun, Moon, Apple } from 'lucide-react';
import type { HistoryNutritionDetailsProps } from '../../../interface';
import { formatDisplayDate } from '../../../utils/date';

const HistoryNutritionDetails = ({
  selectedDate,
  isSelectedDateToday,
  consumedCalo,
  targetCalo,
  totalCaloPercent,
  consumedProtein,
  targetProtein,
  proteinPercent,
  consumedCarbs,
  targetCarbs,
  carbsPercent,
  consumedFat,
  targetFat,
  fatPercent,
  mealSlots,
  getMealDetails,
  dailyLoading,
}: HistoryNutritionDetailsProps) => {
  const getMealConfig = (id: string) => {
    switch (id) {
      case 'BREAKFAST':
        return {
          icon: (
            <Coffee className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600 dark:text-amber-300 drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]" />
          ),
          badgeBg:
            'bg-amber-500/15 dark:bg-gradient-to-br dark:from-amber-500/25 dark:via-orange-500/15 dark:to-transparent border border-amber-500/30 dark:border-amber-400/40 text-amber-700 dark:text-amber-300 shadow-xs',
          cardHover:
            'hover:border-amber-400/50 hover:shadow-[0_0_24px_rgba(245,158,11,0.12)]',
          calColor: 'text-amber-700 dark:text-amber-300',
        };
      case 'LUNCH':
        return {
          icon: (
            <Sun className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600 dark:text-orange-300 drop-shadow-[0_2px_10px_rgba(249,115,22,0.3)]" />
          ),
          badgeBg:
            'bg-orange-500/15 dark:bg-gradient-to-br dark:from-orange-500/25 dark:via-rose-500/15 dark:to-transparent border border-orange-500/30 dark:border-orange-400/40 text-orange-700 dark:text-orange-300 shadow-xs',
          cardHover:
            'hover:border-orange-400/50 hover:shadow-[0_0_24px_rgba(249,115,22,0.12)]',
          calColor: 'text-orange-700 dark:text-orange-300',
        };
      case 'DINNER':
        return {
          icon: (
            <Moon className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 dark:text-indigo-300 drop-shadow-[0_2px_10px_rgba(99,102,241,0.3)]" />
          ),
          badgeBg:
            'bg-indigo-500/15 dark:bg-gradient-to-br dark:from-indigo-500/25 dark:via-purple-500/15 dark:to-transparent border border-indigo-500/30 dark:border-indigo-400/40 text-indigo-700 dark:text-indigo-300 shadow-xs',
          cardHover:
            'hover:border-indigo-400/50 hover:shadow-[0_0_24px_rgba(99,102,241,0.12)]',
          calColor: 'text-indigo-700 dark:text-indigo-300',
        };
      case 'SNACK':
      default:
        return {
          icon: (
            <Apple className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 dark:text-emerald-300 drop-shadow-[0_2px_10px_rgba(16,185,129,0.3)]" />
          ),
          badgeBg:
            'bg-emerald-500/15 dark:bg-gradient-to-br dark:from-emerald-500/25 dark:via-teal-500/15 dark:to-transparent border border-emerald-500/30 dark:border-emerald-400/40 text-emerald-700 dark:text-emerald-300 shadow-xs',
          cardHover:
            'hover:border-emerald-400/50 hover:shadow-[0_0_24px_rgba(16,185,129,0.12)]',
          calColor: 'text-emerald-700 dark:text-emerald-300',
        };
    }
  };

  return (
    <section
      className={`md:col-span-12 bento-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-outline-variant/30 space-y-4 sm:space-y-6 transition-opacity duration-200 ${
        dailyLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Date Header & Calorie Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-bento-border/50">
        <div>
          <h2 className="text-lg sm:text-xl font-headline-md font-bold text-on-surface">Nhật ký dinh dưỡng</h2>
          <span className="text-xs text-on-surface-variant mt-0.5 block">
            {isSelectedDateToday ? 'Hôm nay' : formatDisplayDate(selectedDate)}
          </span>
        </div>

        <div className="flex flex-col md:items-end">
          <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
            <span className="text-xs text-on-surface-variant font-medium">Calo đã nạp:</span>
            <span className="text-sm sm:text-base font-bold text-green-light">
              {consumedCalo} / {targetCalo} kcal
            </span>
          </div>
          <div className="w-full md:w-64 h-2 sm:h-2.5 bg-slate-200 dark:bg-surface-bright rounded-full overflow-hidden">
            <div
              className="h-full bg-green-light rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(22,163,74,0.3)] dark:shadow-[0_0_8px_rgba(102,200,28,0.5)]"
              style={{ width: `${totalCaloPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Macro Summary Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="flex flex-col items-center p-2.5 sm:p-3.5 bg-slate-100/70 dark:bg-surface-bright/30 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/5 text-center">
          <span className="text-[11px] sm:text-xs text-on-surface-variant mb-0.5 sm:mb-1 font-medium truncate w-full">Đạm (Protein)</span>
          <span className="text-sm sm:text-base md:text-lg font-bold text-[#0086C9]">
            {consumedProtein}{' '}
            <span className="text-[10px] sm:text-xs font-normal text-on-surface-variant">/{targetProtein}g</span>
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#0086C9] font-semibold mt-0.5">{proteinPercent}%</span>
        </div>

        <div className="flex flex-col items-center p-2.5 sm:p-3.5 bg-slate-100/70 dark:bg-surface-bright/30 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/5 text-center">
          <span className="text-[11px] sm:text-xs text-on-surface-variant mb-0.5 sm:mb-1 font-medium truncate w-full">
            Tinh bột (Carbs)
          </span>
          <span className="text-sm sm:text-base md:text-lg font-bold text-[#EF6820]">
            {consumedCarbs}{' '}
            <span className="text-[10px] sm:text-xs font-normal text-on-surface-variant">/{targetCarbs}g</span>
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#EF6820] font-semibold mt-0.5">{carbsPercent}%</span>
        </div>

        <div className="flex flex-col items-center p-2.5 sm:p-3.5 bg-slate-100/70 dark:bg-surface-bright/30 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/5 text-center">
          <span className="text-[11px] sm:text-xs text-on-surface-variant mb-0.5 sm:mb-1 font-medium truncate w-full">Chất béo (Fat)</span>
          <span className="text-sm sm:text-base md:text-lg font-bold text-[#F63D68]">
            {consumedFat}{' '}
            <span className="text-[10px] sm:text-xs font-normal text-on-surface-variant">/{targetFat}g</span>
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#F63D68] font-semibold mt-0.5">{fatPercent}%</span>
        </div>
      </div>

      {/* Daily Meals Grid */}
      <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
        <h3 className="text-sm sm:text-base font-headline-md font-bold text-on-surface px-1">
          Danh sách bữa ăn
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-gutter">
          {mealSlots.map((mealConfig) => {
            const mealDetails = getMealDetails(mealConfig.id);
            const hasItems = mealDetails.items.length > 0;
            const config = getMealConfig(mealConfig.id);

            return (
              <div
                key={mealConfig.id}
                className={`bento-card p-4 sm:p-5 flex flex-col justify-between group transition-all duration-300 border border-bento-border/50 rounded-2xl sm:rounded-3xl ${config.cardHover}`}
              >
                {/* Header: Icon, Meal Name, Total Calories & Status Check */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${config.badgeBg}`}
                    >
                      {config.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-headline-md text-sm sm:text-base font-bold text-on-surface truncate">
                        {mealConfig.name}
                      </h4>
                      <span
                        className={`font-body-md text-xs font-bold ${
                          hasItems ? 'text-green-light' : 'text-slate-800 dark:text-on-surface-variant'
                        }`}
                      >
                        {mealDetails.totalCalories} kcal
                      </span>
                    </div>
                  </div>

                  {hasItems && (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-green-light/10 border border-green-light/30 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={15} className="text-green-light stroke-[2.5]" />
                    </div>
                  )}
                </div>

                {/* Food Items List */}
                <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-bento-border/40">
                  {hasItems ? (
                    <div className="flex flex-wrap gap-1 sm:gap-1.5">
                      {mealDetails.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] sm:text-xs bg-slate-100 dark:bg-surface-bright/40 border border-slate-200 dark:border-white/10 text-on-surface px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-bold capitalize flex items-center gap-1"
                        >
                          {item.foodName}{' '}
                          <span className="text-slate-700 dark:text-on-surface-variant font-medium text-[10px] sm:text-[11px]">
                            ({item.weightInGram}g)
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-700 dark:text-on-surface-variant font-medium italic">
                      Chưa ghi nhận món ăn nào trong ngày này
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HistoryNutritionDetails;
