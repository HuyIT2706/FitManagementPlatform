/* eslint-disable @next/next/no-img-element */
'use client';

import { X } from 'lucide-react';
import type { SelectedFoodSummaryProps } from '../../../interface';

export default function SelectedFoodSummary({
  addedItems,
  totalAddedCalories,
  onRemoveItem,
}: SelectedFoodSummaryProps) {
  if (addedItems.length === 0) return null;

  return (
    <section className="bg-surface-bright/20 p-4 rounded-2xl border border-white/10 space-y-3">
      <h2 className="font-bold flex justify-between items-center text-sm">
        <span className="text-on-surface">Món ăn đã chọn ({addedItems.length})</span>
        <span className="text-primary font-bold text-base">
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
              className="flex justify-between items-center bg-background/70 p-3 rounded-xl border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0 bg-black/40">
                  <img
                    src={foodImg}
                    alt={item.food.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1 capitalize">
                    {item.food.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {item.weightInGram}g •{' '}
                    <strong className="text-primary">{itemCalories} kcal</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                suppressHydrationWarning
                onClick={() => onRemoveItem(index)}
                className="w-9 h-9 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center transition-all cursor-pointer shrink-0"
                aria-label="Xóa món ăn"
              >
                <X size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
