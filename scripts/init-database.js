const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
;
const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

async function initDatabase() {
  console.log('════════════════════════════════════════════════════');
  console.log('🚀 تهيئة قاعدة البيانات PostgreSQL');
  console.log('════════════════════════════════════════════════════\n');

  try {
    // 1. اختبار الاتصال
    console.log('1️⃣ فحص الاتصال بقاعدة البيانات...');
    await prisma.$connect();
    console.log('✅ الاتصال نجح!\n');
    
    // 2. إحصائيات قبل التهيئة
    console.log('2️⃣ إحصائيات قبل التهيئة:');
    const beforeStats = {
      users: await prisma.user.count(),
      cars: await prisma.car.count(),
      auctions: await prisma.auction.count(),
    };
    console.log(`👥 المستخدمون: ${beforeStats.users}`);
    console.log(`🚗 السيارات: ${beforeStats.cars}`);
    console.log(`🔨 المزادات: ${beforeStats.auctions}\n`);
    
    // 3. إنشاء مستخدمين أساسيين
    console.log('3️⃣ إنشاء المستخدمين الأساسيين:');
    console.log('════════════════════════════');
    
    // إنشاء مدير النظام
    const adminPhone = '+218900000000';
    let admin = await prisma.user.findUnique({
      where: { phone: adminPhone }
    });
    
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await prisma.user.create({
        data: {
          name: 'System Admin',
          phone: adminPhone,
          loginIdentifier: 'admin',
          email: 'admin@sooq-mazad.ly',
          role: 'SUPER_ADMIN',
          accountType: 'REGULAR_USER',
          verified: true,
          status: 'ACTIVE',
          password: {
            create: {
              hashedPassword: hashedPassword
            }
          }
        }
      });
      console.log('✅ تم إنشاء حساب المدير');
    } else {
      console.log('⚠️ حساب المدير موجود مسبقاً');
    }
    
    console.log('📱 بيانات الدخول للمدير:');
    console.log(`   Phone: ${adminPhone}`);
    console.log('   Password: admin123\n');
    
    // إنشاء مستخدم عادي للاختبار
    const userPhone = '+218911111111';
    let testUser = await prisma.user.findUnique({
      where: { phone: userPhone }
    });
    
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('user123', 10);
      testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          phone: userPhone,
          loginIdentifier: 'testuser',
          email: 'test@sooq-mazad.ly',
          role: 'USER',
          accountType: 'REGULAR_USER',
          verified: true,
          status: 'ACTIVE',
          password: {
            create: {
              hashedPassword: hashedPassword
            }
          }
        }
      });
      console.log('✅ تم إنشاء مستخدم اختبار');
    } else {
      console.log('⚠️ مستخدم الاختبار موجود مسبقاً');
    }
    
    console.log('📱 بيانات الدخول للمستخدم:');
    console.log(`   Phone: ${userPhone}`);
    console.log('   Password: user123\n');
    
    // إنشاء بائع سيارات
    const sellerPhone = '+218922222222';
    let seller = await prisma.user.findUnique({
      where: { phone: sellerPhone }
    });
    
    if (!seller) {
      const hashedPassword = await bcrypt.hash('seller123', 10);
      seller = await prisma.user.create({
        data: {
          name: 'Car Seller',
          phone: sellerPhone,
          loginIdentifier: 'carseller',
          email: 'seller@sooq-mazad.ly',
          role: 'USER',
          accountType: 'REGULAR_USER',
          verified: true,
          status: 'ACTIVE',
          password: {
            create: {
              hashedPassword: hashedPassword
            }
          }
        }
      });
      console.log('✅ تم إنشاء حساب بائع سيارات');
    } else {
      console.log('⚠️ حساب البائع موجود مسبقاً');
    }
    
    console.log('📱 بيانات الدخول للبائع:');
    console.log(`   Phone: ${sellerPhone}`);
    console.log('   Password: seller123\n');
    
    // 4. إنشاء بيانات تجريبية
    console.log('4️⃣ إنشاء بيانات تجريبية:');
    console.log('════════════════════════════');
    
    // إنشاء سيارة تجريبية
    if (beforeStats.cars === 0) {
      const testCar = await prisma.car.create({
        data: {
          title: 'Toyota Camry 2020',
          description: 'Excellent condition, low mileage',
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          price: 25000,
          mileage: 30000,
          color: 'Silver',
          fuelType: 'GASOLINE',
          transmission: 'AUTOMATIC',
          engineSize: '2.5L',
          location: 'Tripoli',
          status: 'AVAILABLE',
          views: 0,
          carType: 'SEDAN',
          sellerId: seller.id,
          isAuction: false,
        }
      });
      console.log('✅ تم إنشاء سيارة تجريبية');
      
      // إنشاء مزاد تجريبي
      const testAuction = await prisma.auction.create({
        data: {
          title: 'Mercedes-Benz E-Class 2019',
          description: 'Luxury sedan in perfect condition',
          startPrice: 35000,
          currentPrice: 35000,
          minimumBid: 500,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // بعد أسبوع
          status: 'ACTIVE',
          sellerId: seller.id,
          carId: testCar.id,
          views: 0,
          totalBids: 0,
        }
      });
      console.log('✅ تم إنشاء مزاد تجريبي');
    } else {
      console.log('⚠️ البيانات التجريبية موجودة مسبقاً');
    }
    
    // 5. إحصائيات بعد التهيئة
    console.log('\n5️⃣ إحصائيات بعد التهيئة:');
    console.log('════════════════════════════');
    const afterStats = {
      users: await prisma.user.count(),
      cars: await prisma.car.count(),
      auctions: await prisma.auction.count(),
      bids: await prisma.bid.count(),
      transportServices: await prisma.transportService.count(),
    };
    
    console.log(`👥 المستخدمون: ${afterStats.users}`);
    console.log(`🚗 السيارات: ${afterStats.cars}`);
    console.log(`🔨 المزادات: ${afterStats.auctions}`);
    console.log(`💰 العروض: ${afterStats.bids}`);
    console.log(`🚚 خدمات النقل: ${afterStats.transportServices}\n`);
    
    // 6. معلومات الوصول
    console.log('6️⃣ معلومات الوصول:');
    console.log('════════════════════════════');
    console.log('🌐 الموقع الرئيسي: http://localhost:3021');
    console.log('🔐 لوحة التحكم: http://localhost:3021/admin/login');
    console.log('📊 Prisma Studio: http://localhost:5555');
    console.log('🔌 قاعدة البيانات: postgresql://localhost:5432/sooq_mazad\n');
    
    console.log('✅ تمت تهيئة قاعدة البيانات بنجاح!');
    console.log('🎯 يمكنك الآن استخدام النظام بشكل كامل');
    
  } catch (error) {
    console.error('\n❌ خطأ في تهيئة قاعدة البيانات:');
    console.error(error.message);
    
    if (error.code === 'P2002') {
      console.log('\n⚠️ بعض البيانات موجودة مسبقاً - هذا طبيعي');
    } else if (error.code === '22P05') {
      console.log('\n⚠️ مشكلة في ترميز الأحرف');
      console.log('💡 الحل: تأكد من أن قاعدة البيانات تستخدم UTF8 encoding');
    }
  } finally {
    await prisma.$disconnect();
    console.log('\n════════════════════════════════════════════════════');
  }
}

// تشغيل التهيئة
initDatabase().catch(console.error);
