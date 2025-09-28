const CACHE_NAME = 'alhaq-initiative-site-v4-20250927';
const OFFLINE_URL = '/offline.html';
const ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/library.html',
  '/help.html',
  '/contact.html',
  '/quran.html',
  '/assets/images/favicon.svg',
  '/assets/images/favicon.ico',
  '/assets/images/apple-touch-icon.png',
  '/assets/images/favicon-96x96.png',
  '/assets/css/styles.css',
  '/assets/css/quran.css',
  '/assets/js/site.js',
  '/assets/js/quran.js',
  '/assets/Quran_Data/Metadata.js',
  '/assets/Quran_Data/Quran.txt'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL, ...ASSETS]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
      return resp;
    }).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') return caches.match(OFFLINE_URL);
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    })
  );
});
