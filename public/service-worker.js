const CACHE_NAME = 'jewelia-pos-cache-v1';
const urlsToCache = [
  '/manifest.json',
  '/favicon.ico',
  // Add other static assets here
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Only handle static assets and specific routes
  const url = new URL(event.request.url);
  if (!urlsToCache.includes(url.pathname) && !url.pathname.startsWith('/pos')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
}); 
 