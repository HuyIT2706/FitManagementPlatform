/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useMemo } from 'react';
import { ArrowLeft, ChevronDown, Plus, Check, Search, BadgeCheck, Utensils, Mic } from 'lucide-react';
import type { SmartParsedFoodItem, FoodItem } from '../../../interface';
import { useMealBuilderStore } from '../../../services/useMealBuilderStore';
import toast from '../../../utils/toast';
import { WeightEditModal } from './WeightEditEat';

interface SmartFoodResultsViewProps {
  mealShortName: string;
  displayDate: string;
  onOpenMealDatePicker: () => void;
  onBack: () => void;
  onReopenSmartInput: () => void;
  results: SmartParsedFoodItem[];
  onFinish: () => void;
}

export const SmartFoodResultsView = ({
  mealShortName,
  displayDate,
  onOpenMealDatePicker,
  onBack,
  onReopenSmartInput,
  results,
  onFinish,
}: SmartFoodResultsViewProps) => {
  const { addedItems, addItem, getTotalCalories } = useMealBuilderStore();

  const [searchFilter, setSearchFilter] = useState('');
  const [editingFood, setEditingFood] = useState<SmartParsedFoodItem | null>(null);

  // Filter results by user typed keyword in the search bar
  const filteredResults = useMemo(() => {
    if (!searchFilter.trim()) return results;
    const q = searchFilter.toLowerCase();
    return results.filter((f) => f.name.toLowerCase().includes(q));
  }, [results, searchFilter]);

  const handleQuickAdd = (item: SmartParsedFoodItem) => {
    addItem(item as unknown as FoodItem, item.suggestedWeight);
    toast.success(`Đã thêm ${item.name} (${item.suggestedWeight}g)!`);
  };

  const handleCustomWeightSave = (newWeight: number) => {
    if (editingFood) {
      addItem(editingFood as unknown as FoodItem, newWeight);
      toast.success(`Đã thêm ${editingFood.name} (${newWeight}g)!`);
      setEditingFood(null);
    }
  };

  const isFoodAdded = (foodId: string) => {
    return addedItems.some((item) => item.food.id === foodId);
  };

  const getAddedFoodWeight = (foodId: string) => {
    const found = addedItems.find((item) => item.food.id === foodId);
    return found ? found.weightInGram : null;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background text-on-surface flex flex-col justify-between">
      {/* Sticky Header exactly as Image 3 */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-background/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 px-4 py-2.5 flex items-center justify-between">
        {/* Left: Back Arrow */}
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white transition-colors cursor-pointer"
          aria-label="Quay lại"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Center: Meal Title & Date with Dropdown caret */}
        <button
          type="button"
          onClick={onOpenMealDatePicker}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
        >
          <span className="font-extrabold text-base text-slate-900 dark:text-white">
            {mealShortName} {displayDate}
          </span>
          <ChevronDown
            size={16}
            className="text-primary group-hover:translate-y-0.5 transition-transform shrink-0"
          />
        </button>

        <button
          type="button"
          onClick={onReopenSmartInput}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-emerald-500 dark:text-primary transition-colors cursor-pointer"
          title="Nhập giọng nói hoặc văn bản khác"
        >
          <Mic size={20} />
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-xl mx-auto w-full px-4 pt-3 pb-24 space-y-3">
        {/* Search Bar matching Image 3 */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Tìm kiếm thực phẩm"
            className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/15 rounded-2xl text-slate-900 dark:text-white text-sm font-medium focus:outline-hidden focus:border-primary placeholder:text-slate-400 dark:placeholder:text-white/40 shadow-xs pr-10"
          />
          <div className="absolute right-3.5 text-emerald-500 dark:text-primary pointer-events-none">
            <Search size={18} />
          </div>
        </div>

        {/* Results List */}
        {filteredResults.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white dark:bg-white/[0.03] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
              <Utensils size={26} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base mb-1">
              Chưa tìm thấy món phù hợp
            </h3>
            <p className="text-xs text-slate-500 dark:text-white/60 max-w-xs mx-auto mb-4">
              Bạn có thể điều chỉnh từ khóa tìm kiếm hoặc nói/gõ lại để hệ thống nhận diện.
            </p>
            <button
              type="button"
              onClick={onReopenSmartInput}
              className="px-4 py-2 rounded-xl bg-primary text-black font-extrabold text-xs hover:opacity-90 transition-all shadow-xs cursor-pointer"
            >
              Nói / Gõ lại
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredResults.map((item) => {
              const alreadyAdded = isFoodAdded(item.id);
              const addedWeight = getAddedFoodWeight(item.id);
              const displayWeight = addedWeight || item.suggestedWeight;
              const displayCalories = Math.round((item.caloriesPer100g * displayWeight) / 100);

              // Bullet color indicator
              const bulletColor =
                displayCalories > 300
                  ? 'bg-amber-500'
                  : displayCalories > 150
                    ? 'bg-emerald-500'
                    : 'bg-yellow-500';

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-white/[0.04] border transition-all shadow-xs hover:shadow-md ${
                    alreadyAdded
                      ? 'border-emerald-500/50 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06]'
                      : 'border-slate-200/80 dark:border-white/10'
                  }`}
                >
                  {/* Left: Thumbnail & Food details (Click to edit weight) */}
                  <div
                    onClick={() => setEditingFood(item)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-2 select-none"
                    title="Nhấn để chỉnh sửa trọng lượng"
                  >
                    {/* Rounded Image Thumbnail */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10 shrink-0 border border-slate-200 dark:border-white/10">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-white/40">
                          <Utensils size={18} />
                        </div>
                      )}
                    </div>

                    {/* Food text info */}
                    <div className="min-w-0">
                      {/* Name + Verified Checkmark Badge */}
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                          {item.name}
                        </span>
                        <BadgeCheck size={16} className="text-sky-500 shrink-0" />
                      </div>

                      {/* Description or category (if any) */}
                      {item.category && (
                        <span className="text-[11px] text-slate-500 dark:text-white/60 block truncate mt-0.5">
                          {item.category}
                        </span>
                      )}

                      {/* Weight and Pre-calculated Calories Line */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-2 h-2 rounded-full ${bulletColor} shrink-0`} />
                        <span className="text-xs font-bold text-slate-700 dark:text-white/80">
                          {displayWeight}g, {displayCalories} kcal
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Circular Plus / Added Check Button */}
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(item)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs ${
                      alreadyAdded
                        ? 'bg-primary text-black scale-105'
                        : 'border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white/90 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-400'
                    }`}
                    title={alreadyAdded ? 'Nhấn để thêm tiếp' : 'Thêm vào bữa ăn'}
                  >
                    {alreadyAdded ? <Check size={18} /> : <Plus size={18} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Bar when items added */}
      {addedItems.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40">
          <div className="p-3 bg-slate-900/95 dark:bg-surface-container-high/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl flex items-center justify-between text-white">
            <div className="pl-2">
              <span className="text-xs font-bold text-slate-300 block">
                Đã chọn {addedItems.length} món
              </span>
              <span className="text-sm font-extrabold text-primary">
                {Math.round(getTotalCalories())} kcal
              </span>
            </div>
            <button
              type="button"
              onClick={onFinish}
              className="px-5 py-2.5 rounded-xl bg-primary text-black font-extrabold text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Xem bữa ăn & Lưu
            </button>
          </div>
        </div>
      )}

      {/* Weight Editor Modal */}
      {editingFood && (
        <WeightEditModal
          isOpen={true}
          onClose={() => setEditingFood(null)}
          food={editingFood as unknown as FoodItem}
          initialWeight={editingFood.suggestedWeight}
          onConfirm={handleCustomWeightSave}
        />
      )}
    </div>
  );
};
