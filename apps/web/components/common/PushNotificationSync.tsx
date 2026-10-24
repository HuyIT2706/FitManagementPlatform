'use client';

import { useEffect } from 'react';
import { autoSyncPushSubscription } from '../../utils/pushNotification';

export default function PushNotificationSync() {
  useEffect(() => {
    autoSyncPushSubscription();
  }, []);

  return null;
}
