// @ts-nocheck
/**
 * Cloudflare CDN Configuration
 * CDN مجاني 100% لتحسين الأداء
 */

export const cloudflareConfig = {
  // Cloudflare Pages - مجاني للـ Static Assets
  cdn: {
    enabled: (process as any).env.NODE_ENV === 'production',
    baseUrl: (process as any).env.NEXT_PUBLIC_CDN_URL || '',
    
    // تحويل مسارات الصور للـ CDN
    getImageUrl: (path: string) => {
      if (!cloudflareConfig.cdn.enabled || !cloudflareConfig.cdn.baseUrl) {
        return path;
      }
      
      // إذا كان المسار كامل URL، ارجعه كما هو
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      
      // أضف CDN URL للصور
      return `${cloudflareConfig.cdn.baseUrl}${path}`;
    },

    // تحويل الـ Static Assets
    getAssetUrl: (path: string) => {
      if (!cloudflareConfig.cdn.enabled || !cloudflareConfig.cdn.baseUrl) {
        return path;
      }
      
      // الملفات التي يجب أن تمر عبر CDN
      const cdnAssets = ['.css', '.js', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif'];
      const shouldUseCDN = cdnAssets.some(ext => path.endsWith(ext));
      
      if (shouldUseCDN) {
        return `${cloudflareConfig.cdn.baseUrl}${path}`;
      }
      
      return path;
    }
  },

  // Cloudflare Image Optimization (مجاني مع حدود)
  imageOptimization: {
    formats: ['avif', 'webp'],
    quality: 85,
    
    // إنشاء URL محسن للصورة
    getOptimizedUrl: (src: string, options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'avif' | 'webp' | 'auto';
    } = {}) => {
      // Cloudflare Image Resizing
      if (cloudflareConfig.cdn.enabled) {
        const params = new URLSearchParams();
        
        if (options.width) params.append('width', options.width.toString());
        if (options.height) params.append('height', options.height.toString());
        if (options.quality) params.append('quality', options.quality.toString());
        if (options.format) params.append('format', options.format);
        
        const queryString = params.toString();
        return queryString ? `${src}?${queryString}` : src;
      }
      
      return src;
    }
  },

  // Cloudflare Cache Rules
  cacheRules: {
    // Cache static assets لمدة طويلة
    static: {
      images: '365d',
      css: '30d',
      js: '30d',
      fonts: '365d'
    },
    
    // Cache API responses
    api: {
      public: '5m',
      authenticated: '1m',
      realtime: '0s'
    },
    
    // إنشاء Cache Headers
    getHeaders: (type: 'static' | 'api', subtype: string) => {
      const rules = cloudflareConfig.cacheRules[type];
      const duration = rules[subtype as keyof typeof rules];
      
      if (!duration || duration === '0s') {
        return {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        };
      }
      
      // تحويل المدة إلى ثواني
      const seconds = parseDuration(duration);
      
      return {
        'Cache-Control': `public, max-age=${seconds}, s-maxage=${seconds}`,
        'CDN-Cache-Control': `max-age=${seconds}`,
        'Cloudflare-CDN-Cache-Control': `max-age=${seconds}`
      };
    }
  },

  // Cloudflare Security Headers
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: *.cloudflare.com",
      "font-src 'self' data:",
      "connect-src 'self' *.cloudflare.com",
      "frame-ancestors 'none'"
    ].join('; ')
  },

  // Cloudflare Workers (Edge Functions) - مجاني حتى 100k requests/day
  workers: {
    // إعادة توجيه الصور للـ optimization
    imageWorker: `
      addEventListener('fetch', event => {
        event.respondWith(handleRequest(event.request))
      })
      
      async function handleRequest(request) {
        const url = new URL(request.url)
        
        // تحسين الصور تلقائياً
        if (/\\.(jpg|jpeg|png|gif|webp)$/i.test(url.pathname)) {
          const accept = request.headers.get('Accept')
          
          if (accept && accept.includes('image/avif')) {
            url.searchParams.set('format', 'avif')
          } else if (accept && accept.includes('image/webp')) {
            url.searchParams.set('format', 'webp')
          }
          
          // إضافة quality تلقائياً إذا لم تكن موجودة
          if (!url.searchParams.has('quality')) {
            url.searchParams.set('quality', '85')
          }
        }
        
        return fetch(url.toString(), request)
      }
    `,
    
    // حماية من DDoS
    rateLimitWorker: `
      const rateLimits = new Map()
      
      addEventListener('fetch', event => {
        event.respondWith(handleRateLimit(event.request))
      })
      
      async function handleRateLimit(request) {
        const ip = request.headers.get('CF-Connecting-IP')
        const key = \`\${ip}:\${new Date().getMinutes()}\`
        
        const count = rateLimits.get(key) || 0
        
        if (count > 100) { // 100 requests per minute
          return new Response('Too Many Requests', { status: 429 })
        }
        
        rateLimits.set(key, count + 1)
        
        // تنظيف الذاكرة
        if (rateLimits.size > 1000) {
          const oldestKey = rateLimits.keys().next().value
          rateLimits.delete(oldestKey)
        }
        
        return fetch(request)
      }
    `
  }
};

// Helper function لتحويل المدة
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 0;
  
  const [, value, unit] = match;
  const num = parseInt(value, 10);
  
  switch (unit) {
    case 's': return num;
    case 'm': return num * 60;
    case 'h': return num * 3600;
    case 'd': return num * 86400;
    default: return 0;
  }
}

// تصدير helper functions
export const { getImageUrl, getAssetUrl } = cloudflareConfig.cdn;
export const { getOptimizedUrl } = cloudflareConfig.imageOptimization;
export const { getHeaders } = cloudflareConfig.cacheRules;

export default cloudflareConfig;
