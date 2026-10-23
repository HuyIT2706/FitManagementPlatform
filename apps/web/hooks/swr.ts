import useSWR, { type SWRConfiguration } from 'swr';
import apiClient from '../api/axios';
import type {
  UserDataHome,
  PTDashboardData,
  DailyNutritionData,
  MealPlanAssigned,
  AssignedWorkoutPlanData,
  ExercisePaginatedResponse,
  NotificationItem,
} from '../interface';
import type { PTCodeQrData, PTSessionItem } from '@repo/types';

export const swrFetcher = async <T>(url: string): Promise<T> => {
  const res = await apiClient.get<T>(url);
  return res.data;
};

const DEFAULT_SWR_OPTIONS: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateIfStale: true,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
};

export const useCurrentUser = (options?: SWRConfiguration) => {
  const hasToken =
    typeof window !== 'undefined' && Boolean(localStorage.getItem('jwt_token'));
  return useSWR<UserDataHome>(
    hasToken ? '/users/me' : null,
    swrFetcher,
    {
      ...DEFAULT_SWR_OPTIONS,
      refreshInterval: (latestData) => {
        if (
          latestData?.assignedPt?.status === 'PENDING' ||
          latestData?.isPendingPtApproval
        ) {
          return 10000;
        }
        return 0;
      },
      ...options,
    }
  );
};

export interface BodyMetricItem {
  id: string;
  userId?: string;
  weight: number;
  height?: number | null;
  bodyFat?: number | null;
  muscleMass?: number | null;
  recordedAt: string | Date;
}

export const useBodyMetrics = (options?: SWRConfiguration) => {
  return useSWR<BodyMetricItem[]>(
    '/progress/metrics',
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
    { ...DEFAULT_SWR_OPTIONS, keepPreviousData: true, ...options }
  );
};

export const usePtDashboard = (options?: SWRConfiguration) => {
  const hasToken =
    typeof window !== 'undefined' && Boolean(localStorage.getItem('jwt_token'));
  return useSWR<PTDashboardData>(
    hasToken ? '/pt/dashboard' : null,
    swrFetcher,
    { ...DEFAULT_SWR_OPTIONS, ...options }
  );
};

export const usePtCodeQr = (options?: SWRConfiguration) => {
  const hasToken =
    typeof window !== 'undefined' && Boolean(localStorage.getItem('jwt_token'));
  return useSWR<PTCodeQrData>(
    hasToken ? '/pt/code-qr' : null,
    swrFetcher,
    { ...DEFAULT_SWR_OPTIONS, ...options }
  );
};

export const usePtSchedule = (startDate?: string, endDate?: string, options?: SWRConfiguration) => {
  const hasToken =
    typeof window !== 'undefined' && Boolean(localStorage.getItem('jwt_token'));
  const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : '';
  return useSWR<PTSessionItem[]>(
    hasToken ? `/pt/schedule${query}` : null,
    swrFetcher,
    { ...DEFAULT_SWR_OPTIONS, ...options }
  );
};

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export const useNotifications = (options?: SWRConfiguration) => {
  const hasToken =
    typeof window !== 'undefined' && Boolean(localStorage.getItem('jwt_token'));
  return useSWR<NotificationsResponse>(
    hasToken ? '/notifications' : null,
    swrFetcher,
    {
      ...DEFAULT_SWR_OPTIONS,
      refreshInterval: 60000,
      shouldRetryOnError: false,
      ...options,
    }
  );
};
