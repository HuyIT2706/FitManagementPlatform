'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { mutate } from 'swr';
import {
  autoSyncPushSubscription,
  registerServiceWorker,
} from '../../utils/pushNotification';
import { hydrateSwrSnapshotCache } from '../../hooks/swr';
import { AUTH_CHANGED_EVENT } from '../../api/axios';
import { startNotificationStream } from '../../utils/notificationStream';

export default function PushNotificationSync() {
  const pathname = usePathname();
  const activeTokenRef = useRef<string | null>(null);
  const stopStreamRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    hydrateSwrSnapshotCache();

    const isNative =
      typeof window !== 'undefined' &&
      (navigator.userAgent.includes('NutriCoreApp') ||
        Boolean(
          (
            window as unknown as {
              Capacitor?: { isNativePlatform?: () => boolean };
            }
          ).Capacitor?.isNativePlatform?.(),
        ));

    if (isNative) return;

    void registerServiceWorker();
    void autoSyncPushSubscription();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncStreamConnection = () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        stopStreamRef.current?.();
        stopStreamRef.current = null;
        activeTokenRef.current = null;
        return;
      }

      if (activeTokenRef.current === token && stopStreamRef.current) {
        return;
      }

      stopStreamRef.current?.();
      activeTokenRef.current = token;
      stopStreamRef.current = startNotificationStream();
    };

    syncStreamConnection();

    const handleResumeSync = () => {
      syncStreamConnection();
      if (!localStorage.getItem('jwt_token')) return;
      void mutate('/notifications');
      void mutate('/users/me');
      if (pathname?.startsWith('/pt')) {
        void mutate('/pt/dashboard');
      }
      if (pathname?.startsWith('/training') || pathname?.startsWith('/profile')) {
        void mutate('/workout/assigned-meal-plan');
        void mutate('/workout/assigned-workout-plan');
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'jwt_token') {
        syncStreamConnection();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleResumeSync();
      }
    };

    window.addEventListener(AUTH_CHANGED_EVENT, syncStreamConnection);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleResumeSync);
    window.addEventListener('online', handleResumeSync);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncStreamConnection);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleResumeSync);
      window.removeEventListener('online', handleResumeSync);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [pathname]);

  useEffect(() => {
    return () => {
      stopStreamRef.current?.();
      stopStreamRef.current = null;
      activeTokenRef.current = null;
    };
  }, []);

  return null;
}
