/* ── XDJ-AZ Service Worker ─────────────────────────────────────────────
   Strategie: Network-First mit Cache-Fallback.
   • Online  → immer frische Version vom Server, Cache wird aktualisiert
   • Offline → letzter bekannter Stand aus Cache
   • Kein manuelles Versions-Bumping nötig: Browser prüft SW-Datei bei
     jeder Navigation automatisch auf Byte-Änderungen.
   ──────────────────────────────────────────────────────────────────── */

var CACHE = 'xdj-az';
var URLS  = ['./', './index.html'];

/* Install: Grundressourcen vorhalten */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(URLS);
    })
  );
  /* Sofort übernehmen – kein Warten auf Tab-Neustart */
  self.skipWaiting();
});

/* Activate: Veraltete Caches entfernen */
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

/* Fetch: Network-First */
self.addEventListener('fetch', function(e) {
  /* Nur GET, keine Browser-Extensions o.ä. */
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request).then(function(networkRes) {
      /* Antwort in Cache schreiben (nur OK-Responses) */
      if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
        var toCache = networkRes.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, toCache); });
      }
      return networkRes;
    }).catch(function() {
      /* Offline: Cache-Fallback */
      return caches.match(e.request).then(function(cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});
