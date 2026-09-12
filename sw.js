// Service worker for the transformer explainer PWA.
//
// This is a plain static file (unlike the sibling a8-ai-ethics / ai-data-ethics
// repos, whose sw.js is generated at Astro build time from a template) because
// this repo has no build step at all - static.yml just uploads the checked-out
// files as-is. Every path below is relative (no leading "/"), so it resolves
// correctly under the GitHub Pages project path
// (/interactive-transformer-explainer/) without needing to hardcode it.
//
// Strategy:
//  - Page navigation (index.html itself): network-first, so anyone online
//    always gets the latest content; falls back to whatever's cached when
//    offline. Offline use only works once the page has been visited online
//    at least once - acceptable for a page like this.
//  - Same-origin static assets (manifest, icons): cache-first with a
//    background refresh, since they rarely change.
//  - Cross-origin requests (Google Fonts, the esm.sh tokenizer module) are
//    deliberately left untouched, not intercepted at all - the page already
//    has a graceful offline fallback for the tokenizer (it falls back from
//    the live cl100k encoder to its own offline BPE implementation when the
//    module import fails), so there's no need for the service worker to try
//    to cache or fake those responses too.
//
// Bump CACHE_VERSION on any deploy where already-installed visitors should
// drop their old cached content immediately, rather than waiting for it to
// expire naturally via the logic below.
const CACHE_VERSION = 'v1';
const CACHE_NAME = 'transformer-explainer-' + CACHE_VERSION;
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('transformer-explainer-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
