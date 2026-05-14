const CACHE = "clash-v5";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.allSettled([
        cache.add("/"),
        cache.add("/manifest.json"),
        cache.add("/favicon.svg"),
      ]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(async keys => {
      const wasInstalled = keys.length > 0;
      const stale = keys.filter(k => k !== CACHE);
      await Promise.all(stale.map(k => caches.delete(k)));
      await self.clients.claim();
      if (wasInstalled) {
        const clients = await self.clients.matchAll({ type: "window" });
        clients.forEach(c => c.postMessage({ type: "SW_UPDATED" }));
      }
    })
  );
});

self.addEventListener("fetch", e => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/") || url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(request, res.clone()));
          return res;
        });
      })
    );
    return;
  }

  e.respondWith(
    fetch(request)
      .then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(request, res.clone()));
        return res;
      })
      .catch(() => caches.match(request))
  );
});
