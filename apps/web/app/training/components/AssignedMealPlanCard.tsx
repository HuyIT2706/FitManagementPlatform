/* eslint-disable @next/next/no-img-element */
'use client';

import { Sunrise, Sun, Moon, Cookie, UtensilsCrossed } from 'lucide-react';
import type { AssignedMealPlanCardProps } from '../../../interface';

export default function AssignedMealPlanCard({
  assignedMealPlan,
  ptName,
}: AssignedMealPlanCardProps) {
  const getMealIcon = (iconName?: string) => {
    switch (iconName) {
      case 'wb_twilight':
        return <Sunrise size={20} className="text-amber-400" />;
      case 'wb_sunny':
        return <Sun size={20} className="text-orange-400" />;
      case 'dark_mode':
        return <Moon size={20} className="text-indigo-400" />;
      case 'icecream':
      default:
        return <Cookie size={20} className="text-emerald-400" />;
    }
  };

  const meals = assignedMealPlan?.meals || [
    {
      name: 'Bữa Sáng',
      kcal: 450,
      description: '3 Trứng ốp la + 100g Yến mạch',
      icon: 'wb_twilight',
    },
    {
      name: 'Bữa Trưa',
      kcal: 650,
      description: '200g Ức gà + 150g Gạo lứt',
      icon: 'wb_sunny',
    },
  ];

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
              {assignedMealPlan?.coachName || `Coach ${ptName}`}:
            </strong>
            &quot;
            {assignedMealPlan?.coachAdvice ||
              'Ăn đúng lượng Carbs trước tập 1 tiếng để có sức nâng tạ nhé!'}
            &quot;
          </p>
        </div>

        {/* Meal Slots List */}
        <div className="grid grid-cols-1 gap-3">
          {meals.map((meal, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-surface-bright/30 p-3.5 rounded-2xl border border-white/5"
            >
              <div className="w-11 h-11 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center text-orange-400 shrink-0">
                {getMealIcon(meal.icon)}
              </div>
              <div className="grow">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-on-surface text-base">{meal.name}</h4>
                  <span className="text-green-light font-bold text-xs">{meal.kcal} kcal</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">{meal.description}</p>
              </div>
            </div>
          ))}
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
}
