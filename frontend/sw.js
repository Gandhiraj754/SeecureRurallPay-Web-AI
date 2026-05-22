/**
 * SecureRuralPay Service Worker (sw.js)
 * Features:
 *  - Cache-first for all static assets (HTML, CSS, JS)
 *  - Network-first for API calls with offline fallback
 *  - Background sync for failed transactions (queued offline)
 *  - Optimized for 2G / low-bandwidth environments
 */

const CACHE_NAME = 'srp-v3';
const API_PREFIX = '/api/';

// Static assets to cache immediately on install
const STATIC_FILES = [
    '/',
    '/index.html',
    '/login.html',
    '/send-money.html',
    '/check-link.html',
    '/check-pdf.html',
    '/history.html',
    '/security-tips.html',
    '/css/main.css',
    '/css/mobile.css',
    '/js/offline.js',
    '/js/api.js',
    '/js/auth.js',
    '/js/transaction.js',
    '/js/link-scanner.js',
    '/js/pdf-analyzer.js',
    '/js/i18n.js',
    '/js/security.js',
    '/manifest.json'
];

// ── Install: cache all static files ──────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // Cache one by one to avoid failing on one bad file
            return Promise.allSettled(
                STATIC_FILES.map(url => cache.add(url).catch(() => { }))
            );
        }).then(() => self.skipWaiting())
    );
});

// ── Activate: delete old caches ───────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// ── Fetch: Cache-first for static, Network-first for API ──────────
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Skip non-GET and browser extensions
    if (event.request.method !== 'GET') return;
    if (!url.protocol.startsWith('http')) return;

    // API calls: network-first, offline fallback
    if (url.pathname.startsWith(API_PREFIX)) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache successful API responses (GET only)
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                    }
                    return response;
                })
                .catch(() =>
                    caches.match(event.request).then(cached =>
                        cached || new Response(JSON.stringify({
                            offline: true,
                            error: 'No internet connection',
                            message: 'Using offline mode -- your action will sync when back online'
                        }), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        })
                    )
                )
        );
        return;
    }

    // Static assets: cache-first, network fallback
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                }
                return response;
            }).catch(() =>
                caches.match('/index.html') // fallback to home
            );
        })
    );
});

// ── Background sync for offline transactions ───────────────────────
self.addEventListener('sync', event => {
    if (event.tag === 'srp-tx-sync') {
        event.waitUntil(syncQueuedTransactions());
    }
});

async function syncQueuedTransactions() {
    // Notify all clients that sync is happening
    const clients = await self.clients.matchAll();
    clients.forEach(client => client.postMessage({ type: 'SYNC_START' }));
    // Actual sync happens in offline.js on the client side
    clients.forEach(client => client.postMessage({ type: 'SYNC_READY' }));
}

// ── Push notification support (for fraud alerts) ──────────────────
self.addEventListener('push', event => {
    const data = event.data?.json() || {};
    event.waitUntil(
        self.registration.showNotification(data.title || 'SecureRuralPay Alert', {
            body: data.body || 'You have a new security notification',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'srp-alert',
            requireInteraction: data.urgent || false
        })
    );
});
