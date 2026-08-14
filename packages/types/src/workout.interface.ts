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
  category?: string | null;
  force?: string | null;
  level?: string | null;
  mechanic?: string | null;
  equipment?: string | null;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
  setupImageUrl?: string | null;
  startImageUrl?: string | null;
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
