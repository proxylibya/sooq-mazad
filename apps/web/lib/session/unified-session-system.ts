// @ts-nocheck
/**
 * 🔐 نظام الجلسات الموحد - Enterprise Grade
 * نظام آمن وموحد لإدارة جميع الجلسات في المشروع
 */

import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import UniversalCookieManager, { COOKIE_MAX_AGE, COOKIE_NAMES } from '../cookies/UniversalCookieManager';
// ============= الواجهات والأنواع =============

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'MODERATOR' | 'MANAGER';
  accountType: string;
  verified: boolean;
  status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
  profileImage?: string | null;
  wallet?: {
    balance: number;
    currency: string;
  };
  createdAt?: string | Date;
}

export interface SessionData {
  user: User;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
}

export interface TokenPayload {
  sessionId: string;
  userId: string;
  role: string;
  exp: number;
  iat: number;
}

export interface SessionConfig {
  jwtSecret: string;
  defaultMaxAge: number;  // بالثواني
  rememberMeMaxAge: number; // بالثواني
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'lax' | 'strict' | 'none';
}

// ============= التكوين الافتراضي =============

const DEFAULT_CONFIG: SessionConfig = {
  jwtSecret: (process as any).env.JWT_SECRET || 'your-super-secret-key-change-in-production',
  defaultMaxAge: 24 * 60 * 60, // 24 ساعة
  rememberMeMaxAge: 30 * 24 * 60 * 60, // 30 يوم
  secure: (process as any).env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax'
};

// ============= النظام الموحد للجلسات =============

export class UnifiedSessionSystem {
  private config: SessionConfig;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============= إنشاء الجلسة =============

