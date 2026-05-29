// ==========================================
// SERVICE WORKER — CineRadar PWA
// ==========================================
// v2.3 FINAL — NÃO cacheia respostas de erro da API (evita 404 stale)

const CACHE_NAME = 'cineradar-v3-' + new Date().toISOString().slice(0,10);
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/base.css',
    '/css/layout.css',
    '/css/components.css',
    '/css/pages.css',
    '/css/responsive.css',
    '/css/extra.css',
    '/css/style-additions.css',
    '/js/config.js',
    '/js/utils.js',
    '/js/storage.js',
    '/js/api.js',
    '/js/components/loader.js',
    '/js/components/navbar.js',
    '/js/components/footerNav.js',
    '/js/components/movieCard.js',
    '/js/components/carousel.js',
    '/js/components/player.js',
    '/js/pages/home.js',
    '/js/pages/explore.js',
    '/js/pages/search.js',
    '/js/pages/details.js',
    '/js/pages/calendar.js',
    '/js/pages/myList.js',
    '/js/pages/actor.js',
    '/js/pages/reels.js',
    '/js/pages/iptv.js',
    '/js/router.js',
    '/js/app.js',
    '/js/protect.js',
    '/js/adGate.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// ==========================================
// INSTALL
// ==========================================
self.addEventListener('install', (event) => {
    console.log('[SW] v2.3 instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch(() => {
                console.log('[SW] Alguns assets nao puderam ser cacheados');
            });
        })
    );
    self.skipWaiting();
});

// ==========================================
// ACTIVATE — Limpa TODOS os caches antigos
// ==========================================
self.addEventListener('activate', (event) => {
    console.log('[SW] v2.3 ativando...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// ==========================================
// FETCH — API: Network Only (sem cache!) + Static: Cache First
// ==========================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // --- STRATEGY 1: API calls (TMDB, Watchmode, OMDb) — NETWORK ONLY ---
    // NUNCA cacheia API para evitar 404 stale
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(fetch(request));
        return;
    }

    // --- STRATEGY 2: HTTP (IPTV) — passa direto (SW pode fazer HTTP) ---
    if (url.protocol === 'http:' && !url.hostname.includes('localhost')) {
        event.respondWith(
            fetch(request).catch((err) => {
                console.log('[SW] HTTP fetch falhou:', err.message);
                return new Response('HTTP blocked', { status: 403 });
            })
        );
        return;
    }

    // --- STRATEGY 3: Static assets — Cache First ---
    if (request.method === 'GET') {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    if (response.ok && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                });
            })
        );
        return;
    }

    // --- STRATEGY 4: Default ---
    event.respondWith(fetch(request));
});

// ==========================================
// MESSAGE — Proxy fetch via SW
// ==========================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PROXY_FETCH') {
        const { url } = event.data;
        fetch(url, { cache: 'no-cache' })
        .then(async (response) => {
            const text = await response.text();
            event.ports[0].postMessage({ 
                response: text, 
                status: response.status,
                ok: response.ok 
            });
        })
        .catch((err) => {
            event.ports[0].postMessage({ error: err.message });
        });
    }
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
