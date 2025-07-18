const CACHE_NAME = "malla-curricular-v2.0.0"
const urlsToCache = ["/", "/manifest.json", "/?view=progress", "/?edit=career", "/offline.html"]

// Instalación del Service Worker
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

// Activación del Service Worker
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

// Interceptar solicitudes de red con Background Sync
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch((error) => {
          console.error("Service Worker: Fetch failed", error)
          // Return offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/offline.html")
          }
          return caches.match("/")
        })
    }),
  )
})

// Background Sync - Sincronización en segundo plano
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  console.log("Background sync ejecutado")
  try {
    // Sincronizar datos pendientes
    const pendingData = await getPendingData()
    if (pendingData.length > 0) {
      await syncDataToServer(pendingData)
      await clearPendingData()
    }
  } catch (error) {
    console.error("Error en background sync:", error)
    throw error // Re-throw para que se reintente
  }
}

// Periodic Background Sync - Actualización periódica
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "periodic-background-sync") {
    event.waitUntil(doPeriodicSync())
  }
})

async function doPeriodicSync() {
  console.log("Periodic sync ejecutado")
  try {
    // Actualizar contenido en segundo plano
    const response = await fetch("/api/latest-content")
    if (response.ok) {
      const data = await response.json()
      const cache = await caches.open(CACHE_NAME)
      await cache.put("/api/latest-content", new Response(JSON.stringify(data)))
    }
  } catch (error) {
    console.error("Error en periodic sync:", error)
  }
}

// Push Notifications - Notificaciones push
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {}
  const options = {
    body: data.body || "Nueva actualización disponible",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: {
      url: data.url || "/",
      timestamp: Date.now(),
    },
    actions: [
      {
        action: "open",
        title: "Abrir App",
      },
      {
        action: "close",
        title: "Cerrar",
      },
    ],
    requireInteraction: true,
    silent: false,
  }

  event.waitUntil(self.registration.showNotification(data.title || "MallaApp", options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "open" || !event.action) {
    event.waitUntil(clients.openWindow(event.notification.data.url))
  }
})

// Share Target - Manejar contenido compartido
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  if (url.pathname === "/share-target") {
    event.respondWith(handleSharedTarget(event.request))
  }

  if (url.pathname === "/open-file") {
    event.respondWith(handleFileOpen(event.request))
  }
})

async function handleSharedTarget(request) {
  const formData = await request.formData()
  const title = formData.get("title") || ""
  const text = formData.get("text") || ""
  const url = formData.get("url") || ""

  return Response.redirect(
    `/?shared=true&title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    302,
  )
}

async function handleFileOpen(request) {
  const url = new URL(request.url)
  const fileType = url.searchParams.get("type")

  return Response.redirect(`/?file-opened=true&type=${fileType}`, 302)
}

// Funciones auxiliares
async function getPendingData() {
  // Simular obtención de datos pendientes
  return []
}

async function syncDataToServer(data) {
  // Simular sincronización con servidor
  console.log("Sincronizando datos:", data)
}

async function clearPendingData() {
  // Simular limpieza de datos sincronizados
  console.log("Datos pendientes limpiados")
}

// Manejo de errores globales
self.addEventListener("error", (event) => {
  console.error("Service Worker error:", event.error)
})

self.addEventListener("unhandledrejection", (event) => {
  console.error("Service Worker unhandled rejection:", event.reason)
})
