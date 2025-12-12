const cacheName = "DefaultCompany-Hisstory-1.0-20250306";
const contentToCache = [
    "Build/webgl_test.loader.js",
    "Build/webgl_test.framework.js.br",
    "Build/webgl_test.data.br",
    "Build/webgl_test.wasm.br",
    "TemplateData/style.css"

];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
      // Never cache non-GET requests
      if (e.request.method !== "GET") {
        return fetch(e.request);
      }

      // Avoid caching range requests (common for audio/video streaming).
      // Cache API does not handle partial content well and can cause pending requests.
      if (e.request.headers && e.request.headers.has("range")) {
        return fetch(e.request);
      }

      // Avoid caching StreamingAssets (often updated during dev and may stream large files)
      const url = new URL(e.request.url);
      if (url.pathname.includes("/StreamingAssets/")) {
        return fetch(e.request);
      }

      let response = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (response) { return response; }

      response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      // Best effort cache: ignore failures for streamed/unsupported responses
      try { await cache.put(e.request, response.clone()); } catch (_) {}
      return response;
    })());
});
