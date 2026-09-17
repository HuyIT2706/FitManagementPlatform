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

export interface OnboardingStepProps {
  store: any;
}

export type StepAgeProps = OnboardingStepProps;
export type StepGenderProps = OnboardingStepProps;
export type StepWeightProps = OnboardingStepProps;
export type StepHeightProps = OnboardingStepProps;
export type StepActivityProps = OnboardingStepProps;
export type StepBMIProps = OnboardingStepProps;
export type StepCalorieOffsetProps = OnboardingStepProps;
export type StepMealProps = OnboardingStepProps;
export type StepDietProps = OnboardingStepProps;
export type StepHealthProps = OnboardingStepProps;
export type StepNotifyProps = OnboardingStepProps;
