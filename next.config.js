/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,

  // تحسينات الأداء المتقدمة
  experimental: {
    scrollRestoration: true,
    optimizeCss: true,
  },

  // إعدادات الصور المحسنة
  images: {
    domains: [
      'localhost',
      'sooq-mazad.ly',
      'res.cloudinary.com',
      'staticmap.openstreetmap.de',
      'tile.openstreetmap.org',
    ],
    remotePatterns: [
      { protocol: 'https', hostname: '**.openstreetmap.de' },
      { protocol: 'https', hostname: '**.openstreetmap.org' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Headers للأداء والأمان
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
      {
        // في التطوير: لا cache لتجنب ERR_CONTENT_LENGTH_MISMATCH
        // في الإنتاج: cache طويل المدة
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev ? 'no-store, max-age=0' : 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev ? 'no-cache' : 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev ? 'no-cache' : 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },

  // إعدادات Webpack المحسنة
  webpack: (config, { isServer, dev }) => {
    config.ignoreWarnings = [{ module: /node_modules/ }, { message: /Critical dependency/ }];

    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            common: {
              minChunks: 2,
              priority: -10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },

  // إعدادات TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },

  // إعدادات ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },

  // تحسين أوقات الاستجابة
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
};

module.exports = nextConfig;
