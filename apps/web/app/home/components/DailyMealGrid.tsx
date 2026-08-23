'use client';

import Link from 'next/link';
import { Sunrise, Sun, Moon, Cookie, Plus, ChevronRight } from 'lucide-react';
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

  const getMealIcon = (id: string) => {
    switch (id) {
      case 'BREAKFAST':
        return <Sunrise size={20} className="text-amber-400" />;
      case 'LUNCH':
        return <Sun size={20} className="text-orange-400" />;
      case 'DINNER':
        return <Moon size={20} className="text-indigo-400" />;
      case 'SNACK':
      default:
        return <Cookie size={20} className="text-emerald-400" />;
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

          return (
            <div
              key={mealConfig.id}
              className="bento-card p-5 flex flex-col justify-between group hover:bg-surface-bright/30 transition-colors border border-bento-border/50 rounded-2xl"
            >
              {/* Header: Icon, Meal Name, Total Calories & Add Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-bright/40 border border-white/10 flex items-center justify-center shrink-0">
                    {getMealIcon(mealConfig.id)}
                  </div>
                  <div>
                    <h4 className="font-headline-md text-base font-bold text-on-surface">
                      {mealConfig.name}
                    </h4>
                    <span className="font-body-md text-xs text-green-light font-bold">
                      {mealDetails.totalCalories} kcal
                    </span>
                  </div>
                </div>

                <Link
                  href={`/add-meal?type=${mealConfig.id}&date=${selectedDateFormattedStr}`}
                  onClick={(e) => handleAddMealClick(e)}
                  className={`w-8 h-8 rounded-full border border-outline-variant/40 flex items-center justify-center transition-all ${
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
                        className="text-xs bg-surface-bright/20 border border-white/10 text-on-surface-variant px-2.5 py-1 rounded-lg font-medium capitalize"
                      >
                        {item.foodName}{' '}
                        <span className="text-on-surface-variant/60">
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
