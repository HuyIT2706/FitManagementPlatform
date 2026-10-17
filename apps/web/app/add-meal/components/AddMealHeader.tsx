"use client";

import { ArrowLeft, ChevronDown, UtensilsCrossed, Sparkles } from "lucide-react";
import type { AddMealHeaderProps } from "../../../interface";

const AddMealHeader = ({
  mealTitle,
  mealShortName,
  displayDate,
  addedItemsCount,
  isSaving,
  onBack,
  onSaveMeal,
  onOpenMealDatePicker,
  onOpenSmartInput,
}: AddMealHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-background/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-xs transition-colors">
      {/* Left: Back Button */}
      <div className="w-16 flex items-center justify-start shrink-0">
        <button
          type="button"
          suppressHydrationWarning
          onClick={onBack}
          className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-on-surface transition-colors cursor-pointer"
          aria-label="Quay lại"
        >
          <ArrowLeft size={19} className="sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Center: Meal Title + Date Dropdown Button */}
      <div className="flex-1 flex items-center justify-center min-w-0 px-1">
        <button
          type="button"
          suppressHydrationWarning
          onClick={onOpenMealDatePicker}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-white/10 max-w-[220px] sm:max-w-sm"
          title="Nhấn để đổi bữa ăn hoặc ngày ghi nhật ký"
        >
          <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
            {mealShortName || mealTitle} {displayDate || ""}
          </span>
          <ChevronDown
            size={15}
            className="text-primary group-hover:translate-y-0.5 transition-transform shrink-0"
          />
        </button>
      </div>

      {/* Right: Dish Counter Badge (when 0) OR Save Button (when > 0) */}
      <div className="min-w-16 flex items-center justify-end shrink-0 gap-1">
        {onOpenSmartInput && (
          <button
            type="button"
            suppressHydrationWarning
            onClick={onOpenSmartInput}
            className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-emerald-500 dark:text-primary transition-colors cursor-pointer"
            title="Nhập bằng giọng nói hoặc nhiều món"
          >
            <Sparkles size={18} />
          </button>
        )}
        {addedItemsCount > 0 ? (
          <button
            type="button"
            suppressHydrationWarning
            onClick={onSaveMeal}
            disabled={isSaving}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-primary text-black rounded-full font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity shadow-[0_0_12px_rgba(102,200,28,0.4)] cursor-pointer flex items-center gap-1 disabled:opacity-50 shrink-0"
          >
            {isSaving ? "Đang lưu..." : `Lưu (${addedItemsCount})`}
          </button>
        ) : (
          <div
            className="relative p-2 text-slate-400 dark:text-white/40 flex items-center justify-center shrink-0 cursor-default"
            title="Chưa có món ăn nào được chọn"
          >
            <UtensilsCrossed size={18} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-slate-200 dark:bg-white/15 text-slate-700 dark:text-white/70 text-[10px] font-black flex items-center justify-center border border-white/20">
              0
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default AddMealHeader;
