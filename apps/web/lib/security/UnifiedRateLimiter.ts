/**
 * نظام Rate Limiting موحد ومتقدم
 * حماية شاملة ضد الهجمات والاستخدام المفرط
 */

// @ts-nocheck
import { cache } from '../core/unified-cache';

// Simple logger fallback
const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args),
  debug: (msg: string, ...args: any[]) => console.debug(`[DEBUG] ${msg}`, ...args),
};

// Use unified cache as storage
const localKeyDB = cache;

export interface RateLimitRule {
  name: string;
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (identifier: string) => string;
  onLimitReached?: (identifier: string, info: LimitInfo) => void;
}

export interface LimitInfo {
  totalHits: number;
  totalHitsPerWindow: number;
  remainingPoints: number;
  msBeforeNext: number;
  isFirstInWindow: boolean;
}

export interface AttackPattern {
  type: 'BRUTE_FORCE' | 'DDOS' | 'SCRAPING' | 'SUSPICIOUS_ACTIVITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  indicators: string[];
  autoBlock: boolean;
  blockDurationMs: number;
}

class UnifiedRateLimiter {
  private rules = new Map<string, RateLimitRule>();
  private blockedIPs = new Map<string, number>(); // IP -> unblock timestamp
  private attackPatterns: AttackPattern[] = [];
  private stats = {
    totalRequests: 0,
    blockedRequests: 0,
    attacksDetected: 0,
    rulesTriggered: new Map<string, number>(),
  };

  constructor() {
    this.setupDefaultRules();
    this.setupAttackDetection();
    this.startCleanupRoutines();
  }

  /**
   * إعداد القواعد الافتراضية
   */
  private setupDefaultRules(): void {
    // قواعد API العامة
    this.addRule({
      name: 'api_general',
      windowMs: 60 * 1000, // دقيقة واحدة
      maxRequests: 100,
    });

    // قواعد تسجيل الدخول
    this.addRule({
      name: 'auth_login',
      windowMs: 15 * 60 * 1000, // 15 دقيقة
      maxRequests: 5,
      onLimitReached: (identifier, info) => {
        this.detectPotentialAttack(identifier, 'BRUTE_FORCE', {
          attempts: info.totalHits,
          timeWindow: 15 * 60 * 1000,
        });
      },
    });

    // قواعد رفع الملفات
    this.addRule({
      name: 'file_upload',
      windowMs: 60 * 1000,
      maxRequests: 20,
    });

    // قواعد العمليات الحساسة
    this.addRule({
      name: 'sensitive_operations',
      windowMs: 60 * 1000,
      maxRequests: 10,
    });

    // قواعد البحث
    this.addRule({
      name: 'search_api',
      windowMs: 60 * 1000,
      maxRequests: 60,
    });

    // قواعد المراسلة
    this.addRule({
      name: 'messaging',
      windowMs: 60 * 1000,
      maxRequests: 30,
    });

    logger.info('تم إعداد قواعد Rate Limiting الافتراضية', {
      rulesCount: this.rules.size,
    });
  }

  /**
   * إعداد كشف الهجمات
   */
  private setupAttackDetection(): void {
    this.attackPatterns = [
      {
        type: 'BRUTE_FORCE',
        severity: 'HIGH',
        indicators: ['multiple_failed_logins', 'password_attempts'],
        autoBlock: true,
        blockDurationMs: 30 * 60 * 1000, // 30 دقيقة
      },
      {
        type: 'DDOS',
        severity: 'CRITICAL',
        indicators: ['excessive_requests', 'multiple_endpoints'],
        autoBlock: true,
        blockDurationMs: 60 * 60 * 1000, // ساعة واحدة
      },
      {
        type: 'SCRAPING',
        severity: 'MEDIUM',
        indicators: ['automated_requests', 'rapid_pagination'],
        autoBlock: true,
        blockDurationMs: 15 * 60 * 1000, // 15 دقيقة
      },
      {
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'LOW',
        indicators: ['unusual_patterns', 'bot_behavior'],
        autoBlock: false,
        blockDurationMs: 0,
      },
    ];
  }

  /**
   * إضافة قاعدة جديدة
   */
  addRule(rule: RateLimitRule): void {
    this.rules.set(rule.name, rule);
    this.stats.rulesTriggered.set(rule.name, 0);
    logger.debug(`تم إضافة قاعدة Rate Limiting: ${rule.name}`, rule);
  }

