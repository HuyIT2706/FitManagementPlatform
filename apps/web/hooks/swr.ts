import useSWR, { type SWRConfiguration, mutate as globalMutate } from 'swr';
import apiClient from '../api/axios';
import { readSwrCache, writeSwrCache } from '../utils/swrCache';
import { formatYYYYMMDD } from '../utils/date';
import type {
  UserDataHome,
  PTDashboardData,
  DailyNutritionData,
  MealPlanAssigned,
  AssignedWorkoutPlanData,
  ExerciseDetailResponse,
  ExercisePaginatedResponse,
  NotificationItem,
} from '../interface';
import type { PTCodeQrData, PTSessionItem } from '@repo/types';

// Base SWR fetcher
export const swrFetcher = async <T>(url: string): Promise<T> => {
  const res = await apiClient.get<T>(url);
  return res.data;
};

// Global SWR defaults: deduplicate requests within 30s across tab navigation
const DEFAULT_SWR_OPTIONS: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateIfStale: false,
  revalidateOnReconnect: false,
  dedupingInterval: 30000,
  errorRetryCount: 3,
};

// Auth token check helper
function useHasToken(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem('jwt_token'));
}

// Prefetch `/users/me` into SWR cache to prevent render waterfalls
export const prefetchCurrentUser = (): void => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('jwt_token')) return;
  void globalMutate('/users/me', () => swrFetcher<UserDataHome>('/users/me'), {
    revalidate: false,
  });
};
// Hydrates SWR cache from sessionStorage after mount without causing SSR mismatch
export const hydrateSwrSnapshotCache = (): void => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('jwt_token')) return;

  const cachedUser = readSwrCache<UserDataHome>('me');
  if (cachedUser) {
    void globalMutate('/users/me', cachedUser, { revalidate: false });
  }

  const todayStr = formatYYYYMMDD(new Date());
  const cachedDaily = readSwrCache<DailyNutritionData>(`daily_${todayStr}`);
  if (cachedDaily) {
    void globalMutate(`/nutrition/daily?date=${todayStr}`, cachedDaily, {
      revalidate: false,
    });
  }
};

