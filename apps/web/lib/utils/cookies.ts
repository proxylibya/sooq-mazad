/**
 * 🍪 إدارة ملفات تعريف الارتباط (Cookies)
 * 
 * مدير موحد للتعامل مع cookies في المتصفح والخادم
 */

import { NextApiRequest, NextApiResponse } from 'next';

// أسماء الـ cookies المستخدمة في النظام
export const COOKIE_NAMES = {
  ADMIN_TOKEN: 'admin_token',
  ADMIN_SESSION: 'admin_session',
  ADMIN_REFRESH: 'admin_refresh_token',
  USER_TOKEN: 'user_token',
  LANGUAGE: 'language',
  THEME: 'theme'
} as const;

const COOKIE_SECURE = process.env.SESSION_COOKIE_SECURE === 'true';

// إعدادات الـ cookies الافتراضية
export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: COOKIE_SECURE,
  sameSite: 'lax' as 'lax' | 'strict' | 'none',
  path: '/',
  maxAge: 8 * 60 * 60, // 8 ساعات
  expires: undefined as Date | undefined,
  domain: undefined as string | undefined
};

/**
 * مدير موحد للتعامل مع الـ cookies
 */
export class UniversalCookieManager {
  private req?: NextApiRequest;
  private res?: NextApiResponse;

  constructor(req?: NextApiRequest, res?: NextApiResponse) {
    this.req = req;
    this.res = res;
  }

  /**
   * قراءة cookie
   */
  get(name: string): string | undefined {
    // في بيئة الخادم
    if (this.req) {
      return this.req.cookies[name];
    }

    // في بيئة المتصفح
    if (typeof document !== 'undefined') {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift();
      }
    }

    return undefined;
  }

  /**
   * كتابة cookie
   */
  set(name: string, value: string, options: Partial<typeof COOKIE_CONFIG> = {}): void {
    const config = { ...COOKIE_CONFIG, ...options };

    // في بيئة الخادم
    if (this.res) {
      this.res.setHeader('Set-Cookie', this.serialize(name, value, config));
      return;
    }

    // في بيئة المتصفح
    if (typeof document !== 'undefined') {
      document.cookie = this.serialize(name, value, config);
    }
  }

  /**
   * حذف cookie
   */
  remove(name: string): void {
    this.set(name, '', { maxAge: -1 });
  }

  /**
   * فحص وجود cookie
   */
  has(name: string): boolean {
    return this.get(name) !== undefined;
  }

  /**
   * الحصول على جميع الـ cookies
   */
  getAll(): Record<string, string> {
    // في بيئة الخادم
    if (this.req) {
      const cookies = this.req.cookies || {};
      // تنظيف القيم undefined
      const cleanCookies: Record<string, string> = {};
      for (const [key, value] of Object.entries(cookies)) {
        if (value !== undefined) {
          cleanCookies[key] = value;
        }
      }
      return cleanCookies;
    }

    // في بيئة المتصفح
    if (typeof document !== 'undefined') {
      const cookies: Record<string, string> = {};
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookies[name] = value;
        }
      });
      return cookies;
    }

    return {};
  }

  /**
   * تحويل إعدادات الـ cookie إلى نص
   */
  private serialize(name: string, value: string, options: Partial<typeof COOKIE_CONFIG>): string {
    const parts = [`${name}=${encodeURIComponent(value)}`];

    if (options.maxAge) {
      parts.push(`Max-Age=${options.maxAge}`);
    }

    if (options.expires) {
      parts.push(`Expires=${options.expires.toUTCString()}`);
    }

    if (options.httpOnly) {
      parts.push('HttpOnly');
    }

    if (options.secure) {
      parts.push('Secure');
    }

    if (options.sameSite) {
      parts.push(`SameSite=${options.sameSite}`);
    }

    if (options.path) {
      parts.push(`Path=${options.path}`);
    }

    if (options.domain) {
      parts.push(`Domain=${options.domain}`);
    }

    return parts.join('; ');
  }
}

/**
 * إنشاء مدير cookies جديد
 */
export function createCookieManager(req?: NextApiRequest, res?: NextApiResponse): UniversalCookieManager {
  return new UniversalCookieManager(req, res);
}

/**
 * دوال مساعدة سريعة للاستخدام الشائع
 */

