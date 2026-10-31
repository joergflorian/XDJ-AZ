/* ── XDJ-AZ Service Worker ─────────────────────────────────────────────
   Strategie: Network-First mit Timeout und Cache-Fallback.
   • Online        → immer frische Version, HTTP-Cache wird umgangen
   • Schlechtes Netz → nach NET_TIMEOUT der letzte Stand aus dem Cache,
                     der Abruf läuft im Hintergrund weiter
   • Offline       → letzter bekannter Stand aus dem Cache
   • Kein manuelles Versions-Bumping nötig: Es gibt nur eine Seite, und
     sie wird bei jedem erfolgreichen Abruf im Cache ersetzt.
   ──────────────────────────────────────────────────────────────────── */

var CACHE       = 'xdj-az';
var PAGE        = './';
var NET_TIMEOUT = 4000;

/* Weitergeleitete Antworten darf der Browser nicht für Navigationen nutzen */
function plainResponse(res) {
  if (!res.redirected) return res;
  return new Response(res.body, {
    status: res.status, statusText: res.statusText, headers: res.headers
  });
}

/* Install: Seite vorhalten, damit sie nach dem ersten Besuch offline läuft */
self.addEventListener('install', function(e) {
  e.waitUntil(
    fetch(PAGE, { cache: 'reload' }).then(function(res) {
      if (!res.ok) throw new Error('Seite nicht geladen: ' + res.status);
      return caches.open(CACHE).then(function(c) {
        return c.put(PAGE, plainResponse(res));
      });
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

/* Fetch: Die App besteht aus einer Datei, also zählen nur Navigationen auf sie.
   Andere Dateien im Repo (Lizenzen, Docs) dürfen die Seite im Cache nie ersetzen. */
self.addEventListener('fetch', function(e) {
  if (e.request.mode !== 'navigate') return;
  var path = new URL(e.request.url).pathname;
  var root = new URL(PAGE, self.location).pathname;
  if (path !== root && path !== root + 'index.html') return;

  var copy = null;
  /* cache:'no-cache' – sonst liefert GitHub Pages bis zu 10 Minuten alte Stände */
  var network = fetch(e.request.url, { cache: 'no-cache' }).then(function(res) {
    if (res.status >= 500) throw new Error('Serverfehler: ' + res.status);
    var page = plainResponse(res);
    if (page.ok) copy = page.clone();
    return page;
  });

  /* Eigener Lebensdauer-Promise, damit der Abruf auch nach dem Timeout fertig wird */
  e.waitUntil(network.then(function() {
    if (!copy) return;
    return caches.open(CACHE).then(function(c) { return c.put(PAGE, copy); });
  }).catch(function() {}));

  var timeout = new Promise(function(resolve) {
    setTimeout(resolve, NET_TIMEOUT);
  });

  e.respondWith(
    Promise.race([network, timeout]).catch(function() {}).then(function(res) {
      if (res) return res;
      return caches.match(PAGE).then(function(cached) {
        return cached || network;
      });
    })
  );
});
