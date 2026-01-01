/**
 * 🗄️ Prisma Client الموحد - سوق مزاد
 * Unified Prisma Client
 * 
 * ملف واحد لجميع عمليات قاعدة البيانات
 * جميع الملفات الأخرى يجب أن تستورد من هنا
 */

import { PrismaClient, Prisma } from '@prisma/client';

// ============================================
// 🔧 Singleton Pattern
// ============================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * إنشاء Prisma Client مع الإعدادات المثلى
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
    errorFormat: 'pretty',
  });
}

// Singleton instance
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ============================================
// 🛡️ حماية الاستعلامات
// ============================================

const MAX_QUERY_LIMIT = 100;
const DEFAULT_QUERY_LIMIT = 20;

/**
 * التحقق من صحة حد الاستعلام
 */
export function validateQueryLimit(limit?: number): number {
  if (!limit || limit < 1) return DEFAULT_QUERY_LIMIT;
  if (limit > MAX_QUERY_LIMIT) return MAX_QUERY_LIMIT;
  return Math.floor(limit);
}

// ============================================
// 🔌 إدارة الاتصال
// ============================================

/**
 * التحقق من صحة اتصال قاعدة البيانات
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('[Database] Connection check failed:', error);
    return false;
  }
}

/**
 * إغلاق اتصال قاعدة البيانات
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('[Database] Disconnected successfully');
  } catch (error) {
    console.error('[Database] Disconnect error:', error);
  }
}

/**
 * إعادة الاتصال بقاعدة البيانات
 */
export async function reconnectDatabase(): Promise<boolean> {
  try {
    await prisma.$disconnect();
    await prisma.$connect();
    return await checkDatabaseConnection();
  } catch (error) {
    console.error('[Database] Reconnect error:', error);
    return false;
  }
}

// ============================================
// 📊 إحصائيات قاعدة البيانات
// ============================================

export interface DatabaseStats {
  connected: boolean;
  totalUsers: number;
  totalCars: number;
  totalAuctions: number;
  totalTransactions: number;
}

/**
 * الحصول على إحصائيات قاعدة البيانات
 */
export async function getDatabaseStats(): Promise<DatabaseStats> {
  try {
    const [users, cars, auctions, transactions] = await Promise.all([
      prisma.users.count(),
      prisma.cars.count(),
      prisma.auctions.count(),
      prisma.transactions.count(),
    ]);

    return {
      connected: true,
      totalUsers: users,
      totalCars: cars,
      totalAuctions: auctions,
      totalTransactions: transactions,
    };
  } catch (error) {
    console.error('[Database] Stats error:', error);
    return {
      connected: false,
      totalUsers: 0,
      totalCars: 0,
      totalAuctions: 0,
      totalTransactions: 0,
    };
  }
}

// ============================================
// 🔄 معاملات آمنة
// ============================================

/**
 * تنفيذ معاملة آمنة مع retry
 */
export async function safeTransaction<T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(operation, {
        maxWait: 5000,
        timeout: 10000,
      });
    } catch (error) {
      lastError = error as Error;
      console.warn(`[Database] Transaction attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  throw lastError;
}

// ============================================
// 📤 التصدير
// ============================================

export { Prisma };
export default prisma;
