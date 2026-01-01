import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge Caching Middleware
 * يوفر كاش متقدم على مستوى Edge للصفحات شبه الثابتة
 * يعمل مع Vercel Edge، Cloudflare Workers، أو أي CDN يدعم Edge Functions
 */

// تعريف الصفحات القابلة للكاش وفترات صلاحيتها
const CACHE_CONFIG = {
  // صفحات عامة (كاش طويل)
  static: {
    paths: ['/', '/about', '/contact', '/terms', '/privacy', '/showrooms', '/yards', '/transport'],
    maxAge: 3600, // ساعة واحدة
    staleWhileRevalidate: 86400, // 24 ساعة
  },
  // صفحات المزادات (كاش متوسط)
  auctions: {
    paths: ['/auctions', '/listings', '/marketplace'],
    maxAge: 300, // 5 دقائق
    staleWhileRevalidate: 600, // 10 دقائق
  },
  // صفحات السيارات (كاش قصير)
  cars: {
    paths: ['/cars'],
    maxAge: 180, // 3 دقائق
    staleWhileRevalidate: 300, // 5 دقائق
  },
  // API العام (كاش قصير جداً)
  publicApi: {
    paths: ['/api/public', '/api/stats', '/api/metrics'],
    maxAge: 60, // دقيقة واحدة
    staleWhileRevalidate: 120, // دقيقتان
  },
};

/**
 * تحديد نوع الكاش المناسب للمسار
 */
function getCacheConfigForPath(pathname: string): {
  maxAge: number;
  staleWhileRevalidate: number;
} | null {
  // البحث في الصفحات الثابتة
  if (CACHE_CONFIG.static.paths.some((path) => pathname === path)) {
    return {
      maxAge: CACHE_CONFIG.static.maxAge,
      staleWhileRevalidate: CACHE_CONFIG.static.staleWhileRevalidate,
    };
  }

  // البحث في صفحات المزادات
  if (CACHE_CONFIG.auctions.paths.some((path) => pathname.startsWith(path))) {
    return {
      maxAge: CACHE_CONFIG.auctions.maxAge,
      staleWhileRevalidate: CACHE_CONFIG.auctions.staleWhileRevalidate,
    };
  }

  // البحث في صفحات السيارات
  if (CACHE_CONFIG.cars.paths.some((path) => pathname.startsWith(path))) {
    return {
      maxAge: CACHE_CONFIG.cars.maxAge,
      staleWhileRevalidate: CACHE_CONFIG.cars.staleWhileRevalidate,
    };
  }

  // البحث في API العام
  if (CACHE_CONFIG.publicApi.paths.some((path) => pathname.startsWith(path))) {
    return {
      maxAge: CACHE_CONFIG.publicApi.maxAge,
      staleWhileRevalidate: CACHE_CONFIG.publicApi.staleWhileRevalidate,
    };
  }

  return null;
}

/**
 * Edge Caching Middleware الرئيسي
 */
export async function edgeCachingMiddleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // تطبيق الكاش على GET requests فقط
  if (method !== 'GET') {
    return NextResponse.next();
  }

  // تخطي الكاش إذا كان الطلب مخصصاً/شخصياً (جلسة مستخدم أو ترويسة تمنع الكاش)
  const hasAuthCookie =
    request.cookies.has('next-auth.session-token') ||
    request.cookies.has('__Secure-next-auth.session-token') ||
    request.cookies.has('admin_session') ||
    request.cookies.has('token') ||
    request.cookies.has('refreshToken');
  const cacheControl = request.headers.get('cache-control') || '';
  const hasNoCacheHeader = /no-cache|no-store|private/i.test(cacheControl);

  if (hasAuthCookie || hasNoCacheHeader || request.headers.has('authorization')) {
    const resp = NextResponse.next();
    resp.headers.set('X-Cache-Bypass', 'authenticated-or-nocache');
    return resp;
  }

  // تخطي الصفحات الخاصة والمصادقة
  const skipPaths = ['/admin', '/dashboard', '/profile', '/auth', '/api/auth'];
  if (skipPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // الحصول على تكوين الكاش
  const cacheConfig = getCacheConfigForPath(pathname);

  if (!cacheConfig) {
    return NextResponse.next();
  }

  // إنشاء response مع headers الكاش المناسبة
  const response = NextResponse.next();

  // إضافة Cache-Control headers
  const cacheControlHeader = [
    'public',
    `s-maxage=${cacheConfig.maxAge}`,
    `stale-while-revalidate=${cacheConfig.staleWhileRevalidate}`,
  ].join(', ');

  response.headers.set('Cache-Control', cacheControlHeader);

  // إضافة Vary header للتأكد من كاش صحيح
  response.headers.set('Vary', 'Accept-Encoding, Accept-Language');

  // إضافة ETag للتحقق من التغييرات
  const etag = generateETag(pathname);
  response.headers.set('ETag', etag);

  // التحقق من If-None-Match header
  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        'Cache-Control': cacheControlHeader,
        ETag: etag,
      },
    });
  }

  // إضافة X-Cache header للتتبع
  response.headers.set('X-Cache-Config', 'edge-caching-enabled');
  response.headers.set('X-Cache-Time', new Date().toISOString());

  return response;
}

