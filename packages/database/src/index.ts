/**
 * @sooq-mazad/database
 * يصدّر Prisma Client من الملف الموحد
 * 
 * ملاحظة: هذا الملف هو wrapper فقط
 * جميع عمليات قاعدة البيانات تتم في: apps/web/lib/prisma-unified.ts
 */

// تصدير مباشر من apps/web/lib/prisma.ts
// في حالة استخدام هذا الباكج في مكان آخر

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
