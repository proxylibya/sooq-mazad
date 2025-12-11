import { NextApiRequest } from 'next';
import crypto from 'crypto';
import { encryption } from './encryption';

// أنواع الهجمات المختلفة
export enum AttackType {
  SQL_INJECTION = 'SQL_INJECTION',
  XSS = 'XSS',
  CSRF = 'CSRF',
  BRUTE_FORCE = 'BRUTE_FORCE',
  DDOS = 'DDOS',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

// مستويات التنبيه
export enum AlertLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// واجهة تقرير الأمان
interface SecurityReport {
  allowed: boolean;
  reason?: string;
  attackType?: AttackType;
  severity: AlertLevel;
  details: any;
}

// فئة الحماية المتقدمة
export class AdvancedSecurity {
  private suspiciousIPs = new Map<
    string,
    { attempts: number; lastAttempt: number; blocked: boolean }
  >();
  private csrfTokens = new Map<string, { token: string; expiry: number }>();

  // أنماط SQL Injection المشبوهة
  private sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(\'|\"|;|--|\*|\/\*|\*\/)/g,
    /(\b(INFORMATION_SCHEMA|SYSOBJECTS|SYSCOLUMNS)\b)/gi,
  ];

  // أنماط XSS المشبوهة
  private xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi,
  ];

  // فحص الطلب الوارد للتهديدات الأمنية
  analyzeRequest(req: NextApiRequest): SecurityReport {
    const clientIP = this.getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers.referer || '';

    // فحص IP المحظور
    if (this.isIPBlocked(clientIP)) {
      return {
        allowed: false,
        reason: 'IP محظور بسبب نشاط مشبوه',
        attackType: AttackType.BRUTE_FORCE,
        severity: AlertLevel.HIGH,
        details: { ip: clientIP },
      };
    }

    // فحص SQL Injection
    const sqlCheck = this.checkSQLInjection(req);
    if (!sqlCheck.safe) {
      this.recordSuspiciousActivity(clientIP);
      return {
        allowed: false,
        reason: 'تم اكتشاف محاولة حقن SQL',
        attackType: AttackType.SQL_INJECTION,
        severity: AlertLevel.CRITICAL,
        details: { patterns: sqlCheck.patterns, ip: clientIP },
      };
    }

    // فحص XSS
    const xssCheck = this.checkXSS(req);
    if (!xssCheck.safe) {
      this.recordSuspiciousActivity(clientIP);
      return {
        allowed: false,
        reason: 'تم اكتشاف محاولة XSS',
        attackType: AttackType.XSS,
        severity: AlertLevel.HIGH,
        details: { patterns: xssCheck.patterns, ip: clientIP },
      };
    }

    // فحص User Agent المشبوه
    if (this.isSuspiciousUserAgent(userAgent)) {
      return {
        allowed: false,
        reason: 'User Agent مشبوه',
        attackType: AttackType.SUSPICIOUS_ACTIVITY,
        severity: AlertLevel.MEDIUM,
        details: { userAgent, ip: clientIP },
      };
    }

    // فحص معدل الطلبات
    if (this.isRateLimitExceeded(clientIP)) {
      return {
        allowed: false,
        reason: 'تم تجاوز معدل الطلبات المسموح',
        attackType: AttackType.DDOS,
        severity: AlertLevel.HIGH,
        details: { ip: clientIP },
      };
    }

    return {
      allowed: true,
      severity: AlertLevel.LOW,
      details: { ip: clientIP },
    };
  }

  // فحص SQL Injection
  private checkSQLInjection(req: NextApiRequest): {
    safe: boolean;
    patterns: string[];
  } {
    const foundPatterns: string[] = [];
    const dataToCheck = [
      JSON.stringify(req.body || {}),
      JSON.stringify(req.query || {}),
      req.url || '',
    ].join(' ');

    for (const pattern of this.sqlInjectionPatterns) {
      if (pattern.test(dataToCheck)) {
        foundPatterns.push(pattern.source);
      }
    }

    return {
      safe: foundPatterns.length === 0,
      patterns: foundPatterns,
    };
  }

  // فحص XSS
  private checkXSS(req: NextApiRequest): { safe: boolean; patterns: string[] } {
    const foundPatterns: string[] = [];
    const dataToCheck = [JSON.stringify(req.body || {}), JSON.stringify(req.query || {})].join(' ');

    for (const pattern of this.xssPatterns) {
      if (pattern.test(dataToCheck)) {
        foundPatterns.push(pattern.source);
      }
    }

    return {
      safe: foundPatterns.length === 0,
      patterns: foundPatterns,
    };
  }

