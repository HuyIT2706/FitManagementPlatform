'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Coffee,
  Sun,
  Moon,
  Apple,
  RefreshCw,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import apiClient from '../../api/axios';
import toast from '../../utils/toast';
import { mutate } from 'swr';
import { broadcastSync } from '../../utils/realtimeSync';
import type { GeneratedMealPlanResponse, GeneratedMealSession } from '@repo/types';

interface SmartMealPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplied?: () => void;
}

export default function SmartMealPlannerModal({
  isOpen,
  onClose,
  onApplied,
}: SmartMealPlannerModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mealPlan, setMealPlan] = useState<GeneratedMealPlanResponse | null>(null);

  const fetchMealPlan = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post<GeneratedMealPlanResponse>(
        '/nutrition/generate-meal-plan',
        {}
      );
      setMealPlan(res.data);
    } catch (err: unknown) {
      console.error('Error generating AI meal plan:', err);
      toast.error('Không thể tạo thực đơn AI. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMealPlan();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyAndSave = async () => {
    if (!mealPlan) return;
    setSaving(true);
    try {
      await apiClient.post('/nutrition/generate-meal-plan', {
        targetCalories: mealPlan.targetCalories,
        targetProtein: mealPlan.targetProtein,
        targetCarbs: mealPlan.targetCarbs,
        targetFat: mealPlan.targetFat,
        saveToDatabase: true,
      });

      await Promise.all([
        mutate('/workout/assigned-meal-plan'),
        mutate('/users/me'),
        mutate((key) => typeof key === 'string' && key.startsWith('/nutrition/daily')),
      ]);
      broadcastSync('MEAL_PLAN_UPDATED');

      toast.success('Đã áp dụng thực đơn vào kế hoạch cá nhân');
      if (onApplied) onApplied();
      onClose();
    } catch {
      toast.error('Không thể lưu thực đơn. Vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  const getMealIcon = (key: string) => {
    switch (key) {
      case 'breakfast':
        return <Coffee className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      case 'morningSnack':
        return <Apple className="w-5 h-5 text-lime-500 dark:text-lime-400" />;
      case 'lunch':
        return <Sun className="w-5 h-5 text-orange-500 dark:text-orange-400" />;
      case 'afternoonSnack':
        return <Apple className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
      case 'dinner':
        return <Moon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />;
      default:
        return <Apple className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121915] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header - Clean, modern, without gimmicky AI icon */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Gợi Ý Thực Đơn Dinh Dưỡng
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body - Responsive & scrollbar hidden */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-6 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : mealPlan ? (
            <>
              {/* Macro Overview Banner */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Flame className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      Tổng năng lượng: {mealPlan.calculatedCalories} kcal
                    </span>
                    <span className="text-xs text-slate-500 dark:text-white/50">
                      (Mục tiêu: {mealPlan.targetCalories} kcal)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold inline-flex items-center gap-1">
                      {mealPlan.meals.length} bữa / ngày 
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      Protein: {mealPlan.calculatedProtein}g / {mealPlan.targetProtein}g
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                      Carbs: {mealPlan.calculatedCarbs}g / {mealPlan.targetCarbs}g
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                      Fat: {mealPlan.calculatedFat}g / {mealPlan.targetFat}g
                    </span>
                  </div>
                </div>

                {/* Safety Allergy Filter Badge */}
                {mealPlan.allergiesFiltered && mealPlan.allergiesFiltered.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                    <ShieldCheck size={15} className="shrink-0" />
                    <span>
                      Đã tự động loại bỏ các thành phần dị ứng & chế độ kiêng cữ: {mealPlan.allergiesFiltered.slice(0, 8).join(', ')}...
                    </span>
                  </div>
                )}
              </div>

              {/* Responsive Meals Grid: 1 col on mobile, 2/3/4 cols on larger screens */}
              <div
                className={`grid grid-cols-1 ${
                  mealPlan.meals.length === 2
                    ? 'md:grid-cols-2'
                    : mealPlan.meals.length === 3
                      ? 'md:grid-cols-3'
                      : 'sm:grid-cols-2 lg:grid-cols-4'
                } gap-3 sm:gap-4`}
              >
                {mealPlan.meals.map((meal: GeneratedMealSession) => (
                  <div
                    key={meal.mealKey}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                          {getMealIcon(meal.mealKey)}
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {meal.mealName}
                          </h4>
                        </div>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          {meal.totalCalories} kcal
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {meal.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between gap-2 text-xs py-1 border-b border-slate-100 dark:border-white/5 last:border-none"
                          >
                            <span className="font-medium text-slate-700 dark:text-white/80 leading-snug">
                              • {it.weightInGrams}g {it.foodName}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-white/40 shrink-0 text-right whitespace-nowrap">
                              {it.calories} kcal ({it.protein}g P)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-white/50 pt-2 border-t border-slate-100 dark:border-white/5 font-semibold">
                      <span>P: {meal.totalProtein}g</span>
                      <span>C: {meal.totalCarbs}g</span>
                      <span>F: {meal.totalFat}g</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coach Advice */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-100 dark:bg-white/5 text-xs text-slate-600 dark:text-white/70 leading-relaxed space-y-1">
                <span className="font-bold text-slate-800 dark:text-white block">
                  Lời khuyên dinh dưỡng:
                </span>
                <p>{mealPlan.coachAdvice}</p>
                <p className="italic text-[11px] text-slate-500 dark:text-white/50">
                  {mealPlan.formattedPlan.note}
                </p>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions - Responsive stacking on mobile */}
        <div className="p-3.5 sm:p-5 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => fetchMealPlan()}
            disabled={loading || saving}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Đổi thực đơn khác
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={handleApplyAndSave}
              disabled={loading || saving || !mealPlan}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:opacity-95 hover:scale-[1.01] cursor-pointer transition-all disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Áp Dụng Thực Đơn'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
