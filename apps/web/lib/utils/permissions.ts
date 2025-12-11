/**
 * 🔐 نظام الصلاحيات المُصلح - الإصدار النهائي
 * 
 * الإصلاحات المطبقة:
 * 1. SUPER_ADMIN يرى كل شيء دائماً
 * 2. ADMIN وMODERATOR يحصلون على صلاحيات افتراضية إذا لم توجد صلاحيات في قاعدة البيانات
 * 3. نظام fallback ذكي لمنع اختفاء الأقسام
 * 4. دمج تلقائي للصلاحيات الافتراضية عند الحاجة
 * 5. إصلاح مشكلة اختفاء القائمة الجانبية في لوحة التحكم
 */

export interface PermissionItem {
  requiredPermission?: string;
  children?: PermissionItem[];
}

// Wildcard permissions that imply full access
const WILDCARD_PERMISSIONS = ['*', 'ALL', 'FULL_ACCESS', 'admin:all'];

/**
 * تطبيع أسماء الصلاحيات - دعم الأسماء المختصرة والكاملة
 */
const PERMISSION_ALIASES: Record<string, string> = {
  'dashboard': 'الوصول_للوحة_التحكم',
  'users': 'إدارة_المستخدمين',
  'roles': 'إدارة_الأدوار',
  'admins': 'إدارة_المسؤولين',
  'auctions': 'إدارة_سوق_المزاد',
  'marketplace': 'إدارة_السوق_الفوري',
  'transport': 'خدمات_النقل',
  'showrooms': 'إدارة_المعارض',
  'yards': 'إدارة_الساحات',
  'companies': 'إدارة_الشركات',
  'finance': 'إدارة_المالية',
  'wallets': 'إدارة_المحافظ',
  'messages': 'الرسائل_والإشعارات',
  'content': 'إدارة_المحتوى',
  'page_analytics': 'تحليلات_الصفحات',
  'reports': 'التقارير_والتحليلات',
  'security': 'الأمان_والمراقبة',
  'pages': 'إدارة_الصفحات',
  'page_visibility': 'إدارة_رؤية_الصفحات',
  'settings': 'الإعدادات_العامة',
  'users.view': 'عرض_المستخدمين',
  'users.add': 'إضافة_مستخدم',
  'users.edit': 'تعديل_مستخدم',
  'users.delete': 'حذف_مستخدم',
  'users.ban': 'إدارة_الحظر',
  'users.reports': 'تقارير_المستخدمين',
  'roles.view': 'عرض_الأدوار',
  'roles.create': 'إنشاء_دور',
  'roles.edit': 'تعديل_دور',
  'roles.delete': 'حذف_دور',
  'admins.view': 'عرض_المسؤولين',
  'admins.add': 'إضافة_مسؤول',
  'admins.edit': 'تعديل_مسؤول',
  'admins.delete': 'حذف_مسؤول',
  'auctions.view': 'عرض_المزادات',
  'auctions.create': 'إنشاء_مزاد',
  'auctions.edit': 'تعديل_مزاد',
  'auctions.delete': 'حذف_مزاد',
  'auctions.active': 'المزادات_النشطة',
  'auctions.completed': 'المزادات_المكتملة',
  'auctions.sales': 'إدارة_المبيعات',
  'auctions.templates': 'إدارة_قوالب_الرسائل',
  'auctions.settings': 'إعدادات_المزادات',
  'marketplace.view': 'عرض_السوق_الفوري',
  'marketplace.ads': 'إدارة_الإعلانات',
  'marketplace.settings': 'إعدادات_السوق',
  'transport.view': 'عرض_النقل',
  'transport.manage': 'إدارة_النقل',
  'showrooms.view': 'عرض_المعارض',
  'showrooms.add': 'إضافة_معرض',
  'showrooms.edit': 'تعديل_معرض',
  'finance.view': 'عرض_المالية',
  'finance.reports': 'التقارير_المالية',
  'finance.payments': 'إدارة_المدفوعات',
  'visitors.view': 'رؤية_الزوار',
  'products.view': 'رؤية_المنتجات',
};

/**
 * 🎯 الصلاحيات الافتراضية للأدوار - النظام الآمن
 */
