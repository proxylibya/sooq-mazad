import { NextRequest, NextResponse } from 'next/server';
import { checkPageVisibility } from '../lib/pageVisibility';
// قائمة الصفحات المستثناة من فحص الرؤية
const EXCLUDED_PATHS = [
  '/api/',
  '/_next/',
  '/images/',
  '/uploads/',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/admin/page-visibility', // السماح بالوصول لصفحة إدارة الرؤية نفسها
];

// قائمة الصفحات الأساسية التي لا يمكن إخفاؤها
const CORE_PAGES = ['/', '/404', '/500', '/login', '/admin'];
/**
 * Middleware للتحقق من رؤية الصفحات
 */
export async function pageVisibilityMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // تجاهل المسارات المستثناة
  if (EXCLUDED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  try {
    // الحصول على ممنلومات المستخدم من الكوكيز أو الجلسة
    const userRole = request.cookies.get('userRole')?.value;
    const isAuthenticated = !!request.cookies.get('authToken')?.value;
    // التحقق من رؤية الصفحة
    const visibilityResult = await checkPageVisibility(pathname, userRole, isAuthenticated);
    // إذا كانت الصفحة غير مرئية
    if (!visibilityResult.isVisible) {
      // إعادة توجيه إلى صفحة 404
      return NextResponse.redirect(new URL('/404', request.url));
    }

    // إذا كانت الصفحة مرئية لكن المستخدم غير مصرح له بالوصول
    if (!visibilityResult.isAllowed) {
      if (visibilityResult.redirectTo) {
        return NextResponse.redirect(new URL(visibilityResult.redirectTo, request.url));
      }

      // إعادة توجيه افتراضية حسب السبب
      if (visibilityResult.reason === 'يتطلب تسجيل دخول') {
        return NextResponse.redirect(new URL('/login', request.url));
      } else {
        return NextResponse.redirect(new URL('/403', request.url));
      }
    }

    // السماح بالوصول
    return NextResponse.next();
  } catch (error) {
    console.error('خطأ في middleware رؤية الصفحات:', error);

    // في حالة الخطأ، السماح بالوصول للصفحات الأساسية
    if (CORE_PAGES.includes(pathname)) {
      return NextResponse.next();
    }

    // إعادة توجيه إلى صفحة خطأ للصفحات الأخرى
    return NextResponse.redirect(new URL('/500', request.url));
  }
}

/**
 * دالة مساعدة للتحقق من صلاحية المستخدم
 */
function getUserFromRequest(request: NextRequest) {
  try {
    const authToken = request.cookies.get('authToken')?.value;
    const userRole = request.cookies.get('userRole')?.value;
    const userId = request.cookies.get('userId')?.value;
    if (!authToken) {
      return { isAuthenticated: false, userRole: null, userId: null };
    }

    return {
      isAuthenticated: true,
      userRole: userRole || 'user',
      userId: userId || null,
    };
  } catch (error) {
    console.error('خطأ في استخراج معلومات المستخدم:', error);
    return { isAuthenticated: false, userRole: null, userId: null };
  }
}

/**
 * دالة للتحقق من الصفحات المحمية
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/admin',
    '/profile',
    '/my-account',
    '/sell-car',
    '/add-listing',
    '/edit-listing',
    '/messages',
    '/notifications',
    '/settings',
  ];

  return protectedRoutes.some((route) => pathname.startsWith(route));
}

/**
 * دالة للتحقق من صفحات الإدارة
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

/**
 * دالة للتحقق من صفحات التشخيص
 */
export function isDebugRoute(pathname: string): boolean {
  const debugRoutes = ['/debug-', '/test-', '/database-viewer'];
  return debugRoutes.some((route) => pathname.startsWith(route));
}
