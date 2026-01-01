/**
 * 🔐 نظام الصلاحيات المُصلح - الإصدار الجذري
 * 
 * الإصلاحات المطبقة:
 * 1. SUPER_ADMIN يرى كل شيء دائماً
 * 2. ADMIN يحصل على صلاحيات افتراضية كافية
 * 3. لا إخفاء كامل للأقسام أبداً
 * 4. نظام fallback ذكي
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
 * الحصول على الصلاحيات الافتراضية للدور
 */
function getDefaultPermissionsForRole(userRole?: string): string[] {
  if (!userRole) return [];
  return DEFAULT_ROLE_PERMISSIONS[userRole] || [];
}

/**
 * التحقق من صلاحية واحدة - النسخة المحسنة
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

  // دمج الصلاحيات: المُرسلة + الافتراضية للدور
  const effectivePermissions = [
    ...(userPermissions || []),
    ...getDefaultPermissionsForRole(userRole)
  ];

  // إزالة التكرار
  const uniquePermissions = [...new Set(effectivePermissions)];

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

  return requiredPermissions.every((perm) => hasPermission(userPermissions, perm, userRole));
}

/**
 * 🛡️ فلترة عناصر القائمة بناءً على الصلاحيات - النسخة المُصلحة
 */
export function filterMenuByPermissions<T extends PermissionItem>(
  menuItems: T[],
  userPermissions: string[],
  userRole?: string
): T[] {
  if (process.env.NODE_ENV === 'development') {
    console.log('[filterMenuByPermissions] التحقق من:', {
      userRole,
      permissionsCount: userPermissions?.length || 0,
      menuItemsCount: menuItems?.length || 0
    });
  }

  // 🔥 SUPER_ADMIN يرى كل شيء دائماً
  if (userRole === 'SUPER_ADMIN') {
    if (process.env.NODE_ENV === 'development') {
      console.log('[filterMenuByPermissions] SUPER_ADMIN - إظهار جميع الأقسام');
    }
    return menuItems;
  }

  // دمج الصلاحيات: المُرسلة + الافتراضية
  const effectivePermissions = [
    ...(userPermissions || []),
    ...getDefaultPermissionsForRole(userRole)
  ];

  // إزالة التكرار
  const uniquePermissions = [...new Set(effectivePermissions)];

  if (process.env.NODE_ENV === 'development') {
    console.log('[filterMenuByPermissions] الصلاحيات الفعالة:', {
      original: userPermissions?.length || 0,
      defaults: getDefaultPermissionsForRole(userRole).length,
      total: uniquePermissions.length,
      sample: uniquePermissions.slice(0, 5)
    });
  }

  // Wildcard/full-access support
  if (uniquePermissions.some((p) => WILDCARD_PERMISSIONS.includes(p))) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[filterMenuByPermissions] وُجدت صلاحية شاملة - إظهار جميع الأقسام');
    }
    return menuItems;
  }

  // 🛡️ SAFETY NET: إذا كان المستخدم إداري ولا توجد صلاحيات، أظهر الأقسام الأساسية
  const isAdminUser = ['ADMIN', 'MODERATOR', 'SUPER_ADMIN'].includes(userRole || '');
  if (isAdminUser && uniquePermissions.length === 0) {
    console.warn('[filterMenuByPermissions] مستخدم إداري بلا صلاحيات - تطبيق صلاحيات طوارئ');
    
    // صلاحيات طوارئ للمديرين
    const emergencyPermissions = [
      'الوصول_للوحة_التحكم',
      'dashboard.view',
      'إدارة_المستخدمين',
      'users.view',
      'إدارة_سوق_المزاد',
      'auctions.view',
      'إدارة_السوق_الفوري',
      'marketplace.view'
    ];
    
    return menuItems.filter(item => 
      !item.requiredPermission || 
      emergencyPermissions.includes(item.requiredPermission) ||
      emergencyPermissions.includes(normalizePermission(item.requiredPermission))
    );
  }

  // الفلترة العادية
  const filteredItems = menuItems
    .map((item) => {
      const parentAccess = hasPermission(uniquePermissions, item.requiredPermission, userRole);
      const hasChildren = !!(item.children && item.children.length > 0);
      
      if (hasChildren) {
        const filteredChildren = item.children!.filter((child) => 
          hasPermission(uniquePermissions, child.requiredPermission, userRole)
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

  if (process.env.NODE_ENV === 'development') {
    console.log('[filterMenuByPermissions] النتيجة:', {
      originalCount: menuItems.length,
      filteredCount: filteredItems.length,
      hiddenCount: menuItems.length - filteredItems.length
    });
  }

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

  return hasPermission(userPermissions, requiredPermission, userRole);
}

/**
 * الحصول على قائمة الصفحات المسموح بها
 */
export function getAllowedPages(
  pages: Array<{ href: string; requiredPermission?: string }>,
  userPermissions: string[],
  userRole?: string
): string[] {
  if (userRole === 'SUPER_ADMIN') {
    return pages.map((p) => p.href);
  }

  // Wildcard/full-access gets all pages
  const effectivePermissions = [
    ...(userPermissions || []),
    ...getDefaultPermissionsForRole(userRole)
  ];

  if (effectivePermissions.some((p) => WILDCARD_PERMISSIONS.includes(p))) {
    return pages.map((p) => p.href);
  }

  return pages
    .filter((page) => hasPermission(effectivePermissions, page.requiredPermission, userRole))
    .map((p) => p.href);
}

/**
 * دمج صلاحيات من مصادر متعددة
 */
export function mergePermissions(...permissionArrays: string[][]): string[] {
  const allPermissions = permissionArrays.flat();
  return [...new Set(allPermissions)];
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