const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  'SUPER_ADMIN': ['*'], // صلاحية شاملة
  'ADMIN': [
    // أساسي
    'الوصول_للوحة_التحكم',
    'dashboard.view',
    'dashboard.manage',
    
    // المستخدمون
    'إدارة_المستخدمين',
    'عرض_المستخدمين',
    'users.view',
    'users.manage',
    
    // المزادات
    'إدارة_سوق_المزاد',
    'عرض_المزادات',
    'auctions.view',
    'auctions.manage',
    
    // السوق
    'إدارة_السوق_الفوري',
    'marketplace.view',
    'marketplace.manage',
    
    // النقل
    'خدمات_النقل',
    'transport.view',
    'transport.manage',
    
    // المعارض
    'إدارة_المعارض',
    'showrooms.view',
    'showrooms.manage',
    
    // الشركات
    'إدارة_الشركات',
    'companies.view',
    'companies.manage',
    
    // المالية
    'إدارة_المالية',
    'finance.view',
    'finance.manage',
    
    // التقارير
    'التقارير_والتحليلات',
    'reports.view',
    'stats.view'
  ],
  'MODERATOR': [
    'الوصول_للوحة_التحكم',
    'dashboard.view',
    'عرض_المستخدمين',
    'users.view',
    'عرض_المزادات',
    'auctions.view',
    'marketplace.view',
    'transport.view',
    'showrooms.view',
    'reports.view'
  ]
};

/**
 * تطبيع اسم الصلاحية
 */
function normalizePermission(permission: string): string {
  return PERMISSION_ALIASES[permission] || permission;
}

/**
 * ✅ النظام الآن يدمج الصلاحيات الافتراضية تلقائياً
 * إذا لم توجد صلاحيات في قاعدة البيانات للأدوار النظامية
 * هذا يحل مشكلة اختفاء الأقسام عند عدم وجود صلاحيات
 */

/**
 * التحقق من صلاحية واحدة - النسخة المُصلحة مع الصلاحيات الافتراضية
 * ✅ تدمج صلاحيات افتراضية للأدوار النظامية إذا لم توجد صلاحيات
 */
export function hasPermission(
  userPermissions: string[],
  requiredPermission?: string,
  userRole?: string
): boolean {
  // إذا لم تُطلب صلاحية، فالوصول مسموح
  if (!requiredPermission) {
    return true;
  }

  // SUPER_ADMIN له كل شيء دائماً
  if (userRole === 'SUPER_ADMIN') {
    return true;
  }

  // ✅ دمج الصلاحيات الافتراضية للأدوار النظامية إذا لم توجد صلاحيات
  let effectivePermissions = userPermissions || [];
  
  if (effectivePermissions.length === 0 && userRole && DEFAULT_ROLE_PERMISSIONS[userRole]) {
    effectivePermissions = DEFAULT_ROLE_PERMISSIONS[userRole];
  }

  const uniquePermissions = Array.from(new Set(effectivePermissions));

  // Wildcard/full-access support
  if (uniquePermissions.some((p) => WILDCARD_PERMISSIONS.includes(p))) {
    return true;
  }

  const normalizedRequired = normalizePermission(requiredPermission);
  const normalizedUserPerms = uniquePermissions.map(p => normalizePermission(p));

  return normalizedUserPerms.includes(normalizedRequired) || 
         uniquePermissions.includes(requiredPermission);
}

/**
 * التحقق من صلاحيات متعددة (يحتاج واحدة على الأقل)
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string[],
  userRole?: string
): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // SUPER_ADMIN له كل شيء
  if (userRole === 'SUPER_ADMIN') {
    return true;
  }

  // ✅ تمرير userRole للمحافظة على فحص SUPER_ADMIN ودمج الصلاحيات الافتراضية
  return requiredPermissions.some((perm) => hasPermission(userPermissions, perm, userRole));
}

/**
 * التحقق من جميع الصلاحيات (يحتاج جميعها)
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[],
  userRole?: string
): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // SUPER_ADMIN له كل شيء
  if (userRole === 'SUPER_ADMIN') {
    return true;
  }

  // ✅ تمرير userRole للمحافظة على فحص SUPER_ADMIN ودمج الصلاحيات الافتراضية
  return requiredPermissions.every((perm) => hasPermission(userPermissions, perm, userRole));
}

// Throttle logging to prevent console spam
let lastLogTime = 0;
const LOG_THROTTLE_MS = 5000; // Log at most once every 5 seconds

/**
 * 🛡️ فلترة عناصر القائمة بناءً على الصلاحيات - النسخة المُصلحة
 */
