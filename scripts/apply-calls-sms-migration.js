/**
 * تطبيق migration جداول المكالمات و SMS
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log(' تطبيق migration جداول المكالمات و SMS...\n');

  try {
    // إنشاء جدول call_logs
    console.log(' إنشاء جدول call_logs...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "call_logs" (
        "id" TEXT NOT NULL,
        "callId" TEXT NOT NULL,
        "callerId" TEXT NOT NULL,
        "callerName" TEXT,
        "callerPhone" TEXT,
        "calleeId" TEXT NOT NULL,
        "calleeName" TEXT,
        "calleePhone" TEXT,
        "type" TEXT NOT NULL DEFAULT 'voice',
        "status" TEXT NOT NULL DEFAULT 'ringing',
        "direction" TEXT NOT NULL DEFAULT 'outgoing',
        "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "answerTime" TIMESTAMP(3),
        "endTime" TIMESTAMP(3),
        "duration" INTEGER DEFAULT 0,
        "conversationId" TEXT,
        "quality" TEXT,
        "endReason" TEXT,
        "metadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log(' تم إنشاء جدول call_logs');

    // إنشاء جدول sms_logs
    console.log(' إنشاء جدول sms_logs...');
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
        "metadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "sms_logs_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log(' تم إنشاء جدول sms_logs');

    // إنشاء جدول sms_templates
    console.log(' إنشاء جدول sms_templates...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "sms_templates" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "variables" TEXT[],
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "sms_templates_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log(' تم إنشاء جدول sms_templates');

    // إنشاء جدول communication_settings
    console.log(' إنشاء جدول communication_settings...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "communication_settings" (
        "id" TEXT NOT NULL,
        "key" TEXT NOT NULL UNIQUE,
        "value" JSONB NOT NULL,
        "description" TEXT,
        "updatedBy" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "communication_settings_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log(' تم إنشاء جدول communication_settings');

    // إنشاء الفهارس
    console.log(' إنشاء الفهارس...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "call_logs_callerId_idx" ON "call_logs"("callerId")',
      'CREATE INDEX IF NOT EXISTS "call_logs_calleeId_idx" ON "call_logs"("calleeId")',
      'CREATE INDEX IF NOT EXISTS "call_logs_status_idx" ON "call_logs"("status")',
      'CREATE INDEX IF NOT EXISTS "sms_logs_phone_idx" ON "sms_logs"("phone")',
      'CREATE INDEX IF NOT EXISTS "sms_logs_status_idx" ON "sms_logs"("status")',
    ];

    for (const idx of indexes) {
      await prisma.$executeRawUnsafe(idx);
    }
    console.log(' تم إنشاء الفهارس');

    // إدراج قوالب افتراضية
    console.log(' إدراج القوالب الافتراضية...');
    await prisma.$executeRawUnsafe(`
      INSERT INTO "sms_templates" ("id", "name", "type", "content", "variables") 
      VALUES ('tpl_otp', 'رمز التحقق', 'otp', 'رمز التحقق: {{code}}', ARRAY['code'])
      ON CONFLICT ("id") DO NOTHING
    `);
    console.log(' تم إدراج القوالب');

    // التحقق من وجود الجداول
    console.log('\n التحقق من الجداول...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('call_logs', 'sms_logs', 'sms_templates', 'communication_settings')
    `;

    console.log('   الجداول الموجودة:', tables.map((t) => t.table_name).join(', '));

    if (tables.length === 4) {
      console.log('\n تم إنشاء جميع الجداول بنجاح!');
    } else {
      console.log(`\n تم إنشاء ${tables.length}/4 جداول`);
    }
  } catch (error) {
    console.error(' خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