  /**
   * إنشاء جلسة جديدة للمستخدم
   */
  async createSession(
    user: User,
    req: NextApiRequest,
    rememberMe: boolean = false
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    sessionData: SessionData;
  }> {
    const sessionId = this.generateSessionId();
    const now = Date.now();
    const maxAge = rememberMe ? this.config.rememberMeMaxAge : this.config.defaultMaxAge;
    const expiresAt = now + (maxAge * 1000);
    // بيانات الجلسة
    const sessionData: SessionData = {
      user,
      sessionId,
      ipAddress: this.getClientIP(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      createdAt: now,
      expiresAt,
      lastActivity: now
    };

    // إنشاء Access Token
    const accessToken = this.generateAccessToken(user, sessionId, expiresAt);
    // إنشاء Refresh Token
    const refreshToken = this.generateRefreshToken(user.id, sessionId);
    return {
      accessToken,
      refreshToken,
      sessionData
    };
  }

  /**
   * تعيين كوكيز الجلسة
   */
  setSessionCookies(
    res: NextApiResponse,
    accessToken: string,
    refreshToken: string,
    rememberMe: boolean = false
  ): void {
    const maxAge = rememberMe
      ? this.config.rememberMeMaxAge
      : this.config.defaultMaxAge;

    // Access Token Cookie
    UniversalCookieManager.setCookie(res, {
      name: COOKIE_NAMES.USER_ACCESS,
      value: accessToken,
      maxAge,
      httpOnly: this.config.httpOnly,
      secure: this.config.secure,
      sameSite: this.config.sameSite,
      path: '/'
    });

    // Refresh Token Cookie (أطول مدة)
    UniversalCookieManager.setCookie(res, {
      name: COOKIE_NAMES.USER_REFRESH,
      value: refreshToken,
      maxAge: COOKIE_MAX_AGE.THREE_MONTHS,
      httpOnly: true, // دائماً httpOnly للrefresh token
      secure: this.config.secure,
      sameSite: this.config.sameSite,
      path: '/'
    });
  }

  // ============= التحقق من الجلسة =============

  /**
   * التحقق من صحة الجلسة
   */
  async validateSession(req: NextApiRequest): Promise<SessionData | null> {
    try {
      const token = this.extractToken(req);
      if (!token) return null;

      // التحقق من JWT
      const decoded = jwt.verify(token, this.config.jwtSecret) as TokenPayload;
      // التحقق من انتهاء الصلاحية
      if (Date.now() > decoded.exp * 1000) {
        return null;
      }

      // إعادة بناء بيانات الجلسة
      // في الإنتاج: يمكن جلبها من قاعدة البيانات أو Redis
      const sessionData: SessionData = {
        user: {
          id: decoded.userId,
          role: decoded.role as User['role'],
          // باقي البيانات يمكن جلبها من DB
        } as User,
        sessionId: decoded.sessionId,
        ipAddress: this.getClientIP(req),
        userAgent: req.headers['user-agent'] || 'unknown',
        createdAt: decoded.iat * 1000,
        expiresAt: decoded.exp * 1000,
        lastActivity: Date.now()
      };

      return sessionData;
    } catch (error) {
      console.error('خطأ في التحقق من الجلسة:', error);
      return null;
    }
  }

  /**
   * تجديد الجلسة باستخدام Refresh Token
   */
  async refreshSession(req: NextApiRequest): Promise<{
    accessToken: string;
    success: boolean;
  }> {
    try {
      const refreshToken = UniversalCookieManager.getCookie(req, COOKIE_NAMES.USER_REFRESH);
      if (!refreshToken) {
        return { accessToken: '', success: false };
      }

      // التحقق من Refresh Token
      const decoded = jwt.verify(refreshToken, this.config.jwtSecret) as any;
      // إنشاء Access Token جديد
      const newAccessToken = this.generateAccessToken(
        { id: decoded.userId, role: decoded.role } as User,
        decoded.sessionId,
        Date.now() + (this.config.defaultMaxAge * 1000)
      );

      return {
        accessToken: newAccessToken,
        success: true
      };
    } catch (error) {
      console.error('خطأ في تجديد الجلسة:', error);
      return { accessToken: '', success: false };
    }
  }

  // ============= إنهاء الجلسة =============

  /**
   * إنهاء الجلسة وتسجيل الخروج
   */
  async destroySession(res: NextApiResponse): Promise<void> {
    // مسح كوكيز الجلسة
    UniversalCookieManager.clearMultipleCookies(res, [
      COOKIE_NAMES.USER_ACCESS,
      COOKIE_NAMES.USER_REFRESH
    ]);

    // في الإنتاج: حذف الجلسة من قاعدة البيانات أو Redis
  }

  // ============= وظائف مساعدة =============

  /**
   * استخراج التوكن من الطلب
   */
  private extractToken(req: NextApiRequest): string | null {
    // 1. من Header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 2. من Cookie
    const cookieToken = UniversalCookieManager.getCookie(req, COOKIE_NAMES.USER_ACCESS);
    if (cookieToken) {
      return cookieToken;
    }

    return null;
  }

  /**
   * الحصول على IP العميل
   */
  private getClientIP(req: NextApiRequest): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
      return ips.trim();
    }
    return req.socket?.remoteAddress || 'unknown';
  }

  /**
   * توليد معرف جلسة فريد
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * إنشاء Access Token
   */
  private generateAccessToken(user: User, sessionId: string, expiresAt: number): string {
    const payload: TokenPayload = {
      sessionId,
      userId: user.id,
      role: user.role,
      exp: Math.floor(expiresAt / 1000),
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, this.config.jwtSecret);
  }

  /**
   * إنشاء Refresh Token
   */
  private generateRefreshToken(userId: string, sessionId: string): string {
    return jwt.sign(
      {
        userId,
        sessionId,
        type: 'refresh',
        exp: Math.floor((Date.now() + (90 * 24 * 60 * 60 * 1000)) / 1000)
      },
      this.config.jwtSecret
    );
  }

  // ============= Middleware للحماية =============

  /**
   * Middleware للتحقق من المصادقة
   */
  requireAuth() {
    return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
      const session = await this.validateSession(req);

      if (!session) {
        return res.status(401).json({
          success: false,
          message: 'غير مصرح - يرجى تسجيل الدخول'
        });
      }

      // إضافة بيانات الجلسة للطلب
      (req as any).session = session;
      next();
    };
  }

  /**
   * Middleware للتحقق من الأدوار
   */
  requireRole(roles: string[]) {
    return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
      const session = await this.validateSession(req);

      if (!session) {
        return res.status(401).json({
          success: false,
          message: 'غير مصرح - يرجى تسجيل الدخول'
        });
      }

      if (!roles.includes(session.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'غير مسموح - ليس لديك الصلاحيات المطلوبة'
        });
      }

      (req as any).session = session;
      next();
    };
  }
}

// ============= Instance الافتراضي =============

export const sessionSystem = new UnifiedSessionSystem();
// ============= دوال مساعدة للتصدير =============

export const createSession = sessionSystem.createSession.bind(sessionSystem);
export const validateSession = sessionSystem.validateSession.bind(sessionSystem);
export const refreshSession = sessionSystem.refreshSession.bind(sessionSystem);
export const destroySession = sessionSystem.destroySession.bind(sessionSystem);
export const requireAuth = sessionSystem.requireAuth.bind(sessionSystem);
export const requireRole = sessionSystem.requireRole.bind(sessionSystem);
export default sessionSystem;
