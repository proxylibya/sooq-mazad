/**
 * 📦 نقطة الدخول الموحدة لقاعدة البيانات
 * Unified Database Entry Point
 */

// تصدير Prisma Client الموحد
export { 
  prisma, 
  validateQueryLimit,
  checkDatabaseConnection,
  disconnectDatabase,
  reconnectDatabase,
  getDatabaseStats,
  safeTransaction,
  Prisma 
} from './prisma-unified';

// تصدير الأنواع
export type { DatabaseStats } from './prisma-unified';
