// Caches remote photos (Supabase storage) after first load: instant on next open, works offline.
const CACHE = "dw-img-v1";
const MAX_ENTRIES = 200;
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

async function trim(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - MAX_ENTRIES; i++) await cache.delete(keys[i]);
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || req.destination !== "image") return;
  if (new URL(req.url).origin === self.location.origin) return; // bundled images are already local
  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req);
      const net = fetch(req)
        .then(async (res) => {
          if (res && (res.ok || res.type === "opaque")) {
            await cache.put(req, res.clone());
            await trim(cache);
          }
          return res;
        })
        .catch(() => null);
      if (hit) { e.waitUntil(net); return hit; }
      return (await net) || Response.error();
    })(),
  );
});
