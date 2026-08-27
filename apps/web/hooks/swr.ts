import useSWR, { type SWRConfiguration } from 'swr';
import apiClient from '../api/axios';
import type {
  UserDataHome,
  PTDashboardData,
  DailyNutritionData,
  MealPlanAssigned,
  AssignedWorkoutPlanData,
  ExercisePaginatedResponse,
} from '../interface';
import type { PTCodeQrData, PTSessionItem } from '@repo/types';

export const swrFetcher = async <T>(url: string): Promise<T> => {
  const res = await apiClient.get<T>(url);
  return res.data;
};

const DEFAULT_SWR_OPTIONS: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateIfStale: true,
  dedupingInterval: 4000,
};

export const useCurrentUser = (options?: SWRConfiguration) => {
  return useSWR<UserDataHome>(
    '/users/me',
    swrFetcher,
    { ...DEFAULT_SWR_OPTIONS, ...options }
  );
};

export const useDailyNutrition = (dateStr?: string, options?: SWRConfiguration) => {
  const url = dateStr ? `/nutrition/daily?date=${dateStr}` : null;
  return useSWR<DailyNutritionData>(
    url,
    swrFetcher,
    { ...DEFAULT_SWR_OPTIONS, ...options }
  );
};

export const useAssignedMealPlan = (options?: SWRConfiguration) => {
  return useSWR<MealPlanAssigned | null>(
    '/workout/assigned-meal-plan',
    swrFetcher,
    { ...DEFAULT_SWR_OPTIONS, ...options }
  );
};

export const useAssignedWorkoutPlan = (options?: SWRConfiguration) => {
  return useSWR<AssignedWorkoutPlanData | null>(
    '/workout/assigned-workout-plan',
    swrFetcher,
    { ...DEFAULT_SWR_OPTIONS, ...options }
  );
};

export const useExerciseLibrary = (
  page = 1,
  limit = 8,
  muscle = 'ALL',
  search = '',
  options?: SWRConfiguration
) => {
  const query = `?page=${page}&limit=${limit}&muscle=${muscle}&search=${encodeURIComponent(search)}`;
  return useSWR<ExercisePaginatedResponse>(
    `/workout/exercises${query}`,
    swrFetcher,
    { ...DEFAULT_SWR_OPTIONS, ...options }
  );
};

export const usePtDashboard = (options?: SWRConfiguration) => {
  return useSWR<PTDashboardData>(
    '/pt/dashboard',
    swrFetcher,
    { ...DEFAULT_SWR_OPTIONS, ...options }
  );
};

export const usePtCodeQr = (options?: SWRConfiguration) => {
  return useSWR<PTCodeQrData>(
    '/pt/code-qr',
    swrFetcher,
    { ...DEFAULT_SWR_OPTIONS, ...options }
  );
};

export const usePtSchedule = (startDate?: string, endDate?: string, options?: SWRConfiguration) => {
  const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : '';
  return useSWR<PTSessionItem[]>(
    `/pt/schedule${query}`,
    swrFetcher,
    { ...DEFAULT_SWR_OPTIONS, ...options }
  );
};
