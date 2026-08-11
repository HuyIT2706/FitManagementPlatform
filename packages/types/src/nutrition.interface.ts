export interface FoodItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
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
  icon: string;
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
  mealSlots?: MealSlotConfig[];
  meals?: MealData[];
  mealSummary?: Record<string, MealSummaryItem>;
}
