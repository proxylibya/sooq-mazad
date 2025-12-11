/**
 * سكريبت تهيئة بيانات الأقسام الافتراضية
 * يتم تشغيله بعد prisma migrate
 *
 * التشغيل: node scripts/seed-site-sections.js
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
    message: null,
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
    message: null,
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
    message: null,
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
    message: null,
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
    message: null,
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
    message: null,
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
    message: null,
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

const DEFAULT_ELEMENTS = [
  {
    key: 'hero_banner',
    name: 'البانر الرئيسي',
    pageType: 'homepage',
    elementType: 'section',
    category: 'hero',
    isVisible: true,
    isInteractive: true,
    displayOrder: 1,
  },
  {
    key: 'search_bar',
    name: 'شريط البحث',
    pageType: 'homepage',
    elementType: 'component',
    category: 'navigation',
    isVisible: true,
    isInteractive: true,
    displayOrder: 2,
  },
  {
    key: 'main_categories',
    name: 'الأقسام الرئيسية',
    pageType: 'homepage',
    elementType: 'section',
    category: 'navigation',
    isVisible: true,
    isInteractive: true,
    displayOrder: 3,
  },
  {
    key: 'featured_auctions',
    name: 'قسم الخدمات',
    pageType: 'homepage',
    elementType: 'section',
    category: 'content',
    isVisible: true,
    isInteractive: true,
    displayOrder: 4,
  },
  {
    key: 'premium_cars_ads',
    name: 'الإعلانات المميزة',
    pageType: 'homepage',
    elementType: 'section',
    category: 'advertisement',
    isVisible: true,
    isInteractive: true,
    displayOrder: 5,
  },
  {
    key: 'business_packages',
    name: 'حزم الأعمال',
    pageType: 'homepage',
    elementType: 'section',
    category: 'advertisement',
    isVisible: true,
    isInteractive: true,
    displayOrder: 6,
  },
  {
    key: 'cta_section',
    name: 'قسم CTA',
    pageType: 'homepage',
    elementType: 'section',
    category: 'content',
    isVisible: true,
    isInteractive: true,
    displayOrder: 7,
  },
  {
    key: 'site_stats',
    name: 'إحصائيات الموقع',
    pageType: 'homepage',
    elementType: 'section',
    category: 'information',
    isVisible: true,
    isInteractive: false,
    displayOrder: 8,
  },
];

async function main() {
  console.log('🚀 بدء تهيئة بيانات الأقسام...\n');

  try {
    // إضافة الأقسام
    console.log('📁 إضافة الأقسام...');
    for (const section of DEFAULT_SECTIONS) {
      const existing = await prisma.site_sections.findUnique({
        where: { slug: section.slug },
      });

      if (existing) {
        console.log(`   ⏭️  القسم "${section.name}" موجود مسبقاً`);
      } else {
        await prisma.site_sections.create({ data: section });
        console.log(`   ✅ تم إضافة القسم "${section.name}"`);
      }
    }

    // إضافة العناصر
    console.log('\n📦 إضافة العناصر...');
    for (const element of DEFAULT_ELEMENTS) {
      const existing = await prisma.site_elements.findUnique({
        where: { key: element.key },
      });

      if (existing) {
        console.log(`   ⏭️  العنصر "${element.name}" موجود مسبقاً`);
      } else {
        await prisma.site_elements.create({ data: element });
        console.log(`   ✅ تم إضافة العنصر "${element.name}"`);
      }
    }

    console.log('\n✨ تمت التهيئة بنجاح!');

    // عرض ملخص
    const sectionsCount = await prisma.site_sections.count();
    const elementsCount = await prisma.site_elements.count();
    console.log(`\n📊 الملخص:`);
    console.log(`   - الأقسام: ${sectionsCount}`);
    console.log(`   - العناصر: ${elementsCount}`);
  } catch (error) {
    console.error('❌ خطأ:', error.message);

    if (error.code === 'P2021') {
      console.log('\n⚠️  الجداول غير موجودة. قم بتشغيل:');
      console.log('   npx prisma migrate dev --name add_site_sections');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
