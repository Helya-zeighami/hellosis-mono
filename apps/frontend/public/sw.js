const PRECACHE = "hellosis-shell-v3"
const RUNTIME = "hellosis-runtime-v3"
const APP_SHELL = ["/en", "/fa", "/icon-192x192.png", "/icon-512x512.png"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== PRECACHE && k !== RUNTIME).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return

  const { request } = event
  const url = new URL(request.url)

  // Next.js owns its streamed route data and immutable build assets. Caching
  // these here can mix deployments or make client navigation wait on stale RSC.
  if (
    request.headers.get("RSC") === "1" ||
    url.searchParams.has("_rsc") ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/api/")
  ) return

  // same-origin navigation: network-first, fallback to cache
  if (request.mode === "navigate" && url.origin === self.location.origin) {
    event.respondWith(
      fetch(request).then((response) => {
        const copy = response.clone()
        caches.open(RUNTIME).then((cache) => cache.put(request, copy))
        return response
      }).catch(() => caches.match(request).then((c) => c || caches.match("/en"))),
    )
    return
  }

  // everything else: cache-first, then network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone()
          caches.open(RUNTIME).then((cache) => cache.put(request, clone))
        }
        return response
      })
    }),
  )
})

self.addEventListener("push", (event) => {
  let data = { title: "Hellosis", body: "" }
  try {
    data = event.data?.json() ?? data
  } catch {
    // ignore
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      vibrate: [100, 50, 100],
    }),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(self.clients.openWindow("/"))
})
