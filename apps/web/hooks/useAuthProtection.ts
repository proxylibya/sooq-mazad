/**
 * Hook للحماية من الوصول غير المصرح به
 * Auth Protection Hook
 */

import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

interface User {
    id: string;
    name?: string;
    phone?: string;
    email?: string;
    role?: string;
    status?: string;
}

interface AuthProtectionOptions {
    redirectTo?: string;
    requireAuth?: boolean;
    allowedRoles?: string[];
    showModal?: boolean;
}

interface AuthProtectionResult {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    showAuthModal: boolean;
    setShowAuthModal: (show: boolean) => void;
    requireLogin: (action?: string, callback?: () => void | Promise<void>) => boolean;
    handleAuthSuccess: () => void;
    handleAuthClose: () => void;
}

/**
 * Hook للتحقق من حالة المصادقة وحماية الصفحات
 */
// قيمة افتراضية ثابتة لتجنب إعادة الإنشاء
const EMPTY_ROLES: string[] = [];

export function useAuthProtection(options: AuthProtectionOptions = {}): AuthProtectionResult {
    const {
        redirectTo = '/login',
        requireAuth = true,
        allowedRoles = EMPTY_ROLES,
        showModal = false,
    } = options;

    // تثبيت المرجع لتجنب الحلقات اللانهائية
    const stableAllowedRoles = useMemo(() => allowedRoles, [allowedRoles.join(',')]);

    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // نافذة تسجيل الدخول تبدأ مغلقة دائماً - تفتح فقط عند الحاجة
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // الحصول على token من localStorage
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

                // محاولة الحصول على بيانات المستخدم من الجلسة
                const response = await fetch('/api/auth/session', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                });

                if (response.ok) {
                    const data = await response.json();

                    // التحقق من وجود البيانات بشكل آمن
                    if (data && data.user) {
                        // التحقق من الأدوار المسموحة
                        if (allowedRoles.length > 0 && !allowedRoles.includes(data.user.role)) {
                            setError('غير مصرح لك بالوصول');
                            if (requireAuth) {
                                router.push('/unauthorized');
                            }
                        } else {
                            setUser(data.user);
                            // إغلاق النافذة عند نجاح المصادقة
                            setShowAuthModal(false);
                        }
                    } else {
                        // المستخدم غير مسجل الدخول
                        setUser(null);
                        // إذا كان showModal مفعل، نعرض نافذة تسجيل الدخول بدلاً من إعادة التوجيه
                        if (showModal) {
                            setShowAuthModal(true);
                        } else if (requireAuth) {
                            router.push(redirectTo);
                        }
                    }
                } else {
                    // فشل الاستجابة
                    setUser(null);
                    if (requireAuth) {
                        router.push(redirectTo);
                    }
                }
            } catch (err) {
                console.error('Auth check error:', err);
                setError('فشل في التحقق من الجلسة');
                setUser(null);
                if (requireAuth) {
                    router.push(redirectTo);
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router.isReady, redirectTo, requireAuth, stableAllowedRoles, showModal]);

    const requireLogin = (action?: string, callback?: () => void | Promise<void>): boolean => {
        if (!user) {
            setShowAuthModal(true);
            return false;
        }
        if (callback) {
            void callback();
        }
        return true;
    };

    const handleAuthSuccess = (): void => {
        setShowAuthModal(false);
        // إعادة تحميل بيانات المستخدم
        window.location.reload();
    };

    const handleAuthClose = (): void => {
        setShowAuthModal(false);
    };

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        showAuthModal,
        setShowAuthModal,
        requireLogin,
        handleAuthSuccess,
        handleAuthClose,
    };
}

/**
 * Hook مبسط للحصول على المستخدم الحالي
 */
export function useAuth(): { user: User | null; isLoading: boolean; } {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            try {
                // الحصول على token من localStorage
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

                const response = await fetch('/api/auth/session', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user || null);
                }
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        getUser();
    }, []);

    return { user, isLoading };
}

export default useAuthProtection;
