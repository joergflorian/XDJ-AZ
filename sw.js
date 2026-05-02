/* XDJ-AZ Masterguide — Service Worker (auto-versioned, network-first HTML)
   CACHE_NAME liest Version aus URL-Parameter ?v=
   → Niemals manuell anpassen. Wird automatisch durch index.html versioniert. */

var CACHE_NAME = 'xdj-az-' + (self.location.search.replace('?v=','') || 'latest');
var HTML_URL   = './index.html';

/* ── INSTALL: index.html vorab cachen ───────────────────────────────── */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) { return cache.add(HTML_URL); })
      .then(function() { return self.skipWaiting(); })
  );
});

/* ── ACTIVATE: alte Caches löschen, sofort übernehmen ──────────────── */
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

/* ── FETCH: HTML immer network-first, Assets cache-first ───────────── */
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  if (e.request.url.startsWith('chrome-extension://')) return;

  var isHTML = e.request.destination === 'document' ||
               e.request.url.endsWith('.html') ||
               e.request.url.endsWith('/');

  if (isHTML) {
    /* Network-first: immer frische HTML laden, Cache nur als Fallback */
    e.respondWith(
      fetch(e.request).then(function(res) {
        if (res && res.status === 200) {
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
        }
        return res;
      }).catch(function() {
        return caches.match(HTML_URL);
      })
    );
  } else {
    /* Cache-first für Assets (Fonts, Icons etc.) */
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        if (cached) return cached;
        return fetch(e.request).then(function(res) {
          if (!res || res.status !== 200 || res.type === 'opaque') return res;
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
          return res;
        });
      }).catch(function() { return caches.match(HTML_URL); })
    );
  }
});
