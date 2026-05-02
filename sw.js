/* XDJ-AZ — Cleanup Service Worker
   Löscht alle alten Caches und deregistriert sich selbst.
   Einmalig hochladen, danach nie wieder nötig. */
self.addEventListener('install', function() { self.skipWaiting(); });
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys()
      .then(function(keys){ return Promise.all(keys.map(function(k){ return caches.delete(k); })); })
      .then(function(){ return self.registration.unregister(); })
      .then(function(){ return self.clients.matchAll(); })
      .then(function(clients){ clients.forEach(function(c){ c.navigate(c.url); }); })
  );
});
