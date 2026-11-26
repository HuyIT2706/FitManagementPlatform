import type { ActivityLogItem, MealSlotConfig } from '@repo/types';

export type {
  ActivityLogItem,
  UserDataHome,
  DailyNutritionData,
  MealSlotConfig,
} from '@repo/types';

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
  burnedCalories?: number;
  activities?: ActivityLogItem[];
  strokeDashoffset?: number;
  isSelectedDateToday: boolean;
  selectedDateFormatted: string;
  isFutureDate?: boolean;
  onOpenBurnModal?: () => void;
  onDeleteActivity?: (id: string) => void;
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
