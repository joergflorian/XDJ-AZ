/* XDJ-AZ Masterguide — Service Worker
   Cache-Name automatisch via APP_VERSION aus index.html (postMessage).
   Fallback: 'xdj-az-v1' */

var CACHE = 'xdj-az-v1';
var OFFLINE_URL = './index.html';

self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SET_VERSION') {
    CACHE = 'xdj-az-' + e.data.version;
  }
});

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.add(OFFLINE_URL);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

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

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  if (e.request.url.startsWith('chrome-extension://')) return;
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(res) {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        var clone = res.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        return res;
      }).catch(function() {
        return caches.match(OFFLINE_URL);
      });
    })
  );
});
