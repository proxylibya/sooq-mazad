/**
 * 🛡️ Enterprise Rate Limiter - نظام التحكم في معدل الطلبات
 * حماية متقدمة ضد DDoS, Brute Force, Scraping
 * مصمم للتعامل مع ملايين الطلبات
 */

import { cache } from '../cache/enterprise-cache';

// =====================================
// Types & Interfaces
// =====================================

export interface RateLimitConfig {
    name: string;
    windowMs: number;           // نافذة الوقت بالميلي ثانية
    maxRequests: number;        // الحد الأقصى للطلبات
    blockDurationMs?: number;   // مدة الحظر عند التجاوز
    skipSuccessful?: boolean;   // تجاوز الطلبات الناجحة
    skipFailed?: boolean;       // تجاوز الطلبات الفاشلة
    keyPrefix?: string;         // بادئة المفتاح
    points?: number;            // نقاط لكل طلب (للـ sliding window)
    message?: string;           // رسالة خطأ مخصصة
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
    blocked?: boolean;
    blockReason?: string;
}

export interface RateLimitInfo {
    count: number;
    windowStart: number;
    blocked: boolean;
    blockUntil?: number;
    violations: number;
}

export interface AttackInfo {
    type: 'BRUTE_FORCE' | 'DDOS' | 'SCRAPING' | 'SPAM' | 'BOT';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    evidence: Record<string, unknown>;
    timestamp: number;
}

export interface RateLimiterStats {
    totalRequests: number;
    allowedRequests: number;
    blockedRequests: number;
    activeBlocks: number;
    attacksDetected: number;
    ruleStats: Record<string, { allowed: number; blocked: number; }>;
}

// =====================================
// Default Configurations
// =====================================

const DEFAULT_RULES: RateLimitConfig[] = [
    // API عام
    {
        name: 'api:general',
        windowMs: 60 * 1000,
        maxRequests: 100,
        message: 'عدد كبير من الطلبات. يرجى الانتظار.',
    },
    // تسجيل الدخول
    {
        name: 'auth:login',
        windowMs: 15 * 60 * 1000,
        maxRequests: 5,
        blockDurationMs: 30 * 60 * 1000,
        message: 'محاولات تسجيل دخول كثيرة. حسابك محظور مؤقتاً.',
    },
    // إنشاء حساب
    {
        name: 'auth:register',
        windowMs: 60 * 60 * 1000,
        maxRequests: 3,
        blockDurationMs: 60 * 60 * 1000,
        message: 'تم تجاوز الحد الأقصى لإنشاء الحسابات.',
    },
    // OTP
    {
        name: 'auth:otp',
        windowMs: 10 * 60 * 1000,
        maxRequests: 5,
        blockDurationMs: 15 * 60 * 1000,
        message: 'عدد كبير من طلبات رمز التحقق.',
    },
    // البحث
    {
        name: 'search',
        windowMs: 60 * 1000,
        maxRequests: 30,
        message: 'عدد كبير من عمليات البحث.',
    },
    // رفع الملفات
    {
        name: 'upload',
        windowMs: 60 * 1000,
        maxRequests: 10,
        message: 'عدد كبير من عمليات رفع الملفات.',
    },
    // المزادات
    {
        name: 'auction:bid',
        windowMs: 60 * 1000,
        maxRequests: 20,
        message: 'عدد كبير من المزايدات.',
    },
    // الرسائل
    {
        name: 'messaging',
        windowMs: 60 * 1000,
        maxRequests: 30,
        message: 'عدد كبير من الرسائل.',
    },
    // إنشاء إعلانات
    {
        name: 'listing:create',
        windowMs: 60 * 60 * 1000,
        maxRequests: 10,
        message: 'تم تجاوز الحد اليومي لإنشاء الإعلانات.',
    },
    // التقييمات
    {
        name: 'review',
        windowMs: 60 * 60 * 1000,
        maxRequests: 5,
        message: 'عدد كبير من التقييمات.',
    },
    // العمليات الحساسة
    {
        name: 'sensitive',
        windowMs: 60 * 1000,
        maxRequests: 5,
        blockDurationMs: 10 * 60 * 1000,
        message: 'عدد كبير من العمليات الحساسة.',
    },
];

