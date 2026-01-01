/**
 * إصلاح جدول sms_logs
 */

const { PrismaClient } = require('@prisma/client');

async function fixSmsTable() {
  const prisma = new PrismaClient();

  try {
    console.log('🔧 إصلاح جدول sms_logs...\n');

    // حذف الجدول وإعادة إنشائه
    try {
      await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS sms_logs CASCADE');
      console.log('✓ تم حذف الجدول القديم');
    } catch (e) {
      console.log('⚠ الجدول غير موجود أو تم حذفه');
    }

    // إنشاء الجدول من جديد
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "sms_logs" (
        "id" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'notification',
        "status" TEXT NOT NULL DEFAULT 'pending',
        "userId" TEXT,
        "userName" TEXT,
        "cost" DECIMAL(10, 4) DEFAULT 0,
        "provider" TEXT DEFAULT 'local',
        "providerId" TEXT,
        "sentAt" TIMESTAMP(3),
        "deliveredAt" TIMESTAMP(3),
        "errorCode" TEXT,
        "errorMessage" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "sms_logs_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log('✓ تم إنشاء الجدول الجديد');

    // إنشاء الفهارس
    await prisma.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS "sms_logs_phone_idx" ON "sms_logs"("phone")',
    );
    await prisma.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS "sms_logs_status_idx" ON "sms_logs"("status")',
    );
    await prisma.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS "sms_logs_type_idx" ON "sms_logs"("type")',
    );
    await prisma.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS "sms_logs_createdAt_idx" ON "sms_logs"("createdAt")',
    );
    console.log('✓ تم إنشاء الفهارس');

    // التحقق
    const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'sms_logs' ORDER BY ordinal_position
    `);
    console.log('\n📋 أعمدة الجدول:', columns.map((c) => c.column_name).join(', '));

    console.log('\n✅ تم إصلاح جدول sms_logs بنجاح!');
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixSmsTable();
