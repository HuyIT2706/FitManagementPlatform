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
// Global SWR defaults — persistent caching to avoid redundant calls on tab switch
// ---------------------------------------------------------------------------

const DEFAULT_SWR_OPTIONS: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateIfStale: false,
  revalidateOnReconnect: false,
  dedupingInterval: 30000, // 30s deduping window prevents spamming on rapid navigation
  errorRetryCount: 3,
};

// ---------------------------------------------------------------------------
// useHasToken — single source of truth for auth gate
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
  void globalMutate('/users/me', () => swrFetcher<UserDataHome>('/users/me'), {
    revalidate: false,
  });
};
export const useCurrentUser = (options?: SWRConfiguration) => {
  const hasToken = useHasToken();
  return useSWR<UserDataHome>(
    hasToken ? '/users/me' : null,
    swrFetcher,
    {
      ...DEFAULT_SWR_OPTIONS,
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
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
  const url = dateStr ? `/nutrition/daily?date=${dateStr}` : null;
  return useSWR<DailyNutritionData>(
    url,
    swrFetcher,
    {
      ...DEFAULT_SWR_OPTIONS,
      revalidateIfStale: false,
      keepPreviousData: true,
      dedupingInterval: 60000, // 1 minute
      ...options,
    }
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
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (muscle && muscle !== 'ALL') params.set('muscle', muscle);
  if (search.trim()) params.set('search', search.trim());

  return useSWR<ExercisePaginatedResponse>(
    `/workout/exercises?${params.toString()}`,
    swrFetcher,
    {
      ...DEFAULT_SWR_OPTIONS,
      dedupingInterval: 30000,
      keepPreviousData: true,
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
      dedupingInterval: 30000,
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
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      ...options,
    }
  );
};

// ---------------------------------------------------------------------------
// syncUserSession — Call this to immediately sync role/session from DB/Supabase
// ---------------------------------------------------------------------------
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
