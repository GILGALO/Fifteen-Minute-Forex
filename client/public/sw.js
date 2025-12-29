self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data,
    actions: [
      { action: 'view', title: 'View Signal' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
