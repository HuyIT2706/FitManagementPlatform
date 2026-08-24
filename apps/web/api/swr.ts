'use client';

import useSWR, { type SWRConfiguration } from 'swr';
import apiClient from './axios';
import type { UserDataHome, PTDashboardData } from '../interface';
import type { PTCodeQrData } from '@repo/types';

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