export function filterMenuByPermissions<T extends PermissionItem>(
  menuItems: T[],
  userPermissions: string[],
  userRole?: string
): T[] {
  // Throttled logging in development only
  const now = Date.now();
  if (process.env.NODE_ENV === 'development' && (now - lastLogTime) > LOG_THROTTLE_MS) {
    console.log('[filterMenuByPermissions] التحقق من:', {
      userRole,
      permissionsCount: userPermissions?.length || 0,
      menuItemsCount: menuItems?.length || 0
    });
    lastLogTime = now;
  }

  // 🔥 SUPER_ADMIN يرى كل شيء دائماً
  if (userRole === 'SUPER_ADMIN') {
    return menuItems;
  }

  // ✅ دمج الصلاحيات الافتراضية للأدوار النظامية إذا لم توجد صلاحيات
  let effectivePermissions = userPermissions || [];
  
  // إذا لم توجد صلاحيات وكان الدور نظامي، نعطي الصلاحيات الافتراضية
  if (effectivePermissions.length === 0 && userRole && DEFAULT_ROLE_PERMISSIONS[userRole]) {
    effectivePermissions = DEFAULT_ROLE_PERMISSIONS[userRole];
    console.log(`[filterMenuByPermissions] تطبيق الصلاحيات الافتراضية للدور ${userRole}`);
  }

  // إزالة التكرار
  const uniquePermissions = Array.from(new Set(effectivePermissions));

  // Removed verbose logging - use browser devtools for debugging if needed

  // Wildcard/full-access support
  if (uniquePermissions.some((p) => WILDCARD_PERMISSIONS.includes(p))) {
    return menuItems;
  }

  // ⚠️ إذا لم توجد صلاحيات أبداً حتى بعد الافتراضية، لا نعرض أي أقسام
  if (uniquePermissions.length === 0) {
    console.warn('[filterMenuByPermissions] لا توجد صلاحيات - لن يتم عرض أي أقسام');
    return [];
  }

  // الفلترة العادية
  const filteredItems = menuItems
    .map((item) => {
      // ✅ فحص الصلاحية بدون الرجوع للدور
      const parentAccess = hasPermission(uniquePermissions, item.requiredPermission);
      const hasChildren = !!(item.children && item.children.length > 0);
      
      if (hasChildren) {
        const filteredChildren = item.children!.filter((child) => 
          hasPermission(uniquePermissions, child.requiredPermission)
        );

        // Include item if parent is allowed OR any child is allowed
        if (parentAccess || filteredChildren.length > 0) {
          return {
            ...item,
            children: filteredChildren,
          } as T;
        }
        return null;
      } else {
        // عنصر بسيط - أظهره إذا كان مسموح
        return parentAccess ? item : null;
      }
    })
    .filter((item): item is T => item !== null);

  // Removed verbose result logging

  return filteredItems;
}

/**
 * التحقق من صلاحية الوصول لصفحة
 */
export function canAccessPage(
  userPermissions: string[],
  requiredPermission?: string,
  userRole?: string
): boolean {
  if (userRole === 'SUPER_ADMIN') {
    return true;
  }

  // ✅ تمرير userRole للمحافظة على فحص SUPER_ADMIN ودمج الصلاحيات الافتراضية
  return hasPermission(userPermissions, requiredPermission, userRole);
}

/**
 * الحصول علمى قائمة الصفحات المسموح بها
 */
export function getAllowedPages(
  pages: Array<{ href: string; requiredPermission?: string }>,
  userPermissions: string[],
  userRole?: string
): string[] {
  if (userRole === 'SUPER_ADMIN') {
    return pages.map((p) => p.href);
  }

  // ✅ دمج الصلاحيات الافتراضية للأدوار النظامية
  let effectivePermissions = userPermissions || [];
  if (effectivePermissions.length === 0 && userRole && DEFAULT_ROLE_PERMISSIONS[userRole]) {
    effectivePermissions = DEFAULT_ROLE_PERMISSIONS[userRole];
  }

  // Wildcard/full-access gets all pages
  if (effectivePermissions.some((p) => WILDCARD_PERMISSIONS.includes(p))) {
    return pages.map((p) => p.href);
  }

  return pages
    .filter((page) => hasPermission(userPermissions, page.requiredPermission, userRole))
    .map((p) => p.href);
}

/**
 * دمج صلاحيات من مصادر متعددة
 */
export function mergePermissions(...permissionArrays: string[][]): string[] {
  const allPermissions = permissionArrays.flat();
  return Array.from(new Set(allPermissions));
}

/**
 * التحقق من كون المستخدم مسؤول
 */
export function isAdmin(userRole?: string): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(userRole || '');
}

/**
 * التحقق من كون المستخدم مدير عام
 */
export function isSuperAdmin(userRole?: string): boolean {
  return userRole === 'SUPER_ADMIN';
}

/**
 * الحصول على مستوى الصلاحية
 */
export function getPermissionLevel(userRole?: string): number {
  const levels: Record<string, number> = {
    SUPER_ADMIN: 100,
    ADMIN: 50,
    MODERATOR: 25,
    USER: 0
  };

  return levels[userRole || 'USER'] || 0;
}

/**
 * التحقق من كون الصلاحية أعلى من مستوى معين
 */
export function hasMinimumLevel(
  userRole: string | undefined,
  minimumRole: string
): boolean {
  return getPermissionLevel(userRole) >= getPermissionLevel(minimumRole);
}

// تصدير الصلاحيات الافتراضية للاستخدام الخارجي
export { DEFAULT_ROLE_PERMISSIONS };