  /**
   * فحص معدل الطلبات
   */
  async checkLimit(
    ruleName: string,
    identifier: string,
    metadata?: unknown,
  ): Promise<{
    allowed: boolean;
    limitInfo?: LimitInfo;
    retryAfter?: number;
    blockReason?: string;
  }> {
    this.stats.totalRequests++;

    // فحص الحظر المسبق
    const blockCheck = this.checkBlocked(identifier);
    if (!blockCheck.allowed) {
      this.stats.blockedRequests++;
      return {
        allowed: false,
        retryAfter: blockCheck.retryAfter,
        blockReason: blockCheck.reason,
      };
    }

    // الحصول على القاعدة
    const rule = this.rules.get(ruleName);
    if (!rule) {
      logger.warn(`قاعدة Rate Limiting غير موجودة: ${ruleName}`);
      return { allowed: true };
    }

    try {
      // إنشاء مفتاح التخزين
      const key = rule.keyGenerator
        ? rule.keyGenerator(identifier)
        : `ratelimit:${ruleName}:${identifier}`;

      // جلب البيانات الحالية
      const current = await localKeyDB.get<{
        count: number;
        windowStart: number;
        firstRequest: number;
      }>(key);

      const now = Date.now();
      const windowStart = current?.windowStart || now;
      const isNewWindow = now - windowStart >= rule.windowMs;

      let count = 0;
      let firstRequest = now;

      if (current && !isNewWindow) {
        count = current.count;
        firstRequest = current.firstRequest;
      }

      // زيادة العداد
      count++;

      // فحص الحد الأقصى
      if (count > rule.maxRequests) {
        // تسجيل تجاوز الحد
        this.stats.rulesTriggered.set(ruleName, (this.stats.rulesTriggered.get(ruleName) || 0) + 1);

        const limitInfo: LimitInfo = {
          totalHits: count,
          totalHitsPerWindow: count,
          remainingPoints: 0,
          msBeforeNext: rule.windowMs - (now - windowStart),
          isFirstInWindow: false,
        };

        // استدعاء معالج تجاوز الحد
        rule.onLimitReached?.(identifier, limitInfo);

        // كشف الهجوم المحتمل
        this.detectPotentialAttack(identifier, 'DDOS', {
          ruleName,
          requests: count,
          timeWindow: rule.windowMs,
          metadata,
        });

        logger.warn(`تم تجاوز حد Rate Limiting`, {
          rule: ruleName,
          identifier,
          count,
          limit: rule.maxRequests,
          windowMs: rule.windowMs,
        });

        return {
          allowed: false,
          limitInfo,
          retryAfter: Math.ceil(limitInfo.msBeforeNext / 1000),
        };
      }

      // حفظ البيانات المحدثة
      const newData = {
        count,
        windowStart: isNewWindow ? now : windowStart,
        firstRequest,
      };

      await localKeyDB.set(key, newData, Math.ceil(rule.windowMs / 1000));

      const limitInfo: LimitInfo = {
        totalHits: count,
        totalHitsPerWindow: count,
        remainingPoints: rule.maxRequests - count,
        msBeforeNext: rule.windowMs - (now - (isNewWindow ? now : windowStart)),
        isFirstInWindow: isNewWindow,
      };

      return {
        allowed: true,
        limitInfo,
      };
    } catch (error) {
      logger.error(`خطأ في فحص Rate Limiting`, error, {
        ruleName,
        identifier,
      });
      // في حالة الخطأ، السماح بالطلب لتجنب حجب الخدمة
      return { allowed: true };
    }
  }

  /**
   * فحص الحظر المسبق
   */
  private checkBlocked(identifier: string): {
    allowed: boolean;
    retryAfter?: number;
    reason?: string;
  } {
    const blockUntil = this.blockedIPs.get(identifier);

    if (blockUntil && Date.now() < blockUntil) {
      const retryAfter = Math.ceil((blockUntil - Date.now()) / 1000);
      return {
        allowed: false,
        retryAfter,
        reason: 'IP_BLOCKED_ATTACK_DETECTION',
      };
    }

    // إزالة الحظر المنتهي
    if (blockUntil && Date.now() >= blockUntil) {
      this.blockedIPs.delete(identifier);
    }

    return { allowed: true };
  }

  /**
   * كشف الهجوم المحتمل
   */
  private detectPotentialAttack(
    identifier: string,
    attackType: AttackPattern['type'],
    evidence: unknown,
  ): void {
    const pattern = this.attackPatterns.find((p) => p.type === attackType);
    if (!pattern) return;

    this.stats.attacksDetected++;

    logger.warn(`تم كشف هجوم محتمل: ${attackType}`, {
      identifier,
      evidence,
      severity: pattern.severity,
    });

    // حظر تلقائي إذا كان مُفعلاً
    if (pattern.autoBlock && pattern.blockDurationMs > 0) {
      this.blockIP(identifier, pattern.blockDurationMs, `${attackType}_DETECTED`);
    }

    // إشعار النظام
    this.notifySecuritySystem(identifier, attackType, pattern.severity, evidence);
  }

  /**
   * حظر IP
   */
  blockIP(ip: string, durationMs: number, reason: string): void {
    const blockUntil = Date.now() + durationMs;
    this.blockedIPs.set(ip, blockUntil);

    logger.error(`تم حظر IP: ${ip}`, {
      duration: `${Math.round(durationMs / 1000 / 60)} دقيقة`,
      reason,
      blockUntil: new Date(blockUntil).toISOString(),
    });
  }

