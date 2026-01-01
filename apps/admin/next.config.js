const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  poweredByHeader: false,

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  transpilePackages: [
    '@sooq-mazad/ui',
    '@sooq-mazad/utils',
    '@sooq-mazad/config',
    '@sooq-mazad/types',
  ],

  images: {
    unoptimized: true, // تعطيل تحسين الصور لأنها من خادم آخر
  },

  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@sooq-mazad/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@sooq-mazad/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@sooq-mazad/config': path.resolve(__dirname, '../../packages/config/src'),
      '@sooq-mazad/types': path.resolve(__dirname, '../../packages/types/src'),
    };
    return config;
  },

  async rewrites() {
    // استخدام متغير البيئة أو القيمة الافتراضية
    const webAppUrl = process.env.WEB_APP_URL || 'http://localhost:3021';

    return [
      {
        source: '/',
        destination: '/admin',
      },
      // توجيه طلبات الصور إلى تطبيق الـ web (port 3021)
      {
        source: '/images/:path*',
        destination: `${webAppUrl}/images/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${webAppUrl}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
