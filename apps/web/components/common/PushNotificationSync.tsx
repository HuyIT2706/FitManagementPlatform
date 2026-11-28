'use client';

import { useEffect } from 'react';
import {
  autoSyncPushSubscription,
  registerServiceWorker,
} from '../../utils/pushNotification';
import { hydrateSwrSnapshotCache } from '../../hooks/swr';

export default function PushNotificationSync() {
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

  return null;
}
