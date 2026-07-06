const CACHE_NAME = 'soro-v2.0.0';  // ⬅️ Changed version to force update
const ASSETS_TO_CACHE = [
    '/',
    // '/index.html',  // ⬅️ REMOVED - Don't cache index.html
    // '/css/style.css',  // ⬅️ REMOVED - Not needed (CSS is inlined)
    // '/js/utils.js',  // ⬅️ REMOVED - Not needed (JS is inlined)
    // '/js/auth.js',
    // '/js/chat.js',
    // '/js/groups.js',
    // '/js/stories.js',
    // '/js/communities.js',
    // '/js/settings.js',
    // '/js/app.js',
    '/manifest.json',
    '/icons/icon.svg'
];

// Install event - cache assets
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

// Activate event - clean old caches and claim clients
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

// Fetch event - NETWORK FIRST for everything
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
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
                // Cache successful responses for assets (not HTML)
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const url = new URL(event.request.url);
                    // Only cache non-HTML files
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
                // Network failed, try cache
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

// Handle push notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body || 'New message',
        icon: '/icons/icon.svg',
        badge: '/icons/icon.svg',
        vibrate: [200, 100, 200],
        data: {
            chatId: data.chatId,
            url: data.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Open'
            },
            {
                action: 'reply',
                title: 'Reply'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'SORO', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'reply') {
        event.waitUntil(clients.openWindow('/'));
    } else {
        const chatId = event.notification.data?.chatId;
        const url = chatId ? `/?chat=${chatId}` : '/';
        event.waitUntil(clients.openWindow(url));
    }
});

// Handle message from main thread
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});