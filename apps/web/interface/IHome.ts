import type { MealSlotConfig } from '@repo/types';

export type { UserDataHome, DailyNutritionData, MealSlotConfig } from '@repo/types';

export interface MealItem {
  foodName: string;
  weightInGram: number;
}

export interface CalendarStripProps {
  currentMonday: Date;
  selectedDate: Date;
  weekDays: Date[];
  dayLabelMap: string[];
  isSelectedDateToday: boolean;
  onSelectDate: (date: Date) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onGoToToday: () => void;
  isSameDay: (d1: Date, d2: Date) => boolean;
}

export interface DailyFuelHeroCardProps {
  consumedCalo: number;
  targetCalo: number;
  remainingCalories: number;
  strokeDashoffset?: number;
  isSelectedDateToday: boolean;
  selectedDateFormatted: string;
}

export interface MacroCardsProps {
  consumedProtein: number;
  targetProtein: number;
  proteinPercentage: number;
  consumedCarbs: number;
  targetCarbs: number;
  carbsPercentage: number;
  consumedFat: number;
  targetFat: number;
  fatPercentage: number;
}

export interface DailyMealGridProps {
  mealSlots: MealSlotConfig[];
  getMealDetails: (type: string) => {
    totalCalories: number;
    items: MealItem[];
  };
  selectedDateFormattedStr: string;
}
