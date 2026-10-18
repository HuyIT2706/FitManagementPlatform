'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, Plus, Minus, Camera } from 'lucide-react';
import apiClient from '../../api/axios';
import { toast } from '../../utils/toast';
import { useMealBuilderStore } from '../../services/useMealBuilderStore';
import type { FoodItem } from '../../interface';

interface CreateFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (food: FoodItem) => void;
  allowAddToMeal?: boolean;
}

export const CreateFoodModal = ({
  isOpen,
  onClose,
  onSuccess,
  allowAddToMeal = false,
}: CreateFoodModalProps) => {
  const { addItem } = useMealBuilderStore();

  const [name, setName] = useState('');
  const [calories, setCalories] = useState<string>('');
  const [weight, setWeight] = useState<string>('100');
  const [unit, setUnit] = useState<'g' | 'ml'>('g');

  const [carbs, setCarbs] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [fat, setFat] = useState<string>('');

  const [showOtherNutrients, setShowOtherNutrients] = useState(false);
  const [fiber, setFiber] = useState<string>('');
  const [showWeightTooltip, setShowWeightTooltip] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addToMealAlso, setAddToMealAlso] = useState(false);

  // Auto-calculate calories if carbs/protein/fat change and calories hasn't been manually set
  const handleNutrientChange = (
    type: 'carbs' | 'protein' | 'fat',
    val: string
  ) => {
    let nextCarbs = carbs;
    let nextProtein = protein;
    let nextFat = fat;

    if (type === 'carbs') {
      nextCarbs = val;
      setCarbs(val);
    } else if (type === 'protein') {
      nextProtein = val;
      setProtein(val);
    } else if (type === 'fat') {
      nextFat = val;
      setFat(val);
    }

    const c = parseFloat(nextCarbs) || 0;
    const p = parseFloat(nextProtein) || 0;
    const f = parseFloat(nextFat) || 0;

    // Standard formula: 1g carb = 4 kcal, 1g protein = 4 kcal, 1g fat = 9 kcal
    const computed = Math.round(c * 4 + p * 4 + f * 9);
    if (computed > 0) {
      setCalories(computed.toString());
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      toast.warning('Vui lòng nhập tên thực phẩm mới', 'Thiếu thông tin');
      return;
    }

    const numWeight = parseFloat(weight) || 100;
    if (numWeight <= 0) {
      toast.warning('Khối lượng phải lớn hơn 0', 'Khối lượng không hợp lệ');
      return;
    }

    const numCalories = parseFloat(calories) || 0;
    const numCarbs = parseFloat(carbs) || 0;
    const numProtein = parseFloat(protein) || 0;
    const numFat = parseFloat(fat) || 0;
    const numFiber = fiber ? parseFloat(fiber) || 0 : undefined;

    // Convert values to per 100g standard for FoodLibrary
    const factor = 100 / numWeight;
    const caloriesPer100g = Math.round(numCalories * factor);
    const carbsPer100g = Math.round(numCarbs * factor * 10) / 10;
    const proteinPer100g = Math.round(numProtein * factor * 10) / 10;
    const fatPer100g = Math.round(numFat * factor * 10) / 10;
    const fiberPer100g = numFiber !== undefined ? Math.round(numFiber * factor * 10) / 10 : undefined;

    setIsSubmitting(true);
    try {
      const res = await apiClient.post<FoodItem>('/nutrition/foods', {
        name: name.trim(),
        caloriesPer100g,
        carbsPer100g,
        proteinPer100g,
        fatPer100g,
        fiberPer100g,
        category: 'Món ăn tự tạo',
      });

      const savedFood = res.data;

      // Only add to meal if the user explicitly chose to
      if (addToMealAlso) {
        addItem(savedFood, numWeight);
      }

      toast.success(
        addToMealAlso
          ? `Đã lưu món "${savedFood.name}" vào dữ liệu và thêm vào bữa ăn!`
          : `Đã thêm món "${savedFood.name}" vào cơ sở dữ liệu món ăn thành công!`,
        'Thành công'
      );

      // Reset form
      setName('');
      setCalories('');
      setCarbs('');
      setProtein('');
      setFat('');
      setFiber('');
      setAddToMealAlso(false);

      if (onSuccess) {
        onSuccess(savedFood);
      }
      onClose();
    } catch (err: unknown) {
      console.error('Failed to create food:', err);
      const errMsg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Không thể tạo thực phẩm mới';
      toast.error(errMsg || 'Đã có lỗi xảy ra khi lưu thực phẩm', 'Thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-[#f4f7f4] dark:bg-[#0e1410] text-slate-800 dark:text-white overflow-y-auto"
        >
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-[#f4f7f4]/90 dark:bg-[#0e1410]/90 backdrop-blur-md">
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white dark:bg-white/10 border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/20 transition-colors cursor-pointer shadow-xs"
              aria-label="Quay lại"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Tạo thực phẩm
            </h1>
            <div className="w-10" />
          </header>

          <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-1 pb-24 space-y-4">
            {/* Cute Salad Illustration Graphic (Matching Image 3) */}
            <div className="flex flex-col items-center justify-center pt-2 pb-1">
              <div className="relative w-28 h-24 flex items-center justify-center">
                {/* Decorative Bowl with vegetables illustration */}
                <div className="w-24 h-16 bg-gradient-to-t from-slate-200 to-slate-100 dark:from-white/10 dark:to-white/20 rounded-b-full relative overflow-visible flex items-center justify-center border border-slate-300 dark:border-white/20 shadow-inner">
                  {/* Salad Veggie Toppings */}
                  <div className="absolute -top-3 flex items-center justify-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-rose-500 shadow-xs" />
                    <span className="w-5 h-5 rounded-full bg-amber-400 shadow-xs" />
                    <span className="w-4 h-4 rounded-full bg-emerald-500 shadow-xs" />
                    <span className="w-3.5 h-3.5 rounded-full bg-orange-400 shadow-xs" />
                  </div>
                  <div className="text-[10px] font-black tracking-widest text-emerald-600 dark:text-primary uppercase opacity-60">
                    FRESH
                  </div>
                </div>

                {/* Camera icon badge in corner */}
                <div className="absolute right-1 bottom-1 w-7 h-7 rounded-full bg-primary text-dark-slate flex items-center justify-center shadow-md border-2 border-white dark:border-[#0e1410]">
                  <Camera size={14} className="text-white" />
                </div>
              </div>
            </div>

            {/* Card 1: Basic Info (Name, Calories, Weight) */}
            <div className="bg-white dark:bg-[#151c17] rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-white/10 space-y-4">
              {/* Tên thực phẩm mới */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <label className="text-sm font-bold text-slate-800 dark:text-white shrink-0">
                  Tên thực phẩm mới
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: cơm"
                  className="flex-1 text-right text-sm font-semibold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-hidden"
                />
              </div>

              {/* Năng lượng */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <label className="text-sm font-bold text-slate-800 dark:text-white shrink-0">
                  Năng lượng
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="0.0"
                    className="w-24 text-right text-sm font-bold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-hidden"
                  />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Kcal
                  </span>
                </div>
              </div>

              {/* Khối lượng */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 shrink-0">
                  <label className="text-sm font-bold text-slate-800 dark:text-white">
                    Khối lượng
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowWeightTooltip(!showWeightTooltip)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                    title="Khối lượng của phần ăn bạn tạo"
                  >
                    <HelpCircle size={15} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="100"
                    className="w-20 text-right text-sm font-bold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-hidden"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as 'g' | 'ml')}
                    className="text-xs font-bold text-slate-700 dark:text-white bg-slate-100 dark:bg-white/10 rounded-lg px-1.5 py-1 focus:outline-hidden cursor-pointer"
                  >
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
              </div>

              {showWeightTooltip && (
                <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 leading-relaxed">
                  💡 Nhập khối lượng phần ăn thực tế của bạn. Hệ thống sẽ tự quy đổi chuẩn về 100g và đồng thời thêm đúng lượng này vào bữa ăn của bạn.
                </div>
              )}
            </div>

            {/* Card 2: Macros (Carbs, Protein, Fat, Other) */}
            <div className="bg-white dark:bg-[#151c17] rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-white/10 space-y-4">
              {/* Carbs */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <label className="text-sm font-bold text-slate-800 dark:text-white shrink-0">
                  Carbs
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={carbs}
                    onChange={(e) => handleNutrientChange('carbs', e.target.value)}
                    placeholder="0.0"
                    className="w-24 text-right text-sm font-bold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-hidden"
                  />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    g
                  </span>
                </div>
              </div>

              {/* Chất đạm */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <label className="text-sm font-bold text-slate-800 dark:text-white shrink-0">
                  Chất đạm
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={protein}
                    onChange={(e) => handleNutrientChange('protein', e.target.value)}
                    placeholder="0.0"
                    className="w-24 text-right text-sm font-bold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-hidden"
                  />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    g
                  </span>
                </div>
              </div>

              {/* Chất béo */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <label className="text-sm font-bold text-slate-800 dark:text-white shrink-0">
                  Chất béo
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={fat}
                    onChange={(e) => handleNutrientChange('fat', e.target.value)}
                    placeholder="0.0"
                    className="w-24 text-right text-sm font-bold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-hidden"
                  />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    g
                  </span>
                </div>
              </div>

              {/* + Chất khác (nếu có) */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowOtherNutrients(!showOtherNutrients)}
                  className="text-xs font-bold text-emerald-600 dark:text-primary flex items-center gap-1.5 py-1 hover:underline cursor-pointer"
                >
                  {showOtherNutrients ? <Minus size={14} /> : <Plus size={14} />}
                  Chất khác (nếu có)
                </button>

                {showOtherNutrients && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-3 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Chất xơ (Fiber)
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={fiber}
                          onChange={(e) => setFiber(e.target.value)}
                          placeholder="0.0"
                          className="w-20 text-right text-xs font-bold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-hidden"
                        />
                        <span className="text-xs font-semibold text-slate-500">
                          g
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Subtext description matching Image 3 */}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                Giá trị năng lượng được tính theo hệ số quy đổi: 1 g carbohydrate = 4 kcal, 1 g chất đạm = 4 kcal, 1 g chất béo = 9 kcal.
              </p>
            </div>
          </main>

          {/* Bottom Fixed Action Button (Matching Image 3) */}
          <footer className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-4 bg-[#f4f7f4]/95 dark:bg-[#0e1410]/95 backdrop-blur-md z-20 space-y-2.5">
            {allowAddToMeal && (
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 select-none px-1">
                <input
                  type="checkbox"
                  checked={addToMealAlso}
                  onChange={(e) => setAddToMealAlso(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-[#528d36] cursor-pointer"
                />
                <span>Đồng thời thêm món này vào bữa ăn hiện tại</span>
              </label>
            )}

            <button
              type="button"
              disabled={isSubmitting || !name.trim()}
              onClick={handleSave}
              className="w-full h-12 rounded-full bg-[#528d36] hover:bg-[#467b2d] active:scale-98 text-white font-bold text-sm tracking-wide transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Đang lưu vào kho món ăn...' : 'Lưu vào dữ liệu món ăn'}
            </button>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateFoodModal;
