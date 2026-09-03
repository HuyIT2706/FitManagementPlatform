"use client";

import { useState } from "react";
import { Plus, StickyNote } from "lucide-react";
import type { FoodItem } from "@repo/types";
import PtFoodSelectionModal from "./PtFoodSelectionModal";

interface StudentNutritionTabProps {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  breakfastText: string;
  lunchText: string;
  dinnerText: string;
  snackText: string;
  nutritionNote: string;
  saving: boolean;
  onTargetCaloriesChange: (val: number) => void;
  onTargetProteinChange: (val: number) => void;
  onTargetCarbsChange: (val: number) => void;
  onTargetFatChange: (val: number) => void;
  onBreakfastTextChange: (val: string) => void;
  onLunchTextChange: (val: string) => void;
  onDinnerTextChange: (val: string) => void;
  onSnackTextChange: (val: string) => void;
  onNutritionNoteChange: (val: string) => void;
  onSaveNutrition: () => void;
}

const StudentNutritionTab = ({
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFat,
  breakfastText,
  lunchText,
  dinnerText,
  snackText,
  nutritionNote,
  saving,
  onTargetCaloriesChange,
  onTargetProteinChange,
  onTargetCarbsChange,
  onTargetFatChange,
  onBreakfastTextChange,
  onLunchTextChange,
  onDinnerTextChange,
  onSnackTextChange,
  onNutritionNoteChange,
  onSaveNutrition,
}: StudentNutritionTabProps) => {
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [activeMealKey, setActiveMealKey] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >("breakfast");

  const mealTitleMap = {
    breakfast: "Bữa Sáng",
    lunch: "Bữa Trưa",
    dinner: "Bữa Tối",
    snack: "Bữa Phụ",
  };

  const handleOpenFoodModal = (
    mealKey: "breakfast" | "lunch" | "dinner" | "snack",
  ) => {
    setActiveMealKey(mealKey);
    setIsFoodModalOpen(true);
  };

  const mergeFoodIntoMealText = (
    currentText: string | undefined,
    food: FoodItem,
    weightInGrams: number,
  ): string => {
    if (!currentText || !currentText.trim()) {
      const cal = Math.round((food.caloriesPer100g * weightInGrams) / 100);
      const p = Math.round((food.proteinPer100g * weightInGrams) / 100);
      const c = Math.round((food.carbsPer100g * weightInGrams) / 100);
      const f = Math.round((food.fatPer100g * weightInGrams) / 100);
      return `+ ${weightInGrams}g ${food.name} (${cal} kcal, ${p}g P, ${c}g C, ${f}g F)`;
    }

    const lines = currentText.split("\n");
    const foodNameClean = food.name.trim().toLowerCase();

    let merged = false;
    const updatedLines = lines.map((line) => {
      const lineLower = line.toLowerCase();
      if (lineLower.includes(foodNameClean)) {
        const matchWeight = line.match(/(\d+)\s*g/i);
        const existingWeight =
          matchWeight && matchWeight[1] ? parseInt(matchWeight[1], 10) : 0;
        const totalWeight = existingWeight + weightInGrams;

        const cal = Math.round((food.caloriesPer100g * totalWeight) / 100);
        const p = Math.round((food.proteinPer100g * totalWeight) / 100);
        const c = Math.round((food.carbsPer100g * totalWeight) / 100);
        const f = Math.round((food.fatPer100g * totalWeight) / 100);

        merged = true;
        return `+ ${totalWeight}g ${food.name} (${cal} kcal, ${p}g P, ${c}g C, ${f}g F)`;
      }
      return line;
    });

    if (!merged) {
      const cal = Math.round((food.caloriesPer100g * weightInGrams) / 100);
      const p = Math.round((food.proteinPer100g * weightInGrams) / 100);
      const c = Math.round((food.carbsPer100g * weightInGrams) / 100);
      const f = Math.round((food.fatPer100g * weightInGrams) / 100);
      updatedLines.push(
        `+ ${weightInGrams}g ${food.name} (${cal} kcal, ${p}g P, ${c}g C, ${f}g F)`,
      );
    }

    return updatedLines.join("\n");
  };

  const handleAddFoodToMeal = (food: FoodItem, weightInGrams: number) => {
    if (activeMealKey === "breakfast") {
      onBreakfastTextChange(
        mergeFoodIntoMealText(breakfastText, food, weightInGrams),
      );
    } else if (activeMealKey === "lunch") {
      onLunchTextChange(mergeFoodIntoMealText(lunchText, food, weightInGrams));
    } else if (activeMealKey === "dinner") {
      onDinnerTextChange(mergeFoodIntoMealText(dinnerText, food, weightInGrams));
    } else if (activeMealKey === "snack") {
      onSnackTextChange(mergeFoodIntoMealText(snackText, food, weightInGrams));
    }
  };

  return (
    <section className="space-y-6">
      {/* Target Macros Settings */}
      <div className="bento-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
              Mục Tiêu Dinh Dưỡng & Phân Chia Bữa Ăn
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Thiết lập mục tiêu calo, macro và chỉ định thực đơn từng bữa cho
              học viên
            </p>
          </div>

          <button
            type="button"
            onClick={onSaveNutrition}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary text-dark-slate font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 cursor-pointer transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? "Đang lưu..." : "Lưu kế hoạch"}
          </button>
        </div>

        {/* Macro Inputs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-surface-bright/40 border border-white/10 space-y-1.5 hover:border-primary/30 transition-all">
            <span className="font-semibold text-on-surface-variant">
              Target Calo (Kcal)
            </span>
            <input
              type="number"
              placeholder="0"
              value={targetCalories === 0 ? "" : targetCalories}
              onChange={(e) =>
                onTargetCaloriesChange(
                  e.target.value === "" ? 0 : Number(e.target.value),
                )
              }
              className="w-full bg-surface-bright/60 border border-primary/40 rounded-xl px-3 py-2 text-primary font-extrabold text-base outline-none focus:border-primary focus:bg-surface-bright transition-all"
            />
          </div>

          <div className="p-4 rounded-2xl bg-surface-bright/40 border border-white/10 space-y-1.5 hover:border-amber-400/30 transition-all">
            <span className="font-semibold text-amber-400">
              Protein (Grams)
            </span>
            <input
              type="number"
              placeholder="0"
              value={targetProtein === 0 ? "" : targetProtein}
              onChange={(e) =>
                onTargetProteinChange(
                  e.target.value === "" ? 0 : Number(e.target.value),
                )
              }
              className="w-full bg-surface-bright/60 border border-amber-400/40 rounded-xl px-3 py-2 text-amber-400 font-extrabold text-base outline-none focus:border-amber-400 focus:bg-surface-bright transition-all"
            />
          </div>

          <div className="p-4 rounded-2xl bg-surface-bright/40 border border-white/10 space-y-1.5 hover:border-blue-400/30 transition-all">
            <span className="font-semibold text-blue-400">Carbs (Grams)</span>
            <input
              type="number"
              placeholder="0"
              value={targetCarbs === 0 ? "" : targetCarbs}
              onChange={(e) =>
                onTargetCarbsChange(
                  e.target.value === "" ? 0 : Number(e.target.value),
                )
              }
              className="w-full bg-surface-bright/60 border border-blue-400/40 rounded-xl px-3 py-2 text-blue-400 font-extrabold text-base outline-none focus:border-blue-400 focus:bg-surface-bright transition-all"
            />
          </div>

          <div className="p-4 rounded-2xl bg-surface-bright/40 border border-white/10 space-y-1.5 hover:border-rose-400/30 transition-all">
            <span className="font-semibold text-rose-400">Fat (Grams)</span>
            <input
              type="number"
              placeholder="0"
              value={targetFat === 0 ? "" : targetFat}
              onChange={(e) =>
                onTargetFatChange(
                  e.target.value === "" ? 0 : Number(e.target.value),
                )
              }
              className="w-full bg-surface-bright/60 border border-rose-400/40 rounded-xl px-3 py-2 text-rose-400 font-extrabold text-base outline-none focus:border-rose-400 focus:bg-surface-bright transition-all"
            />
          </div>
        </div>

        {/* Coach Advice / Note Section */}
        <div className="p-4 rounded-2xl bg-surface-bright/30 border border-white/10 space-y-2 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <label className="font-extrabold text-primary flex items-center gap-1.5 text-xs">
              <StickyNote size={15} />
              Ghi Chú & Lời Dặn Dò Của HLV
            </label>
            <span className="text-[11px] text-on-surface-variant">
              Tùy chọn
            </span>
          </div>
          <textarea
            rows={2}
            value={nutritionNote}
            onChange={(e) => onNutritionNoteChange(e.target.value)}
            placeholder="Ví dụ: Nhớ uống đủ 2.5L nước mỗi ngày, ăn chậm nhai kỹ và hạn chế nạp tinh bột nhanh sau 20h tối..."
            className="w-full bg-surface-bright/50 border border-white/10 rounded-xl p-3 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/60 focus:bg-surface-bright/80 outline-none resize-none font-medium leading-relaxed transition-all text-xs"
          />
        </div>

        {/* 4 Meal Slots Prescribed Plan */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="text-sm font-bold text-on-surface flex items-center gap-2">
              Phân Chia Thực Đơn Chi Tiết 4 Bữa
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Breakfast */}
            <div className="p-4 rounded-2xl bg-surface-bright/30 border border-white/10 space-y-2.5 hover:border-amber-400/30 transition-all">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-amber-400 flex items-center gap-2 text-xs">
                  Bữa Sáng
                </label>
                <button
                  type="button"
                  onClick={() => handleOpenFoodModal("breakfast")}
                  className="px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[11px] font-bold flex items-center gap-1 hover:bg-amber-400/20 transition-all cursor-pointer"
                >
                  <Plus size={13} />
                  Chọn món
                </button>
              </div>
              <textarea
                rows={3}
                value={breakfastText}
                onChange={(e) => onBreakfastTextChange(e.target.value)}
                placeholder="Ví dụ: + 100g Yến mạch (389 kcal)&#10;+ 2 Quả trứng luộc..."
                className="w-full bg-surface-bright/50 border border-white/10 rounded-xl p-3 text-on-surface placeholder:text-on-surface-variant/40 focus:border-amber-400/60 focus:bg-surface-bright/80 outline-none resize-none font-medium leading-relaxed transition-all"
              />
            </div>

            {/* Lunch */}
            <div className="p-4 rounded-2xl bg-surface-bright/30 border border-white/10 space-y-2.5 hover:border-orange-400/30 transition-all">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-orange-400 flex items-center gap-2 text-xs">
                  Bữa Trưa
                </label>
                <button
                  type="button"
                  onClick={() => handleOpenFoodModal("lunch")}
                  className="px-2.5 py-1 rounded-lg bg-orange-400/10 border border-orange-400/30 text-orange-400 text-[11px] font-bold flex items-center gap-1 hover:bg-orange-400/20 transition-all cursor-pointer"
                >
                  <Plus size={13} />
                  Chọn món
                </button>
              </div>
              <textarea
                rows={3}
                value={lunchText}
                onChange={(e) => onLunchTextChange(e.target.value)}
                placeholder="Ví dụ: + 150g Ức gà áp chảo (248 kcal)&#10;+ 150g Cơm gạo lứt..."
                className="w-full bg-surface-bright/50 border border-white/10 rounded-xl p-3 text-on-surface placeholder:text-on-surface-variant/40 focus:border-orange-400/60 focus:bg-surface-bright/80 outline-none resize-none font-medium leading-relaxed transition-all"
              />
            </div>

            {/* Dinner */}
            <div className="p-4 rounded-2xl bg-surface-bright/30 border border-white/10 space-y-2.5 hover:border-indigo-400/30 transition-all">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-indigo-400 flex items-center gap-2 text-xs">
                  Bữa Tối
                </label>
                <button
                  type="button"
                  onClick={() => handleOpenFoodModal("dinner")}
                  className="px-2.5 py-1 rounded-lg bg-indigo-400/10 border border-indigo-400/30 text-indigo-400 text-[11px] font-bold flex items-center gap-1 hover:bg-indigo-400/20 transition-all cursor-pointer"
                >
                  <Plus size={13} />
                  Chọn món
                </button>
              </div>
              <textarea
                rows={3}
                value={dinnerText}
                onChange={(e) => onDinnerTextChange(e.target.value)}
                placeholder="Ví dụ: + 150g Thăn bò nướng (375 kcal)&#10;+ 150g Khoai lang..."
                className="w-full bg-surface-bright/50 border border-white/10 rounded-xl p-3 text-on-surface placeholder:text-on-surface-variant/40 focus:border-indigo-400/60 focus:bg-surface-bright/80 outline-none resize-none font-medium leading-relaxed transition-all"
              />
            </div>

            {/* Snack */}
            <div className="p-4 rounded-2xl bg-surface-bright/30 border border-white/10 space-y-2.5 hover:border-emerald-400/30 transition-all">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-emerald-400 flex items-center gap-2 text-xs">
                  Bữa Phụ
                </label>
                <button
                  type="button"
                  onClick={() => handleOpenFoodModal("snack")}
                  className="px-2.5 py-1 rounded-lg bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-400/20 transition-all cursor-pointer"
                >
                  <Plus size={13} />
                  Chọn món
                </button>
              </div>
              <textarea
                rows={3}
                value={snackText}
                onChange={(e) => onSnackTextChange(e.target.value)}
                placeholder="Ví dụ: + 1 Quả táo (52 kcal)&#10;+ 1 Muỗng Whey Protein Isolate..."
                className="w-full bg-surface-bright/50 border border-white/10 rounded-xl p-3 text-on-surface placeholder:text-on-surface-variant/40 focus:border-emerald-400/60 focus:bg-surface-bright/80 outline-none resize-none font-medium leading-relaxed transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Pt Food Selection Modal */}
      <PtFoodSelectionModal
        isOpen={isFoodModalOpen}
        onClose={() => setIsFoodModalOpen(false)}
        targetMealName={mealTitleMap[activeMealKey]}
        onAddFoodToMeal={handleAddFoodToMeal}
      />
    </section>
  );
};

export default StudentNutritionTab;
