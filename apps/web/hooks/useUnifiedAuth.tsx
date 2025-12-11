// @ts-nocheck
/**
 * 🪝 React Hook الموحد للمصادقة
 * يستخدم نظام الجلسات الموحد الجديد
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import ClientSessionManager, { ClientUser } from '../lib/session/client-session-manager';
export interface UseUnifiedAuthReturn {
  // البيانات الأساسية
  user: ClientUser | null;
  loading: boolean;
  error: string | null;

  // حالات المصادقة
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isModerator: boolean;
  isManager: boolean;
  hasAdminAccess: boolean;

  // الوظائف
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<ClientUser>) => void;
  refreshSession: () => Promise<boolean>;
  getAccessToken: () => string | null;
}

export interface LoginCredentials {
  identifier: string; // phone or email or username
  password: string;
  rememberMe?: boolean;
}

export interface LoginResult {
  success: boolean;
  message?: string;
  user?: ClientUser;
}

/**
 * Hook موحد للمصادقة
 */
export function useUnifiedAuth(): UseUnifiedAuthReturn {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  // ============= التهيئة =============

  useEffect(() => {
    setIsClient(true);
  }, []);

  // تحميل الجلسة عند التهيئة
  useEffect(() => {
    if (!isClient) return;

    const loadSession = () => {
      try {
        setLoading(true);
        const session = ClientSessionManager.getSession();

        if (session) {
          setUser(session.user);
          console.log('[useUnifiedAuth] ✅ تم تحميل الجلسة');
        } else {
          console.log('[useUnifiedAuth] 📭 لا توجد جلسة نشطة');
        }
      } catch (err) {
        console.error('[useUnifiedAuth] ❌ خطأ في تحميل الجلسة:', err);
        setError('حدث خطأ في تحميل بيانات المستخدم');
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    // الاستماع لتغييرات الجلسة
    const unsubscribe = ClientSessionManager.onSessionChange((event) => {
      console.log('[useUnifiedAuth] 📡 حدث تغيير في الجلسة:', event.type);

      switch (event.type) {
        case 'session-saved':
        case 'user-updated':
          setUser(event.detail?.user || event.detail);
          break;
        case 'session-cleared':
          setUser(null);
          break;
      }
    });

    // بدء مراقب الجلسة
    const stopMonitor = ClientSessionManager.startSessionMonitor();
    // التنظيف
    return () => {
      unsubscribe();
      stopMonitor();
    };
  }, [isClient]);

  // ============= وظائف المصادقة =============

  /**
   * تسجيل الدخول
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/unified-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // حفظ الجلسة
        ClientSessionManager.saveSession(
          data.user,
          data.accessToken,
          data.refreshToken,
          credentials.rememberMe || false,
        );

        setUser(data.user);

        console.log('[useUnifiedAuth] ✅ تسجيل دخول ناجح');

        return {
          success: true,
          user: data.user,
        };
      } else {
        const errorMsg = data.message || 'فشل تسجيل الدخول';
        setError(errorMsg);

        return {
          success: false,
          message: errorMsg,
        };
      }
    } catch (err: any) {
      console.error('[useUnifiedAuth] ❌ خطأ في تسجيل الدخول:', err);
      const errorMsg = err.message || 'حدث خطأ في تسجيل الدخول';
      setError(errorMsg);

      return {
        success: false,
        message: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * تسجيل الخروج
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await ClientSessionManager.logout('/');
      setUser(null);
      console.log('[useUnifiedAuth] ✅ تسجيل خروج ناجح');
    } catch (err) {
      console.error('[useUnifiedAuth] ❌ خطأ في تسجيل الخروج:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * تحديث بيانات المستخدم
   */
  const updateUser = useCallback(
    (userData: Partial<ClientUser>) => {
      if (!user) return;

      ClientSessionManager.updateUser(userData);
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);

      console.log('[useUnifiedAuth] ✅ تم تحديث بيانات المستخدم');
    },
    [user],
  );

  /**
   * تجديد الجلسة
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const success = await ClientSessionManager.refreshToken();

      if (success) {
        console.log('[useUnifiedAuth] ✅ تم تجديد الجلسة');
      } else {
        console.log('[useUnifiedAuth] ❌ فشل تجديد الجلسة');
      }

      return success;
    } catch (err) {
      console.error('[useUnifiedAuth] ❌ خطأ في تجديد الجلسة:', err);
      return false;
    }
  }, []);

  /**
   * الحصول على Access Token
   */
  const getAccessToken = useCallback((): string | null => {
    return ClientSessionManager.getAccessToken();
  }, []);

  // ============= الحالات المحسوبة =============

  const isAuthenticated = useMemo(() => !!user, [user]);

  const isAdmin = useMemo(() => user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN', [user]);

  const isSuperAdmin = useMemo(() => user?.role === 'SUPER_ADMIN', [user]);

  const isModerator = useMemo(() => user?.role === 'MODERATOR', [user]);

  const isManager = useMemo(() => user?.role === 'MANAGER', [user]);

  const hasAdminAccess = useMemo(
    () => ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'MANAGER'].includes(user?.role || ''),
    [user],
  );

  // ============= النتائج =============

  return {
    // البيانات
    user,
    loading,
    error,

    // الحالات
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isModerator,
    isManager,
    hasAdminAccess,

    // الوظائف
    login,
    logout,
    updateUser,
    refreshSession,
    getAccessToken,
  };
}

// تصدير افتراضي
export default useUnifiedAuth;
