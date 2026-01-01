// script لإضافة بيانات سيارات تجريبية للسوق الفوري
const { PrismaClient } = require('@prisma/client');
;
const prisma = new PrismaClient();
;
const sampleCars = [;
  {
    title: 'تويوتا كامري 2023 - حالة ممتازة',
    brand: 'تويوتا (Toyota)',
    model: 'كامري',
    year: 2023,
    price: 120000,
    condition: 'NEW',
    mileage: 5000,
    location: 'طرابلس',
    images:
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop,https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop',
    description: 'تويوتا كامري 2023 بحالة ممتازة، كيلومترات قليلة، جميع الأوراق سليمة',
    features: 'مكيف,نوافذ كهربائية,مقاعد جلد,نظام ملاحة',
    fuelType: 'بنزين',
    transmission: 'أوتوماتيك',
    bodyType: 'سيدان',
    color: 'أبيض',
    interiorColor: 'أسود',
    seatCount: '5 مقاعد',
    vehicleType: 'سيارة',
    manufacturingCountry: 'اليابان',
    regionalSpecs: 'خليجي',
    customsStatus: 'مخلص',
    licenseStatus: 'مرخص',
    insuranceStatus: 'مؤمن',
    paymentMethod: 'نقداً أو تقسيط',
    contactPhone: '+218912345678',
    status: 'AVAILABLE',
    isAuction: false,
    featured: true,
  },
  {
    title: 'هونداي إلنترا 2022 - فل كامل',
    brand: 'هيونداي (Hyundai)',
    model: 'إلنترا',
    year: 2022,
    price: 85000,
    condition: 'USED',
    mileage: 15000,
    location: 'بنغازي',
    images:
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop,https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=600&fit=crop',
    description: 'هونداي إلنترا 2022 فل كامل، صيانة دورية منتظمة، لا يوجد حوادث',
    features: 'مكيف,نوافذ كهربائية,مقاعد قماش,راديو CD',
    fuelType: 'بنزين',
    transmission: 'أوتوماتيك',
    bodyType: 'سيدان',
    color: 'فضي',
    interiorColor: 'رمادي',
    seatCount: '5 مقاعد',
    vehicleType: 'سيارة',
    manufacturingCountry: 'كوريا الجنوبية',
    regionalSpecs: 'أمريكي',
    customsStatus: 'مخلص',
    licenseStatus: 'مرخص',
    insuranceStatus: 'مؤمن',
    paymentMethod: 'نقداً',
    contactPhone: '+218923456789',
    status: 'AVAILABLE',
    isAuction: false,
    featured: false,
  },
  {
    title: 'نيسان التيما 2023 - وكالة',
    brand: 'نيسان (Nissan)',
    model: 'التيما',
    year: 2023,
    price: 95000,
    condition: 'NEW',
    mileage: 2000,
    location: 'مصراتة',
    images:
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&h=600&fit=crop,https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
    description: 'نيسان التيما 2023 وكالة، ضمان شامل، جميع الملحقات الأصلية',
    features: 'مكيف,نوافذ كهربائية,مقاعد جلد,نظام صوت متقدم',
    fuelType: 'بنزين',
    transmission: 'أوتوماتيك',
    bodyType: 'سيدان',
    color: 'أحمر',
    interiorColor: 'أسود',
    seatCount: '5 مقاعد',
    vehicleType: 'سيارة',
    manufacturingCountry: 'اليابان',
    regionalSpecs: 'خليجي',
    customsStatus: 'مخلص',
    licenseStatus: 'مرخص',
    insuranceStatus: 'مؤمن',
    paymentMethod: 'نقداً أو تقسيط',
    contactPhone: '+218934567890',
    status: 'AVAILABLE',
    isAuction: false,
    featured: false,
  },
  {
    title: 'فورد موستانج 2021 - سبورت',
    brand: 'فورد (Ford)',
    model: 'موستانج',
    year: 2021,
    price: 180000,
    condition: 'USED',
    mileage: 8000,
    location: 'الزاوية',
    images:
      'https://images.unsplash.com/photo-1617531653520-bd466c5d2401?w=800&h=600&fit=crop,https://images.unsplash.com/photo-1609882554048-2be9e4797663?w=800&h=600&fit=crop',
    description: 'فورد موستانج 2021 سبورت، أداء عالي، للهواة والمحترفين',
    features: 'مكيف,نوافذ كهربائية,مقاعد رياضية,نظام صوت بوز',
    fuelType: 'بنزين',
    transmission: 'يدوي',
    bodyType: 'كوبيه',
    color: 'أزرق',
    interiorColor: 'أسود',
    seatCount: '4 مقاعد',
    vehicleType: 'سيارة رياضية',
    manufacturingCountry: 'أمريكا',
    regionalSpecs: 'أمريكي',
    customsStatus: 'مخلص',
    licenseStatus: 'مرخص',
    insuranceStatus: 'مؤمن',
    paymentMethod: 'نقداً',
    contactPhone: '+218945678901',
    status: 'AVAILABLE',
    isAuction: false,
    featured: true,
  },
  {
    title: 'شيفروليه كروز 2022 - اقتصادية',
    brand: 'شيفروليه (Chevrolet)',
    model: 'كروز',
    year: 2022,
    price: 72000,
    condition: 'USED',
    mileage: 25000,
    location: 'سبها',
    images:
      'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&h=600&fit=crop,https://images.unsplash.com/photo-1610768764270-790fbec18178?w=800&h=600&fit=crop',
    description: 'شيفروليه كروز 2022 اقتصادية في استهلاك الوقود، مثالية للاستخدام اليومي',
    features: 'مكيف,نوافذ عادية,مقاعد قماش,راديو',
    fuelType: 'بنزين',
    transmission: 'يدوي',
    bodyType: 'هاتشباك',
    color: 'أسود',
    interiorColor: 'رمادي',
    seatCount: '5 مقاعد',
    vehicleType: 'سيارة',
    manufacturingCountry: 'أمريكا',
    regionalSpecs: 'أمريكي',
    customsStatus: 'مخلص',
    licenseStatus: 'مرخص',
    insuranceStatus: 'غير مؤمن',
    paymentMethod: 'نقداً',
    contactPhone: '+218956789012',
    status: 'AVAILABLE',
    isAuction: false,
    featured: false,
  },
  {
    title: 'بي ام دبليو X5 2023 - فاخرة',
    brand: 'بي إم دبليو (BMW)',
    model: 'X5',
    year: 2023,
    price: 350000,
    condition: 'NEW',
    mileage: 1000,
    location: 'طرابلس',
    images:
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop,https://images.unsplash.com/photo-1609854611315-a735d4ad0cf4?w=800&h=600&fit=crop',
    description: 'BMW X5 2023 فاخرة، مواصفات عالية، للباحثين عن الرفاهية والأداء',
    features: 'مكيف تلقائي,نوافذ كهربائية,مقاعد جلد فاخر,نظام ملاحة متقدم,كاميرات 360',
    fuelType: 'بنزين',
    transmission: 'أوتوماتيك',
    bodyType: 'SUV',
    color: 'أبيض لؤلؤي',
    interiorColor: 'بني فاتح',
    seatCount: '7 مقاعد',
    vehicleType: 'SUV',
    manufacturingCountry: 'ألمانيا',
    regionalSpecs: 'أوروبي',
    customsStatus: 'مخلص',
    licenseStatus: 'مرخص',
    insuranceStatus: 'مؤمن شامل',
    paymentMethod: 'نقداً أو تقسيط',
    contactPhone: '+218967890123',
    status: 'AVAILABLE',
    isAuction: false,
    featured: true,
  },
  {
    title: 'مازda CX-5 2023 - SUV مدمج',
    brand: 'مازدا (Mazda)',
    model: 'CX-5',
    year: 2023,
    price: 115000,
    condition: 'NEW',
    mileage: 3000,
    location: 'بيضاء',
    images:
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop,https://images.unsplash.com/photo-1617886853745-2973d91df734?w=800&h=600&fit=crop',
    description: 'مازda CX-5 2023 SUV مدمج، توازن مثالي بين الحجم والاقتصاد',
    features: 'مكيف,نوافذ كهربائية,مقاعد نصف جلد,نظام صوت 6 سماعات',
    fuelType: 'بنزين',
    transmission: 'أوتوماتيك',
    bodyType: 'SUV',
    color: 'رمادي معدني',
    interiorColor: 'أسود',
    seatCount: '5 مقاعد',
    vehicleType: 'SUV',
    manufacturingCountry: 'اليابان',
    regionalSpecs: 'خليجي',
    customsStatus: 'مخلص',
    licenseStatus: 'مرخص',
    insuranceStatus: 'مؤمن',
    paymentMethod: 'نقداً أو تقسيط',
    contactPhone: '+218978901234',
    status: 'AVAILABLE',
    isAuction: false,
    featured: false,
  },
];

