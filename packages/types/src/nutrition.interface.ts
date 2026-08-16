export interface FoodItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number | null;
  sugarPer100g?: number | null;
  saturatedFatPer100g?: number | null;
  transFatPer100g?: number | null;
  waterPer100g?: number | null;
  calciumPer100g?: number | null;
  ironPer100g?: number | null;
  potassiumPer100g?: number | null;
  magnesiumPer100g?: number | null;
  sodiumPer100g?: number | null;
  vitaminAPer100g?: number | null;
  vitaminCPer100g?: number | null;
  vitaminDPer100g?: number | null;
  vitaminEPer100g?: number | null;
  conAxitPer100g?: number | null;
  source?: string | null;
  imageUrl?: string | null;
}

export interface MealItemData {
  id?: string;
  mealLogId?: string;
  foodLibraryId?: string | null;
  foodName: string;
  weightInGram: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealData {
  id?: string;
  userId?: string;
  mealName: string;
  logDate?: Date | string;
  totalCalories: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
  items?: MealItemData[];
}

export interface MealSummaryItem {
  mealName: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  items: Array<{
    foodName: string;
    weightInGram: number;
    calories?: number;
  }>;
}

export interface MealSlotConfig {
  id: string;
  name: string;
  icon?: string;
}

export interface NutritionTargetSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionProgress {
  caloriesPercent: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  strokeDashoffset: number;
  remainingCalories: number;
}

export interface StreakData {
  currentStreak: number;
  totalLoggedDays: number;
  loggedDates: string[];
}

export interface DailyNutritionData {
  date?: string;
  targets?: NutritionTargetSummary;
  consumed?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  progress?: NutritionProgress;
  streak?: StreakData;
  mealSlots?: MealSlotConfig[];
  meals?: MealData[];
  mealSummary?: Record<string, MealSummaryItem>;
}
