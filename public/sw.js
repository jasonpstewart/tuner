const CACHE_NAME = 'tuner-v2';

// Derive the base path portably from the SW's registration scope so this
// file works whether the app is served at `/` (local dev) or `/tuner/`
// (GitHub Pages). Do NOT hardcode `/tuner/` — and do NOT reach for
// `import.meta.env.BASE_URL`: files under public/ are copied verbatim and
// are not processed by Vite. Bump CACHE_NAME when you change SW logic.
const BASE = new URL(self.registration.scope).pathname;

// App shell files to precache — these are the offline fallback set. Under
// the normal (online) flow, the shell is served network-first; the precache
// only kicks in when the network is unavailable.
const APP_SHELL = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}manifest.json`,
  `${BASE}icon-192.svg`,
  `${BASE}icon-512.svg`,
];

// Install: precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
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

// Fetch: split routing.
//
//   - Cross-origin            → pass through (don't handle).
//   - `${BASE}assets/*`       → cache-first. Vite emits content-hashed
//                               filenames (e.g. `index-CnsINiPv.js`), so
//                               cached entries are immutable and safe to
//                               serve forever.
//   - Everything else         → network-first with cache fallback. This
//     same-origin                covers `index.html`, `manifest.json`, the
//                                bare `${BASE}` directory, `sw.js`, and
//                                the unhashed `icon-*.svg` files. Installed
//                                PWAs pick up new deploys whenever the user
//                                is online; offline, they fall back to the
//                                precache (and to `${BASE}index.html` for
//                                navigation requests).
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // Cache-first for hashed Vite assets
  if (url.pathname.startsWith(`${BASE}assets/`)) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            const clone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone));
            return response;
          })
      )
    );
    return;
  }

  // Network-first for the unhashed shell (index.html, manifest.json,
  // icons, sw.js, the bare directory, etc.)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        // Navigation fallback: if the user is offline and we don't have
        // this exact URL cached, serve the precached index.html so the
        // SPA can still boot.
        if (event.request.mode === 'navigate') {
          const indexFallback = await caches.match(`${BASE}index.html`);
          if (indexFallback) return indexFallback;
        }
        return Response.error();
      })
  );
});
