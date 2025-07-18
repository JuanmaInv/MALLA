const CACHE_NAME = "malla-curricular-v1.0.0"
const urlsToCache = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/_next/static/css/app/layout.css",
  "/_next/static/chunks/webpack.js",
  "/_next/static/chunks/main-app.js",
]

self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching files")
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log("Service Worker: Installed successfully")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("Service Worker: Installation failed", error)
      }),
  )
})

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Deleting old cache", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker: Activated successfully")
        return self.clients.claim()
      }),
  )
})

self.addEventListener("fetch", (event) => {
  // Solo cachear solicitudes GET
  if (event.request.method !== "GET") {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si está en caché, devolverlo
      if (response) {
        return response
      }

      // Si no está en caché, hacer la solicitud de red
      return fetch(event.request)
        .then((response) => {
          // Verificar si la respuesta es válida
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clonar la respuesta
          const responseToCache = response.clone()

          // Agregar a la caché
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch((error) => {
          console.error("Service Worker: Fetch failed", error)
          // Devolver una respuesta offline si está disponible
          return caches.match("/")
        })
    }),
  )
})

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
