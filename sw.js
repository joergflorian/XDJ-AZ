/* XDJ-AZ Masterguide — Service Worker v1.0
   Strategie: Cache-First für die App, Network-First für externe Ressourcen
   Offline-fähig nach erstem Laden */

var CACHE = 'xdj-az-v1';
var OFFLINE_URL = './index.html';

/* Beim Installieren: index.html sofort cachen */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.add(OFFLINE_URL);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* Beim Aktivieren: alte Caches löschen */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* Fetch: Cache-First für eigene Ressourcen, Network-First für externe */
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  /* Externe Ressourcen (Google Fonts, etc.) — Netzwerk zuerst, Fallback Cache */
  if (url.indexOf('googleapis.com') !== -1 || url.indexOf('gstatic.com') !== -1) {
    e.respondWith(
      fetch(e.request).then(function(res) {
        var clone = res.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        return res;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }

  /* Eigene Ressourcen — Cache-First */
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(res) {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        var clone = res.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        return res;
      }).catch(function() {
        /* Offline-Fallback: immer index.html zurückgeben */
        return caches.match(OFFLINE_URL);
      });
    })
  );
});
