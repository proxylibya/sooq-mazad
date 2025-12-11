const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdPlacement() {
  console.log('Testing ad_placements...\n');

  try {
    console.log('1. Creating a new ad placement...');
    const newPlacement = await prisma.ad_placements.create({
      data: {
        name: 'Test Placement - Home Top Banner',
        description: 'A test placement for homepage top section',
        location: 'HOME_TOP',
        type: 'STATIC',
        status: 'ACTIVE',
        maxAds: 3,
        displayOrder: 1,
        autoRotate: true,
        rotateInterval: 5,
        width: '100%',
        height: '300px',
        isActive: true,
      },
    });
    console.log('✓ Created placement:', newPlacement.id);
    console.log('  Name:', newPlacement.name);
    console.log('  Location:', newPlacement.location);
    console.log('  Type:', newPlacement.type);
    console.log('');

    console.log('2. Fetching all placements...');
    const placements = await prisma.ad_placements.findMany({
      orderBy: [{ location: 'asc' }, { displayOrder: 'asc' }],
    });
    console.log(`✓ Found ${placements.length} placement(s)`);
    placements.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} (${p.location}) - ${p.status}`);
    });
    console.log('');

    console.log('3. Fetching placement by ID...');
    const placement = await prisma.ad_placements.findUnique({
      where: { id: newPlacement.id },
      include: {
        ads: true,
        _count: {
          select: { ads: true },
        },
      },
    });
    console.log('✓ Found placement:', placement.name);
    console.log('  ID:', placement.id);
    console.log('  Ads count:', placement._count.ads);
    console.log('');

    console.log('4. Updating placement...');
    const updatedPlacement = await prisma.ad_placements.update({
      where: { id: newPlacement.id },
      data: {
        description: 'Updated description for testing',
        displayOrder: 5,
      },
    });
    console.log('✓ Updated placement');
    console.log('  New description:', updatedPlacement.description);
    console.log('  New display order:', updatedPlacement.displayOrder);
    console.log('');

    console.log('5. Deleting test placement...');
    await prisma.ad_placements.delete({
      where: { id: newPlacement.id },
    });
    console.log('✓ Deleted placement:', newPlacement.id);
    console.log('');

    console.log('✅ All tests passed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdPlacement();