// =====================================
// Enterprise Rate Limiter Class
// =====================================

class EnterpriseRateLimiter {
    private rules = new Map<string, RateLimitConfig>();
    private stats: RateLimiterStats = {
        totalRequests: 0,
        allowedRequests: 0,
        blockedRequests: 0,
        activeBlocks: 0,
        attacksDetected: 0,
        ruleStats: {},
    };
    private blockedIdentifiers = new Map<string, { until: number; reason: string; }>();
    private attackHistory: AttackInfo[] = [];

    constructor() {
        this.initializeRules();
        this.startCleanupInterval();
    }

    /**
     * تهيئة القواعد الافتراضية
     */
    private initializeRules(): void {
        for (const rule of DEFAULT_RULES) {
            this.addRule(rule);
        }
        console.log(`✅ Enterprise Rate Limiter: Initialized with ${this.rules.size} rules`);
    }

    /**
     * إضافة قاعدة جديدة
     */
    addRule(config: RateLimitConfig): void {
        this.rules.set(config.name, config);
        this.stats.ruleStats[config.name] = { allowed: 0, blocked: 0 };
    }

    /**
     * حذف قاعدة
     */
    removeRule(name: string): void {
        this.rules.delete(name);
        delete this.stats.ruleStats[name];
    }

    /**
     * فحص معدل الطلبات
     */
    async check(
        ruleName: string,
        identifier: string,
        options?: { weight?: number; skipCheck?: boolean; }
    ): Promise<RateLimitResult> {
        this.stats.totalRequests++;

        // الحصول على القاعدة
        const rule = this.rules.get(ruleName);
        if (!rule) {
            console.warn(`Rate limit rule not found: ${ruleName}`);
            return { allowed: true, remaining: 999, resetTime: 0 };
        }

        // تخطي الفحص إذا طُلب
        if (options?.skipCheck) {
            return { allowed: true, remaining: rule.maxRequests, resetTime: 0 };
        }

        // فحص الحظر المسبق
        const blockInfo = this.blockedIdentifiers.get(identifier);
        if (blockInfo && Date.now() < blockInfo.until) {
            this.stats.blockedRequests++;
            this.stats.ruleStats[ruleName].blocked++;
            return {
                allowed: false,
                remaining: 0,
                resetTime: blockInfo.until,
                retryAfter: Math.ceil((blockInfo.until - Date.now()) / 1000),
                blocked: true,
                blockReason: blockInfo.reason,
            };
        }

        // بناء مفتاح التخزين
        const cacheKey = `ratelimit:${rule.keyPrefix || ruleName}:${identifier}`;
        const now = Date.now();

        try {
            // جلب البيانات الحالية
            let info = await cache.get<RateLimitInfo>(cacheKey, { namespace: 'ratelimit' });

            // بدء نافذة جديدة
            if (!info || now - info.windowStart >= rule.windowMs) {
                info = {
                    count: 0,
                    windowStart: now,
                    blocked: false,
                    violations: 0,
                };
            }

            // زيادة العداد
            const weight = options?.weight || 1;
            info.count += weight;

            // حساب الوقت المتبقي
            const resetTime = info.windowStart + rule.windowMs;
            const remaining = Math.max(0, rule.maxRequests - info.count);

            // فحص تجاوز الحد
            if (info.count > rule.maxRequests) {
                info.violations++;

                // حظر إذا تم تكوينه
                if (rule.blockDurationMs && info.violations >= 2) {
                    const blockUntil = now + rule.blockDurationMs;
                    this.blockedIdentifiers.set(identifier, {
                        until: blockUntil,
                        reason: `${ruleName}_EXCEEDED`,
                    });
                    info.blocked = true;
                    info.blockUntil = blockUntil;

                    // كشف هجوم محتمل
                    this.detectAttack(identifier, ruleName, info);
                }

                // حفظ البيانات
                await cache.set(cacheKey, info, {
                    ttl: Math.ceil(rule.windowMs / 1000),
                    namespace: 'ratelimit',
                });

                this.stats.blockedRequests++;
                this.stats.ruleStats[ruleName].blocked++;

                return {
                    allowed: false,
                    remaining: 0,
                    resetTime,
                    retryAfter: Math.ceil((resetTime - now) / 1000),
                    blocked: info.blocked,
                    blockReason: rule.message,
                };
            }

            // حفظ البيانات المحدثة
            await cache.set(cacheKey, info, {
                ttl: Math.ceil(rule.windowMs / 1000),
                namespace: 'ratelimit',
            });

            this.stats.allowedRequests++;
            this.stats.ruleStats[ruleName].allowed++;

            return {
                allowed: true,
                remaining,
                resetTime,
            };
        } catch (error) {
            console.error('Rate limiter error:', error);
            // في حالة الخطأ، السماح بالطلب لتجنب حجب الخدمة
            return { allowed: true, remaining: rule.maxRequests, resetTime: 0 };
        }
    }

