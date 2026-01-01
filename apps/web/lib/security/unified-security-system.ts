/**
 * نظام الأمان والحماية الموحد العالمي
 * Unified Global Security System
 * 
 * نظام حماية شامل ضد:
 * - SQL Injection
 * - XSS Attacks
 * - CSRF Attacks
 * - DDoS Attacks
 * - Brute Force
 * - Data Leaks
 */

import crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { keydb } from '@/lib/cache/keydb-unified';
import DOMPurify from 'isomorphic-dompurify';

// Constants
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ENCRYPTION_IV_LENGTH = 16;
const HASH_SECRET = process.env.HASH_SECRET || 'your-hash-secret-change-in-production';

/**
 * فئة نظام الأمان الموحد
 */
export class UnifiedSecuritySystem {
  private static instance: UnifiedSecuritySystem;
  private encryptionKey: Buffer;

  private constructor() {
    this.encryptionKey = Buffer.from(ENCRYPTION_KEY, 'hex');
  }

  /**
   * الحصول على مثيل واحد من النظام
   */
  public static getInstance(): UnifiedSecuritySystem {
    if (!UnifiedSecuritySystem.instance) {
      UnifiedSecuritySystem.instance = new UnifiedSecuritySystem();
    }
    return UnifiedSecuritySystem.instance;
  }

