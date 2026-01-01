// Service Worker متقدم للأداء العالي والاستقرار
const CACHE_NAME = 'sooq-mazad-v2.0.0';
const STATIC_CACHE = 'static-v2.0.0';
const DYNAMIC_CACHE = 'dynamic-v2.0.0';
const IMAGE_CACHE = 'images-v2.0.0';
;
// الملفات الأساسية للتخزين المؤقت
const STATIC_ASSETS = [;
  '/',
  '/auctions',
  '/marketplace',
  '/_next/static/css/app.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// شبكات URL للتخزين المؤقت الديناميكي
const DYNAMIC_PATTERNS = [;
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
  /\/_next\/static\//,
  /\/api\/auctions/,
  /\/api\/cars/,
];

// شبكات الصور
const IMAGE_PATTERNS = [/\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i, /\/images\//, /\/uploads\//];
;
// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');

  event.waitUntil(
    Promise.all([
      // تخزين الملفات الأساسية
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),

      // إنشاء caches أخرى
      caches.open(DYNAMIC_CACHE),
      caches.open(IMAGE_CACHE),
    ]).then(() => {
      console.log('✅ Service Worker installed successfully');
      // فرض تفعيل فوري
      return self.skipWaiting();
    }),
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');

  event.waitUntil(
    Promise.all([
      // تنظيف caches القديمة
      cleanupOldCaches(),

      // السيطرة على جميع الصفحات فوراً
      self.clients.claim(),
    ]).then(() => {
      console.log('✅ Service Worker activated successfully');
    }),
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
;
  // تجاهل الطلبات غير HTTP
  if (!request.url.startsWith('http')) return;

  // تجاهل Chrome Extensions
  if (url.protocol === 'chrome-extension:') return;

  // استراتيجيات مختلفة حسب نوع الطلب
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// معالجة طلبات الصور - Cache First
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);
;
    if (cachedResponse) {
      // تحديث الصورة في الخلفية إذا كانت قديمة
      if (isCacheExpired(cachedResponse, 24 * 60 * 60 * 1000)) {
        // 24 ساعة
        updateImageInBackground(request, cache);
      }
      return cachedResponse;
    }

    // جلب الصورة وتخزينها
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('Image request failed:', error);
    return new Response('Image not available', { status: 404 });
  }
}

// معالجة طلبات API - Network First مع Stale While Revalidate
async function handleAPIRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cacheKey = request.url;
;
  try {
    // محاولة الشبكة أولاً
    const response = await fetch(request.clone());
;
    if (response.status === 200) {
      // تخزين الاستجابة الناجحة
      const responseToCache = response.clone();
      responseToCache.headers.set('sw-cache-timestamp', Date.now().toString());
      cache.put(cacheKey, responseToCache);
    }

    return response;
  } catch (error) {
    console.warn('Network request failed, trying cache:', error);

    // الرجوع للتخزين المؤقت عند فشل الشبكة
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      // إضافة header للدلالة على أنها من Cache
      const response = cachedResponse.clone();
      response.headers.set('sw-from-cache', 'true');
      return response;
    }

    // إرجاع استجابة خطأ إذا لم يوجد في Cache
    return new Response(
      JSON.stringify({
        error: 'Network unavailable and no cached data',
        timestamp: Date.now(),
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

// معالجة الملفات الثابتة - Cache First
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
;
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('Static asset request failed:', error);
    return new Response('Asset not available', { status: 404 });
  }
}

// معالجة طلبات التنقل - Network First مع Cache Fallback
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
;
    if (response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.warn('Navigation request failed, trying cache:', error);

    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
;
    if (cachedResponse) {
      return cachedResponse;
    }

    // الرجوع للصفحة الرئيسية المخزنة
    const fallbackResponse = await cache.match('/');
    if (fallbackResponse) {
      return fallbackResponse;
    }

    return new Response('Page not available offline', {
      status: 503,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

// معالجة الطلبات الديناميكية العامة
async function handleDynamicRequest(request) {
  try {
    const response = await fetch(request);
;
    if (response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
;
    return cachedResponse || new Response('Resource not available', { status: 404 });
  }
}

// دوال مساعدة لتحديد نوع الطلب
function isImageRequest(request) {
  return IMAGE_PATTERNS.some((pattern) => pattern.test(request.url));
}

function isAPIRequest(request) {
  return request.url.includes('/api/') || request.url.includes('api.');
}

function isStaticAsset(request) {
  return (
    request.url.includes('/_next/static/') ||
    request.url.includes('/static/') ||
    /\.(js|css|woff2?)$/i.test(request.url)
  );
}

function isNavigationRequest(request) {
  return (
    request.mode === 'navigate' ||
    (request.method === 'GET' && request.headers.get('accept').includes('text/html'))
  );
}

// فحص انتهاء صلاحية Cache
function isCacheExpired(response, maxAge) {
  const timestamp = response.headers.get('sw-cache-timestamp');
  if (!timestamp) return true;

  return Date.now() - parseInt(timestamp) > maxAge;
}

// تحديث الصورة في الخلفية
async function updateImageInBackground(request, cache) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
  } catch (error) {
    console.warn('Background image update failed:', error);
  }
}

// تنظيف Caches القديمة
async function cleanupOldCaches() {
  const cacheWhitelist = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
  const cacheNames = await caches.keys();
;
  return Promise.all(
    cacheNames.map((cacheName) => {
      if (!cacheWhitelist.includes(cacheName)) {
        console.log('🗑️ Deleting old cache:', cacheName);
        return caches.delete(cacheName);
      }
    }),
  );
}

// رسائل من الصفحة الرئيسية
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;

      case 'CLEAR_CACHE':
        clearAllCaches().then(() => {
          event.ports[0].postMessage({ success: true });
        });
        break;

      case 'GET_CACHE_STATUS':
        getCacheStatus().then((status) => {
          event.ports[0].postMessage(status);
        });
        break;
    }
  }
});

// مسح جميع Caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(cacheNames.map((name) => caches.delete(name)));
}

// الحصول على حالة Cache
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
;
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    status[name] = keys.length;
  }

  return status;
}

console.log('🚀 Advanced Service Worker loaded successfully');
