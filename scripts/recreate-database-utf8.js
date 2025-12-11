/**
 * سكريبت إعادة إنشاء قاعدة البيانات بترميز UTF8
 * ⚠️ تحذير: هذا سيحذف جميع البيانات الموجودة!
 */

const { Client } = require('pg');

async function recreateDatabase() {
  console.log('⚠️  تحذير: هذا السكريبت سيحذف قاعدة البيانات ويعيد إنشائها!');
  console.log('⚠️  جميع البيانات ستُفقد!\n');

  // الاتصال بـ postgres database للتمكن من حذف/إنشاء قواعد بيانات
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres', // الاتصال بقاعدة البيانات الافتراضية
  });

  try {
    await client.connect();
    console.log('✅ متصل بـ PostgreSQL\n');

    // قطع جميع الاتصالات بقاعدة البيانات
    console.log('🔌 قطع الاتصالات الحالية...');
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'sooq_mazad'
        AND pid <> pg_backend_pid();
    `);

    // حذف قاعدة البيانات القديمة
    console.log('🗑️  حذف قاعدة البيانات القديمة...');
    await client.query('DROP DATABASE IF EXISTS sooq_mazad');
    console.log('✅ تم حذف قاعدة البيانات القديمة');

    // إنشاء قاعدة البيانات الجديدة بترميز UTF8
    console.log('📦 إنشاء قاعدة البيانات الجديدة بترميز UTF8...');
    await client.query(`
      CREATE DATABASE sooq_mazad
      WITH ENCODING 'UTF8'
           LC_COLLATE 'en_US.UTF-8'
           LC_CTYPE 'en_US.UTF-8'
           TEMPLATE template0;
    `);
    console.log('✅ تم إنشاء قاعدة البيانات بترميز UTF8');

    // التحقق من الترميز
    const newClient = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      database: 'sooq_mazad',
    });

    await newClient.connect();
    const result = await newClient.query('SHOW server_encoding');
    console.log('\n📊 ترميز الخادم الجديد:', result.rows[0].server_encoding);

    const clientEnc = await newClient.query('SHOW client_encoding');
    console.log('📊 ترميز العميل:', clientEnc.rows[0].client_encoding);

    await newClient.end();

    console.log('\n✅ تم إعادة إنشاء قاعدة البيانات بنجاح!');
    console.log('\n📋 الخطوات التالية:');
    console.log('   1. شغّل: npx prisma db push');
    console.log('   2. شغّل: npx prisma generate');
    console.log('   3. (اختياري) شغّل: node prisma/seed-featured-ads.js');
  } catch (error) {
    console.error('❌ خطأ:', error.message);

    // إذا كان الخطأ بسبب عدم وجود locale، جرب بدون
    if (error.message.includes('LC_COLLATE') || error.message.includes('LC_CTYPE')) {
      console.log('\n🔄 محاولة إنشاء بدون locale محدد...');
      try {
        await client.query('DROP DATABASE IF EXISTS sooq_mazad');
        await client.query(`
          CREATE DATABASE sooq_mazad
          WITH ENCODING 'UTF8'
          TEMPLATE template0;
        `);
        console.log('✅ تم إنشاء قاعدة البيانات بترميز UTF8 (بدون locale محدد)');
      } catch (retryError) {
        console.error('❌ فشل أيضاً:', retryError.message);
      }
    }
  } finally {
    await client.end();
  }
}

// تشغيل السكريبت
recreateDatabase();
