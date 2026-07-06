const CACHE_NAME = 'soro-v2.0.1';
const DYNAMIC_CACHE = 'soro-dynamic-v2';

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
                    .filter((name) => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - network first with smarter caching
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    // Don't cache Firebase/Firestore API calls
    if (event.request.url.includes('firestore') || 
        event.request.url.includes('firebase') ||
        event.request.url.includes('googleapis.com') ||
        event.request.url.includes('gstatic.com')) {
        return;
    }

    // For navigation requests, use network-first
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clonedResponse = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(event.request, clonedResponse);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request).then((cached) => {
                        return cached || caches.match('/');
                    });
                })
        );
        return;
    }

    // For other requests, cache-first with network update
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const clonedResponse = networkResponse.clone();
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(event.request, clonedResponse);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })
    );
});

// Background sync for offline messages
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-messages') {
        event.waitUntil(
            self.clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({
                        type: 'SYNC_OFFLINE_MESSAGES',
                        timestamp: Date.now()
                    });
                });
            })
        );
    }
});

// Periodic background sync (for fetching new messages)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-messages') {
        event.waitUntil(
            self.clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({
                        type: 'CHECK_NEW_MESSAGES',
                        timestamp: Date.now()
                    });
                });
            })
        );
    }
});

// Push notifications - enhanced
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    let data;
    try {
        data = event.data.json();
    } catch (e) {
        data = { title: 'SORO', body: event.data.text() };
    }
    
    const options = {
        body: data.body || 'You have a new message',
        icon: '/icons/icon.svg',
        badge: '/icons/icon.svg',
        vibrate: [200, 100, 200],
        data: { 
            chatId: data.chatId, 
            url: data.url || '/',
            senderId: data.senderId
        },
        actions: [
            {
                action: 'reply',
                title: 'Quick Reply',
                type: 'text',
                placeholder: 'Type your reply...'
            },
            {
                action: 'open',
                title: 'Open Chat'
            }
        ],
        tag: `chat-${data.chatId || 'general'}`,
        renotify: true,
        requireInteraction: true,
        silent: false,
        timestamp: Date.now()
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'SORO', options)
    );
});

// Notification click - enhanced with reply support
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/';
    
    if (event.action === 'reply' && event.reply) {
        // Send reply back to the app
        event.waitUntil(
            self.clients.matchAll({ type: 'window' }).then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({
                        type: 'QUICK_REPLY',
                        reply: event.reply,
                        chatId: event.notification.data?.chatId
                    });
                });
                
                // Also try to open the app
                if (clients.length === 0) {
                    return self.clients.openWindow(urlToOpen);
                } else {
                    return clients[0].focus();
                }
            })
        );
    } else {
        // Open app
        event.waitUntil(
            self.clients.matchAll({ type: 'window' }).then((clients) => {
                for (const client of clients) {
                    if (client.url.includes(urlToOpen) && 'focus' in client) {
                        return client.focus();
                    }
                }
                return self.clients.openWindow(urlToOpen);
            })
        );
    }
});

// Push subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
    console.log('Push subscription changed');
    event.waitUntil(
        self.registration.pushManager.subscribe({ userVisibleOnly: true })
            .then((newSubscription) => {
                // Send new subscription to server
                return fetch('/api/push-subscription', {
                    method: 'POST',
                    body: JSON.stringify({ subscription: newSubscription })
                });
            })
    );
});

// Message from main thread
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'REGISTER_BACKGROUND_SYNC') {
        // Register periodic sync if available
        if ('periodicSync' in self.registration) {
            self.registration.periodicSync.register('check-messages', {
                minInterval: 5 * 60 * 1000 // 5 minutes
            }).catch(() => {
                console.log('Periodic sync not available');
            });
        }
    }
});