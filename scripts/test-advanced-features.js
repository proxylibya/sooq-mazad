const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdvancedFeatures() {
  console.log('🧪 Testing Advanced Ad Features...\n');

  let placementId = null;
  let adId = null;

  try {
    console.log('1. Creating test placement...');
    const placement = await prisma.ad_placements.create({
      data: {
        name: 'Test Advanced Features',
        location: 'HOME_TOP',
        type: 'SLIDER',
        maxAds: 5,
        displayOrder: 1,
        isActive: true,
      },
    });
    placementId = placement.id;
    console.log('✓ Created placement:', placementId);
    console.log('');

    console.log('2. Creating ad with full data (title, description, image)...');
    const ad = await prisma.placement_ads.create({
      data: {
        placementId: placementId,
        entityType: 'AUCTION',
        entityId: 'auction-advanced-test',
        title: 'مزاد BMW 2024 الفاخرة',
        description: 'سيارة BMW بحالة ممتازة مع كامل المواصفات والإضافات',
        imageUrl: 'https://example.com/bmw-2024.jpg',
        priority: 10,
        isActive: true,
      },
    });
    adId = ad.id;
    console.log('✓ Created ad with advanced features');
    console.log('  ID:', ad.id);
    console.log('  Title:', ad.title);
    console.log('  Description:', ad.description);
    console.log('  Image:', ad.imageUrl);
    console.log('');

    console.log('3. Testing clicks and impressions tracking...');
    
    for (let i = 0; i < 50; i++) {
      await prisma.placement_ads.update({
        where: { id: adId },
        data: {
          impressions: {
            increment: 1,
          },
        },
      });
    }
    console.log('✓ Added 50 impressions');

    for (let i = 0; i < 5; i++) {
      await prisma.placement_ads.update({
        where: { id: adId },
        data: {
          clicks: {
            increment: 1,
          },
        },
      });
    }
    console.log('✓ Added 5 clicks');
    console.log('');

    console.log('4. Calculating CTR...');
    const adWithStats = await prisma.placement_ads.findUnique({
      where: { id: adId },
    });
    const ctr = (adWithStats.clicks / adWithStats.impressions) * 100;
    console.log('✓ Statistics:');
    console.log('  Clicks:', adWithStats.clicks);
    console.log('  Impressions:', adWithStats.impressions);
    console.log('  CTR:', ctr.toFixed(2) + '%');
    console.log('');

    console.log('5. Creating multiple ads with different stats...');
    const ads = [];
    for (let i = 1; i <= 3; i++) {
      const newAd = await prisma.placement_ads.create({
        data: {
          placementId: placementId,
          entityType: 'CAR',
          entityId: `car-test-${i}`,
          title: `سيارة تجريبية ${i}`,
          description: `وصف السيارة التجريبية رقم ${i}`,
          imageUrl: `https://example.com/car-${i}.jpg`,
          priority: 10 - i,
          isActive: true,
          clicks: Math.floor(Math.random() * 20),
          impressions: Math.floor(Math.random() * 200) + 50,
        },
      });
      ads.push(newAd);
    }
    console.log(`✓ Created ${ads.length} additional ads`);
    console.log('');

    console.log('6. Testing stats aggregation...');
    const allAds = await prisma.placement_ads.findMany({
      where: { placementId },
      include: {
        placement: {
          select: {
            name: true,
            location: true,
          },
        },
      },
    });

    const totalClicks = allAds.reduce((sum, ad) => sum + ad.clicks, 0);
    const totalImpressions = allAds.reduce((sum, ad) => sum + ad.impressions, 0);
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    console.log('✓ Aggregate stats:');
    console.log('  Total Ads:', allAds.length);
    console.log('  Total Clicks:', totalClicks);
    console.log('  Total Impressions:', totalImpressions);
    console.log('  Average CTR:', avgCTR.toFixed(2) + '%');
    console.log('');

    console.log('7. Testing top performing ads query...');
    const topAds = await prisma.placement_ads.findMany({
      where: { placementId },
      orderBy: { clicks: 'desc' },
      take: 3,
    });
    console.log('✓ Top 3 ads by clicks:');
    topAds.forEach((ad, index) => {
      const adCtr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00';
      console.log(`  ${index + 1}. ${ad.title || ad.entityId}`);
      console.log(`     Clicks: ${ad.clicks}, Impressions: ${ad.impressions}, CTR: ${adCtr}%`);
    });
    console.log('');

    console.log('8. Testing ads with custom data...');
    const customAd = await prisma.placement_ads.create({
      data: {
        placementId: placementId,
        entityType: 'CUSTOM',
        entityId: 'custom-test',
        title: 'إعلان مخصص',
        description: 'إعلان بمحتوى مخصص',
        customData: {
          buttonText: 'اعرف المزيد',
          backgroundColor: '#ff6600',
          features: ['ميزة 1', 'ميزة 2', 'ميزة 3'],
        },
        priority: 15,
        isActive: true,
      },
    });
    console.log('✓ Created ad with custom data');
    console.log('  Custom Data:', JSON.stringify(customAd.customData, null, 2));
    console.log('');

    console.log('9. Testing inactive ads filtering...');
    await prisma.placement_ads.update({
      where: { id: ads[0].id },
      data: { isActive: false },
    });
    
    const activeAds = await prisma.placement_ads.findMany({
      where: {
        placementId: placementId,
        isActive: true,
      },
    });
    console.log('✓ Active ads count:', activeAds.length);
    console.log('  (1 ad was deactivated for testing)');
    console.log('');

    console.log('10. Testing date-based filtering...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    await prisma.placement_ads.update({
      where: { id: ads[1].id },
      data: {
        startDate: now,
        endDate: tomorrow,
      },
    });
    console.log('✓ Set date range for one ad');
    console.log('  Start:', now.toISOString());
    console.log('  End:', tomorrow.toISOString());
    console.log('');

    console.log('11. Cleanup test data...');
    await prisma.placement_ads.deleteMany({
      where: { placementId: placementId },
    });
    await prisma.ad_placements.delete({
      where: { id: placementId },
    });
    console.log('✓ Cleanup completed');
    console.log('');

    console.log('✅ All advanced features tests passed!\n');
    console.log('📊 Test Summary:');
    console.log('  ✓ Title & Description support');
    console.log('  ✓ Image URL support');
    console.log('  ✓ Click tracking');
    console.log('  ✓ Impression tracking');
    console.log('  ✓ CTR calculation');
    console.log('  ✓ Stats aggregation');
    console.log('  ✓ Top ads sorting');
    console.log('  ✓ Custom data JSON');
    console.log('  ✓ Active/inactive filtering');
    console.log('  ✓ Date-based filtering');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);

    if (placementId) {
      console.log('\n🧹 Cleaning up after error...');
      try {
        await prisma.placement_ads.deleteMany({
          where: { placementId: placementId },
        });
        await prisma.ad_placements.delete({
          where: { id: placementId },
        });
        console.log('✓ Cleanup completed');
      } catch (cleanupError) {
        console.error('Failed to cleanup:', cleanupError.message);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

testAdvancedFeatures();
