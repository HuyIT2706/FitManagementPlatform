'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import type { FoodItem } from '../../../interface';

interface WeightEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  food: FoodItem | null;
  initialWeight: number;
  onConfirm: (weight: number) => void;
}

export const WeightEditModal = ({
  isOpen,
  onClose,
  food,
  initialWeight,
  onConfirm,
}: WeightEditModalProps) => {
  const [weight, setWeight] = useState<number>(initialWeight || 100);

  if (!isOpen || !food) return null;

  const currentWeight = Number(weight) || 0;
  const currentCalories = Math.round((food.caloriesPer100g * currentWeight) / 100);
  const currentProtein = Math.round(((food.proteinPer100g * currentWeight) / 100) * 10) / 10;
  const currentCarbs = Math.round(((food.carbsPer100g * currentWeight) / 100) * 10) / 10;
  const currentFat = Math.round(((food.fatPer100g * currentWeight) / 100) * 10) / 10;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentWeight > 0) {
      onConfirm(currentWeight);
      onClose();
    }
  };

  const quickWeights = [50, 100, 150, 180, 200, 250, 300];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-sm bg-white dark:bg-[#1a231e] rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-white/10 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate pr-2">
              Chỉnh sửa trọng lượng
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors text-slate-500 dark:text-white/70"
            >
              <X size={18} />
            </button>
          </div>

          {/* Food Info */}
          <div className="mb-4">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">
              {food.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-primary">
                {currentCalories} kcal
              </span>
              <span className="text-slate-300 dark:text-white/20">•</span>
              <span className="text-[11px] text-slate-500 dark:text-white/60">
                P: {currentProtein}g | C: {currentCarbs}g | F: {currentFat}g
              </span>
            </div>
          </div>

          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-white/70 mb-1.5">
                Khối lượng (gram):
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="5000"
                  autoFocus
                  value={weight || ''}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 rounded-2xl text-slate-900 dark:text-white text-lg font-black focus:outline-hidden focus:border-primary pr-12 text-center"
                />
                <span className="absolute right-4 text-xs font-bold text-slate-400 dark:text-white/40 pointer-events-none">
                  gram
                </span>
              </div>
            </div>

            {/* Quick Weight Chips */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {quickWeights.map((qw) => (
                <button
                  key={qw}
                  type="button"
                  onClick={() => setWeight(qw)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    weight === qw
                      ? 'bg-primary text-black'
                      : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/80 hover:bg-slate-200 dark:hover:bg-white/20'
                  }`}
                >
                  {qw}g
                </button>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/80 font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={currentWeight <= 0}
                className="flex-1 py-2.5 rounded-2xl bg-primary text-black font-extrabold text-sm hover:opacity-90 active:scale-95 transition-all shadow-[0_0_12px_rgba(102,200,28,0.35)] flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <Check size={16} />
                Lưu ({currentWeight}g)
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
