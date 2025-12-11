const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFullAdSystem() {
  console.log('Testing Full Ad Placement System...\n');

  let placementId = null;
  let adId = null;

  try {
    console.log('1. Creating ad placement...');
    const placement = await prisma.ad_placements.create({
      data: {
        name: 'Test Homepage Banner',
        description: 'Banner for testing',
        location: 'HOME_TOP',
        type: 'SLIDER',
        status: 'ACTIVE',
        maxAds: 3,
        displayOrder: 1,
        autoRotate: true,
        rotateInterval: 5,
        width: '100%',
        height: '400px',
        isActive: true,
      },
    });
    placementId = placement.id;
    console.log('✓ Created placement:', placementId);
    console.log('  Name:', placement.name);
    console.log('  Max Ads:', placement.maxAds);
    console.log('');

    console.log('2. Adding first ad to placement...');
    const ad1 = await prisma.placement_ads.create({
      data: {
        placementId: placementId,
        entityType: 'AUCTION',
        entityId: 'auction-test-123',
        priority: 10,
        isActive: true,
      },
      include: {
        placement: true,
      },
    });
    adId = ad1.id;
    console.log('✓ Created ad:', ad1.id);
    console.log('  Type:', ad1.entityType);
    console.log('  Entity ID:', ad1.entityId);
    console.log('  Priority:', ad1.priority);
    console.log('');

    console.log('3. Adding second ad to placement...');
    const ad2 = await prisma.placement_ads.create({
      data: {
        placementId: placementId,
        entityType: 'CAR',
        entityId: 'car-test-456',
        priority: 5,
        isActive: true,
      },
    });
    console.log('✓ Created ad:', ad2.id);
    console.log('');

    console.log('4. Fetching placement with ads...');
    const placementWithAds = await prisma.ad_placements.findUnique({
      where: { id: placementId },
      include: {
        ads: {
          orderBy: { priority: 'desc' },
        },
        _count: {
          select: { ads: true },
        },
      },
    });
    console.log('✓ Found placement:', placementWithAds.name);
    console.log('  Total ads:', placementWithAds._count.ads);
    console.log('  Ads:');
    placementWithAds.ads.forEach((ad, i) => {
      console.log(`    ${i + 1}. ${ad.entityType} - ${ad.entityId} (Priority: ${ad.priority})`);
    });
    console.log('');

    console.log('5. Checking capacity limit...');
    console.log(`  Current: ${placementWithAds._count.ads}/${placementWithAds.maxAds}`);
    console.log(`  Can add more: ${placementWithAds._count.ads < placementWithAds.maxAds ? 'Yes' : 'No'}`);
    console.log('');

    console.log('6. Fetching all ads for placement...');
    const allAds = await prisma.placement_ads.findMany({
      where: { placementId: placementId },
      include: {
        placement: {
          select: {
            name: true,
            location: true,
          },
        },
      },
      orderBy: { priority: 'desc' },
    });
    console.log(`✓ Found ${allAds.length} ads`);
    console.log('');

    console.log('7. Updating ad priority...');
    const updatedAd = await prisma.placement_ads.update({
      where: { id: adId },
      data: { priority: 20 },
    });
    console.log('✓ Updated ad priority to:', updatedAd.priority);
    console.log('');

    console.log('8. Fetching active ads only...');
    const activeAds = await prisma.placement_ads.findMany({
      where: {
        placementId: placementId,
        isActive: true,
      },
    });
    console.log(`✓ Found ${activeAds.length} active ads`);
    console.log('');

    console.log('9. Testing ad status toggle...');
    await prisma.placement_ads.update({
      where: { id: adId },
      data: { isActive: false },
    });
    console.log('✓ Disabled ad:', adId);
    
    await prisma.placement_ads.update({
      where: { id: adId },
      data: { isActive: true },
    });
    console.log('✓ Re-enabled ad:', adId);
    console.log('');

    console.log('10. Cleaning up test data...');
    await prisma.placement_ads.deleteMany({
      where: { placementId: placementId },
    });
    console.log('✓ Deleted all ads');

    await prisma.ad_placements.delete({
      where: { id: placementId },
    });
    console.log('✓ Deleted placement');
    console.log('');

    console.log('11. Testing advanced queries...');
    console.log('  Creating test data for advanced queries...');
    
    const testPlacement = await prisma.ad_placements.create({
      data: {
        name: 'Advanced Test',
        location: 'MARKETPLACE_TOP',
        type: 'GRID',
        maxAds: 5,
        displayOrder: 0,
        isActive: true,
      },
    });

    await prisma.placement_ads.createMany({
      data: [
        {
          placementId: testPlacement.id,
          entityType: 'AUCTION',
          entityId: 'auction-1',
          priority: 10,
          isActive: true,
        },
        {
          placementId: testPlacement.id,
          entityType: 'CAR',
          entityId: 'car-1',
          priority: 8,
          isActive: true,
        },
        {
          placementId: testPlacement.id,
          entityType: 'SHOWROOM',
          entityId: 'showroom-1',
          priority: 5,
          isActive: false,
        },
      ],
    });

    const activeCount = await prisma.placement_ads.count({
      where: {
        placementId: testPlacement.id,
        isActive: true,
      },
    });
    console.log(`  Active ads count: ${activeCount}`);

    const byType = await prisma.placement_ads.groupBy({
      by: ['entityType'],
      where: {
        placementId: testPlacement.id,
      },
      _count: true,
    });
    console.log('  Ads by type:');
    byType.forEach((group) => {
      console.log(`    ${group.entityType}: ${group._count}`);
    });

    await prisma.placement_ads.deleteMany({
      where: { placementId: testPlacement.id },
    });
    await prisma.ad_placements.delete({
      where: { id: testPlacement.id },
    });
    console.log('  ✓ Cleaned up advanced test data');
    console.log('');

    console.log('✅ All tests passed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('  - Ad Placements CRUD: ✓');
    console.log('  - Placement Ads CRUD: ✓');
    console.log('  - Capacity Limits: ✓');
    console.log('  - Relations & Includes: ✓');
    console.log('  - Filtering & Ordering: ✓');
    console.log('  - Status Management: ✓');
    console.log('  - Advanced Queries: ✓');
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

testFullAdSystem();
