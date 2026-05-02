/* XDJ-AZ Masterguide — Service Worker (auto-versioned)
   Version kommt aus URL-Parameter: sw.js?v=1.32
   index.html wird NIEMALS gecacht — immer vom Netz geholt.
   Nur externe Assets (Fonts) werden gecacht. */

var CACHE_NAME = 'xdj-az-' + (self.location.search.replace('?v=','') || 'latest');

self.addEventListener('install', function(e) {
  /* index.html NICHT im install-Cache — kommt immer frisch vom Netz */
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  if (e.request.url.startsWith('chrome-extension://')) return;

  /* HTML/Dokumente: immer Network-First, kein Cache */
  if (e.request.destination === 'document' ||
      e.request.url.endsWith('.html') ||
      e.request.url.split('?')[0].endsWith('/')) {
    e.respondWith(
      fetch(e.request).catch(function() {
        /* Offline-Fallback: letzte gecachte Version wenn vorhanden */
        return caches.match('./index.html');
      })
    );
    return;
  }

  /* Externe Assets (Fonts etc.): Cache-First */
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(res) {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        var clone = res.clone();
        caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
        return res;
      });
    })
  );
});
