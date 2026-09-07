/* eslint-disable @next/next/no-img-element */
'use client';

import { X } from 'lucide-react';
import type { SelectedFoodSummaryProps } from '../../../interface';

const SelectedFoodSummary = ({
  addedItems,
  totalAddedCalories,
  onRemoveItem,
}: SelectedFoodSummaryProps) => {
  if (addedItems.length === 0) return null;

  return (
    <section className="bg-surface-bright/20 p-3.5 sm:p-4 rounded-2xl border border-white/10 space-y-2.5 sm:space-y-3">
      <h2 className="font-bold flex justify-between items-center text-xs sm:text-sm">
        <span className="text-on-surface">Món ăn đã chọn ({addedItems.length})</span>
        <span className="text-primary font-bold text-sm sm:text-base">
          {Math.round(totalAddedCalories)} kcal
        </span>
      </h2>

      <div className="space-y-2">
        {addedItems.map((item, index) => {
          const itemCalories = Math.round(
            (item.food.caloriesPer100g * item.weightInGram) / 100
          );
          const foodImg =
            item.food.imageUrl ||
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80';

          return (
            <div
              key={index}
              className="flex justify-between items-center bg-background/70 p-2.5 sm:p-3 rounded-xl border border-white/5 gap-3"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/10 shrink-0 bg-black/40">
                  <img
                    src={foodImg}
                    alt={item.food.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-xs sm:text-sm line-clamp-1 capitalize">
                    {item.food.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-on-surface-variant mt-0.5">
                    {item.weightInGram}g •{' '}
                    <strong className="text-primary">{itemCalories} kcal</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                suppressHydrationWarning
                onClick={() => onRemoveItem(index)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center transition-all cursor-pointer shrink-0"
                aria-label="Xóa món ăn"
              >
                <X size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SelectedFoodSummary;
