const CACHE_NAME = 'soro-v2.0.0';
const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
    '/icons/icon.svg'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
                    console.warn('Failed to cache some assets:', error);
                    return Promise.resolve();
                });
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - network first
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    // Don't cache Firebase/Firestore API calls
    if (event.request.url.includes('firestore') || 
        event.request.url.includes('firebase') ||
        event.request.url.includes('googleapis.com') ||
        event.request.url.includes('gstatic.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const url = new URL(event.request.url);
                    if (!url.pathname.endsWith('.html') && url.pathname !== '/') {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                }
                return networkResponse;
            })
            .catch((error) => {
                console.warn('Fetch failed, using cache:', error);
                return caches.match(event.request).then((cachedResponse) => {
                    return cachedResponse || new Response('Offline - Resource not available', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});

// Push notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;
    const data = event.data.json();
    const options = {
        body: data.body || 'New message',
        icon: '/icons/icon.svg',
        badge: '/icons/icon.svg',
        vibrate: [200, 100, 200],
        data: { chatId: data.chatId, url: data.url || '/' }
    };
    event.waitUntil(
        self.registration.showNotification(data.title || 'SORO', options)
    );
});

// Notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow('/'));
});

// Skip waiting message
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});