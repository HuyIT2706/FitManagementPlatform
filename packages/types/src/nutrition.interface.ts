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

export interface DailyNutritionData {
  date?: string;
  consumed?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  meals?: MealData[];
}
