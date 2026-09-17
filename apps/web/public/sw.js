// NutriCore Service Worker for Web Push Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 1. Lắng nghe sự kiện Push từ Server
self.addEventListener('push', (event) => {
  let data = {
    title: 'NutriCore Thông Báo',
    body: 'Bạn có cập nhật mới từ hệ thống NutriCore!',
    icon: '/logoApp.jpg',
    badge: '/logoApp.jpg',
    url: '/home',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const title = data.title || 'NutriCore';
  const options = {
    body: data.body,
    icon: data.icon || '/logoApp.jpg',
    badge: data.badge || '/logoApp.jpg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || (data.data && data.data.url) || '/home',
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'open_url',
        title: 'Xem ngay',
      },
      {
        action: 'close',
        title: 'Đóng',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 2. Lắng nghe khi người dùng bấm vào thông báo
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl =
    event.notification.data && event.notification.data.url
      ? event.notification.data.url
      : '/home';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Nếu đã mở tab rồi thì focus vào tab đó
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Nếu chưa mở tab nào thì mở cửa sổ mới
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});
