import type { MealSlotConfig } from './IHome';

export interface MonthCell {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
}

export interface HistoryStreakHeroCardProps {
  streakDays: number;
  calorieComplianceDays: number;
  totalTrackingDays: number;
  hasPt: boolean;
  checkedInPtSessions: number;
  totalPtSessions: number;
  ptAttendancePercent: number;
}

export interface HistoryMonthCalendarProps {
  currentMonth: Date;
  selectedDate: Date;
  monthCells: MonthCell[];
  loggedDates: string[];
  monthNames: string[];
  isSelectedDateToday: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: Date) => void;
  onGoToToday: () => void;
  isSameDay: (d1: Date, d2: Date) => boolean;
}

export interface HistoryNutritionDetailsProps {
  selectedDate: Date;
  isSelectedDateToday: boolean;
  consumedCalo: number;
  targetCalo: number;
  totalCaloPercent: number;
  consumedProtein: number;
  targetProtein: number;
  proteinPercent: number;
  consumedCarbs: number;
  targetCarbs: number;
  carbsPercent: number;
  consumedFat: number;
  targetFat: number;
  fatPercent: number;
  mealSlots: MealSlotConfig[];
  getMealDetails: (type: string) => {
    totalCalories: number;
    items: Array<{ foodName: string; weightInGram: number }>;
  };
  dailyLoading: boolean;
}
