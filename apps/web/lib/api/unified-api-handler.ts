/**
 * نظام معالج API الموحد العالمي
 * Unified Global API Handler System
 * 
 * نظام قوي للتعامل مع جميع طلبات API بشكل موحد
 * يدعم: Rate Limiting, Caching, Error Handling, Validation, Logging
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodSchema } from 'zod';
import { keydb } from '@/lib/cache/keydb-unified';
import { authSystem } from '@/lib/auth/unified-auth-system';
import prisma from '@/lib/prisma';

// Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiHandlerOptions<T = any> {
  methods: HttpMethod[];
  requireAuth?: boolean;
  requireRoles?: string[];
  validateBody?: ZodSchema<T>;
  validateQuery?: ZodSchema;
  rateLimit?: RateLimitOptions;
  cache?: CacheOptions;
  logging?: boolean;
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

export interface CacheOptions {
  ttl: number;
  key?: (req: NextApiRequest) => string;
}

export interface ApiContext {
  req: NextApiRequest;
  res: NextApiResponse;
  user?: any;
  body?: any;
  query?: any;
  params?: any;
}

export type ApiHandler<T = any> = (context: ApiContext) => Promise<T> | T;

/**
 * فئة معالج API الموحد
 */
export class UnifiedApiHandler {
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  /**
   * إنشاء معالج API موحد
   */
  public static create<T = any>(
    handler: ApiHandler<T>,
    options: ApiHandlerOptions<T> = { methods: ['GET'] }
  ) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        // 1. التحقق من الطريقة HTTP
        if (!options.methods.includes(req.method as HttpMethod)) {
          return this.sendError(res, 405, `Method ${req.method} not allowed`);
        }

        // 2. التحقق من Rate Limiting
        if (options.rateLimit) {
          const isRateLimited = await this.checkRateLimit(req, options.rateLimit);
          if (isRateLimited) {
            return this.sendError(res, 429, options.rateLimit.message || 'Too many requests');
          }
        }

        // 3. التحقق من المصادقة
        let user = null;
        if (options.requireAuth) {
          const authHeader = req.headers.authorization;
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return this.sendError(res, 401, 'غير مصرح');
          }

          const token = authHeader.substring(7);
          user = await authSystem.getUserFromToken(token);
          
          if (!user) {
            return this.sendError(res, 401, 'رمز غير صالح');
          }

