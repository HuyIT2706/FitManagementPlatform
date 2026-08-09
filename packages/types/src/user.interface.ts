export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface UserData {
  id?: string;
  fullName?: string;
  avatarUrl?: string | null;
  email?: string;
  role?: string;
}

export interface OnboardingData {
  age: number | null;
  gender: string | null;
  weight: number | null;
  targetWeight: number | null;
  height: number | null;
  activityLevel: string | null;
  mealFrequency: number | null;
  dietaryPreferences: string[];
  healthConditions: string[];
  pushNotifications: boolean;
}

export interface NutritionTarget {
  id?: string;
  studentId?: string;
  targetCalo?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  effectiveDate?: Date | string;
}

export interface UserDataHome extends UserData {
  mealFrequency?: number;
  nutritionTargets?: NutritionTarget[];
}
