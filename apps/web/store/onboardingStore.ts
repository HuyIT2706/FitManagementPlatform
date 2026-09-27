import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { OnboardingData } from '@repo/types';

export interface OnboardingState extends OnboardingData {
  currentStep: number;
  birthYear: number | null;

  // Actions
  setCurrentStep: (step: number) => void;
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
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 1,
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

      setCurrentStep: (currentStep) => set({ currentStep }),
      setBirthYear: (birthYear) => set({ birthYear }),
      setGender: (gender) => set({ gender }),
      setWeight: (weight) => set({ weight }),
      setTargetWeight: (targetWeight) => set({ targetWeight }),
      setHeight: (height) => set({ height }),
      setActivityLevel: (activityLevel) => set({ activityLevel }),
      setCaloriesOffset: (caloriesOffset) => set({ caloriesOffset }),
      setMealFrequency: (mealFrequency) => set({ mealFrequency }),
      toggleDietaryPreference: (preference) =>
        set((state) => ({
          dietaryPreferences: state.dietaryPreferences.includes(preference)
            ? state.dietaryPreferences.filter((p) => p !== preference)
            : [...state.dietaryPreferences, preference],
        })),
      toggleHealthCondition: (condition) =>
        set((state) => ({
          healthConditions: state.healthConditions.includes(condition)
            ? state.healthConditions.filter((c) => c !== condition)
            : [...state.healthConditions, condition],
        })),
      setPushNotifications: (pushNotifications) => set({ pushNotifications }),
      resetOnboarding: () =>
        set({
          currentStep: 1,
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
        }),
    }),
    {
      name: 'nutricore_onboarding_storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
