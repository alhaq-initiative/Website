const CACHE_NAME = 'amn-site-v20260426-4';
const CORE = [
  '/',
  '/index.html',
  '/download/',
  '/support/',
  '/faq/',
  '/404.html',
  '/assets/css/styles.css?v=20250927',
  '/assets/css/amn-redesign.css?v=20260426',
  '/assets/css/amn-docs.css?v=20260426',
  '/assets/js/site.js?v=20250927',
  '/assets/js/amn-i18n.js?v=20260426'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Navigation requests: network first, fallback to cached page/404
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          return cached || caches.match('/404.html');
        })
    );
    return;
  }

  // Static assets: cache first
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
      return res;
    }))
  );
});
