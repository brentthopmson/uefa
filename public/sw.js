const CACHE_PREFIX = 'uefa';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(CACHE_PREFIX))
            .map((k) => caches.delete(k))
        )
      ),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // GAS API calls: Network First with cache fallback
  if (url.href.includes('script.google.com') || url.href.includes('googleusercontent.com')) {
    event.respondWith(networkFirstWithCache(request, `${CACHE_PREFIX}-api`));
    return;
  }

  // Next.js static assets (JS, CSS, fonts): Cache First
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    url.pathname.match(/\.(js|css|woff2?|ttf|svg|ico)(\?.*)?$/)
  ) {
    event.respondWith(cacheFirst(request, `${CACHE_PREFIX}-static`));
    return;
  }

  // Images + splash screens: Cache First
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|webp)(\?.*)?$/) ||
    url.pathname.startsWith('/splash-') ||
    url.pathname.startsWith('/icon-')
  ) {
    event.respondWith(cacheFirst(request, `${CACHE_PREFIX}-images`));
    return;
  }

  // Navigation / pages: Network First
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithCache(request, `${CACHE_PREFIX}-pages`));
    return;
  }

  event.respondWith(networkFirstWithCache(request, `${CACHE_PREFIX}-default`));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.open(cacheName).then((c) => c.match(request));
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const c = await caches.open(cacheName);
      c.put(request, response.clone());
    }
    return response;
  } catch (e) {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const c = await caches.open(cacheName);
      c.put(request, response.clone());
    }
    return response;
  } catch (e) {
    const cached = await caches.open(cacheName).then((c) => c.match(request));
    if (cached) return cached;
    if (request.mode === 'navigate') {
      const fallback = await caches.open(`${CACHE_PREFIX}-pages`).then((c) => c.match('/login'));
      if (fallback) return fallback;
    }
    return new Response(JSON.stringify({ error: 'No internet connection', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
