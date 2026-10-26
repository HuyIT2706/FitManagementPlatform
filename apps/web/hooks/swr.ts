import useSWR, { type SWRConfiguration, mutate as globalMutate } from 'swr';
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

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

export const swrFetcher = async <T>(url: string): Promise<T> => {
  const res = await apiClient.get<T>(url);
  return res.data;
};

// ---------------------------------------------------------------------------
// Global SWR defaults — applied to all hooks unless overridden
// Increased dedupingInterval to 5s to prevent duplicate in-flight requests
// when multiple components mount simultaneously (e.g. page transitions)
// ---------------------------------------------------------------------------

const DEFAULT_SWR_OPTIONS: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateIfStale: true,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,   // was 2000 — 5s window prevents thundering herd on route change
  errorRetryCount: 3,
};

// ---------------------------------------------------------------------------
// useHasToken — single source of truth for auth gate
// Previously duplicated 5 times across hooks — now centralised.
// ---------------------------------------------------------------------------

function useHasToken(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem('jwt_token'));
}

// ---------------------------------------------------------------------------
// Prefetch helper — call this in root page.tsx INSTEAD of raw apiClient.get
// so the result is stored in SWR cache and reused by useCurrentUser()
// ---------------------------------------------------------------------------

export const prefetchCurrentUser = (): void => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('jwt_token')) return;
  // Trigger a SWR-managed fetch that populates the cache key '/users/me'
  void globalMutate('/users/me', () => swrFetcher<UserDataHome>('/users/me'), {
    revalidate: false, // trust the fetched value, no immediate re-fetch
  });
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export const useCurrentUser = (options?: SWRConfiguration) => {
  const hasToken = useHasToken();
  return useSWR<UserDataHome>(
    hasToken ? '/users/me' : null,
    swrFetcher,
    {
      ...DEFAULT_SWR_OPTIONS,
      revalidateIfStale: false, 
      dedupingInterval: 60000,  
      refreshInterval: (latestData) => {
        if (
          latestData?.assignedPt?.status === 'PENDING' ||
          latestData?.isPendingPtApproval
        ) {
          return 15000;
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
    {
      ...DEFAULT_SWR_OPTIONS,
      revalidateIfStale: false,
      dedupingInterval: 30000,
      ...options,
    }
  );
};

export const useDailyNutrition = (dateStr?: string, options?: SWRConfiguration) => {
  const url = dateStr ? `/nutrition/daily?date=${dateStr}` : null;
  return useSWR<DailyNutritionData>(
    url,
    swrFetcher,
    { ...DEFAULT_SWR_OPTIONS, keepPreviousData: true, ...options }
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
  const hasToken = useHasToken();
  return useSWR<PTDashboardData>(
    hasToken ? '/pt/dashboard' : null,
    swrFetcher,
    { ...DEFAULT_SWR_OPTIONS, ...options }
  );
};

export const usePtCodeQr = (options?: SWRConfiguration) => {
  const hasToken = useHasToken();
  return useSWR<PTCodeQrData>(
    hasToken ? '/pt/code-qr' : null,
    swrFetcher,
    { ...DEFAULT_SWR_OPTIONS, ...options }
  );
};

export const usePtSchedule = (startDate?: string, endDate?: string, options?: SWRConfiguration) => {
  const hasToken = useHasToken();
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

// Notification polling: only poll when the tab is visible to save server resources.
// 1000 concurrent users × 1 req/60s = 1000 req/min for notifications alone.
function getNotificationRefreshInterval(): number {
  if (typeof document === 'undefined') return 0;
  return document.visibilityState === 'hidden' ? 0 : 60000;
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
      // Resume polling when tab becomes visible again
      revalidateOnFocus: true,
      ...options,
    }
  );
};
