/**
 * 🌟 نظام التوجيه الموحد العالمي
 * Unified Global Routing System
 * 
 * نظام شامل لإدارة جميع المسارات والصفحات المحمية في المشروع
 */

// =====================================
// Types & Interfaces
// =====================================

export interface RouteConfig {
  path: string;
  name: string;
  title: string;
  description?: string;
  protected: boolean;
  requiredAuth?: 'user' | 'admin' | 'both' | 'none';
  requiredRoles?: string[];
  requiredPermissions?: string[];
  redirectIfAuth?: string;
  component?: string;
  layout?: 'default' | 'admin' | 'auth' | 'blank';
  metadata?: Record<string, any>;
}

export interface RouteGroup {
  name: string;
  prefix: string;
  routes: RouteConfig[];
  middleware?: string[];
  layout?: string;
}

// =====================================
// Route Definitions
// =====================================

/**
 * المسارات العامة - Public Routes
 */
export const PUBLIC_ROUTES: RouteConfig[] = [
  {
    path: '/',
    name: 'home',
    title: 'الصفحة الرئيسية',
    description: 'الصفحة الرئيسية لسوق المزاد',
    protected: false,
    requiredAuth: 'none',
    layout: 'default'
  },
  {
    path: '/login',
    name: 'login',
    title: 'تسجيل الدخول',
    protected: false,
    requiredAuth: 'none',
    redirectIfAuth: '/',
    layout: 'auth'
  },
  {
    path: '/register',
    name: 'register',
    title: 'إنشاء حساب جديد',
    protected: false,
    requiredAuth: 'none',
    redirectIfAuth: '/',
    layout: 'auth'
  },
  {
    path: '/about',
    name: 'about',
    title: 'من نحن',
    protected: false,
    requiredAuth: 'none',
    layout: 'default'
  },
  {
    path: '/contact',
    name: 'contact',
    title: 'اتصل بنا',
    protected: false,
    requiredAuth: 'none',
    layout: 'default'
  },
  {
    path: '/auctions',
    name: 'auctions',
    title: 'المزادات',
    protected: false,
    requiredAuth: 'none',
    layout: 'default'
  },
  {
    path: '/showrooms',
    name: 'showrooms',
    title: 'المعارض',
    protected: false,
    requiredAuth: 'none',
    layout: 'default'
  },
  {
    path: '/transport',
    name: 'transport',
    title: 'خدمات النقل',
    protected: false,
    requiredAuth: 'none',
    layout: 'default'
  }
];

/**
 * مسارات المستخدمين المحمية - Protected User Routes
 */
export const PROTECTED_USER_ROUTES: RouteConfig[] = [
  {
    path: '/profile',
    name: 'profile',
    title: 'الملف الشخصي',
    protected: true,
    requiredAuth: 'user',
    layout: 'default'
  },
  {
    path: '/my-account',
    name: 'my-account',
    title: 'حسابي',
    protected: true,
    requiredAuth: 'user',
    layout: 'default'
  },
  {
    path: '/my-ads',
    name: 'my-ads',
    title: 'إعلاناتي',
    protected: true,
    requiredAuth: 'user',
    layout: 'default'
  },
  {
    path: '/add-listing',
    name: 'add-listing',
    title: 'إضافة إعلان',
    protected: true,
    requiredAuth: 'user',
    layout: 'default'
  },
  {
    path: '/messages',
    name: 'messages',
    title: 'الرسائل',
    protected: true,
    requiredAuth: 'user',
    layout: 'default'
  },
  {
    path: '/favorites',
    name: 'favorites',
    title: 'المفضلة',
    protected: true,
    requiredAuth: 'user',
    layout: 'default'
  },
  {
    path: '/wallet',
    name: 'wallet',
    title: 'المحفظة',
    protected: true,
    requiredAuth: 'user',
    layout: 'default'
  }
];

/**
 * مسارات لوحة التحكم - Admin Routes
 */
