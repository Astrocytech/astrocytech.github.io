const CACHE_NAME = 'astrocytech-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/glyphser.html',
  '/404.html',
  '/files/astrocytech.css',
  '/files/home-hero@2x.webp',
  '/files/glyphser/glyphser-dashboard-light.webp',
  '/files/glyphser/glyphser-dashboard-hero-light.webp',
  '/files/glyphser/glyphser-runs-light.webp',
  '/files/glyphser/glyphser-run-detail-light.webp',
  '/files/glyphser/glyphser-certification-light.webp',
  '/files/favicon_io/favicon-32x32.png',
  '/files/favicon_io/favicon-16x16.png',
  '/files/favicon_io/apple-touch-icon.png',
  '/files/favicon_io/android-chrome-192x192.png',
  '/files/favicon_io/android-chrome-512x512.png',
  '/files/favicon_io/site.webmanifest',
  'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
      .catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/404.html');
        }
      })
  );
});