    /**
     * كشف الهجمات
     */
    private detectAttack(identifier: string, ruleName: string, info: RateLimitInfo): void {
        let attackType: AttackInfo['type'] = 'SPAM';
        let severity: AttackInfo['severity'] = 'LOW';

        // تحديد نوع الهجوم
        if (ruleName.startsWith('auth:login')) {
            attackType = 'BRUTE_FORCE';
            severity = info.violations > 5 ? 'HIGH' : 'MEDIUM';
        } else if (info.count > 500) {
            attackType = 'DDOS';
            severity = 'CRITICAL';
        } else if (ruleName === 'search' && info.count > 100) {
            attackType = 'SCRAPING';
            severity = 'MEDIUM';
        }

        const attack: AttackInfo = {
            type: attackType,
            severity,
            evidence: {
                identifier,
                ruleName,
                count: info.count,
                violations: info.violations,
            },
            timestamp: Date.now(),
        };

        this.attackHistory.push(attack);
        this.stats.attacksDetected++;

        // تحديد مدة الحظر بناءً على الخطورة
        const blockDurations: Record<AttackInfo['severity'], number> = {
            LOW: 5 * 60 * 1000,       // 5 دقائق
            MEDIUM: 15 * 60 * 1000,   // 15 دقيقة
            HIGH: 60 * 60 * 1000,     // ساعة
            CRITICAL: 24 * 60 * 60 * 1000, // 24 ساعة
        };

        const blockDuration = blockDurations[severity];
        this.blockedIdentifiers.set(identifier, {
            until: Date.now() + blockDuration,
            reason: `ATTACK_${attackType}_${severity}`,
        });

        console.warn(`🚨 Attack Detected: ${attackType} [${severity}]`, {
            identifier,
            ruleName,
            violations: info.violations,
        });
    }

    /**
     * حظر معرف يدوياً
     */
    block(identifier: string, durationMs: number, reason: string): void {
        this.blockedIdentifiers.set(identifier, {
            until: Date.now() + durationMs,
            reason,
        });
        console.log(`🔒 Blocked: ${identifier} for ${durationMs / 1000}s - ${reason}`);
    }

    /**
     * إلغاء حظر معرف
     */
    unblock(identifier: string): boolean {
        const deleted = this.blockedIdentifiers.delete(identifier);
        if (deleted) {
            console.log(`🔓 Unblocked: ${identifier}`);
        }
        return deleted;
    }

