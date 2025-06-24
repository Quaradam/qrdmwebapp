self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('qrdm-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/script.js',
        '/greenroom.ogg', // или .ogg, если используешь
        '/favicon.ico'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});