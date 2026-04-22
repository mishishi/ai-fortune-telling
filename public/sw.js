// public/sw.js - Push notification service worker
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data;
  try {
    data = event.data.json();
  } catch (err) {
    console.error('Failed to parse push data:', err);
    return;
  }
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    tag: 'push-notification',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window' }).then((clientList) => {
    for (const client of clientList) {
      if (client.url.includes(self.location.origin) && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      const url = event.notification.data.url;
      return clients.openWindow(url);
    }
  }));
});

self.addEventListener('notificationclose', (event) => {
  // Handle notification close if needed
});