export const ADMIN_ROUTES: RouteConfig[] = [
  {
    path: '/admin',
    name: 'admin-dashboard',
    title: 'لوحة التحكم',
    protected: true,
    requiredAuth: 'admin',
    requiredRoles: ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'],
    layout: 'admin'
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    title: 'تسجيل دخول المدير',
    protected: false,
    requiredAuth: 'none',
    redirectIfAuth: '/admin',
    layout: 'auth'
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    title: 'إدارة المستخدمين',
    protected: true,
    requiredAuth: 'admin',
    requiredRoles: ['ADMIN', 'SUPER_ADMIN'],
    requiredPermissions: ['users.view'],
    layout: 'admin'
  },
  {
    path: '/admin/auctions',
    name: 'admin-auctions',
    title: 'إدارة المزادات',
    protected: true,
    requiredAuth: 'admin',
    requiredRoles: ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'],
    requiredPermissions: ['auctions.view'],
    layout: 'admin'
  },
  {
    path: '/admin/showrooms',
    name: 'admin-showrooms',
    title: 'إدارة المعارض',
    protected: true,
    requiredAuth: 'admin',
    requiredRoles: ['ADMIN', 'SUPER_ADMIN'],
    requiredPermissions: ['showrooms.view'],
    layout: 'admin'
  },
  {
    path: '/admin/transport',
    name: 'admin-transport',
    title: 'إدارة النقل',
    protected: true,
    requiredAuth: 'admin',
    requiredRoles: ['ADMIN', 'SUPER_ADMIN'],
    requiredPermissions: ['transport.view'],
    layout: 'admin'
  },
  {
    path: '/admin/reports',
    name: 'admin-reports',
    title: 'التقارير',
    protected: true,
    requiredAuth: 'admin',
    requiredRoles: ['ADMIN', 'SUPER_ADMIN'],
    requiredPermissions: ['reports.view'],
    layout: 'admin'
  },
  {
    path: '/admin/settings',
    name: 'admin-settings',
    title: 'الإعدادات',
    protected: true,
    requiredAuth: 'admin',
    requiredRoles: ['SUPER_ADMIN'],
    requiredPermissions: ['settings.manage'],
    layout: 'admin'
  }
];

/**
 * مسارات الأخطاء - Error Routes
 */
export const ERROR_ROUTES: RouteConfig[] = [
  {
    path: '/404',
    name: 'not-found',
    title: 'الصفحة غير موجودة',
    protected: false,
    requiredAuth: 'none',
    layout: 'blank'
  },
  {
    path: '/500',
    name: 'server-error',
    title: 'خطأ في الخادم',
    protected: false,
    requiredAuth: 'none',
    layout: 'blank'
  },
  {
    path: '/403',
    name: 'forbidden',
    title: 'غير مصرح',
    protected: false,
    requiredAuth: 'none',
    layout: 'blank'
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    title: 'غير مصرح',
    protected: false,
    requiredAuth: 'none',
    layout: 'blank'
  }
];

// =====================================
// Route Groups
// =====================================

export const ROUTE_GROUPS: RouteGroup[] = [
  {
    name: 'public',
    prefix: '/',
    routes: PUBLIC_ROUTES,
    layout: 'default'
  },
  {
    name: 'user',
    prefix: '/user',
    routes: PROTECTED_USER_ROUTES,
    middleware: ['auth'],
    layout: 'default'
  },
  {
    name: 'admin',
    prefix: '/admin',
    routes: ADMIN_ROUTES,
    middleware: ['auth', 'admin'],
    layout: 'admin'
  },
  {
    name: 'api',
    prefix: '/api',
    routes: [],
    middleware: []
  }
];

// =====================================
// Helper Functions
// =====================================

/**
 * البحث عن مسار بالاسم
 */
export function findRouteByName(name: string): RouteConfig | undefined {
  const allRoutes = [
    ...PUBLIC_ROUTES,
    ...PROTECTED_USER_ROUTES,
    ...ADMIN_ROUTES,
    ...ERROR_ROUTES
  ];
  return allRoutes.find(route => route.name === name);
}

/**
 * البحث عن مسار بالمسار
 */
export function findRouteByPath(path: string): RouteConfig | undefined {
  const allRoutes = [
    ...PUBLIC_ROUTES,
    ...PROTECTED_USER_ROUTES,
    ...ADMIN_ROUTES,
    ...ERROR_ROUTES
  ];
  return allRoutes.find(route => route.path === path);
}

/**
 * التحقق من أن المسار محمي
 */
export function isProtectedRoute(path: string): boolean {
  const route = findRouteByPath(path);
  return route?.protected ?? false;
}

/**
 * التحقق من أن المسار يتطلب دور معين
 */
export function requiresRole(path: string, role: string): boolean {
  const route = findRouteByPath(path);
  if (!route?.requiredRoles) return false;
  return route.requiredRoles.includes(role);
}

/**
 * التحقق من أن المسار يتطلب صلاحية معينة
 */
export function requiresPermission(path: string, permission: string): boolean {
  const route = findRouteByPath(path);
  if (!route?.requiredPermissions) return false;
  return route.requiredPermissions.includes(permission);
}

/**
 * الحصول على نوع المصادقة المطلوبة للمسار
 */
export function getRequiredAuth(path: string): string {
  const route = findRouteByPath(path);
  return route?.requiredAuth ?? 'none';
}

/**
 * الحصول على مسار إعادة التوجيه إذا كان المستخدم مسجل دخول
 */
export function getRedirectIfAuth(path: string): string | undefined {
  const route = findRouteByPath(path);
  return route?.redirectIfAuth;
}

/**
 * الحصول على التخطيط المطلوب للمسار
 */
export function getRouteLayout(path: string): string {
  const route = findRouteByPath(path);
  return route?.layout ?? 'default';
}

