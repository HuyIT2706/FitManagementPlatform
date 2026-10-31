'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { formatYYYYMMDD } from '../../../utils/date';

export interface MealOption {
  id: string;
  shortLabel: string;
  label: string;
}

export interface DateItemOption {
  dateStr: string;
  label: string;
  shortLabel: string;
  isToday: boolean;
}

export const MEAL_OPTIONS: MealOption[] = [
  { id: 'BREAKFAST', shortLabel: 'Sáng', label: 'Bữa Sáng' },
  { id: 'LUNCH', shortLabel: 'Trưa', label: 'Bữa Trưa' },
  { id: 'DINNER', shortLabel: 'Tối', label: 'Bữa Tối' },
  { id: 'SNACK', shortLabel: 'Phụ', label: 'Bữa Phụ' },
];

// Generates past 7 days up to today (quá khứ không quá 1 tuần)
export const getPastWeekDateOptions = (): DateItemOption[] => {
  const options: DateItemOption[] = [];
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const today = new Date();

  // From 7 days ago up to today
  for (let i = 7; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const dateStr = formatYYYYMMDD(d);
    const dayOfWeek = dayNames[d.getDay()];
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const shortLabel = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
    const label =
      i === 0
        ? `Hôm nay, ${day} thg ${month}`
        : i === 1
          ? `Hôm qua, ${day} thg ${month}`
          : `${dayOfWeek}, ${day} thg ${month}`;

    options.push({
      dateStr,
      label,
      shortLabel,
      isToday: i === 0,
    });
  }

  return options;
};

interface MealDatePickerBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMeal: string;
  selectedDate: string;
  mealOptions?: MealOption[];
  onApply: (mealType: string, dateStr: string) => void;
}

export const MealDatePickerBottomSheet = ({
  isOpen,
  onClose,
  selectedMeal,
  selectedDate,
  mealOptions,
  onApply,
}: MealDatePickerBottomSheetProps) => {
  const [tempMeal, setTempMeal] = useState(selectedMeal);
  const [tempDate, setTempDate] = useState(selectedDate);

  const activeMealOptions =
    mealOptions && mealOptions.length > 0 ? mealOptions : MEAL_OPTIONS;
  const dateOptions = getPastWeekDateOptions();

  useEffect(() => {
    if (isOpen) {
      setTempMeal(selectedMeal);
      setTempDate(selectedDate);
    }
  }, [isOpen, selectedMeal, selectedDate]);

  const handleConfirm = () => {
    onApply(tempMeal, tempDate);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 transition-opacity"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white dark:bg-[#141b17] border-t border-slate-200 dark:border-white/15 rounded-t-[32px] p-5 sm:p-6 z-50 shadow-2xl text-slate-900 dark:text-white flex flex-col max-h-[85vh]"
          >
            {/* Drag Handle Bar */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-white/20 rounded-full mx-auto mb-3 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Chọn Bữa Ăn & Ngày
                </h3>
                <p className="text-xs text-slate-500 dark:text-white/60">
                  Ghi nhật ký tối đa trong 7 ngày gần nhất
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-white/80 transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            {/* Two-Column Picker: Left = Meal Type, Right = Date (Past 7 days up to today) */}
            <div className="py-4 grid grid-cols-2 gap-3 overflow-hidden flex-1">
              {/* Column 1: Bữa Ăn */}
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-400 dark:text-white/50 uppercase tracking-wider mb-2 px-1">
                  Bữa ăn
                </span>
                <div className="space-y-1.5 overflow-y-auto max-h-[260px] pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {activeMealOptions.map((m) => {
                    const isSelected = tempMeal === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setTempMeal(m.id)}
                        className={`w-full py-2.5 px-3 rounded-2xl text-left font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/40 shadow-xs'
                            : 'text-slate-700 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <span className="truncate">{m.label}</span>
                        {isSelected && <Check size={14} className="shrink-0 text-[#10b981]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Ngày (Tối đa 1 tuần trước) */}
              <div className="flex flex-col border-l border-slate-100 dark:border-white/10 pl-3">
                <span className="text-[11px] font-bold text-slate-400 dark:text-white/50 uppercase tracking-wider mb-2 px-1">
                  Ngày ghi
                </span>
                <div className="space-y-1.5 overflow-y-auto max-h-[260px] pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {dateOptions.map((d) => {
                    const isSelected = tempDate === d.dateStr;
                    return (
                      <button
                        key={d.dateStr}
                        type="button"
                        onClick={() => setTempDate(d.dateStr)}
                        className={`w-full py-2.5 px-3 rounded-2xl text-left font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/40 shadow-xs'
                            : 'text-slate-700 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <span className="truncate">{d.label}</span>
                        {isSelected && <Check size={14} className="shrink-0 text-[#10b981]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Save Button */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/10 shrink-0">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-black font-extrabold text-sm sm:text-base rounded-full transition-all shadow-[0_0_15px_rgba(102,200,28,0.35)] cursor-pointer active:scale-98"
              >
                Lưu lại
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MealDatePickerBottomSheet;
