"use client";

import React from "react";
import { Plus } from "lucide-react";
import type { ContentLibraryTabNavProps } from "../../../../interface";

const ContentLibraryTabNav = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
}: ContentLibraryTabNavProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 bg-[#121a15] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/10" suppressHydrationWarning>
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => onTabChange("EXERCISES")}
          className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center whitespace-nowrap ${
            activeTab === "EXERCISES"
              ? "bg-[#10b981] text-[#003824] shadow-md shadow-[#10b981]/20"
              : "text-white/60 hover:text-white"
          }`}
        >
          Thư Viện Bài Tập
        </button>

        <button
          type="button"
          suppressHydrationWarning
          onClick={() => onTabChange("FOODS")}
          className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center whitespace-nowrap ${
            activeTab === "FOODS"
              ? "bg-[#10b981] text-[#003824] shadow-md shadow-[#10b981]/20"
              : "text-white/60 hover:text-white"
          }`}
        >
          Thư Viện Món Ăn
        </button>
      </div>

      <button
        type="button"
        suppressHydrationWarning
        onClick={onOpenAddModal}
        className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl bg-[#10b981] text-[#003824] text-xs font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:opacity-90 transition-opacity cursor-pointer shrink-0 w-full sm:w-auto text-center"
      >
        <Plus size={16} />
        {activeTab === "EXERCISES" ? "Thêm bài tập mới" : "Thêm món ăn mới"}
      </button>
    </div>
  );
};

export default ContentLibraryTabNav;
