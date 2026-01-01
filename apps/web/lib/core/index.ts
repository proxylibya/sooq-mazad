/**
 * 🌐 التصدير الموحد لجميع الأنظمة الأساسية
 * UNIFIED CORE EXPORTS
 * ========================================
 * استخدم هذا الملف لاستيراد جميع الأنظمة الأساسية
 * 
 * @example
 * import { prisma, logger, cache, auth } from '@/lib/core';
 */

// ============================================
// 🗄️ Database Exports
// ============================================

export {
    Prisma, db, handlePrismaError, prisma, queryHelpers
} from './unified-prisma';

export type { PrismaClient } from './unified-prisma';

// ============================================
// 📝 Logger Exports
// ============================================

export {
    log, logger
} from './unified-logger';

export type {
    LogContext,
    LogEntry, LogLevel
} from './unified-logger';

// ============================================
// 💾 Cache Exports
// ============================================

export {
    CacheLayer, cache, cacheQuery, getHighPerformanceKeyDB, getOrSetCache, invalidateQueryCache, invalidateUserCache, keydb,
    keydbClient, layeredCache
} from './unified-cache';

export type {
    CacheItem,
    CacheOptions
} from './unified-cache';

// ============================================
// 🔐 Auth Exports
// ============================================

export {
    adminLogin, auth, generateAdminToken, generateToken, getAdminFromRequest, getUserFromRequest, hashPassword, login,
    register, requireAdmin, requireAuth, requireRole, verifyAdminToken, verifyPassword, verifyToken
} from './unified-auth';

export type {
    AdminAuthResult, AdminUser,
    AuthResult, AuthUser
} from './unified-auth';

// ============================================
// 🔧 Re-exports for Compatibility
// ============================================

// هذه التصديرات للتوافقية مع الكود القديم

// Prisma compatibility
export { prisma as default } from './unified-prisma';

// Logger compatibility  
export { logger as UnifiedLogger, logger as UnifiedLoggerInstance } from './unified-logger';

// Cache compatibility
export { cache as unifiedCache } from './unified-cache';

// Auth compatibility
export { auth as authSystem } from './unified-auth';