    /**
     * التحقق من حالة الحظر
     */
    isBlocked(identifier: string): { blocked: boolean; until?: number; reason?: string; } {
        const blockInfo = this.blockedIdentifiers.get(identifier);
        if (!blockInfo) {
            return { blocked: false };
        }

        if (Date.now() >= blockInfo.until) {
            this.blockedIdentifiers.delete(identifier);
            return { blocked: false };
        }

        return {
            blocked: true,
            until: blockInfo.until,
            reason: blockInfo.reason,
        };
    }

    /**
     * إعادة تعيين حد معين
     */
    async reset(ruleName: string, identifier: string): Promise<boolean> {
        const cacheKey = `ratelimit:${ruleName}:${identifier}`;
        await cache.delete(cacheKey, { namespace: 'ratelimit' });
        return true;
    }

    /**
     * الحصول على الإحصائيات
     */
    getStats(): RateLimiterStats {
        return {
            ...this.stats,
            activeBlocks: this.blockedIdentifiers.size,
        };
    }

    /**
     * الحصول على سجل الهجمات
     */
    getAttackHistory(limit = 100): AttackInfo[] {
        return this.attackHistory.slice(-limit);
    }

    /**
     * الحصول على القواعد الحالية
     */
    getRules(): RateLimitConfig[] {
        return Array.from(this.rules.values());
    }

    /**
     * تنظيف دوري
     */
    private startCleanupInterval(): void {
        setInterval(() => {
            const now = Date.now();

            // تنظيف المحظورين المنتهي حظرهم
            for (const [identifier, info] of this.blockedIdentifiers.entries()) {
                if (now >= info.until) {
                    this.blockedIdentifiers.delete(identifier);
                }
            }

            // تنظيف سجل الهجمات (الاحتفاظ بآخر 1000)
            if (this.attackHistory.length > 1000) {
                this.attackHistory = this.attackHistory.slice(-500);
            }

            // تحديث عدد المحظورين النشطين
            this.stats.activeBlocks = this.blockedIdentifiers.size;
        }, 60 * 1000); // كل دقيقة
    }

    /**
     * إعادة تعيين الإحصائيات
     */
    resetStats(): void {
        this.stats = {
            totalRequests: 0,
            allowedRequests: 0,
            blockedRequests: 0,
            activeBlocks: this.blockedIdentifiers.size,
            attacksDetected: 0,
            ruleStats: {},
        };

        for (const name of this.rules.keys()) {
            this.stats.ruleStats[name] = { allowed: 0, blocked: 0 };
        }
    }
}

// =====================================
// Singleton & Middleware
// =====================================

export const rateLimiter = new EnterpriseRateLimiter();

/**
 * Middleware للـ API Routes
 */
export function createRateLimitMiddleware(ruleName: string) {
    return async (req: any, res: any, next: () => void) => {
        const identifier = getClientIdentifier(req);
        const result = await rateLimiter.check(ruleName, identifier);

        // إضافة headers
        res.setHeader('X-RateLimit-Limit', rateLimiter.getRules().find(r => r.name === ruleName)?.maxRequests || 0);
        res.setHeader('X-RateLimit-Remaining', result.remaining);
        res.setHeader('X-RateLimit-Reset', result.resetTime);

        if (!result.allowed) {
            if (result.retryAfter) {
                res.setHeader('Retry-After', result.retryAfter);
            }

            return res.status(429).json({
                success: false,
                error: 'RATE_LIMIT_EXCEEDED',
                message: result.blockReason || 'عدد كبير من الطلبات. يرجى المحاولة لاحقاً.',
                retryAfter: result.retryAfter,
            });
        }

        next();
    };
}

/**
 * Helper للحصول على معرف العميل
 */
export function getClientIdentifier(req: any): string {
    const forwarded = req.headers?.['x-forwarded-for'];
    const ip = forwarded
        ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
        : req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';

    // إضافة User ID إذا موجود
    const userId = req.user?.id || req.session?.userId;
    if (userId) {
        return `user:${userId}:${ip}`;
    }

    return `ip:${ip}`;
}

export default rateLimiter;
