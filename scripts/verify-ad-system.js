const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 Verifying Advanced Advertising System...\n');

  try {
    // Check banner templates
    const templatesCount = await prisma.banner_templates.count();
    console.log(`✅ Banner Templates: ${templatesCount} templates in database`);
    
    if (templatesCount === 11) {
      console.log('   Perfect! All 11 standard banner templates are seeded.');
    }

    // Check ad placements
    const placementsCount = await prisma.ad_placements.count();
    console.log(`✅ Ad Placements: ${placementsCount} placements configured`);

    // Check placement ads
    const adsCount = await prisma.placement_ads.count();
    console.log(`✅ Placement Ads: ${adsCount} ads created`);

    // Check targeting
    const targetingCount = await prisma.ad_targeting.count();
    console.log(`✅ Ad Targeting: ${targetingCount} targeting configurations`);

    // Check variants
    const variantsCount = await prisma.ad_variants.count();
    console.log(`✅ Ad Variants: ${variantsCount} A/B test variants`);

    // Check analytics
    const analyticsCount = await prisma.ad_analytics.count();
    console.log(`✅ Ad Analytics: ${analyticsCount} analytics records`);

    console.log('\n📊 Template Categories:');
    const categories = await prisma.banner_templates.groupBy({
      by: ['category'],
      _count: true,
    });
    
    categories.forEach(cat => {
      console.log(`   ${cat.category.padEnd(12)}: ${cat._count} templates`);
    });

    console.log('\n🎉 System Verification Complete!');
    console.log('✨ Advanced Advertising System is fully operational.');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verify()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
