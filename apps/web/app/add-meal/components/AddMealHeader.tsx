"use client";

import { ArrowLeft, ChevronDown, Mic, Camera } from "lucide-react";
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
  onOpenCameraInput,
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
        {onOpenCameraInput && (
          <button
            type="button"
            suppressHydrationWarning
            onClick={onOpenCameraInput}
            className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-[#82c91e] transition-colors cursor-pointer"
            title="Chụp ảnh món ăn AI"
          >
            <Camera size={18} />
          </button>
        )}
        {onOpenSmartInput && (
          <button
            type="button"
            suppressHydrationWarning
            onClick={onOpenSmartInput}
            className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-blue-500 transition-colors cursor-pointer"
            title="Nhập bằng giọng nói"
          >
            <Mic size={18} />
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
        ): ""}
      </div>
    </header>
  );
};

export default AddMealHeader;
