export type ExerciseCategoryType =
  | "ALL"
  | "CHEST"
  | "BACK"
  | "LEGS"
  | "SHOULDERS"
  | "ARMS"
  | "ABS"
  | "CARDIO"
  | "FULL_BODY";

export interface ExerciseItem {
  id: string;
  name: string;
  category: ExerciseCategoryType;
  categoryName: string;
  imageUrl: string;
  description?: string;
  sets?: number;
  reps?: number;
  weightInKg?: number;
  durationMinutes?: number;
  caloriesBurn?: number;
}

export interface ExercisePaginatedResponse {
  data: ExerciseItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MealPlanAssigned {
  coachName: string;
  coachAvatar?: string;
  coachAdvice: string;
  meals: Array<{
    name: string;
    kcal: number;
    description: string;
    icon: string;
  }>;
  totalKcal: number;
  targetKcal: number;
}