async function seedMarketplaceData() {
  try {
    console.log('🌱 بدء إضافة بيانات السوق الفوري...');

    // التحقق من وجود مستخدم تجريبي أو إنشاؤه
    let testUser = await prisma.user.findFirst({
      where: {
        phone: '+218900000000',
      },
    });

    if (!testUser) {
      console.log('📝 إنشاء مستخدم تجريبي...');
      testUser = await prisma.user.create({
        data: {
          name: 'معرض السوق الفوري التجريبي',
          phone: '+218900000000',
          email: 'test@marketplace.com',
          accountType: 'COMPANY',
          role: 'USER',
          verified: true,
          rating: 4.5,
          totalReviews: 25,
          status: 'ACTIVE',
        },
      });
      console.log('✅ تم إنشاء المستخدم التجريبي');
    }

    // حذف البيانات التجريبية السابقة إذا كانت موجودة
    const existingCars = await prisma.car.findMany({
      where: {
        sellerId: testUser.id,
        isAuction: false,
      },
    });

    if (existingCars.length > 0) {
      console.log(`🗑️ حذف ${existingCars.length} سيارة تجريبية سابقة...`);
      await prisma.car.deleteMany({
        where: {
          sellerId: testUser.id,
          isAuction: false,
        },
      });
    }

    // إضافة السيارات التجريبية الجديدة
    console.log('🚗 إضافة السيارات التجريبية...');
    let addedCount = 0;
;
    for (const carData of sampleCars) {
      try {
        const car = await prisma.car.create({
          data: {
            ...carData,
            sellerId: testUser.id,
          },
        });
        console.log(`✅ تمت إضافة: ${car.title}`);
        addedCount++;
      } catch (error) {
        console.error(`❌ فشل في إضافة السيارة: ${carData.title}`, error.message);
      }
    }

    console.log(`\n🎉 تم بنجاح! تمت إضافة ${addedCount} سيارة للسوق الفوري`);
    console.log('📊 الإحصائيات النهائية:');

    const totalCars = await prisma.car.count({
      where: {
        isAuction: false,
        status: 'AVAILABLE',
      },
    });

    const featuredCars = await prisma.car.count({
      where: {
        isAuction: false,
        status: 'AVAILABLE',
        featured: true,
      },
    });

    console.log(`- إجمالي السيارات في السوق الفوري: ${totalCars}`);
    console.log(`- السيارات المميزة: ${featuredCars}`);
    console.log(
      `- معدل السعر: ${Math.round(sampleCars.reduce((sum, car) => sum + car.price, 0) / sampleCars.length).toLocaleString()} دينار`,
    );
  } catch (error) {
    console.error('❌ خطأ في إضافة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
if (require.main === module) {
  seedMarketplaceData();
}

module.exports = { seedMarketplaceData };
