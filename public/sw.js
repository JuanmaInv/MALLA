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

// Interceptar solicitudes de red
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

// Soporte para Background Sync
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncData())
  }
})

async function syncData() {
  // Aquí iría la lógica para sincronizar datos cuando se recupera la conexión
  console.log("Background sync ejecutado")
  // Por ejemplo, enviar datos almacenados localmente al servidor
  const dataToSync = await getDataToSync()
  if (dataToSync.length > 0) {
    try {
      // Enviar datos al servidor
      await sendToServer(dataToSync)
      // Limpiar datos sincronizados
      await clearSyncedData()
    } catch (error) {
      console.error("Error al sincronizar datos:", error)
      // La sincronización fallará y se reintentará automáticamente
      return Promise.reject(error)
    }
  }
  return Promise.resolve()
}

// Funciones auxiliares para la sincronización
async function getDataToSync() {
  // Simulación - en una app real, esto obtendría datos de IndexedDB
  return []
}

async function sendToServer(data) {
  // Simulación - en una app real, esto enviaría datos al servidor
  console.log("Enviando datos al servidor:", data)
}

async function clearSyncedData() {
  // Simulación - en una app real, esto limpiaría los datos sincronizados
  console.log("Datos sincronizados limpiados")
}

// Soporte para Push Notifications
self.addEventListener("push", (event) => {
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: {
      url: data.url || "/",
    },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data.url))
})

// Soporte para Periodic Sync (actualización en segundo plano)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "update-content") {
    event.waitUntil(updateContent())
  }
})

async function updateContent() {
  // Aquí iría la lógica para actualizar contenido en segundo plano
  console.log("Periodic sync ejecutado - actualizando contenido")
  try {
    // Obtener nuevos datos
    const response = await fetch("/api/latest-data")
    if (response.ok) {
      const data = await response.json()
      // Actualizar caché con nuevos datos
      const cache = await caches.open(CACHE_NAME)
      // Actualizar páginas principales
      await cache.put("/", new Response(JSON.stringify(data)))
      console.log("Contenido actualizado en segundo plano")
    }
  } catch (error) {
    console.error("Error al actualizar contenido:", error)
    return Promise.reject(error)
  }
  return Promise.resolve()
}

// Mensaje para actualizar el Service Worker
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
