import apiClient from '../api/axios';
import { toast } from './toast';

// Chuyển đổi base64 VAPID Key sang Uint8Array
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

// 1. Đăng ký Service Worker
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

// 2. Kiểm tra trạng thái cấp quyền thông báo
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// 3. Xin quyền & Đăng ký Push Manager gửi lên Backend
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
    // 1. Yêu cầu quyền từ người dùng
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      toast.info('Bạn đã từ chối nhận thông báo đẩy. Bạn có thể bật lại trong cài đặt trình duyệt.');
      return false;
    }

    // 2. Khởi tạo & Chờ Service Worker sẵn sàng
    await registerServiceWorker();
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      toast.error('Không thể kích hoạt tiến trình ngầm Service Worker');
      return false;
    }

    // 3. Lấy VAPID public key từ Backend
    const keyRes = await apiClient.get<{ publicKey: string }>('/notifications/vapid-public-key');
    const vapidPublicKey = keyRes.data?.publicKey;
    if (!vapidPublicKey) {
      throw new Error('Không lấy được khóa VAPID từ server');
    }

    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // 4. Đăng ký Push Manager
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
    }

    // 5. Gửi thông tin subscription lên Backend lưu vào DB
    const subJson = subscription.toJSON();
    await apiClient.post('/notifications/subscribe', {
      endpoint: subJson.endpoint,
      keys: subJson.keys,
    });

    toast.success('Đã bật thông báo đẩy ra màn hình thành công!');
    return true;
  } catch (err: any) {
    console.error('Failed to subscribe push notification:', err);
    toast.error('Lỗi khi bật thông báo đẩy: ' + (err?.message || 'Không xác định'));
    return false;
  }
}