/**
 * توليد ETag بسيط بناءً على المسار والوقت
 */
function generateETag(pathname: string): string {
  const date = new Date();
  const day = date.toISOString().split('T')[0];
  const hour = date.getHours();
  const minute = Math.floor(date.getMinutes() / 5) * 5; // تقريب إلى أقرب 5 دقائق

  // إنشاء hash بسيط
  const content = `${pathname}-${day}-${hour}-${minute}`;
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // تحويل إلى 32bit integer
  }

  return `W/"${Math.abs(hash).toString(36)}"`;
}

/**
 * Cloudflare Workers Edge Caching
 * يمكن استخدامه مع Cloudflare Workers
 */
export const cloudflareEdgeCaching = {
  /**
   * تفعيل الكاش على مستوى Cloudflare Edge
   */
  enableEdgeCache: (response: Response, cacheTime: number): Response => {
    const headers = new Headers(response.headers);

    // إضافة Cloudflare-specific headers
    headers.set('CDN-Cache-Control', `max-age=${cacheTime}`);
    headers.set('Cloudflare-CDN-Cache-Control', `max-age=${cacheTime}`);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },

  /**
   * إضافة Cache Tags لـ Cloudflare
   */
  addCacheTags: (response: Response, tags: string[]): Response => {
    const headers = new Headers(response.headers);
    headers.set('Cache-Tag', tags.join(','));

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};

/**
 * Vercel Edge Caching
 * يمكن استخدامه مع Vercel Edge Functions
 */
export const vercelEdgeCaching = {
  /**
   * تفعيل الكاش على مستوى Vercel Edge
   */
  enableEdgeCache: (response: NextResponse, cacheTime: number): NextResponse => {
    response.headers.set('Cache-Control', `public, s-maxage=${cacheTime}, stale-while-revalidate`);
    response.headers.set('CDN-Cache-Control', `max-age=${cacheTime}`);
    response.headers.set('Vercel-CDN-Cache-Control', `max-age=${cacheTime}`);

    return response;
  },

  /**
   * تفعيل ISR (Incremental Static Regeneration)
   */
  enableISR: (response: NextResponse, revalidateSeconds: number): NextResponse => {
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${revalidateSeconds}, stale-while-revalidate`,
    );

    return response;
  },
};

/**
 * Static Asset Caching
 * كاش متقدم للأصول الثابتة
 */
export function staticAssetCaching(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  // الملفات الثابتة
  const staticAssets = [
    { pattern: /\.(jpg|jpeg|png|gif|ico|svg|webp)$/i, maxAge: 31536000 },
    { pattern: /\.(css|js)$/i, maxAge: 31536000 },
    { pattern: /\.(woff|woff2|ttf|eot|otf)$/i, maxAge: 31536000 },
    { pattern: /\.(json|xml)$/i, maxAge: 3600 },
  ];

  for (const asset of staticAssets) {
    if (asset.pattern.test(pathname)) {
      const response = NextResponse.next();

      response.headers.set('Cache-Control', `public, max-age=${asset.maxAge}, immutable`);
      response.headers.set('X-Cache-Type', 'static-asset');

      return response;
    }
  }

  return null;
}

export default edgeCachingMiddleware;
