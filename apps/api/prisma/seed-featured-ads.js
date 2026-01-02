const { PrismaClient } = require('@prisma/client');
;
const prisma = new PrismaClient();
;
async function seedFeaturedAds() {
  try {
    console.log('بدء إنشاء بيانات الإعلانات المميزة التجريبية...');

    // البحث عن مستخدم موجود أو استخدام أول مستخدم متاح
    let testUser = await prisma.user.findFirst({
      where: {
        OR: [{ name: 'مدير الإعلانات' }, { role: 'ADMIN' }],
      },
    });

    if (!testUser) {
      // البحث عن أي مستخدم موجود
      testUser = await prisma.user.findFirst();

      if (!testUser) {
        // إنشاء مستخدم جديد برقم هاتف فريد
        const uniquePhone = `+21891${Date.now().toString().slice(-7)}`;
        testUser = await prisma.user.create({
          data: {
            name: 'مدير الإعلانات',
            phone: uniquePhone,
            loginIdentifier: `ads_manager_${Date.now()}`,
            role: 'ADMIN',
            verified: true,
          },
        });
        console.log('تم إنشاء مستخدم تجريبي:', testUser.name);
      } else {
        console.log('استخدام مستخدم موجود:', testUser.name);
      }
    }

    // البحث عن سيارة موجودة للربط بالإعلان
    const existingCar = await prisma.car.findFirst({
      where: { status: 'AVAILABLE' },
    });

    // البحث عن مزاد موجود للربط بالإعلان
    const existingAuction = await prisma.auction.findFirst({
      where: { status: 'ACTIVE' },
    });

    // البحث عن معرض موجود للربط بالإعلان
    const existingShowroom = await prisma.showroom.findFirst({
      where: { status: 'APPROVED' },
    });

    // إنشاء إعلانات مميزة تجريبية
    const featuredAds = [];
;
    // إعلان مرتبط بسيارة
    if (existingCar) {
      const carAd = await prisma.featuredAd.create({
        data: {
          title: `${existingCar.brand} ${existingCar.model} ${existingCar.year} - عرض مميز`,
          description: `سيارة ${existingCar.brand} ${existingCar.model} موديل ${existingCar.year} في حالة ممتازة`,
          adType: 'CAR_LISTING',
          sourceId: existingCar.id,
          sourceType: 'car',
          position: 1,
          priority: 5,
          isActive: true,
          budget: 500.0,
          location: existingCar.location,
          createdBy: testUser.id,
          views: Math.floor(Math.random() * 100) + 50,
          clicks: Math.floor(Math.random() * 20) + 5,
        },
      });
      featuredAds.push(carAd);
      console.log('تم إنشاء إعلان سيارة مميز:', carAd.title);
    }

    // إعلان مرتبط بمزاد
    if (existingAuction) {
      const auctionAd = await prisma.featuredAd.create({
        data: {
          title: `مزاد حصري - ${existingAuction.title}`,
          description: `مزاد مباشر بسعر ابتدائي ${existingAuction.startingPrice} د.ل`,
          adType: 'AUCTION_LISTING',
          sourceId: existingAuction.id,
          sourceType: 'auction',
          position: 2,
          priority: 4,
          isActive: true,
          budget: 300.0,
          createdBy: testUser.id,
          views: Math.floor(Math.random() * 150) + 80,
          clicks: Math.floor(Math.random() * 30) + 10,
        },
      });
      featuredAds.push(auctionAd);
      console.log('تم إنشاء إعلان مزاد مميز:', auctionAd.title);
    }

    // إعلان مرتبط بمعرض
    if (existingShowroom) {
      const showroomAd = await prisma.featuredAd.create({
        data: {
          title: `${existingShowroom.name} - معرض معتمد`,
          description: `معرض موثوق في ${existingShowroom.city} مع ${existingShowroom.totalCars} سيارة متاحة`,
          adType: 'SHOWROOM_AD',
          sourceId: existingShowroom.id,
          sourceType: 'showroom',
          position: 3,
          priority: 3,
          isActive: true,
          budget: 800.0,
          location: `${existingShowroom.city} - ${existingShowroom.area}`,
          createdBy: testUser.id,
          views: Math.floor(Math.random() * 200) + 100,
          clicks: Math.floor(Math.random() * 40) + 15,
        },
      });
      featuredAds.push(showroomAd);
      console.log('تم إنشاء إعلان معرض مميز:', showroomAd.title);
    }

    // إعلان عام (غير مرتبط بمنشور)
    const genericAd = await prisma.featuredAd.create({
      data: {
        title: 'معرض الأمان للسيارات - عروض حصرية',
        description: 'أفضل السيارات بأسعار تنافسية مع ضمان الجودة',
        imageUrl: '/images/showroom-banner.jpg',
        linkUrl: '/showrooms',
        adType: 'GENERIC_AD',
        position: 1,
        priority: 5,
        isActive: true,
        budget: 1000.0,
        location: 'طرابلس - شارع الجمهورية',
        targetAudience: 'مشترو السيارات',
        createdBy: testUser.id,
        views: Math.floor(Math.random() * 300) + 200,
        clicks: Math.floor(Math.random() * 50) + 25,
      },
    });
    featuredAds.push(genericAd);
    console.log('تم إنشاء إعلان عام مميز:', genericAd.title);

    console.log(`تم إنشاء ${featuredAds.length} إعلانات مميزة بنجاح!`);
    return featuredAds;
  } catch (error) {
    console.error('خطأ في إنشاء البيانات التجريبية:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedFeaturedAds();
    console.log('تم الانتهاء من إنشاء البيانات التجريبية بنجاح!');
  } catch (error) {
    console.error('فشل في إنشاء البيانات التجريبية:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { seedFeaturedAds };
