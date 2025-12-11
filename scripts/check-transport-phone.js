/**
 * سكريبت للتحقق من أرقام هواتف خدمات النقل وإصلاحها
 * الاستخدام: node scripts/check-transport-phone.js [SERVICE_ID]
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const serviceId = process.argv[2];

  if (serviceId) {
    // فحص خدمة محددة
    console.log(`\n🔍 فحص خدمة النقل: ${serviceId}\n`);

    const service = await prisma.transport_services.findUnique({
      where: { id: serviceId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!service) {
      console.log('❌ الخدمة غير موجودة!');
      return;
    }

    console.log('📋 تفاصيل الخدمة:');
    console.log(`   - ID: ${service.id}`);
    console.log(`   - العنوان: ${service.title}`);
    console.log(`   - contactPhone: "${service.contactPhone || 'فارغ'}"`);
    console.log(`   - user.phone: "${service.users?.phone || 'فارغ'}"`);
    console.log(`   - user.name: "${service.users?.name || 'غير معروف'}"`);
    console.log(`   - الحالة: ${service.status}`);

    if (!service.contactPhone && !service.users?.phone) {
      console.log('\n⚠️  لا يوجد رقم هاتف! هذا سبب ظهور "رقم الهاتف غير متوفر"');
      console.log('\n📝 لإضافة رقم هاتف، شغّل:');
      console.log(`   node scripts/check-transport-phone.js ${serviceId} --update 09XXXXXXXX`);
    } else {
      console.log('\n✅ يوجد رقم هاتف');
    }
  } else {
    // فحص جميع الخدمات بدون رقم هاتف
    console.log('\n🔍 البحث عن خدمات بدون رقم هاتف...\n');

    const servicesWithoutPhone = await prisma.transport_services.findMany({
      where: {
        OR: [{ contactPhone: null }, { contactPhone: '' }],
      },
      include: {
        users: {
          select: {
            id: true,
            phone: true,
          },
        },
      },
      take: 20,
    });

    if (servicesWithoutPhone.length === 0) {
      console.log('✅ جميع الخدمات لديها أرقام هواتف');
    } else {
      console.log(`⚠️  وجدت ${servicesWithoutPhone.length} خدمة بدون رقم هاتف:\n`);

      for (const s of servicesWithoutPhone) {
        const userPhone = s.users?.phone;
        console.log(`   - ${s.id}: "${s.title.substring(0, 40)}..."`);
        console.log(
          `     contactPhone: "${s.contactPhone || 'فارغ'}" | user.phone: "${userPhone || 'فارغ'}"`,
        );

        // إذا كان user.phone موجود، نقترح نسخه
        if (userPhone && !s.contactPhone) {
          console.log(`     💡 يمكن نسخ رقم المستخدم: ${userPhone}`);
        }
        console.log('');
      }
    }
  }

  // التحديث إذا طُلب
  if (process.argv[3] === '--update' && process.argv[4]) {
    const newPhone = process.argv[4];
    console.log(`\n📝 تحديث رقم الهاتف إلى: ${newPhone}`);

    await prisma.transport_services.update({
      where: { id: process.argv[2] },
      data: { contactPhone: newPhone },
    });

    console.log('✅ تم التحديث بنجاح!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
