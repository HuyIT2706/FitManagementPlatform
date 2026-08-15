import { create } from 'zustand';
import { OnboardingData } from '@repo/types';

export interface OnboardingState extends OnboardingData {
  birthYear: number | null;

  // Actions
  setBirthYear: (birthYear: number) => void;
  setGender: (gender: string) => void;
  setWeight: (weight: number) => void;
  setTargetWeight: (targetWeight: number) => void;
  setHeight: (height: number) => void;
  setActivityLevel: (level: string) => void;
  setCaloriesOffset: (offset: number) => void;
  setMealFrequency: (frequency: number) => void;
  toggleDietaryPreference: (preference: string) => void;
  toggleHealthCondition: (condition: string) => void;
  setPushNotifications: (enabled: boolean) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  birthYear: 2002,
  age: null,
  gender: null,
  weight: null,
  targetWeight: null,
  height: null,
  activityLevel: null,
  caloriesOffset: -400, 
  mealFrequency: null,
  dietaryPreferences: [],
  healthConditions: [],
  pushNotifications: true,

  setBirthYear: (birthYear) => set({ birthYear }),
  setGender: (gender) => set({ gender }),
  setWeight: (weight) => set({ weight }),
  setTargetWeight: (targetWeight) => set({ targetWeight }),
  setHeight: (height) => set({ height }),
  setActivityLevel: (activityLevel) => set({ activityLevel }),
  setCaloriesOffset: (caloriesOffset) => set({ caloriesOffset }),
  setMealFrequency: (mealFrequency) => set({ mealFrequency }),
  toggleDietaryPreference: (preference) => set((state) => ({
    dietaryPreferences: state.dietaryPreferences.includes(preference)
      ? state.dietaryPreferences.filter(p => p !== preference)
      : [...state.dietaryPreferences, preference]
  })),
  toggleHealthCondition: (condition) => set((state) => ({
    healthConditions: state.healthConditions.includes(condition)
      ? state.healthConditions.filter(c => c !== condition)
      : [...state.healthConditions, condition]
  })),
  setPushNotifications: (pushNotifications) => set({ pushNotifications }),
}));