  /**
   * إلغاء حظر IP
   */
  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    logger.info(`تم إلغاء حظر IP: ${ip}`);
  }

  /**
   * إشعار نظام الأمان
   */
  private notifySecuritySystem(
    identifier: string,
    attackType: AttackPattern['type'],
    severity: AttackPattern['severity'],
    evidence: unknown,
  ): void {
    // يمكن إضافة تكامل مع أنظمة إشعار خارجية هنا
    // مثل Slack, Email, SMS, etc.

    if (severity === 'CRITICAL') {
      logger.error(`تنبيه أمني حرج: ${attackType}`, {
        identifier,
        evidence,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * الحصول على الإحصائيات
   */
  getStats(): {
    totalRequests: number;
    blockedRequests: number;
    attacksDetected: number;
    blockRate: number;
    activeBlocks: number;
    rulesTriggered: Record<string, number>;
    topBlockedIPs: Array<{ ip: string; blockUntil: number; }>;
  } {
    const activeBlocks = Array.from(this.blockedIPs.entries()).filter(
      ([_, blockUntil]) => Date.now() < blockUntil,
    );

    const topBlockedIPs = activeBlocks
      .map(([ip, blockUntil]) => ({ ip, blockUntil }))
      .sort((a, b) => b.blockUntil - a.blockUntil)
      .slice(0, 10);

    return {
      totalRequests: this.stats.totalRequests,
      blockedRequests: this.stats.blockedRequests,
      attacksDetected: this.stats.attacksDetected,
      blockRate:
        this.stats.totalRequests > 0
          ? (this.stats.blockedRequests / this.stats.totalRequests) * 100
          : 0,
      activeBlocks: activeBlocks.length,
      rulesTriggered: Object.fromEntries(this.stats.rulesTriggered),
      topBlockedIPs,
    };
  }

  /**
   * إعادة تعيين الإحصائيات
   */
  resetStats(): void {
    this.stats.totalRequests = 0;
    this.stats.blockedRequests = 0;
    this.stats.attacksDetected = 0;
    this.stats.rulesTriggered.clear();

    for (const ruleName of this.rules.keys()) {
      this.stats.rulesTriggered.set(ruleName, 0);
    }

    logger.info('تم إعادة تعيين إحصائيات Rate Limiting');
  }

  /**
   * تنظيف دوري
   */
  private startCleanupRoutines(): void {
    // تنظيف الحظر المنتهي كل 5 دقائق
    setInterval(
      () => {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [ip, blockUntil] of this.blockedIPs.entries()) {
          if (now >= blockUntil) {
            this.blockedIPs.delete(ip);
            cleanedCount++;
          }
        }

        if (cleanedCount > 0) {
          logger.debug(`تم تنظيف ${cleanedCount} حظر منتهي الصلاحية`);
        }
      },
      5 * 60 * 1000,
    );

    // إعادة تعيين الإحصائيات اليومية
    setInterval(
      () => {
        this.resetStats();
      },
      24 * 60 * 60 * 1000,
    );
  }

  /**
   * middleware للاستخدام مع APIs
   */
  middleware(ruleName: string) {
    return async (req: unknown, res: unknown, next: unknown) => {
      const identifier = this.getClientIdentifier(req);
      const result = await this.checkLimit(ruleName, identifier, {
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
      });

      // إضافة headers معلوماتية
      if (result.limitInfo) {
        res.setHeader('X-RateLimit-Limit', this.rules.get(ruleName)?.maxRequests || 0);
        res.setHeader('X-RateLimit-Remaining', result.limitInfo.remainingPoints);
        res.setHeader(
          'X-RateLimit-Reset',
          Math.ceil(Date.now() / 1000) + Math.ceil((result.limitInfo.msBeforeNext || 0) / 1000),
        );
      }

      if (!result.allowed) {
        if (result.retryAfter) {
          res.setHeader('Retry-After', result.retryAfter);
        }

        return res.status(429).json({
          success: false,
          error: 'عدد كبير من الطلبات',
          message: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً',
          retryAfter: result.retryAfter,
          blockReason: result.blockReason,
        });
      }

      return next();
    };
  }

  /**
   * الحصول على معرف العميل
   */
  private getClientIdentifier(req: unknown): string {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
      ? Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded.split(',')[0]
      : req.connection?.remoteAddress || req.socket?.remoteAddress;
    return ip || 'unknown';
  }
}

// إنشاء مثيل موحد
export const rateLimiter = new UnifiedRateLimiter();

// دوال مساعدة للتوافق
export const checkRateLimit = (ruleName: string, identifier: string, metadata?: unknown) =>
  rateLimiter.checkLimit(ruleName, identifier, metadata);

export const blockIP = (ip: string, durationMs: number, reason: string) =>
  rateLimiter.blockIP(ip, durationMs, reason);

export const unblockIP = (ip: string) => rateLimiter.unblockIP(ip);

export const getRateLimitStats = () => rateLimiter.getStats();

// Rate limiter middleware للتوافق مع الكود القديم
export const generalLimiter = {
  windowMs: 60 * 1000,
  maxRequests: 100,
  check: (identifier: string) => rateLimiter.checkLimit('api_general', identifier),
};

export const withRateLimit = (
  ruleName: string = 'api_general',
  options?: { maxRequests?: number; windowMs?: number; }
) => {
  return rateLimiter.middleware(ruleName);
};

export default rateLimiter;
