// Service Worker for Performance Optimization
const CACHE_NAME = 'himanjali-cache-v1.0.0';
const STATIC_CACHE = 'himanjali-static-v1.0.0';
const API_CACHE = 'himanjali-api-v1.0.0';
const IMAGE_CACHE = 'himanjali-images-v1.0.0';

// Cache strategies
const CACHE_STRATEGIES = {
  STATIC: 'cache-first',
  API: 'network-first',
  IMAGES: 'cache-first'
};

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/books.html',
  '/contact.html',
  '/media.html',
  '/src/styles/main.css',
  '/src/js/main.js',
  '/src/js/api.js',
  '/src/js/utils.js',
  '/src/js/components.js',
  '/src/js/book-components.js',
  '/src/js/app-components.js',
  '/src/js/config.js',
  '/src/js/services.js',
  '/src/js/performance-monitor.js',
  
  '/src/js/image-optimizer.js',
  '/himanjalisankar.png',
  '/favicon.ico',
  '/site.webmanifest'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/books',
  '/api/books/latest',
  '/api/about',
  '/api/social',
  '/api/media'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Cache API responses
      caches.open(API_CACHE).then(cache => {
        console.log('Caching API endpoints...');
        return cache.addAll(API_ENDPOINTS);
      })
    ]).then(() => {
      console.log('Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== API_CACHE && 
              cacheName !== IMAGE_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle different cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle static assets (CSS, JS, HTML)
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  
  // Handle API requests
  if (isApiRequest(request)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }
  
  // Handle images
  if (isImageRequest(request)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }
  
  // Handle other requests with network-first strategy
  event.respondWith(networkFirst(request));
});

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache-first strategy failed:', error);
    return new Response('Network error', { status: 503 });
  }
}

// Network-first strategy
async function networkFirst(request, cacheName = null) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && cacheName) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    if (cacheName) {
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    return new Response('Network error', { status: 503 });
  }
}

// Helper functions to determine request types
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.eot') ||
    url.pathname === '/' ||
    url.pathname === '/index.html'
  );
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

function isImageRequest(request) {
  const url = new URL(request.url);
  return (
    url.pathname.includes('/uploads/') ||
    
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url.pathname)
  );
}

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync any pending data when connection is restored
    console.log('Background sync triggered');
    
    // You can add specific sync logic here
    // For example, sync contact form submissions
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/himanjalisankar.png',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_IMAGES') {
    event.waitUntil(cacheImages(event.data.urls));
  }
});

// Cache specific images
async function cacheImages(urls) {
  const cache = await caches.open(IMAGE_CACHE);
  
  const promises = urls.map(url => {
    return fetch(url).then(response => {
      if (response.ok) {
        return cache.put(url, response);
      }
    }).catch(error => {
      console.warn('Failed to cache image:', url, error);
    });
  });
  
  await Promise.all(promises);
  console.log('Images cached successfully');
}
