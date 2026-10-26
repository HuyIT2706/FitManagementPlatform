import apiClient from '../api/axios';
import { toast } from './toast';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    return registration;
  } catch (err) {
    console.error('Service Worker registration failed:', err);
    return null;
  }
}

export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function subscribeToPushNotifications(): Promise<boolean> {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('Notification' in window)
  ) {
    toast.error('Trình duyệt hiện tại không hỗ trợ thông báo đẩy Web Push');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      toast.info('Bạn đã từ chối nhận thông báo đẩy. Bạn có thể bật lại trong cài đặt trình duyệt.');
      return false;
    }

    await registerServiceWorker();
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      toast.error('Không thể kích hoạt tiến trình ngầm Service Worker');
      return false;
    }

    const keyRes = await apiClient.get<{ publicKey: string }>('/notifications/vapid-public-key');
    const vapidPublicKey = keyRes.data?.publicKey;
    if (!vapidPublicKey) {
      throw new Error('Không lấy được khóa VAPID từ server');
    }

    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
    }

    const subJson = subscription.toJSON();
    await apiClient.post('/notifications/subscribe', {
      endpoint: subJson.endpoint,
      keys: subJson.keys,
    });

    toast.success('Đã bật thông báo đẩy ra màn hình thành công!');
    return true;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Failed to subscribe push notification:', error);
    toast.error('Lỗi khi bật thông báo đẩy: ' + (error.message || 'Không xác định'));
    return false;
  }
}

let isAutoSyncing = false;

export async function autoSyncPushSubscription(): Promise<boolean> {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('Notification' in window)
  ) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  const token = localStorage.getItem('jwt_token');
  if (!token) {
    return false;
  }

  // Deduplication check: sync only ONCE per browser session unless token changes
  try {
    const syncedToken = sessionStorage.getItem('nutricore_push_synced');
    if (syncedToken === token) {
      return true; // Already synced this session, skip redundant network calls!
    }
  } catch {
    // Ignore sessionStorage errors (e.g. private mode)
  }

  if (isAutoSyncing) {
    return false;
  }

  isAutoSyncing = true;
  try {
    await registerServiceWorker();
    const registration = await navigator.serviceWorker.ready;
    if (!registration || !registration.pushManager) {
      return false;
    }

    const keyRes = await apiClient.get<{ publicKey: string }>('/notifications/vapid-public-key');
    const vapidPublicKey = keyRes.data?.publicKey;
    if (!vapidPublicKey) {
      return false;
    }

    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
    }

    if (subscription) {
      const subJson = subscription.toJSON();
      if (subJson.endpoint && subJson.keys?.p256dh && subJson.keys?.auth) {
        await apiClient.post('/notifications/subscribe', {
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        });

        // Mark as synced for this session
        try {
          sessionStorage.setItem('nutricore_push_synced', token);
        } catch {
          // Ignore storage quota errors
        }
        return true;
      }
    }
    return false;
  } catch (err) {
    console.warn('Auto-sync push subscription failed silently:', err);
    return false;
  } finally {
    isAutoSyncing = false;
  }
}
