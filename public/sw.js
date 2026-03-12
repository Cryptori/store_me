// sw.js — TokoKu Service Worker
// Cache strategy: Cache First untuk assets, Network First untuk API

const CACHE_VERSION = 'tokoku-v1'
const STATIC_CACHE  = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`

// Halaman & aset yang di-cache untuk offline
const PRECACHE_URLS = [
  '/',
  '/kasir',
  '/offline',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// ── Install: precache static assets ────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// ── Activate: clean old caches ──────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('tokoku-') && k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map(k => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch: smart caching strategy ──────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET dan API Supabase (biarkan network handle)
  if (request.method !== 'GET') return
  if (url.hostname.includes('supabase.co')) return
  if (url.hostname.includes('midtrans')) return

  // Next.js internals — network only
  if (url.pathname.startsWith('/_next/webpack-hmr')) return
  if (url.pathname.startsWith('/api/')) return

  // Static assets (_next/static) — Cache First
  if (url.pathname.startsWith('/_next/static')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Halaman app — Network First dengan fallback ke cache
  event.respondWith(networkFirstWithOfflineFallback(request))
})

// Cache First strategy
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503 })
  }
}

// Network First strategy
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    // Network gagal — coba dari cache
    const cached = await caches.match(request)
    if (cached) return cached
    // Fallback ke halaman offline
    const offlinePage = await caches.match('/offline')
    return offlinePage ?? new Response('Offline', { status: 503 })
  }
}

// ── Push notifications ──────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'TokoKu', {
      body: data.body ?? '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: data.tag ?? 'tokoku-notif',
      data: { url: data.url ?? '/dashboard' },
      actions: data.actions ?? [],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/dashboard'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})