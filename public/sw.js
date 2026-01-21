/**
 * Service Worker for offline support and performance.
 * Caches core assets and implements stale-while-revalidate strategy.
 */

const CACHE_VERSION = "v2";
const CACHE_NAME = `logic-training-${CACHE_VERSION}`;

const CORE_ASSETS = [
  "/",
  "/manifest.json",
];

// Optional icons - don't fail cache install if missing
const OPTIONAL_ASSETS = [
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

/**
 * Install: Cache core assets
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Always cache core assets
      const corePromise = cache.addAll(CORE_ASSETS);
      
      // Try to cache optional assets, but don't fail
      const optionalPromise = Promise.allSettled(
        OPTIONAL_ASSETS.map((asset) => cache.add(asset))
      );

      return Promise.all([corePromise, optionalPromise]);
    }).then(() => {
      // Skip waiting and become active immediately
      return self.skipWaiting();
    })
  );
});

/**
 * Activate: Clean up old caches
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith("logic-training-") && key !== CACHE_NAME)
          .map((key) => {
            console.log(`[SW] Deleting old cache: ${key}`);
            return caches.delete(key);
          })
      );
    }).then(() => {
      // Claim all clients
      return self.clients.claim();
    })
  );
});

/**
 * Fetch: Implement stale-while-revalidate strategy
 */
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  
  // Don't cache cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle navigation requests (HTML pages)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return response;
        })
        .catch(() => {
          // Fall back to cached version
          return caches.match(event.request).then((cached) => {
            if (cached) {
              return cached;
            }
            // Return offline page if available
            return caches.match("/");
          });
        })
    );
    return;
  }

  // Stale-while-revalidate strategy for other assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Return cached version immediately
      if (cached) {
        // Revalidate in the background
        fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, copy);
              });
            }
          })
          .catch(() => {
            // Revalidation failed, but we already served cached version
          });
        return cached;
      }

      // Not in cache, fetch it
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed and not in cache
          return new Response("Offline - Resource not available", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({
              "Content-Type": "text/plain",
            }),
          });
        });
    })
  );
});
