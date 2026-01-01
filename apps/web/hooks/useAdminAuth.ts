/**
 * 🔐 React Hook موحد للمصادقة الإدارية
 * Unified Admin Auth Hook
 * يستخدم النظام الموحد من lib/admin-auth
 */

import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

// أنواع البيانات
type AdminRole = 'ADMIN' | 'SUPER_ADMIN' | 'MODERATOR';

interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
  permissions: string[];
  loginTime: string;
}

export interface UseAdminAuthReturn {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

/**
 * Hook المصادقة الموحد
 */
export function useAdminAuth(): UseAdminAuthReturn {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * التحقق من المصادقة عبر API
   */
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/verify', {
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.admin) {
          setAdmin(data.admin);
        } else {
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
    } catch (err) {
      console.error('[useAdminAuth] Check auth error:', err);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * تسجيل الدخول
   */
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'فشل تسجيل الدخول');
        setIsLoading(false);
        return false;
      }

      if (data.admin) {
        setAdmin(data.admin);
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('[useAdminAuth] Login error:', err);
      setError('حدث خطأ في الاتصال بالخادم');
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * تسجيل الخروج
   */
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch (err) {
      console.error('[useAdminAuth] Logout error:', err);
    }

    setAdmin(null);
    setIsLoading(false);
    router.push('/admin/login');
  }, [router]);

  /**
   * التحقق من الصلاحيات
   */
  const hasPermission = useCallback((permission: string): boolean => {
    if (!admin) return false;
    if (admin.role === 'SUPER_ADMIN') return true;
    if (admin.permissions.includes('*')) return true;
    if (admin.permissions.includes(permission)) return true;
    const [category] = permission.split('.');
    return admin.permissions.includes(`${category}.*`);
  }, [admin]);

  /**
   * التحقق عند التحميل
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    admin,
    isLoading,
    isAuthenticated: !!admin,
    error,
    login,
    logout,
    checkAuth,
    hasPermission,
  };
}

/**
 * Hook للحماية المباشرة للصفحات
 */
export function useRequireAuth(redirectTo: string = '/admin/login'): UseAdminAuthReturn {
  const auth = useAdminAuth();
  const router = useRouter();
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      const returnUrl = encodeURIComponent(router.asPath);
      router.replace(`${redirectTo}?returnUrl=${returnUrl}`);
    }
  }, [auth.isLoading, auth.isAuthenticated, router, redirectTo]);

  return auth;
}

/**
 * Hook للتحقق من الصلاحيات
 */
export function useAdminPermission(requiredPermission: string): boolean {
  const { admin } = useAdminAuth();

  if (!admin) return false;

  // SUPER_ADMIN له كل الصلاحيات
  if (admin.role === 'SUPER_ADMIN') return true;

  // التحقق من الصلاحيات المحددة
  return admin.permissions?.includes(requiredPermission) || false;
}
