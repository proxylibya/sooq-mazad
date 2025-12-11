const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');

const prisma = new PrismaClient();

const BANNER_TEMPLATES = [
  {
    name: 'Leaderboard - لوحة صدارة',
    description: 'بنر أفقي كبير مثالي لأعلى الصفحة',
    category: 'web',
    width: 728,
    height: 90,
    aspectRatio: '728:90',
    tags: ['horizontal', 'top', 'desktop'],
  },
  {
    name: 'Billboard - لوحة إعلانية',
    description: 'بنر أفقي ضخم للإعلانات المميزة',
    category: 'web',
    width: 970,
    height: 250,
    aspectRatio: '970:250',
    tags: ['horizontal', 'premium', 'desktop'],
  },
  {
    name: 'Large Rectangle - مستطيل كبير',
    description: 'بنر مربع كبير للشريط الجانبي',
    category: 'web',
    width: 336,
    height: 280,
    aspectRatio: '336:280',
    tags: ['sidebar', 'desktop', 'standard'],
  },
  {
    name: 'Medium Rectangle - مستطيل متوسط',
    description: 'البنر الأكثر شيوعاً للمحتوى',
    category: 'web',
    width: 300,
    height: 250,
    aspectRatio: '300:250',
    tags: ['sidebar', 'content', 'standard'],
  },
  {
    name: 'Wide Skyscraper - ناطحة سحاب عريضة',
    description: 'بنر طولي للشريط الجانبي',
    category: 'web',
    width: 160,
    height: 600,
    aspectRatio: '160:600',
    tags: ['vertical', 'sidebar', 'desktop'],
  },
  {
    name: 'Mobile Banner - بنر موبايل',
    description: 'بنر مخصص للهواتف المحمولة',
    category: 'mobile',
    width: 320,
    height: 50,
    aspectRatio: '320:50',
    tags: ['mobile', 'horizontal', 'bottom'],
  },
  {
    name: 'Mobile Leaderboard - لوحة موبايل',
    description: 'بنر موبايل أكبر حجماً',
    category: 'mobile',
    width: 320,
    height: 100,
    aspectRatio: '320:100',
    tags: ['mobile', 'horizontal', 'top'],
  },
  {
    name: 'Facebook Cover - غلاف فيسبوك',
    description: 'مقاس مثالي لإعلانات فيسبوك',
    category: 'social',
    width: 820,
    height: 312,
    aspectRatio: '820:312',
    tags: ['facebook', 'social', 'cover'],
  },
  {
    name: 'Instagram Story - قصة انستغرام',
    description: 'مقاس عمودي لقصص انستغرام',
    category: 'social',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    tags: ['instagram', 'story', 'vertical'],
  },
  {
    name: 'Square 1:1 - مربع',
    description: 'بنر مربع مثالي لجميع المنصات',
    category: 'social',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    tags: ['square', 'instagram', 'universal'],
  },
  {
    name: 'Wide 16:9 - عريض',
    description: 'بنر عريض بنسبة HD القياسية',
    category: 'automotive',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    tags: ['wide', 'video', 'hd'],
  },
];

async function seedBannerTemplates() {
  console.log('🌱 Starting banner templates seeding...');

  try {
    const existingCount = await prisma.banner_templates.count();
    
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing templates. Skipping...`);
      console.log('💡 To re-seed, delete existing templates first.');
      return;
    }

    for (const template of BANNER_TEMPLATES) {
      await prisma.banner_templates.create({
        data: {
          id: nanoid(),
          ...template,
          isActive: true,
          usageCount: 0,
        },
      });
      console.log(`✅ Created: ${template.name}`);
    }

    console.log(`\n✨ Successfully seeded ${BANNER_TEMPLATES.length} banner templates!`);
    
    const categories = await prisma.banner_templates.groupBy({
      by: ['category'],
      _count: true,
    });
    
    console.log('\n📊 Templates by category:');
    categories.forEach(cat => {
      console.log(`   ${cat.category}: ${cat._count} templates`);
    });

  } catch (error) {
    console.error('❌ Error seeding banner templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedBannerTemplates()
  .then(() => {
    console.log('\n🎉 Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