          // التحقق من الأدوار
          if (options.requireRoles && !options.requireRoles.includes(user.role)) {
            return this.sendError(res, 403, 'ليس لديك الصلاحية');
          }
        }

        // 4. التحقق من صحة البيانات
        let validatedBody = req.body;
        let validatedQuery = req.query;

        if (options.validateBody && req.body) {
          const validation = options.validateBody.safeParse(req.body);
          if (!validation.success) {
            return this.sendValidationError(res, validation.error);
          }
          validatedBody = validation.data;
        }

        if (options.validateQuery && req.query) {
          const validation = options.validateQuery.safeParse(req.query);
          if (!validation.success) {
            return this.sendValidationError(res, validation.error);
          }
          validatedQuery = validation.data;
        }

        // 5. التحقق من الـ Cache
        if (options.cache && req.method === 'GET') {
          const cacheKey = options.cache.key ? options.cache.key(req) : this.generateCacheKey(req);
          const cached = await keydb.get(cacheKey);
          
          if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return this.sendSuccess(res, cached);
          }
        }

        // 6. إنشاء السياق
        const context: ApiContext = {
          req,
          res,
          user,
          body: validatedBody,
          query: validatedQuery,
          params: req.query
        };

        // 7. تنفيذ المعالج
        const result = await handler(context);

        // 8. حفظ في الـ Cache إذا لزم
        if (options.cache && req.method === 'GET' && result) {
          const cacheKey = options.cache.key ? options.cache.key(req) : this.generateCacheKey(req);
          await keydb.set(cacheKey, result, { ttl: options.cache.ttl });
          res.setHeader('X-Cache', 'MISS');
        }

        // 9. تسجيل النشاط
        if (options.logging && user) {
          this.logApiActivity(user.id, req);
        }

        // 10. إرسال الاستجابة الناجحة
        return this.sendSuccess(res, result);

      } catch (error) {
        console.error('API Handler Error:', error);
        
        // معالجة أخطاء Prisma
        if (error.code === 'P2002') {
          return this.sendError(res, 409, 'البيانات موجودة مسبقاً');
        }
        if (error.code === 'P2025') {
          return this.sendError(res, 404, 'البيانات غير موجودة');
        }
        
        // خطأ عام
        return this.sendError(res, 500, 'خطأ في الخادم');
      }
    };
  }

  /**
   * إرسال استجابة ناجحة
   */
  private static sendSuccess(res: NextApiResponse, data: any, statusCode = 200) {
    res.status(statusCode).json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * إرسال خطأ
   */
  private static sendError(res: NextApiResponse, statusCode: number, message: string) {
    res.status(statusCode).json({
      success: false,
      error: {
        message,
        statusCode,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * إرسال خطأ التحقق من الصحة
   */
  private static sendValidationError(res: NextApiResponse, error: any) {
    const errors = error.errors.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message
    }));

    res.status(400).json({
      success: false,
      error: {
        message: 'بيانات غير صحيحة',
        statusCode: 400,
        errors,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * التحقق من Rate Limiting
   */
  private static async checkRateLimit(
    req: NextApiRequest,
    options: RateLimitOptions
  ): Promise<boolean> {
    const identifier = this.getClientIdentifier(req);
    const key = `ratelimit:${identifier}:${req.url}`;
    const now = Date.now();

    // الحصول على البيانات من الذاكرة
    let data = this.rateLimitStore.get(key);
    
    // إذا لا توجد بيانات أو انتهت النافذة الزمنية
    if (!data || data.resetTime < now) {
      data = {
        count: 1,
        resetTime: now + options.windowMs
      };
      this.rateLimitStore.set(key, data);
      return false;
    }

    // زيادة العداد
    data.count++;
    
    // التحقق من تجاوز الحد
    if (data.count > options.max) {
      return true;
    }

    this.rateLimitStore.set(key, data);
    return false;
  }

  /**
   * الحصول على معرف العميل
   */
  private static getClientIdentifier(req: NextApiRequest): string {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' 
      ? forwarded.split(',')[0].trim()
      : req.socket?.remoteAddress || 'unknown';
    
    return ip;
  }

  /**
   * توليد مفتاح Cache
   */
  private static generateCacheKey(req: NextApiRequest): string {
    const query = JSON.stringify(req.query || {});
    return `api:${req.url}:${query}`;
  }

  /**
   * تسجيل نشاط API
   */
  private static async logApiActivity(userId: string, req: NextApiRequest) {
    try {
      const activity = {
        userId,
        endpoint: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      };
      
      // حفظ في قائمة النشاط
      await keydb.lpush(`activity:api:${userId}`, JSON.stringify(activity));
      
      // الاحتفاظ بآخر 100 نشاط فقط
      await keydb.getClient().ltrim(`activity:api:${userId}`, 0, 99);
    } catch (error) {
      console.error('Activity logging error:', error);
    }
  }
}

/**
 * مساعد سريع لإنشاء معالج API
 */
export const createApiHandler = <T = any>(
  handler: ApiHandler<T>,
  options?: ApiHandlerOptions<T>
) => UnifiedApiHandler.create(handler, options);

/**
 * Validation Schemas الشائعة
 */
export const commonSchemas = {
  // معرف المستخدم
  userId: z.string().cuid('معرف غير صالح'),
  
  // رقم الهاتف الليبي
  phoneNumber: z.string()
    .regex(/^(091|092|093|094|095|096)\d{7}$/, 'رقم هاتف ليبي غير صالح'),
  
  // البريد الإلكتروني
  email: z.string().email('بريد إلكتروني غير صالح').optional(),
  
  // كلمة المرور
  password: z.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
    .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير')
    .regex(/[0-9]/, 'يجب أن تحتوي على رقم'),
  
  // الصفحة والحد للـ Pagination
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    sort: z.enum(['asc', 'desc']).optional(),
    sortBy: z.string().optional()
  }),
  
  // المبلغ المالي
  amount: z.number()
    .positive('المبلغ يجب أن يكون موجب')
    .multipleOf(0.01, 'المبلغ يجب أن يكون بدقة قرشين'),
  
  // التاريخ
  date: z.string().datetime('تاريخ غير صالح'),
  
  // نوع المحفظة
  walletType: z.enum(['LOCAL', 'GLOBAL', 'CRYPTO']),
  
  // حالة المعاملة
  transactionStatus: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']),
  
  // نوع السيارة
  carType: z.enum(['SEDAN', 'SUV', 'TRUCK', 'VAN', 'SPORTS', 'OTHER']),
  
  // حالة السيارة
  carCondition: z.enum(['NEW', 'USED', 'DAMAGED'])
};

/**
 * معالجات أخطاء مخصصة
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * وظائف مساعدة للاستجابات
 */
export const apiResponse = {
  success: (data: any, message?: string) => ({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  }),
  
  error: (message: string, statusCode = 400, details?: any) => ({
    success: false,
    error: {
      message,
      statusCode,
      details,
      timestamp: new Date().toISOString()
    }
  }),
  
  paginated: (data: any[], pagination: any) => ({
    success: true,
    data,
    pagination,
    timestamp: new Date().toISOString()
  })
};

/**
 * Middleware helpers
 */
export const apiMiddleware = {
  // التحقق من المصادقة
  requireAuth: (handler: ApiHandler) => 
    createApiHandler(handler, { 
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      requireAuth: true 
    }),
  
  // التحقق من الدور
  requireRole: (roles: string[], handler: ApiHandler) =>
    createApiHandler(handler, {
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      requireAuth: true,
      requireRoles: roles
    }),
  
  // Rate Limiting
  withRateLimit: (max: number, windowMs: number, handler: ApiHandler) =>
    createApiHandler(handler, {
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      rateLimit: { max, windowMs }
    }),
  
  // Caching
  withCache: (ttl: number, handler: ApiHandler) =>
    createApiHandler(handler, {
      methods: ['GET'],
      cache: { ttl }
    })
};
