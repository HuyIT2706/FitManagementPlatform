'use client';

import { EggFried, UtensilsCrossed, MoonStar, Apple, CheckCircle2 } from 'lucide-react';
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
            <EggFried
              size={24}
              className="text-amber-300 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)] stroke-[2.2]"
            />
          ),
          badgeBg:
            'bg-gradient-to-br from-amber-500/25 via-orange-500/15 to-transparent border-amber-400/40 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.25)]',
          cardHover:
            'hover:border-amber-400/50 hover:shadow-[0_0_24px_rgba(245,158,11,0.12)]',
          calColor: 'text-amber-300',
        };
      case 'LUNCH':
        return {
          icon: (
            <UtensilsCrossed
              size={24}
              className="text-orange-300 drop-shadow-[0_2px_10px_rgba(249,115,22,0.5)] stroke-[2.2]"
            />
          ),
          badgeBg:
            'bg-gradient-to-br from-orange-500/25 via-rose-500/15 to-transparent border-orange-400/40 text-orange-300 shadow-[0_0_18px_rgba(249,115,22,0.25)]',
          cardHover:
            'hover:border-orange-400/50 hover:shadow-[0_0_24px_rgba(249,115,22,0.12)]',
          calColor: 'text-orange-300',
        };
      case 'DINNER':
        return {
          icon: (
            <MoonStar
              size={24}
              className="text-indigo-300 drop-shadow-[0_2px_10px_rgba(99,102,241,0.5)] stroke-[2.2]"
            />
          ),
          badgeBg:
            'bg-gradient-to-br from-indigo-500/25 via-purple-500/15 to-transparent border-indigo-400/40 text-indigo-300 shadow-[0_0_18px_rgba(99,102,241,0.25)]',
          cardHover:
            'hover:border-indigo-400/50 hover:shadow-[0_0_24px_rgba(99,102,241,0.12)]',
          calColor: 'text-indigo-300',
        };
      case 'SNACK':
      default:
        return {
          icon: (
            <Apple
              size={24}
              className="text-emerald-300 drop-shadow-[0_2px_10px_rgba(16,185,129,0.5)] stroke-[2.2]"
            />
          ),
          badgeBg:
            'bg-gradient-to-br from-emerald-500/25 via-teal-500/15 to-transparent border-emerald-400/40 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.25)]',
          cardHover:
            'hover:border-emerald-400/50 hover:shadow-[0_0_24px_rgba(16,185,129,0.12)]',
          calColor: 'text-emerald-300',
        };
    }
  };

  return (
    <section
      className={`md:col-span-12 bento-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 space-y-6 transition-opacity duration-200 ${
        dailyLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Date Header & Calorie Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-bento-border/50">
        <div>
          <h2 className="text-xl font-headline-md font-bold text-on-surface">Nhật ký dinh dưỡng</h2>
          <span className="text-xs text-on-surface-variant mt-0.5 block">
            {isSelectedDateToday ? 'Hôm nay' : formatDisplayDate(selectedDate)}
          </span>
        </div>

        <div className="flex flex-col md:items-end">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs text-on-surface-variant font-medium">Calo đã nạp:</span>
            <span className="text-base font-bold text-green-light">
              {consumedCalo} / {targetCalo} kcal
            </span>
          </div>
          <div className="w-full md:w-64 h-2.5 bg-surface-bright rounded-full overflow-hidden">
            <div
              className="h-full bg-green-light rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(102,200,28,0.5)]"
              style={{ width: `${totalCaloPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Macro Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center p-3.5 bg-surface-bright/30 rounded-2xl border border-white/5">
          <span className="text-xs text-on-surface-variant mb-1 font-medium">Đạm (Protein)</span>
          <span className="text-base md:text-lg font-bold text-[#0086C9]">
            {consumedProtein}{' '}
            <span className="text-xs font-normal text-on-surface-variant">/{targetProtein}g</span>
          </span>
          <span className="text-[11px] text-[#0086C9] font-semibold mt-0.5">{proteinPercent}%</span>
        </div>

        <div className="flex flex-col items-center p-3.5 bg-surface-bright/30 rounded-2xl border border-white/5">
          <span className="text-xs text-on-surface-variant mb-1 font-medium">
            Tinh bột (Carbs)
          </span>
          <span className="text-base md:text-lg font-bold text-[#EF6820]">
            {consumedCarbs}{' '}
            <span className="text-xs font-normal text-on-surface-variant">/{targetCarbs}g</span>
          </span>
          <span className="text-[11px] text-[#EF6820] font-semibold mt-0.5">{carbsPercent}%</span>
        </div>

        <div className="flex flex-col items-center p-3.5 bg-surface-bright/30 rounded-2xl border border-white/5">
          <span className="text-xs text-on-surface-variant mb-1 font-medium">Chất béo (Fat)</span>
          <span className="text-base md:text-lg font-bold text-[#F63D68]">
            {consumedFat}{' '}
            <span className="text-xs font-normal text-on-surface-variant">/{targetFat}g</span>
          </span>
          <span className="text-[11px] text-[#F63D68] font-semibold mt-0.5">{fatPercent}%</span>
        </div>
      </div>

      {/* Daily Meals Grid */}
      <div className="space-y-4 pt-2">
        <h3 className="text-base font-headline-md font-bold text-on-surface px-1">
          Danh sách bữa ăn
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {mealSlots.map((mealConfig) => {
            const mealDetails = getMealDetails(mealConfig.id);
            const hasItems = mealDetails.items.length > 0;
            const config = getMealConfig(mealConfig.id);

            return (
              <div
                key={mealConfig.id}
                className={`bento-card p-5 flex flex-col justify-between group transition-all duration-300 border border-bento-border/50 rounded-2xl ${config.cardHover}`}
              >
                {/* Header: Icon, Meal Name, Total Calories & Status Check */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${config.badgeBg}`}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <h4 className="font-headline-md text-base font-bold text-on-surface">
                        {mealConfig.name}
                      </h4>
                      <span
                        className={`font-body-md text-xs font-bold ${
                          hasItems ? 'text-green-light' : 'text-on-surface-variant/70'
                        }`}
                      >
                        {mealDetails.totalCalories} kcal
                      </span>
                    </div>
                  </div>

                  {hasItems && (
                    <div className="w-7 h-7 rounded-full bg-green-light/10 border border-green-light/30 flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-green-light stroke-[2.5]" />
                    </div>
                  )}
                </div>

                {/* Food Items List */}
                <div className="mt-3 pt-3 border-t border-bento-border/40">
                  {hasItems ? (
                    <div className="flex flex-wrap gap-2">
                      {mealDetails.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-surface-bright/40 border border-white/10 text-on-surface px-2.5 py-1 rounded-lg font-medium capitalize flex items-center gap-1"
                        >
                          {item.foodName}{' '}
                          <span className="text-on-surface-variant/70 text-[11px]">
                            ({item.weightInGram}g)
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant/50 italic">
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
