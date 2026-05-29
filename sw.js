// ==========================================
// SERVICE WORKER — CineRadar PWA
// ==========================================
// v2.1 — Proxy HTTP corrigido (remove no-cors que impedia leitura)

const CACHE_NAME = 'cineradar-v2';
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
// INSTALL — Cacheia assets estáticos
// ==========================================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch(() => {
                console.log('[SW] Alguns assets não puderam ser cacheados');
            });
        })
    );
    self.skipWaiting();
});

// ==========================================
// ACTIVATE — Limpa caches antigos
// ==========================================
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// ==========================================
// FETCH — Proxy para HTTP + Cache Strategy
// ==========================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // --- STRATEGY 1: Proxy para HTTP (IPTV/Mixed Content) ---
    // O SW roda em HTTPS e pode fazer fetch para HTTP sem mixed-content block
    if (url.protocol === 'http:' && !url.hostname.includes('localhost')) {
        event.respondWith(
            fetch(request).catch((err) => {
                console.log('[SW] HTTP fetch falhou:', err.message);
                return new Response('HTTP blocked', { status: 403 });
            })
        );
        return;
    }

    // --- STRATEGY 2: API calls (TMDB, etc) — Network First ---
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Só cacheia respostas OK (não 404/500)
                    if (response.ok && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(request))
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

    // --- STRATEGY 4: Default — Network Only ---
    event.respondWith(fetch(request));
});

// ==========================================
// MESSAGE — Proxy fetch via SW (para bypass CORS em HTTPS)
// ==========================================
// NOTA: mode: 'no-cors' foi REMOVIDO porque retorna resposta opaque
// que não pode ser lida com .text(). Para HTTP, o fetch event acima
// já intercepta automaticamente. Para HTTPS com CORS, este proxy
// tenta fetch normal e retorna erro se CORS bloquear.
// ==========================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PROXY_FETCH') {
        const { url } = event.data;

        fetch(url, { 
            cache: 'no-cache',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })
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
});
