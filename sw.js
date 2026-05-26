const CACHE_NAME = 'astrocytech-v30';
const urlsToCache = [
  '/',
  '/index.html',
  '/glyphser.html',
  '/404.html',
  '/files/astrocytech.css',
  '/files/home-hero@2x.webp',
  '/files/glyphser/glyphser-dashboard-light-v2.webp',
  '/files/glyphser/glyphser-dashboard-hero-light-v2.webp',
  '/files/glyphser/glyphser-runs-light-v2.webp',
  '/files/glyphser/glyphser-run-detail-light-v2.webp',
  '/files/glyphser/glyphser-certification-light-v2.webp',
  '/files/glyphser/glyphser-dashboard-full-light.webp',
  '/files/glyphser/glyphser-runs-full-light.webp',
  '/files/glyphser/glyphser-run-detail-full-light.webp',
  '/files/glyphser/glyphser-certification-full-light.webp',
  '/files/glyphser/glyphser-docs-full-light.webp',
  '/files/glyphser/glyphser-module-explorer-full-light.webp',
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
  // Network-first for HTML navigations so content updates without cache-busting.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
          return response;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('/404.html')))
    );
    return;
  }

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
