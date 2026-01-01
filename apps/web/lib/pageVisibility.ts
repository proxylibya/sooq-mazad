/**
 * أدوات إدارة رؤية الصفحة
 */

export type VisibilityState = 'visible' | 'hidden' | 'prerender';

export interface PageVisibilityHook {
    isVisible: boolean;
    visibilityState: VisibilityState;
}

/**
 * التحقق من رؤية الصفحة
 */
export function isPageVisible(): boolean {
    if (typeof document === 'undefined') return true;
    return document.visibilityState === 'visible';
}

/**
 * الحصول على حالة الرؤية
 */
export function getVisibilityState(): VisibilityState {
    if (typeof document === 'undefined') return 'visible';
    return document.visibilityState as VisibilityState;
}

/**
 * إضافة مستمع لتغيير الرؤية
 */
export function onVisibilityChange(callback: (isVisible: boolean) => void): () => void {
    if (typeof document === 'undefined') return () => { };

    const handler = () => {
        callback(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
}

/**
 * تشغيل دالة فقط عندما تكون الصفحة مرئية
 */
export function runWhenVisible<T>(fn: () => T): T | null {
    if (isPageVisible()) {
        return fn();
    }
    return null;
}

/**
 * تأخير التنفيذ حتى تصبح الصفحة مرئية
 */
export function waitUntilVisible(): Promise<void> {
    return new Promise((resolve) => {
        if (isPageVisible()) {
            resolve();
            return;
        }

        const cleanup = onVisibilityChange((isVisible) => {
            if (isVisible) {
                cleanup();
                resolve();
            }
        });
    });
}

/**
 * التحقق من رؤية الصفحة مع معلومات إضافية
 */
export function checkPageVisibility(
    path?: string,
    userRole?: string,
    isAuthenticated?: boolean
): Promise<{
    isVisible: boolean;
    isAllowed: boolean;
    redirectTo?: string;
    reason?: string;
    state?: VisibilityState;
}> {
    // التحقق من الرؤية الأساسية
    const basicVisibility = isPageVisible();
    const visibilityState = getVisibilityState();

    // قائمة الصفحات المحمية
    const protectedPaths = [
        '/profile',
        '/settings',
        '/my-account',
        '/wallet',
        '/favorites',
        '/messages',
        '/notifications',
    ];

    // قائمة صفحات المديرين فقط
    const adminPaths = ['/admin'];

    // تحديد ما إذا كان المسار محمياً
    const isProtectedPath = path ? protectedPaths.some(p => path.startsWith(p)) : false;
    const isAdminPath = path ? adminPaths.some(p => path.startsWith(p)) : false;

    // التحقق من الصلاحيات
    let isAllowed = true;
    let redirectTo: string | undefined;
    let reason: string | undefined;

    if (isProtectedPath && !isAuthenticated) {
        isAllowed = false;
        redirectTo = '/login';
        reason = 'يجب تسجيل الدخول للوصول لهذه الصفحة';
    }

    if (isAdminPath && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        isAllowed = false;
        redirectTo = '/';
        reason = 'غير مصرح بالوصول لصفحات الإدارة';
    }

    return Promise.resolve({
        isVisible: basicVisibility,
        isAllowed,
        redirectTo,
        reason,
        state: visibilityState,
    });
}

/**
 * التحقق البسيط من رؤية الصفحة (بدون معاملات)
 */
export function getPageVisibilityInfo(): { isVisible: boolean; state: VisibilityState; } {
    return {
        isVisible: isPageVisible(),
        state: getVisibilityState(),
    };
}

export default {
    isPageVisible,
    getVisibilityState,
    onVisibilityChange,
    runWhenVisible,
    waitUntilVisible,
    checkPageVisibility,
    getPageVisibilityInfo,
};
