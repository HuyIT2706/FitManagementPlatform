"use client";

import { ArrowLeft } from "lucide-react";
import type { AddMealHeaderProps } from "../../../interface";

const AddMealHeader = ({
  mealTitle,
  addedItemsCount,
  isSaving,
  onBack,
  onSaveMeal,
}: AddMealHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 flex items-center gap-4">
      <button
        type="button"
        suppressHydrationWarning
        onClick={onBack}
        className="p-2 rounded-full hover:bg-white/10 text-on-surface transition-colors cursor-pointer"
        aria-label="Quay lại"
      >
        <ArrowLeft size={20} />
      </button>

      <h1 className="text-xl font-bold font-headline-md flex-1 text-on-surface">
        Thêm {mealTitle}
      </h1>

      {addedItemsCount > 0 && (
        <button
          type="button"
          suppressHydrationWarning
          onClick={onSaveMeal}
          disabled={isSaving}
          className="px-5 py-2 bg-primary text-black rounded-full font-bold text-sm hover:opacity-90 transition-opacity shadow-[0_0_12px_rgba(102,200,28,0.4)] cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
        >
          {isSaving ? "Đang lưu..." : "Lưu lại"}
        </button>
      )}
    </header>
  );
};

export default AddMealHeader;
