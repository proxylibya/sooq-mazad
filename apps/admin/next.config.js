/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,

  // هام جداً للنشر على Vercel لتقليل حجم البناء
  output: 'standalone',

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
    unoptimized: true,
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
