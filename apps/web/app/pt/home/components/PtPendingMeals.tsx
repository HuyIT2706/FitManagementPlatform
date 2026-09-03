/* eslint-disable @next/next/no-img-element */
'use client';

import { CheckCircle2, MessageSquare, Check } from 'lucide-react';
import type { PTPendingMeal } from '@repo/types';
import type { PtPendingMealsProps } from '../../../../interface';
import { getAvatarUrl } from '../../../../utils/avatar';

const PtPendingMeals = ({
  meals,
  approvedMeals,
  feedbackTexts,
  onFeedbackTextChange,
  onApproveMeal,
}: PtPendingMealsProps) => {
  const pendingMealList = meals || [];

  return (
    <section className="space-y-4">
      <h3 className="font-headline-md font-bold text-xl text-on-surface px-1">
        Nhật ký dinh dưỡng chờ duyệt
      </h3>

      <div className="space-y-4">
        {pendingMealList.map((meal: PTPendingMeal) => {
          const isApproved = Boolean(approvedMeals[meal.id]);
          const avatarImg = getAvatarUrl(meal.studentAvatar);
          const mealImg =
            meal.imageUrl ||
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

          return (
            <div
              key={meal.id}
              className="bento-card rounded-3xl p-6 border border-outline-variant/30 space-y-4"
            >
              {/* Student Avatar & Meal Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                    <img src={avatarImg} alt={meal.studentName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-base">{meal.studentName}</h4>
                    <span className="text-xs text-on-surface-variant font-medium">
                      {meal.mealName}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold text-primary">{meal.calories} kcal</span>
              </div>

              {/* Meal Photo & Macros Breakdown */}
              <div className="bg-surface-bright/40 rounded-2xl p-4 border border-white/5 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="w-full md:w-36 h-28 rounded-xl overflow-hidden shrink-0 border border-white/10">
                  <img src={mealImg} alt="Meal photo" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2 grow">
                  <p className="text-sm text-on-surface font-semibold">{meal.foodDescription}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-surface-bright text-xs text-[#0086C9] font-bold px-2.5 py-1 rounded-lg border border-[#0086C9]/20">
                      P: {meal.proteinGrams}g
                    </span>
                    <span className="bg-surface-bright text-xs text-[#EF6820] font-bold px-2.5 py-1 rounded-lg border border-[#EF6820]/20">
                      C: {meal.carbsGrams}g
                    </span>
                    <span className="bg-surface-bright text-xs text-[#F63D68] font-bold px-2.5 py-1 rounded-lg border border-[#F63D68]/20">
                      F: {meal.fatGrams}g
                    </span>
                  </div>
                </div>
              </div>

              {/* Coach Feedback Input & Actions */}
              {!isApproved ? (
                <div className="space-y-3 pt-1">
                  <div className="relative">
                    <MessageSquare
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={feedbackTexts[meal.id] || ''}
                      onChange={(e) => onFeedbackTextChange(meal.id, e.target.value)}
                      placeholder="Gửi lời nhắn cho học viên..."
                      className="w-full bg-surface-bright/30 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary outline-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => onApproveMeal(meal.id)}
                      className="flex-1 bg-primary text-dark-slate font-bold text-xs py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-[0_0_10px_rgba(102,200,28,0.3)] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check size={16} className="stroke-[3]" />
                      Duyệt Bữa Ăn
                    </button>
                    <button
                      type="button"
                      onClick={() => onApproveMeal(meal.id)}
                      className="flex-1 bg-surface-bright/40 text-on-surface font-bold text-xs py-3 rounded-xl border border-white/10 hover:bg-surface-bright transition-colors cursor-pointer"
                    >
                      Nhắc Nhở Sửa Bữa
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-green-light/10 border border-green-light/30 rounded-xl flex items-center gap-2 text-green-light text-xs font-bold">
                  <CheckCircle2 size={18} className="shrink-0" />
                  Đã duyệt bữa ăn và gửi lời nhắn cho học viên!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PtPendingMeals;
