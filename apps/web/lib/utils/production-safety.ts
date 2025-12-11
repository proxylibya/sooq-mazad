/**
 * 🛡️ حماية شاملة للإنتاج العالمي
 * 
 * ضمانات إضافية لمنع أي مشاكل في الإنتاج
 */

// الصلاحيات الأساسية الحرجة
export const ESSENTIAL_PERMISSIONS = [
  'الوصول_للوحة_التحكم',
  'إدارة_المستخدمين',
  'roles.view',
  'users.view'
] as const;

// القائمة الأساسية للطوارئ
export const EMERGENCY_MENU_ITEMS = [
  {
    name: 'لوحة التحكم',
    href: '/admin/dashboard',
    icon: 'HomeIcon'
  },
  {
    name: 'إدارة المستخدمين',
    href: '/admin/users',
    icon: 'UsersIcon'
  },
  {
    name: 'إدارة الأدوار',
    href: '/admin/roles',
    icon: 'ShieldCheckIcon'
  },
  {
    name: 'الإعدادات',
    href: '/admin/settings',
    icon: 'CogIcon'
  }
] as const;

/**
 * فحص سريع للصلاحيات الأساسية
 */
export function hasEssentialPermissions(userPermissions: string[]): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  // فحص Wildcard
  if (userPermissions.includes('*') || userPermissions.includes('ALL')) {
    return true;
  }

  // فحص الصلاحيات الأساسية
  return ESSENTIAL_PERMISSIONS.every(perm => userPermissions.includes(perm));
}

/**
 * إنتاج تسجيل خطأ للإنتاج
 */
export function logProductionError(category: string, details: any): void {
  const errorLog = {
    timestamp: new Date().toISOString(),
    category,
    details,
    environment: process.env.NODE_ENV,
    url: typeof window !== 'undefined' ? window.location.href : 'server'
  };

  if (process.env.NODE_ENV === 'production') {
    // في الإنتاج: تسجيل صامت
    console.error(`[PRODUCTION-${category}]`, JSON.stringify(errorLog));
    
    // يمكن إضافة integration مع monitoring service هنا
    // مثل Sentry, LogRocket, أو DataDog
  } else {
    // في التطوير: تسجيل مفصل
    console.error(`[DEV-${category}]`, errorLog);
  }
}

/**
 * ضمان وجود صلاحيات أساسية للمدير
 */
export function ensureMinimumPermissions(userPermissions: string[], userRole: string): string[] {
  if (process.env.NODE_ENV !== 'production') {
    return userPermissions; // في التطوير لا نتدخل
  }

  // في الإنتاج: ضمان الحد الأدنى
  if (!userPermissions || userPermissions.length === 0) {
    logProductionError('EMPTY_PERMISSIONS', { userRole, originalCount: 0 });
    
    if (['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return [...ESSENTIAL_PERMISSIONS];
    }
  }

  // التأكد من وجود الصلاحيات الأساسية
  const missingEssential = ESSENTIAL_PERMISSIONS.filter(perm => 
    !userPermissions.includes(perm)
  );

  if (missingEssential.length > 0 && ['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
    logProductionError('MISSING_ESSENTIAL_PERMISSIONS', { 
      userRole, 
      missing: missingEssential,
      current: userPermissions.length 
    });

    return [...new Set([...userPermissions, ...ESSENTIAL_PERMISSIONS])];
  }

  return userPermissions;
}

/**
 * إنتاج قائمة طوارئ آمنة
 */
export function getEmergencyMenuItems() {
  return EMERGENCY_MENU_ITEMS.map(item => ({
    ...item,
    emergencyMode: true,
    timestamp: new Date().toISOString()
  }));
}

/**
 * فحص سلامة النظام السريع
 */
export async function quickSystemHealthCheck(): Promise<{
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // فحص متغيرات البيئة
  if (!process.env.DATABASE_URL) {
    issues.push('DATABASE_URL مفقود');
    recommendations.push('إضافة DATABASE_URL في متغيرات البيئة');
  }

  if (!process.env.JWT_SECRET) {
    issues.push('JWT_SECRET مفقود');
    recommendations.push('إضافة JWT_SECRET قوي');
  }

  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
    issues.push(`NODE_ENV غير صحيح: ${process.env.NODE_ENV}`);
    recommendations.push('تحديد NODE_ENV بوضوح');
  }

  // تحديد الحالة
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  
  if (issues.some(issue => issue.includes('DATABASE_URL') || issue.includes('JWT_SECRET'))) {
    status = 'critical';
  } else if (issues.length > 0) {
    status = 'warning';
  }

  return { status, issues, recommendations };
}

/**
 * معلومات النظام للمراقبة
 */
export function getSystemInfo() {
  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || 'unknown',
    features: {
      permissionsSystem: true,
      emergencyFallback: true,
      productionSafety: true,
      autoRecovery: true
    }
  };
}

// إعدادات الأمان للإنتاج
export const PRODUCTION_SAFETY_CONFIG = {
  // إخفاء تفاصيل الأخطاء عن المستخدمين
  hideErrorDetails: process.env.NODE_ENV === 'production',
  
  // تفعيل القائمة الاحتياطية تلقائياً
  enableEmergencyFallback: true,
  
  // تسجيل الأخطاء بصمت
  silentErrorLogging: process.env.NODE_ENV === 'production',
  
  // ضمان الصلاحيات الأساسية
  enforceMinimumPermissions: process.env.NODE_ENV === 'production'
} as const;
