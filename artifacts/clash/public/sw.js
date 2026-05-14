const CACHE = "clash-v4";

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
    caches.keys().then(keys => {
      const oldCaches = keys.filter(k => k !== CACHE);
      return Promise.all(oldCaches.map(k => caches.delete(k)))
        .then(() => self.clients.claim())
        .then(() => {
          // Only reload clients when upgrading from an older version, not on first install
          if (oldCaches.length === 0) return;
          return self.clients.matchAll({ type: "window" }).then(clients =>
            clients.forEach(client => client.postMessage({ type: "SW_UPDATED" }))
          );
        });
    })
  );
});

self.addEventListener("fetch", e => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never intercept API calls or external origins (Google Fonts, etc.)
  if (url.pathname.startsWith("/api/") || url.origin !== self.location.origin) return;

  // Cache-first for Vite hashed bundles (/assets/*)  — safe because the hash changes with content
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

  // Network-first for everything else (HTML pages, manifest, icons)
  // so new deployments are picked up immediately while still working offline
  e.respondWith(
    fetch(request)
      .then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(request, res.clone()));
        return res;
      })
      .catch(() => caches.match(request))
  );
});
