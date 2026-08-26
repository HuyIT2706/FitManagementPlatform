'use client';

import Link from 'next/link';
import { EggFried, UtensilsCrossed, MoonStar, Apple, Plus, ChevronRight } from 'lucide-react';
import toast from '../../../utils/toast';
import { type DailyMealGridProps } from '../../../interface';

const DailyMealGrid = ({
  mealSlots,
  getMealDetails,
  selectedDateFormattedStr,
}: DailyMealGridProps) => {
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const selectedDate = new Date(selectedDateFormattedStr);
  const isFutureDate = selectedDate > todayEnd;

  const handleAddMealClick = (e: React.MouseEvent) => {
    if (isFutureDate) {
      e.preventDefault();
      toast.error('Không thể ghi nhận bữa ăn cho các ngày trước hiện tại!');
    }
  };

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
        };
    }
  };

  return (
    <div className="col-span-1 md:col-span-12 mt-4">
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-headline-md text-xl font-bold text-on-surface">Bữa ăn hàng ngày</h3>
        <button className="font-label-lg text-sm text-green-light hover:text-primary transition-colors flex items-center font-semibold cursor-pointer">
          Lên kế hoạch <ChevronRight size={16} className="ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-gutter">
        {mealSlots.map((mealConfig) => {
          const mealDetails = getMealDetails(mealConfig.id);
          const hasItems = mealDetails.items.length > 0;
          const config = getMealConfig(mealConfig.id);

          return (
            <div
              key={mealConfig.id}
              className={`bento-card p-5 flex flex-col justify-between group transition-all duration-300 border border-bento-border/50 rounded-2xl ${config.cardHover}`}
            >
              {/* Header: Icon, Meal Name, Total Calories & Add Button */}
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

                <Link
                  href={`/add-meal?type=${mealConfig.id}&date=${selectedDateFormattedStr}`}
                  onClick={(e) => handleAddMealClick(e)}
                  className={`w-9 h-9 rounded-xl border border-outline-variant/40 flex items-center justify-center transition-all ${
                    isFutureDate
                      ? 'opacity-40 cursor-not-allowed text-on-surface-variant'
                      : 'text-on-surface-variant hover:bg-green-light/20 hover:text-green-light hover:border-green-light cursor-pointer'
                  }`}
                  aria-label={`Thêm ${mealConfig.name}`}
                >
                  <Plus size={18} />
                </Link>
              </div>

              {/* Food Items List */}
              <div className="mt-3 pt-3 border-t border-bento-border/40">
                {hasItems ? (
                  <div className="flex flex-wrap gap-1.5">
                    {mealDetails.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-surface-bright/40 border border-white/10 text-on-surface px-2.5 py-1 rounded-lg font-medium capitalize"
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
                    Chưa có món ăn nào
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyMealGrid;