  /**
   * تشفير البيانات الحساسة
   */
  public encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);
      const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        this.encryptionKey,
        iv
      );
      
      let encrypted = cipher.update(text);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      
      return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * فك تشفير البيانات
   */
  public decrypt(text: string): string {
    try {
      const textParts = text.split(':');
      const iv = Buffer.from(textParts.shift()!, 'hex');
      const encryptedText = Buffer.from(textParts.join(':'), 'hex');
      
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        this.encryptionKey,
        iv
      );
      
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString();
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * توليد Hash آمن للبيانات
   */
  public hash(data: string): string {
    return crypto
      .createHmac('sha256', HASH_SECRET)
      .update(data)
      .digest('hex');
  }

  /**
   * التحقق من Hash
   */
  public verifyHash(data: string, hash: string): boolean {
    const dataHash = this.hash(data);
    return crypto.timingSafeEqual(
      Buffer.from(dataHash),
      Buffer.from(hash)
    );
  }

  /**
   * تنظيف المدخلات من XSS
   */
  public sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      // تنظيف HTML
      const cleaned = DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      });
      
      // إزالة أكواد SQL الخطرة
      return cleaned
        .replace(/['";\\]/g, '')
        .replace(/--/g, '')
        .replace(/\/\*/g, '')
        .replace(/\*\//g, '')
        .replace(/xp_/gi, '')
        .replace(/sp_/gi, '')
        .replace(/exec/gi, '')
        .replace(/execute/gi, '')
        .replace(/drop/gi, '')
        .replace(/delete/gi, '')
        .replace(/insert/gi, '')
        .replace(/update/gi, '')
        .replace(/union/gi, '')
        .replace(/select/gi, '');
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const key in input) {
        sanitized[key] = this.sanitizeInput(input[key]);
      }
      return sanitized;
    }
    
    return input;
  }

  /**
   * التحقق من صحة البريد الإلكتروني
   */
  public validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length < 255;
  }

  /**
   * التحقق من صحة رقم الهاتف الليبي
   */
  public validateLibyanPhone(phone: string): boolean {
    const phoneRegex = /^(091|092|093|094|095|096)\d{7}$/;
    return phoneRegex.test(phone);
  }

  /**
   * التحقق من قوة كلمة المرور
   */
  public validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // الطول
    if (password.length >= 8) score++;
    else feedback.push('يجب أن تكون 8 أحرف على الأقل');
    
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;

    // الأحرف الكبيرة
    if (/[A-Z]/.test(password)) score++;
    else feedback.push('يجب أن تحتوي على حرف كبير');

    // الأحرف الصغيرة
    if (/[a-z]/.test(password)) score++;
    else feedback.push('يجب أن تحتوي على حرف صغير');

    // الأرقام
    if (/[0-9]/.test(password)) score++;
    else feedback.push('يجب أن تحتوي على رقم');

    // الرموز الخاصة
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    else feedback.push('يُنصح بإضافة رموز خاصة');

    // عدم احتواء كلمات شائعة
    const commonPasswords = ['password', '123456', 'qwerty', 'admin'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      score = Math.max(0, score - 3);
      feedback.push('تحتوي على كلمة شائعة');
    }

    return {
      isValid: score >= 4,
      score: Math.min(10, score),
      feedback
    };
  }

  /**
   * توليد رمز CSRF
   */
  public generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * التحقق من رمز CSRF
   */
  public async verifyCSRFToken(token: string, sessionId: string): Promise<boolean> {
    const storedToken = await keydb.get(`csrf:${sessionId}`);
    return storedToken === token;
  }

  /**
   * حماية من Brute Force
   */
  public async checkBruteForce(
    identifier: string,
    action: string,
    maxAttempts = 5,
    windowMinutes = 15
  ): Promise<{
    isBlocked: boolean;
    remainingAttempts: number;
    blockedUntil?: Date;
  }> {
    const key = `bruteforce:${action}:${identifier}`;
    const blockKey = `${key}:blocked`;
    
    // التحقق من الحظر
    const blockedUntil = await keydb.get<number>(blockKey);
    if (blockedUntil && blockedUntil > Date.now()) {
      return {
        isBlocked: true,
        remainingAttempts: 0,
        blockedUntil: new Date(blockedUntil)
      };
    }

    // عد المحاولات
    const attempts = await keydb.incr(key);
    
    // تعيين مدة انتهاء الصلاحية
    if (attempts === 1) {
      await keydb.expire(key, windowMinutes * 60);
    }

    // التحقق من تجاوز الحد
    if (attempts > maxAttempts) {
      const blockUntil = Date.now() + (windowMinutes * 60 * 1000);
      await keydb.set(blockKey, blockUntil, { ttl: windowMinutes * 60 });
      
      return {
        isBlocked: true,
        remainingAttempts: 0,
        blockedUntil: new Date(blockUntil)
      };
    }

    return {
      isBlocked: false,
      remainingAttempts: maxAttempts - attempts
    };
  }

  /**
   * إعادة تعيين محاولات Brute Force
   */
  public async resetBruteForce(identifier: string, action: string): Promise<void> {
    const key = `bruteforce:${action}:${identifier}`;
    const blockKey = `${key}:blocked`;
    
    await keydb.del([key, blockKey]);
  }

  /**
   * توليد رمز عشوائي آمن
   */
  public generateSecureToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * توليد OTP
   */
  public generateOTP(length = 6): string {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, digits.length);
      otp += digits[randomIndex];
    }
    
    return otp;
  }

  /**
   * حفظ وتحقق OTP
   */
  public async saveOTP(identifier: string, otp: string, expiryMinutes = 5): Promise<void> {
    const key = `otp:${identifier}`;
    await keydb.set(key, otp, { ttl: expiryMinutes * 60 });
  }

  public async verifyOTP(identifier: string, otp: string): Promise<boolean> {
    const key = `otp:${identifier}`;
    const storedOTP = await keydb.get(key);
    
    if (storedOTP === otp) {
      await keydb.del(key); // حذف بعد الاستخدام
      return true;
    }
    
    return false;
  }

  /**
   * تسجيل محاولات الاختراق
   */
  public async logSecurityEvent(event: {
    type: 'INTRUSION' | 'BRUTE_FORCE' | 'XSS' | 'SQL_INJECTION' | 'CSRF' | 'UNAUTHORIZED';
    identifier?: string;
    ipAddress?: string;
    userAgent?: string;
    details?: any;
  }): Promise<void> {
    try {
      const logEntry = {
        ...event,
        timestamp: new Date().toISOString(),
        id: this.generateSecureToken(16)
      };
      
      // حفظ في قائمة الأحداث الأمنية
      await keydb.lpush('security:events', JSON.stringify(logEntry));
      
      // الاحتفاظ بآخر 1000 حدث فقط
      await keydb.getClient().ltrim('security:events', 0, 999);
      
      // إذا كان حدث خطير، أرسل تنبيه
      if (['INTRUSION', 'SQL_INJECTION'].includes(event.type)) {
        console.error('⚠️ CRITICAL SECURITY EVENT:', logEntry);
        // يمكن إضافة إرسال إيميل أو SMS هنا
      }
    } catch (error) {
      console.error('Security logging error:', error);
    }
  }

  /**
   * Headers الأمان لـ HTTP
   */
  public setSecurityHeaders(res: NextApiResponse): void {
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://api.sooq-mazad.ly"
    );
    
    // Headers أخرى
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // HSTS
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
  }

  /**
   * التحقق من IP المشبوه
   */
  public async checkSuspiciousIP(ip: string): Promise<boolean> {
    const blacklistKey = `security:ip:blacklist:${ip}`;
    const isBlacklisted = await keydb.exists(blacklistKey);
    
    if (isBlacklisted) {
      await this.logSecurityEvent({
        type: 'UNAUTHORIZED',
        identifier: ip,
        ipAddress: ip,
        details: 'Blacklisted IP attempted access'
      });
      return true;
    }
    
    return false;
  }

  /**
   * إضافة IP للقائمة السوداء
   */
  public async blacklistIP(ip: string, reason: string, durationHours = 24): Promise<void> {
    const key = `security:ip:blacklist:${ip}`;
    await keydb.set(key, { reason, timestamp: new Date() }, { ttl: durationHours * 3600 });
  }

  /**
   * Middleware للأمان
   */
  public securityMiddleware() {
    return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
      try {
        // تعيين Headers الأمان
        this.setSecurityHeaders(res);
        
        // الحصول على IP
        const forwarded = req.headers['x-forwarded-for'];
        const ip = typeof forwarded === 'string' 
          ? forwarded.split(',')[0].trim()
          : req.socket?.remoteAddress || 'unknown';
        
        // التحقق من IP المشبوه
        if (await this.checkSuspiciousIP(ip)) {
          return res.status(403).json({ error: 'Access denied' });
        }
        
        // تنظيف المدخلات
        if (req.body) {
          req.body = this.sanitizeInput(req.body);
        }
        if (req.query) {
          req.query = this.sanitizeInput(req.query);
        }
        
        next();
      } catch (error) {
        console.error('Security middleware error:', error);
        res.status(500).json({ error: 'Security check failed' });
      }
    };
  }
}

// تصدير مثيل واحد من النظام
export const security = UnifiedSecuritySystem.getInstance();

// تصدير وظائف سريعة للاستخدام
export const secure = {
  encrypt: (text: string) => security.encrypt(text),
  decrypt: (text: string) => security.decrypt(text),
  hash: (data: string) => security.hash(data),
  verifyHash: (data: string, hash: string) => security.verifyHash(data, hash),
  sanitize: (input: any) => security.sanitizeInput(input),
  validateEmail: (email: string) => security.validateEmail(email),
  validatePhone: (phone: string) => security.validateLibyanPhone(phone),
  validatePassword: (password: string) => security.validatePasswordStrength(password),
  generateToken: (length?: number) => security.generateSecureToken(length),
  generateOTP: (length?: number) => security.generateOTP(length),
  checkBruteForce: (id: string, action: string) => security.checkBruteForce(id, action),
  logEvent: (event: any) => security.logSecurityEvent(event)
};