export const useCurrentUser = (options?: SWRConfiguration) => {
  const hasToken = useHasToken();
  return useSWR<UserDataHome>(
    hasToken ? '/users/me' : null,
    swrFetcher,
    {
      ...DEFAULT_SWR_OPTIONS,
      revalidateIfStale: true,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      keepPreviousData: true,
      dedupingInterval: 10000,
      onSuccess: (data) => {
        writeSwrCache('me', data);
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
    {
      ...DEFAULT_SWR_OPTIONS,
      revalidateIfStale: false,
      dedupingInterval: 300000, // 5 minutes cache
      ...options,
    }
  );
};

export const useDailyNutrition = (dateStr?: string, options?: SWRConfiguration) => {
  const hasToken = useHasToken();
  const url = hasToken && dateStr ? `/nutrition/daily?date=${dateStr}` : null;
  return useSWR<DailyNutritionData>(
    url,
    swrFetcher,
    {
      ...DEFAULT_SWR_OPTIONS,
      revalidateIfStale: false,
      keepPreviousData: true,
      dedupingInterval: 120000,
      onSuccess: (data) => {
        if (dateStr) {
          writeSwrCache(`daily_${dateStr}`, data);
        }
      },
      ...options,
    }
  );
};

export const useAssignedMealPlan = (options?: SWRConfiguration) => {
  const hasToken = useHasToken();
  return useSWR<MealPlanAssigned | null>(
    hasToken ? '/workout/assigned-meal-plan' : null,
    swrFetcher,
    {
      ...DEFAULT_SWR_OPTIONS,
      revalidateIfStale: true,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
      ...options,
    }
  );
};

export const useAssignedWorkoutPlan = (options?: SWRConfiguration) => {
  const hasToken = useHasToken();
  return useSWR<AssignedWorkoutPlanData | null>(
    hasToken ? '/workout/assigned-workout-plan' : null,
    swrFetcher,
    {
      ...DEFAULT_SWR_OPTIONS,
      revalidateIfStale: true,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
      ...options,
    }
  );
};

export const useExerciseLibrary = (
  page = 1,
  limit = 8,
  muscle = 'ALL',
  search = '',
  options?: SWRConfiguration
) => {
  const hasToken = useHasToken();
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (muscle && muscle !== 'ALL') params.set('muscle', muscle);
  if (search.trim()) params.set('search', search.trim());

  return useSWR<ExercisePaginatedResponse>(
    hasToken ? `/workout/exercises?${params.toString()}` : null,
    swrFetcher,
    {
      ...DEFAULT_SWR_OPTIONS,
      dedupingInterval: 30000,
      keepPreviousData: true,
      ...options,
    }
  );
};

export const useExerciseDetail = (
  id?: string | null,
  options?: SWRConfiguration
) => {
  const hasToken = useHasToken();
  const encodedId = id ? encodeURIComponent(id) : null;
  return useSWR<ExerciseDetailResponse>(
    hasToken && encodedId ? `/workout/exercises/${encodedId}` : null,
    swrFetcher,
    {
      ...DEFAULT_SWR_OPTIONS,
      dedupingInterval: 60000,
      ...options,
    }
  );
};

export const usePtDashboard = (options?: SWRConfiguration) => {
  const hasToken = useHasToken();
  return useSWR<PTDashboardData>(
    hasToken ? '/pt/dashboard' : null,
    swrFetcher,
    {
      ...DEFAULT_SWR_OPTIONS,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      ...options,
    }
  );
};

export const usePtCodeQr = (options?: SWRConfiguration) => {
  const hasToken = useHasToken();
  return useSWR<PTCodeQrData>(
    hasToken ? '/pt/code-qr' : null,
    swrFetcher,
    {
      ...DEFAULT_SWR_OPTIONS,
      dedupingInterval: 3600000,
      revalidateIfStale: false,
      ...options,
    }
  );
};

export const usePtSchedule = (
  startDate?: string,
  endDate?: string,
  options?: SWRConfiguration
) => {
  const hasToken = useHasToken();
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  const query = params.toString() ? `?${params.toString()}` : '';

  return useSWR<PTSessionItem[]>(
    hasToken ? `/pt/schedule${query}` : null,
    swrFetcher,
    {
      ...DEFAULT_SWR_OPTIONS,
      revalidateIfStale: true,
      dedupingInterval: 5000,
      ...options,
    }
  );
};

export const usePtScheduleSessions = usePtSchedule;

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

function getNotificationRefreshInterval(): number {
  if (typeof document === 'undefined') return 0;
  return document.visibilityState === 'hidden' ? 0 : 30000;
}

export const useNotifications = (options?: SWRConfiguration) => {
  const hasToken = useHasToken();
  return useSWR<NotificationsResponse>(
    hasToken ? '/notifications' : null,
    swrFetcher,
    {
      ...DEFAULT_SWR_OPTIONS,
      refreshInterval: getNotificationRefreshInterval,
      shouldRetryOnError: false,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      ...options,
    }
  );
};

// Sync user session & refreshed JWT into local storage & SWR cache
export const syncUserSession = async (): Promise<UserDataHome | null> => {
  if (typeof window === 'undefined') return null;
  try {
    const res = await apiClient.post<{
      access_token: string;
      user: UserDataHome;
      isPendingPtApproval?: boolean;
    }>('/auth/sync-session');
    if (res.data?.access_token) {
      localStorage.setItem('jwt_token', res.data.access_token);
      await globalMutate('/users/me', res.data.user, true);
      return res.data.user;
    }
    return null;
  } catch (err) {
    console.warn('Sync session failed:', err);
    return null;
  }
};
