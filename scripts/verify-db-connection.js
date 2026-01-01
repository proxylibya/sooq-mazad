const { PrismaClient } = require('@prisma/client');
;
const prisma = new PrismaClient();
;
async function verifyConnection() {
  console.log('\n🔍 ═══════════════════════════════════════════════════════════');
  console.log('   فحص نهائي لاتصال قاعدة البيانات PostgreSQL');
  console.log('   ═══════════════════════════════════════════════════════════\n');

  try {
    // 1. اختبار الاتصال
    console.log('   ⏳ جاري الاتصال بقاعدة البيانات...');
    await prisma.$connect();
    console.log('   ✅ الاتصال نجح!\n');
    
    // 2. معلومات الاتصال
    console.log('   📊 معلومات الاتصال:');
    console.log('   ════════════════════════════');
    console.log('   🖥️  الخادم: localhost:5432');
    console.log('   📁 قاعدة البيانات: sooq_mazad');
    console.log('   🔧 المحرك: PostgreSQL');
    console.log('   ✅ الحالة: متصل ويعمل\n');
    
    // 3. إحصائيات الجداول
    console.log('   📈 إحصائيات الجداول الرئيسية:');
    console.log('   ════════════════════════════');
    
    const userCount = await prisma.user.count();
    const carCount = await prisma.car.count();
    const auctionCount = await prisma.auction.count();
    const transportCount = await prisma.transportService.count();
    const companyCount = await prisma.company.count();
    const showroomCount = await prisma.showroom.count();
    
    console.log(`   👥 المستخدمون: ${userCount}`);
    console.log(`   🚗 السيارات: ${carCount}`);
    console.log(`   🔨 المزادات: ${auctionCount}`);
    console.log(`   🚚 خدمات النقل: ${transportCount}`);
    console.log(`   🏢 الشركات: ${companyCount}`);
    console.log(`   🏬 المعارض: ${showroomCount}`);
    
    const total = userCount + carCount + auctionCount + transportCount + companyCount + showroomCount;
    console.log(`   ════════════════════════════`);
    console.log(`   📊 إجمالي السجلات: ${total}\n`);
    
    // 4. فحص المستخدمين المنشأين
    console.log('   👤 المستخدمون المتاحون:');
    console.log('   ════════════════════════════');
    
    const users = await prisma.user.findMany({
      select: {
        name: true,
        phone: true,
        role: true,
        status: true
      }
    });
    
    if (users.length > 0) {
      users.forEach(user => {
        const roleEmoji = user.role === 'SUPER_ADMIN' ? '👑' : ;
                         user.role === 'ADMIN' ? '🔐' : 
                         user.role === 'MODERATOR' ? '🛡️' : '👤';
        console.log(`   ${roleEmoji} ${user.name} - ${user.phone} (${user.role})`);
      });
    } else {
      console.log('   ⚠️ لا يوجد مستخدمون بعد');
    }
    
    // 5. النتيجة النهائية
    console.log('\n   🎯 النتيجة النهائية:');
    console.log('   ════════════════════════════');
    console.log('   ✅ قاعدة البيانات PostgreSQL متصلة ومهيأة بنجاح');
    console.log('   ✅ Prisma يعمل بشكل صحيح');
    console.log('   ✅ الجداول جاهزة للاستخدام');
    console.log('   ✅ يمكنك الآن البدء في التطوير\n');
    
    // 6. روابط مفيدة
    console.log('   🔗 روابط الوصول:');
    console.log('   ════════════════════════════');
    console.log('   🌐 الموقع: http://localhost:3021');
    console.log('   🔐 لوحة التحكم: http://localhost:3021/admin/login');
    console.log('   📊 Prisma Studio: npx prisma studio');
    console.log('   🔌 Connection String: postgresql://localhost:5432/sooq_mazad');
    
    // 7. بيانات الدخول
    console.log('\n   🔑 بيانات الدخول المتاحة:');
    console.log('   ════════════════════════════');
    console.log('   المدير: +218900000000 / admin123');
    console.log('   المستخدم: +218911111111 / user123');
    console.log('   البائع: +218922222222 / seller123');
    
  } catch (error) {
    console.error('\n   ❌ خطأ في الاتصال:');
    console.error(`   ${error.message}`);
    
    console.log('\n   💡 تأكد من:');
    console.log('   1. PostgreSQL يعمل على المنفذ 5432');
    console.log('   2. قاعدة البيانات sooq_mazad موجودة');
    console.log('   3. ملف .env يحتوي على DATABASE_URL الصحيح');
    
  } finally {
    await prisma.$disconnect();
    console.log('\n   ═══════════════════════════════════════════════════════════\n');
  }
}

// تشغيل الفحص
verifyConnection().catch(console.error);
