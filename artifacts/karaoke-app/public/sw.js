const CACHE_NAME = "myoukee-v4";
const PRECACHE_URLS = [
  "/favicon.svg",
  "/favicon-192.png",
  "/favicon-512.png",
];

const OFFLINE_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>MYOUKEE — Offline</title><style>*{margin:0;padding:0;box-sizing:border-box}body{min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;background:hsl(240 10% 4%);color:#fff;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:24px;padding:max(24px,env(safe-area-inset-top)) max(24px,env(safe-area-inset-right)) max(24px,env(safe-area-inset-bottom)) max(24px,env(safe-area-inset-left))}.c{max-width:360px}h1{font-size:24px;font-weight:700;letter-spacing:2px;color:#a78bfa;margin-bottom:16px}p{font-size:14px;color:rgba(255,255,255,.5);line-height:1.6;margin-bottom:24px}button{padding:12px 32px;border-radius:12px;background:#7c3aed;color:#fff;border:none;font-size:14px;font-weight:600;cursor:pointer}</style></head><body><div class="c"><h1>MYOUKEE</h1><p>You appear to be offline. Please check your internet connection and try again.</p><button onclick="location.reload()">Retry</button></div></body></html>`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request)
            .then((cached) => cached || caches.match("/"))
            .then((cached) => cached || new Response(OFFLINE_HTML, {
              status: 503,
              headers: { "Content-Type": "text/html" }
            }))
        )
    );
    return;
  }

  if (
    url.pathname.match(
      /\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ttf|ico)$/
    )
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || fetch(request)))
    );
    return;
  }
});
