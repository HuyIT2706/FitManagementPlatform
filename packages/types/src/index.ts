export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
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
