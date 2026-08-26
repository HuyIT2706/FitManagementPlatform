/* eslint-disable @next/next/no-img-element */
'use client';

import { EggFried, UtensilsCrossed, MoonStar, Apple } from 'lucide-react';
import type { AssignedMealPlanCardProps } from '../../../interface';

const AssignedMealPlanCard = ({
  assignedMealPlan,
  ptName,
}: AssignedMealPlanCardProps) => {
  if (!assignedMealPlan || !assignedMealPlan.meals || assignedMealPlan.meals.length === 0) {
    return null;
  }

  const getMealConfig = (iconName?: string, mealName?: string) => {
    const key = (iconName || mealName || '').toLowerCase();
    if (key.includes('twilight') || key.includes('sáng') || key.includes('breakfast')) {
      return {
        icon: (
          <EggFried
            size={24}
            className="text-amber-300 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)] stroke-[2.2]"
          />
        ),
        badgeBg:
          'bg-gradient-to-br from-amber-500/25 via-orange-500/15 to-transparent border-amber-400/40 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.25)]',
      };
    }
    if (key.includes('sunny') || key.includes('trưa') || key.includes('lunch')) {
      return {
        icon: (
          <UtensilsCrossed
            size={24}
            className="text-orange-300 drop-shadow-[0_2px_10px_rgba(249,115,22,0.5)] stroke-[2.2]"
          />
        ),
        badgeBg:
          'bg-gradient-to-br from-orange-500/25 via-rose-500/15 to-transparent border-orange-400/40 text-orange-300 shadow-[0_0_18px_rgba(249,115,22,0.25)]',
      };
    }
    if (key.includes('dark') || key.includes('tối') || key.includes('dinner')) {
      return {
        icon: (
          <MoonStar
            size={24}
            className="text-indigo-300 drop-shadow-[0_2px_10px_rgba(99,102,241,0.5)] stroke-[2.2]"
          />
        ),
        badgeBg:
          'bg-gradient-to-br from-indigo-500/25 via-purple-500/15 to-transparent border-indigo-400/40 text-indigo-300 shadow-[0_0_18px_rgba(99,102,241,0.25)]',
      };
    }
    return {
      icon: (
        <Apple
          size={24}
          className="text-emerald-300 drop-shadow-[0_2px_10px_rgba(16,185,129,0.5)] stroke-[2.2]"
        />
      ),
      badgeBg:
        'bg-gradient-to-br from-emerald-500/25 via-teal-500/15 to-transparent border-emerald-400/40 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.25)]',
    };
  };

  const meals = assignedMealPlan.meals;

  const totalKcal = assignedMealPlan?.totalKcal || 1100;
  const targetKcal = assignedMealPlan?.targetKcal || 1734;
  const percentage = Math.min(100, Math.round((totalKcal / targetKcal) * 100));

  return (
    <div className="space-y-4">
      <h3 className="font-headline-md font-bold text-xl text-on-surface px-1">
        Thực đơn chỉ định hôm nay
      </h3>

      <div className="bento-card rounded-3xl p-6 space-y-6 border border-bento-border/50">
        {/* Coach Speech Bubble */}
        <div className="bg-primary/10 border border-primary/30 p-4 rounded-2xl flex gap-3 items-start">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/40 shrink-0">
            {assignedMealPlan?.coachAvatar ? (
              <img
                src={assignedMealPlan.coachAvatar}
                alt="Coach Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <UtensilsCrossed size={20} className="text-primary" />
            )}
          </div>
          <p className="text-sm text-primary leading-relaxed">
            <strong className="text-on-surface block mb-1">
              {assignedMealPlan?.coachName || `${ptName}`}:
            </strong>
            {assignedMealPlan?.coachAdvice ||
              'Ăn đúng lượng Carbs trước tập 1 tiếng để có sức nâng tạ nhé!'}
          </p>
        </div>

        {/* Meal Slots List */}
        <div className="grid grid-cols-1 gap-3">
          {meals.map((meal, index) => {
            const config = getMealConfig(meal.icon, meal.name);
            return (
              <div
                key={index}
                className="flex items-start gap-4 bg-surface-bright/30 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 mt-0.5 ${config.badgeBg}`}
                >
                  {config.icon}
                </div>
                <div className="grow space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-on-surface text-base">{meal.name}</h4>
                    <span className="text-green-light font-bold text-xs">{meal.kcal} kcal</span>
                  </div>
                  <p className="text-xs text-on-surface-variant whitespace-pre-line leading-relaxed font-medium">
                    {meal.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Calories Progress Bar */}
        <div className="pt-1">
          <div className="bg-surface-bright/40 p-4 rounded-2xl border border-white/5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant font-medium">Tổng Kcal hôm nay</span>
              <span className="text-on-surface font-bold">
                {totalKcal} / {targetKcal} Kcal
              </span>
            </div>
            <div className="h-2.5 w-full bg-surface-dim rounded-full overflow-hidden">
              <div
                className="h-full bg-green-light shadow-[0_0_8px_rgba(102,200,28,0.6)]"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignedMealPlanCard;