  // فحص User Agent المشبوه
  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /^$/,
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(userAgent));
  }

  // الحصول على IP العميل
  private getClientIP(req: NextApiRequest): string {
    const forwarded = req.headers['x-forwarded-for'] as string;
    const real = req.headers['x-real-ip'] as string;
    const remoteAddress = req.connection?.remoteAddress || req.socket?.remoteAddress;

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    if (real) {
      return real;
    }

    return remoteAddress || 'unknown';
  }

  // تسجيل النشاط المشبوه
  private recordSuspiciousActivity(ip: string): void {
    const current = this.suspiciousIPs.get(ip) || {
      attempts: 0,
      lastAttempt: 0,
      blocked: false,
    };
    current.attempts++;
    current.lastAttempt = Date.now();

    // حظر IP بعد 5 محاولات مشبوهة
    if (current.attempts >= 5) {
      current.blocked = true;
    }

    this.suspiciousIPs.set(ip, current);
  }

  // فحص IP محظور
  private isIPBlocked(ip: string): boolean {
    const record = this.suspiciousIPs.get(ip);
    if (!record) return false;

    // إلغاء الحظر بعد 24 ساعة
    const hoursPassed = (Date.now() - record.lastAttempt) / (1000 * 60 * 60);
    if (hoursPassed > 24) {
      this.suspiciousIPs.delete(ip);
      return false;
    }

    return record.blocked;
  }

  // فحص معدل الطلبات
  private isRateLimitExceeded(ip: string): boolean {
    // هذا مثال بسيط - في الإنتاج يفضل استخدام KeyDB (بدلاً من Redis)
    const record = this.suspiciousIPs.get(ip) || {
      attempts: 0,
      lastAttempt: 0,
      blocked: false,
    };
    const now = Date.now();
    const timeDiff = now - record.lastAttempt;

    // إذا كان الفرق أقل من ثانية واحدة، فهو مشبوه
    return timeDiff < 1000 && record.attempts > 0;
  }

  // إنشاء CSRF token
  generateCSRFToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 60 * 60 * 1000; // ساعة واحدة

    this.csrfTokens.set(sessionId, { token, expiry });
    return token;
  }

  // التحقق من CSRF token
  verifyCSRFToken(sessionId: string, providedToken: string): boolean {
    const stored = this.csrfTokens.get(sessionId);
    if (!stored) return false;

    // فحص انتهاء الصلاحية
    if (Date.now() > stored.expiry) {
      this.csrfTokens.delete(sessionId);
      return false;
    }

    return crypto.timingSafeEqual(Buffer.from(stored.token), Buffer.from(providedToken));
  }

  // تنظيف البيانات المنتهية الصلاحية
  cleanup(): void {
    const now = Date.now();

    // تنظيف CSRF tokens
    for (const [sessionId, data] of this.csrfTokens.entries()) {
      if (now > data.expiry) {
        this.csrfTokens.delete(sessionId);
      }
    }

    // تنظيف IPs المحظورة القديمة
    for (const [ip, data] of this.suspiciousIPs.entries()) {
      const hoursPassed = (now - data.lastAttempt) / (1000 * 60 * 60);
      if (hoursPassed > 24) {
        this.suspiciousIPs.delete(ip);
      }
    }
  }

  // حظر IP يدوياً
  blockIP(ip: string): void {
    this.suspiciousIPs.set(ip, {
      attempts: 999,
      lastAttempt: Date.now(),
      blocked: true,
    });
  }

  // إلغاء حظر IP
  unblockIP(ip: string): void {
    this.suspiciousIPs.delete(ip);
  }

  // الحصول على إحصائيات الأمان
  getSecurityStats() {
    return {
      blockedIPs: Array.from(this.suspiciousIPs.entries())
        .filter(([_, data]) => data.blocked)
        .map(([ip, data]) => ({
          ip,
          attempts: data.attempts,
          lastAttempt: data.lastAttempt,
        })),
      activeCSRFTokens: this.csrfTokens.size,
      totalSuspiciousIPs: this.suspiciousIPs.size,
    };
  }
}

// إنشاء مثيل واحد للاستخدام في التطبيق
export const security = new AdvancedSecurity();

// تشغيل تنظيف دوري كل 30 دقيقة
setInterval(
  () => {
    security.cleanup();
  },
  30 * 60 * 1000,
);

// دوال مساعدة
export const analyzeRequest = (req: NextApiRequest) => security.analyzeRequest(req);
export const generateCSRFToken = (sessionId: string) => security.generateCSRFToken(sessionId);
export const verifyCSRFToken = (sessionId: string, token: string) =>
  security.verifyCSRFToken(sessionId, token);
export const blockIP = (ip: string) => security.blockIP(ip);
export const unblockIP = (ip: string) => security.unblockIP(ip);
export const getSecurityStats = () => security.getSecurityStats();
