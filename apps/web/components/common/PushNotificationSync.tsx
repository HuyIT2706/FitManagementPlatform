'use client';

import { useEffect } from 'react';
import {
  autoSyncPushSubscription,
  registerServiceWorker,
} from '../../utils/pushNotification';

export default function PushNotificationSync() {
  useEffect(() => {
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