/**
 * بناء URL من اسم المسار والمعاملات
 */
export function buildUrl(name: string, params?: Record<string, string>): string {
  const route = findRouteByName(name);
  if (!route) return '/';
  
  let url = route.path;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`[${key}]`, value);
    });
  }
  
  return url;
}

/**
 * التحقق من أن المستخدم لديه صلاحية الوصول للمسار
 */
export function canAccessRoute(
  path: string,
  user?: { role?: string; permissions?: string[] }
): boolean {
  const route = findRouteByPath(path);
  
  if (!route) return false;
  if (!route.protected) return true;
  if (!user) return false;
  
  // التحقق من الدور
  if (route.requiredRoles && route.requiredRoles.length > 0) {
    if (!user.role || !route.requiredRoles.includes(user.role)) {
      return false;
    }
  }
  
  // التحقق من الصلاحيات
  if (route.requiredPermissions && route.requiredPermissions.length > 0) {
    if (!user.permissions) return false;
    
    const hasAllPermissions = route.requiredPermissions.every(permission =>
      user.permissions?.includes(permission) ||
      user.permissions?.includes('*')
    );
    
    if (!hasAllPermissions) return false;
  }
  
  return true;
}

// =====================================
// Route Patterns & Regex
// =====================================

/**
 * أنماط المسارات الخاصة
 */
export const ROUTE_PATTERNS = {
  PUBLIC: /^\/(?!admin|api|user)/,
  ADMIN: /^\/admin/,
  API: /^\/api/,
  USER: /^\/user/,
  STATIC: /^\/_next|\.(?:jpg|jpeg|gif|png|svg|ico|css|js)$/,
  AUTH: /^\/(login|register|forgot-password|reset-password)/,
  PROTECTED: /^\/(profile|my-account|messages|wallet|add-listing)/
};

/**
 * التحقق من نوع المسار
 */
export function getRouteType(path: string): 'public' | 'admin' | 'api' | 'user' | 'static' | 'auth' {
  if (ROUTE_PATTERNS.STATIC.test(path)) return 'static';
  if (ROUTE_PATTERNS.API.test(path)) return 'api';
  if (ROUTE_PATTERNS.ADMIN.test(path)) return 'admin';
  if (ROUTE_PATTERNS.AUTH.test(path)) return 'auth';
  if (ROUTE_PATTERNS.USER.test(path)) return 'user';
  return 'public';
}

// =====================================
// Navigation Items
// =====================================

/**
 * عناصر القائمة الرئيسية
 */
export function getMainNavItems(user?: any) {
  const items = [
    { name: 'الرئيسية', path: '/', icon: 'home' },
    { name: 'المزادات', path: '/auctions', icon: 'gavel' },
    { name: 'المعارض', path: '/showrooms', icon: 'store' },
    { name: 'النقل', path: '/transport', icon: 'truck' }
  ];
  
  if (user) {
    items.push(
      { name: 'إضافة إعلان', path: '/add-listing', icon: 'plus' },
      { name: 'حسابي', path: '/my-account', icon: 'user' }
    );
  }
  
  return items;
}

/**
 * عناصر قائمة المدير
 */
export function getAdminNavItems(user?: any) {
  const items = [
    { name: 'لوحة التحكم', path: '/admin', icon: 'dashboard', permission: null },
    { name: 'المستخدمون', path: '/admin/users', icon: 'users', permission: 'users.view' },
    { name: 'المزادات', path: '/admin/auctions', icon: 'gavel', permission: 'auctions.view' },
    { name: 'المعارض', path: '/admin/showrooms', icon: 'store', permission: 'showrooms.view' },
    { name: 'النقل', path: '/admin/transport', icon: 'truck', permission: 'transport.view' },
    { name: 'التقارير', path: '/admin/reports', icon: 'chart', permission: 'reports.view' },
    { name: 'الإعدادات', path: '/admin/settings', icon: 'settings', permission: 'settings.manage' }
  ];
  
  if (!user) return [];
  
  return items.filter(item => {
    if (!item.permission) return true;
    return user.permissions?.includes(item.permission) || user.permissions?.includes('*');
  });
}

// Export everything as default for easy import
const UnifiedRoutingSystem = {
  PUBLIC_ROUTES,
  PROTECTED_USER_ROUTES,
  ADMIN_ROUTES,
  ERROR_ROUTES,
  ROUTE_GROUPS,
  ROUTE_PATTERNS,
  findRouteByName,
  findRouteByPath,
  isProtectedRoute,
  requiresRole,
  requiresPermission,
  getRequiredAuth,
  getRedirectIfAuth,
  getRouteLayout,
  buildUrl,
  canAccessRoute,
  getRouteType,
  getMainNavItems,
  getAdminNavItems
};

export default UnifiedRoutingSystem;