/**
 * حفظ رمز المدير
 */
export function setAdminToken(
  token: string, 
  cookieManager: UniversalCookieManager,
  rememberMe: boolean = false
): void {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 8 * 60 * 60; // 30 يوم أو 8 ساعات
  
  cookieManager.set(COOKIE_NAMES.ADMIN_TOKEN, token, {
    maxAge,
    httpOnly: true,
    secure: COOKIE_SECURE
  });
}

/**
 * الحصول على رمز المدير
 */
export function getAdminToken(cookieManager: UniversalCookieManager): string | undefined {
  return cookieManager.get(COOKIE_NAMES.ADMIN_TOKEN);
}

/**
 * حذف رمز المدير
 */
export function removeAdminToken(cookieManager: UniversalCookieManager): void {
  cookieManager.remove(COOKIE_NAMES.ADMIN_TOKEN);
  cookieManager.remove(COOKIE_NAMES.ADMIN_REFRESH);
}

/**
 * حفظ رمز المستخدم العادي
 */
export function setUserToken(
  token: string,
  cookieManager: UniversalCookieManager,
  maxAge: number = 24 * 60 * 60 // 24 ساعة
): void {
  cookieManager.set(COOKIE_NAMES.USER_TOKEN, token, {
    maxAge,
    httpOnly: true,
    secure: COOKIE_SECURE
  });
}

/**
 * الحصول على رمز المستخدم العادي
 */
export function getUserToken(cookieManager: UniversalCookieManager): string | undefined {
  return cookieManager.get(COOKIE_NAMES.USER_TOKEN);
}

/**
 * حذف رمز المستخدم العادي
 */
export function removeUserToken(cookieManager: UniversalCookieManager): void {
  cookieManager.remove(COOKIE_NAMES.USER_TOKEN);
}

/**
 * حفظ إعدادات اللغة
 */
export function setLanguage(
  language: string,
  cookieManager: UniversalCookieManager
): void {
  cookieManager.set(COOKIE_NAMES.LANGUAGE, language, {
    maxAge: 365 * 24 * 60 * 60, // سنة كاملة
    httpOnly: false // يمكن الوصول إليها من JavaScript
  });
}

/**
 * الحصول على إعدادات اللغة
 */
export function getLanguage(cookieManager: UniversalCookieManager): string {
  return cookieManager.get(COOKIE_NAMES.LANGUAGE) || 'ar';
}

/**
 * حفظ إعدادات المظهر
 */
export function setTheme(
  theme: string,
  cookieManager: UniversalCookieManager
): void {
  cookieManager.set(COOKIE_NAMES.THEME, theme, {
    maxAge: 365 * 24 * 60 * 60, // سنة كاملة
    httpOnly: false // يمكن الوصول إليها من JavaScript
  });
}

/**
 * الحصول على إعدادات المظهر
 */
export function getTheme(cookieManager: UniversalCookieManager): string {
  return cookieManager.get(COOKIE_NAMES.THEME) || 'light';
}

/**
 * تنظيف جميع الـ cookies المنتهية الصلاحية
 */
export function cleanExpiredCookies(cookieManager: UniversalCookieManager): void {
  const allCookies = cookieManager.getAll();
  
  // قائمة الـ cookies التي قد تكون منتهية الصلاحية
  const potentiallyExpired = Object.keys(allCookies).filter(name => 
    name.includes('temp_') || name.includes('session_') || name.includes('_expired')
  );

  potentiallyExpired.forEach(name => {
    cookieManager.remove(name);
  });
}

/**
 * فحص صحة رمز المصادقة في الـ cookie
 */
export function validateAuthCookie(token: string | undefined): boolean {
  if (!token) return false;
  
  try {
    // فحص أساسي للتأكد من أن الرمز ليس فارغ ويحتوي على نقاط (JWT format)
    return token.length > 10 && token.includes('.');
  } catch {
    return false;
  }
}

/**
 * إنشاء cookie آمن للجلسة
 */
export function createSecureSessionCookie(
  name: string,
  value: string,
  cookieManager: UniversalCookieManager,
  options: {
    maxAge?: number;
    sameSite?: 'strict' | 'lax' | 'none';
    domain?: string;
  } = {}
): void {
  cookieManager.set(name, value, {
    ...COOKIE_CONFIG,
    ...options,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });
}
