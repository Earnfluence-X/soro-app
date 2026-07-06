const CACHE_NAME = 'soro-v1.0.0';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/utils.js',
    '/js/auth.js',
    '/js/chat.js',
    '/js/groups.js',
    '/js/stories.js',
    '/js/communities.js',
    '/js/settings.js',
    '/js/app.js',
    '/manifest.json',
    '/icons/icon.svg'
];

// Install event - cache all core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
                    console.warn('Failed to cache some assets:', error);
                    // Continue even if some assets fail to cache
                    return Promise.resolve();
                });
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
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

// Fetch event - network first, fallback to cache
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
        caches.match(event.request).then((cachedResponse) => {
            // Return cached response immediately if available
            const fetchPromise = fetch(event.request)
                .then((networkResponse) => {
                    // Cache successful responses
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch((error) => {
                    // Network failed, return cached version if available
                    console.warn('Fetch failed, using cache:', error);
                    return cachedResponse || new Response('Offline - Resource not available', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });

            // Return cached version first if it exists, otherwise wait for network
            return cachedResponse || fetchPromise;
        })
    );
});

// Handle push notifications (future use)
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
        // Open the app to reply
        event.waitUntil(
            clients.openWindow('/')
        );
    } else {
        // Open the specific chat
        const chatId = event.notification.data?.chatId;
        const url = chatId ? `/?chat=${chatId}` : '/';
        event.waitUntil(
            clients.openWindow(url)
        );
    }
});

// Handle message from main thread
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});