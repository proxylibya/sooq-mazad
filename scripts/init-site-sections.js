/**
 * سكربت تهيئة جدول site_sections بالبيانات الافتراضية
 * تشغيل: node scripts/init-site-sections.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEFAULT_SECTIONS = [
  {
    slug: 'auctions',
    name: 'سوق المزاد',
    description: 'مزادات السيارات المباشرة',
    icon: 'ScaleIcon',
    status: 'ACTIVE',
    showInNavbar: true,
    showInMobileMenu: true,
    showInFooter: true,
    showInHomepage: true,
    showHomeButton: true,
    showHomeCard: true,
    navbarOrder: 1,
    footerOrder: 1,
    homepageOrder: 1,
    pageUrl: '/auctions',
    primaryColor: '#f59e0b',
    secondaryColor: '#d97706',
  },
  {
    slug: 'marketplace',
    name: 'السوق الفوري',
    description: 'بيع وشراء السيارات مباشرة',
    icon: 'ShoppingBagIcon',
    status: 'ACTIVE',
    showInNavbar: true,
    showInMobileMenu: true,
    showInFooter: true,
    showInHomepage: true,
    showHomeButton: true,
    showHomeCard: true,
    navbarOrder: 2,
    footerOrder: 2,
    homepageOrder: 2,
    pageUrl: '/marketplace',
    primaryColor: '#3b82f6',
    secondaryColor: '#2563eb',
  },
  {
    slug: 'yards',
    name: 'الساحات',
    description: 'ساحات عرض السيارات',
    icon: 'MapPinIcon',
    status: 'ACTIVE',
    showInNavbar: true,
    showInMobileMenu: true,
    showInFooter: true,
    showInHomepage: true,
    showHomeButton: true,
    showHomeCard: true,
    navbarOrder: 3,
    footerOrder: 3,
    homepageOrder: 3,
    pageUrl: '/yards',
    primaryColor: '#10b981',
    secondaryColor: '#059669',
  },
  {
    slug: 'showrooms',
    name: 'المعارض',
    description: 'معارض السيارات',
    icon: 'BuildingStorefrontIcon',
    status: 'ACTIVE',
    showInNavbar: true,
    showInMobileMenu: true,
    showInFooter: true,
    showInHomepage: true,
    showHomeButton: true,
    showHomeCard: true,
    navbarOrder: 4,
    footerOrder: 4,
    homepageOrder: 4,
    pageUrl: '/showrooms',
    primaryColor: '#14b8a6',
    secondaryColor: '#0d9488',
  },
  {
    slug: 'transport',
    name: 'خدمات النقل',
    description: 'خدمات نقل السيارات',
    icon: 'TruckIcon',
    status: 'ACTIVE',
    showInNavbar: true,
    showInMobileMenu: true,
    showInFooter: true,
    showInHomepage: true,
    showHomeButton: true,
    showHomeCard: true,
    navbarOrder: 5,
    footerOrder: 5,
    homepageOrder: 5,
    pageUrl: '/transport',
    primaryColor: '#f97316',
    secondaryColor: '#ea580c',
  },
  {
    slug: 'companies',
    name: 'الشركات',
    description: 'شركات السيارات',
    icon: 'BuildingOfficeIcon',
    status: 'ACTIVE',
    showInNavbar: false,
    showInMobileMenu: false,
    showInFooter: false,
    showInHomepage: false,
    showHomeButton: false,
    showHomeCard: false,
    navbarOrder: 6,
    footerOrder: 6,
    homepageOrder: 6,
    pageUrl: '/companies',
    primaryColor: '#8b5cf6',
    secondaryColor: '#7c3aed',
  },
  {
    slug: 'premium-cars',
    name: 'السيارات المميزة',
    description: 'سيارات VIP',
    icon: 'SparklesIcon',
    status: 'ACTIVE',
    showInNavbar: false,
    showInMobileMenu: false,
    showInFooter: false,
    showInHomepage: false,
    showHomeButton: false,
    showHomeCard: false,
    navbarOrder: 7,
    footerOrder: 7,
    homepageOrder: 7,
    pageUrl: '/premium-cars',
    primaryColor: '#eab308',
    secondaryColor: '#ca8a04',
  },
];

async function main() {
  console.log('🚀 بدء تهيئة جدول site_sections...\n');

  try {
    // فحص وجود الجدول
    const existingSections = await prisma.site_sections.findMany();
    console.log(`📊 عدد الأقسام الموجودة: ${existingSections.length}`);

    if (existingSections.length === 0) {
      console.log('\n📝 إنشاء الأقسام الافتراضية...');

      for (const section of DEFAULT_SECTIONS) {
        await prisma.site_sections.create({
          data: section,
        });
        console.log(`  ✅ تم إنشاء: ${section.name}`);
      }

      console.log('\n✨ تم إنشاء جميع الأقسام بنجاح!');
    } else {
      console.log('\n📋 الأقسام الموجودة:');
      for (const section of existingSections) {
        console.log(`  - ${section.name} (${section.slug}) - ${section.status}`);
      }
      console.log('\n✅ البيانات موجودة، لا حاجة للتهيئة');
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);

    if (error.code === 'P2021') {
      console.log('\n⚠️ الجدول غير موجود. قم بتشغيل:');
      console.log('   npx prisma db push');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
