export interface UserDataHome {
  id: string;
  name: string;
  avatar?: string;
  nutritionTargets?: Array<{
    targetCalo: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
  }>;
}

export interface DailyNutritionData {
  date: string;
  targets?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  consumed?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  progress?: {
    proteinPercent: number;
    carbsPercent: number;
    fatPercent: number;
    strokeDashoffset?: number;
    remainingCalories?: number;
  };
  mealSlots?: Array<{
    id: string;
    name: string;
    icon?: string;
  }>;
  mealSummary?: Record<
    string,
    {
      totalCalories: number;
      items: Array<{
        foodName: string;
        weightInGram: number;
        calories: number;
      }>;
    }
  >;
}

export interface MealItem {
  foodName: string;
  weightInGram: number;
}

export interface MealSlotConfig {
  id: string;
  name: string;
  icon?: string;
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
