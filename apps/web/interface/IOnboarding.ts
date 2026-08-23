export interface OnboardingFormData {
  birthYear: number;
  gender: string | null;
  weight: number | null;
  targetWeight: number | null;
  height: number | null;
  activityLevel: string | null;
  caloriesOffset: number;
  mealFrequency: number | null;
  dietaryPreferences: string[];
  healthConditions: string[];
  pushNotifications: boolean;
}

export interface CalorieOffsetOption {
  offset: number;
  title: string;
  recommended: boolean;
  desc: string;
}

export interface BMIPreviewResult {
  bmi: number;
  bmiCategory: string;
  bmiColor: string;
  bmiDescription: string;
}
