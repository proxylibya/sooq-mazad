// ملف للوظائف التي تعمل في المتصفح (client-side) فقط
// لا يحتوي على استيراد jsonwebtoken

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  accountType: string;
  verified: boolean;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
  rememberMe: boolean;
}

export interface TokenPayload {
  userId: string;
  phone: string;
  role: string;
  accountType: string;
  iat?: number;
  exp?: number;
}

/**
 * فك تشفير JWT token بدون التحقق من التوقيع - للاستخدام في المتصفح فقط
 */
function decodeJWTPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

/**
 * التحقق من انتهاء صلاحية الرمز المميز - للاستخدام في المتصفح
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeJWTPayload(token);
    if (!decoded || !decoded.exp) return true;

    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    return true;
  }
}

/**
 * الحصول على وقت انتهاء الرمز المميز - للاستخدام في المتصفح
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = decodeJWTPayload(token);
    if (!decoded || !decoded.exp) return null;

    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
}

/**
 * حفظ جلسة المستخدم في localStorage
 */
export function saveUserSession(user: User, token: string, rememberMe: boolean = false): void {
  if (typeof window === 'undefined') return;

  // فك تشفير النصوص العربية قبل الحفظ
  let displayUser = user;
  try {
    // استيراد ديناميكي لتجنب مشاكل SSR
    const { displayUserData } = require('./apiResponseHelper');
    displayUser = displayUserData(user);
  } catch (error) {
    console.warn('فشل في فك تشفير بيانات المستخدم:', error);
    // استخدام البيانات كما هي في حالة الفشل
  }

  const expiresAt = Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000);

  const session: AuthSession = {
    user: displayUser,
    token,
    expiresAt,
    rememberMe,
  };

  localStorage.setItem('authSession', JSON.stringify(session));
  localStorage.setItem('user', JSON.stringify(displayUser));
  localStorage.setItem('token', token);

  // حدث تحديث المستخدم
  window.dispatchEvent(
    new CustomEvent('userUpdated', {
      detail: displayUser,
    }),
  );

  // حدث تسجيل دخول ناجح
  window.dispatchEvent(
    new CustomEvent('loginSuccess', {
      detail: displayUser,
    }),
  );

  // إرسال حدث storage لضمان التزامن
  window.dispatchEvent(
    new StorageEvent('storage', {
      key: 'user',
      newValue: JSON.stringify(displayUser),
      oldValue: null,
      storageArea: localStorage,
    }),
  );

  // إرسال حدث storage للتوكن أيضاً
  window.dispatchEvent(
    new StorageEvent('storage', {
      key: 'token',
      newValue: token,
      oldValue: null,
      storageArea: localStorage,
    }),
  );
}

/**
 * استرجاع جلسة المستخدم من localStorage
 */
export function getUserSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const sessionData = localStorage.getItem('authSession');
    if (!sessionData) return null;

    const session: AuthSession = JSON.parse(sessionData);

    // التحقق من انتهاء صلاحية الجلسة
    if (Date.now() > session.expiresAt) {
      clearUserSession();
      return null;
    }

    // التحقق من انتهاء صلاحية الرمز المميز
    if (isTokenExpired(session.token)) {
      clearUserSession();
      return null;
    }

    return session;
  } catch (error) {
    clearUserSession();
    return null;
  }
}

/**
 * مسح جلسة المستخدم
 */
export function clearUserSession(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('authSession');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('adminUser');
}

/**
 * التحقق من تسجيل دخول المستخدم
 */
export function isUserLoggedIn(): boolean {
  const session = getUserSession();
  return session !== null;
}

/**
 * الحصول على المستخدم الحالي
 */
export function getCurrentUser(): User | null {
  const session = getUserSession();
  return session?.user || null;
}

/**
 * الحصول على معرف المستخدم الحالي
 */
export function getCurrentUserId(): string | null {
  const user = getCurrentUser();
  return user?.id || null;
}

/**
 * التحقق من صلاحيات المستخدم
 */
export function hasPermission(requiredRole: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;

  const roleHierarchy = {
    ADMIN: 4,
    MODERATOR: 3,
    PREMIUM_USER: 2,
    USER: 1,
  };

  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
}

/**
 * تحديث بيانات المستخدم في الجلسة
 */
export function updateUserSession(updatedUser: Partial<User>): void {
  const session = getUserSession();
  if (!session) return;

  const newUser = { ...session.user, ...updatedUser };
  const newSession = { ...session, user: newUser };

  localStorage.setItem('authSession', JSON.stringify(newSession));
  localStorage.setItem('user', JSON.stringify(newUser));
}

/**
 * تجديد الرمز المميز
 */
export async function refreshAuthToken(): Promise<boolean> {
  const session = getUserSession();
  if (!session) return false;

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
    });

    if (!response.ok) {
      clearUserSession();
      return false;
    }

    const data = await response.json();
    if (data.success && data.token) {
      saveUserSession(session.user, data.token, session.rememberMe);
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * إعداد مراقب انتهاء الجلسة
 */
export function setupSessionMonitor(): void {
  if (typeof window === 'undefined') return;

  const isDevelopment = process.env.NODE_ENV === 'development';

  // في وضع التطوير، تقليل تكرار الفحص
  const checkInterval = isDevelopment ? 300000 : 60000; // 5 دقائق في التطوير، دقيقة في الإنتاج

  // فحص الجلسة
  const checkSession = () => {
    const session = getUserSession();
    if (!session) return;

    // إذا كانت الجلسة ستنتهي خلال 5 دقائق، حاول تجديدها
    const fiveMinutes = 5 * 60 * 1000;
    if (session.expiresAt - Date.now() < fiveMinutes) {
      refreshAuthToken();
    }
  };

  setInterval(checkSession, checkInterval);
}

/**
 * تسجيل خروج المستخدم
 */
export async function logoutUser(): Promise<void> {
  const session = getUserSession();

  if (session) {
    try {
      // إشعار الخادم بتسجيل الخروج
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
      });
    } catch (error) {
      // Silent logout error
    }
  }

  clearUserSession();

  // إعادة توجيه إلى الصفحة الرئيسية
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}
