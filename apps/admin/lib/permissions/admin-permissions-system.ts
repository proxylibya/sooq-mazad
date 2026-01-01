/**
 * نظام الصلاحيات المركزي والديناميكي للمديرين
 * Admin Permissions System - Enterprise Edition
 * 
 * هذا الملف هو المصدر الوحيد للصلاحيات في النظام
 * يتزامن مع أقسام لوحة التحكم في AdminSidebar
 * 
 * @version 2.0.0
 * @author سوق المزاد
 */

// ============================================
// أنواع البيانات
// ============================================

export interface Permission {
    id: string;           // معرف الصلاحية (مثل: users:manage)
    section: string;      // القسم الرئيسي
    label: string;        // الاسم بالعربية
    description: string;  // وصف الصلاحية
    icon?: string;        // أيقونة (اختياري)
    actions: string[];    // الإجراءات المتاحة
    children?: Permission[]; // صلاحيات فرعية
}

export interface PermissionSection {
    id: string;
    label: string;
    icon: string;
    permissions: Permission[];
}

// ============================================
// أقسام لوحة التحكم والصلاحيات
// ============================================

/**
 * جميع أقسام لوحة التحكم مع صلاحياتها
 * هذه القائمة تتطابق مع AdminSidebar
 * عند إضافة قسم جديد، أضفه هنا وسيظهر تلقائياً
 */
export const ADMIN_SECTIONS: PermissionSection[] = [
    {
        id: 'dashboard',
        label: 'لوحة التحكم',
        icon: 'HomeIcon',
        permissions: [
            {
                id: 'dashboard:view',
                section: 'dashboard',
                label: 'عرض لوحة التحكم',
                description: 'الوصول للوحة التحكم الرئيسية والإحصائيات',
                actions: ['view'],
            },
        ],
    },
    {
        id: 'users',
        label: 'المستخدمون',
        icon: 'UsersIcon',
        permissions: [
            {
                id: 'users:view',
                section: 'users',
                label: 'عرض المستخدمين',
                description: 'عرض قائمة المستخدمين وبياناتهم',
                actions: ['view', 'search', 'export'],
            },
            {
                id: 'users:create',
                section: 'users',
                label: 'إضافة مستخدمين',
                description: 'إنشاء حسابات مستخدمين جديدة',
                actions: ['create'],
            },
            {
                id: 'users:edit',
                section: 'users',
                label: 'تعديل المستخدمين',
                description: 'تعديل بيانات المستخدمين',
                actions: ['edit', 'update'],
            },
            {
                id: 'users:delete',
                section: 'users',
                label: 'حذف المستخدمين',
                description: 'حذف وحظر المستخدمين',
                actions: ['delete', 'ban', 'suspend', 'restore'],
            },
        ],
    },
    {
        id: 'auctions',
        label: 'المزادات',
        icon: 'TagIcon',
        permissions: [
            {
                id: 'auctions:view',
                section: 'auctions',
                label: 'عرض المزادات',
                description: 'عرض جميع المزادات وتفاصيلها',
                actions: ['view', 'search', 'export'],
            },
            {
                id: 'auctions:create',
                section: 'auctions',
                label: 'إنشاء مزادات',
                description: 'إنشاء مزادات جديدة',
                actions: ['create'],
            },
            {
                id: 'auctions:manage',
                section: 'auctions',
                label: 'إدارة المزادات',
                description: 'تعديل وإدارة المزادات',
                actions: ['edit', 'approve', 'reject', 'cancel', 'feature'],
            },
            {
                id: 'auctions:delete',
                section: 'auctions',
                label: 'حذف المزادات',
                description: 'حذف المزادات نهائياً',
                actions: ['delete'],
            },
            {
                id: 'auctions:settings',
                section: 'auctions',
                label: 'إعدادات المزادات',
                description: 'تعديل إعدادات المزادات العامة',
                actions: ['settings'],
            },
        ],
    },
    {
        id: 'marketplace',
        label: 'السوق الفوري',
        icon: 'ShoppingBagIcon',
        permissions: [
            {
                id: 'marketplace:view',
                section: 'marketplace',
                label: 'عرض الإعلانات',
                description: 'عرض إعلانات السوق الفوري',
                actions: ['view', 'search', 'export'],
            },
            {
                id: 'marketplace:manage',
                section: 'marketplace',
                label: 'إدارة الإعلانات',
                description: 'تعديل وإدارة الإعلانات',
                actions: ['edit', 'approve', 'reject', 'feature'],
            },
            {
                id: 'marketplace:delete',
                section: 'marketplace',
                label: 'حذف الإعلانات',
                description: 'حذف الإعلانات نهائياً',
                actions: ['delete'],
            },
        ],
    },
    {
        id: 'yards',
        label: 'الساحات',
        icon: 'BuildingOfficeIcon',
        permissions: [
            {
                id: 'yards:view',
                section: 'yards',
                label: 'عرض الساحات',
                description: 'عرض جميع الساحات',
                actions: ['view', 'search'],
            },
            {
                id: 'yards:manage',
                section: 'yards',
                label: 'إدارة الساحات',
                description: 'إنشاء وتعديل الساحات',
                actions: ['create', 'edit', 'delete'],
            },
        ],
    },
    {
        id: 'transport',
        label: 'خدمات النقل',
        icon: 'TruckIcon',
        permissions: [
            {
                id: 'transport:view',
                section: 'transport',
                label: 'عرض خدمات النقل',
                description: 'عرض جميع خدمات النقل',
                actions: ['view', 'search', 'export'],
            },
            {
                id: 'transport:manage',
                section: 'transport',
                label: 'إدارة خدمات النقل',
                description: 'إنشاء وتعديل خدمات النقل',
                actions: ['create', 'edit', 'approve', 'reject'],
            },
            {
                id: 'transport:delete',
                section: 'transport',
                label: 'حذف خدمات النقل',
                description: 'حذف خدمات النقل',
                actions: ['delete'],
            },
            {
                id: 'transport:settings',
                section: 'transport',
                label: 'إعدادات النقل',
                description: 'تعديل إعدادات خدمات النقل',
                actions: ['settings'],
            },
        ],
    },
    {
        id: 'showrooms',
        label: 'المعارض',
        icon: 'BuildingStorefrontIcon',
        permissions: [
            {
                id: 'showrooms:view',
                section: 'showrooms',
                label: 'عرض المعارض',
                description: 'عرض جميع المعارض',
                actions: ['view', 'search'],
            },
            {
                id: 'showrooms:manage',
                section: 'showrooms',
                label: 'إدارة المعارض',
                description: 'إنشاء وتعديل المعارض والموافقة عليها',
                actions: ['create', 'edit', 'approve', 'reject', 'delete'],
            },
        ],
    },
    {
        id: 'wallets',
        label: 'المحافظ المالية',
        icon: 'WalletIcon',
        permissions: [
            {
                id: 'wallets:view',
                section: 'wallets',
                label: 'عرض المحافظ',
                description: 'عرض المحافظ والمعاملات',
                actions: ['view', 'search', 'export'],
            },
            {
                id: 'wallets:manage',
                section: 'wallets',
                label: 'إدارة المحافظ',
                description: 'إدارة عمليات الإيداع والسحب',
                actions: ['approve_withdrawal', 'reject_withdrawal', 'adjust_balance'],
            },
            {
                id: 'wallets:transactions',
                section: 'wallets',
                label: 'المعاملات المالية',
                description: 'عرض وإدارة المعاملات المالية',
                actions: ['view_transactions', 'export_transactions'],
            },
        ],
    },
    {
        id: 'admins',
        label: 'المديرون',
        icon: 'UserGroupIcon',
        permissions: [
            {
                id: 'admins:view',
                section: 'admins',
                label: 'عرض المديرين',
                description: 'عرض قائمة المديرين',
                actions: ['view', 'search'],
            },
            {
                id: 'admins:create',
                section: 'admins',
                label: 'إضافة مديرين',
                description: 'إنشاء حسابات مديرين جديدة',
                actions: ['create'],
            },
            {
                id: 'admins:edit',
                section: 'admins',
                label: 'تعديل المديرين',
                description: 'تعديل بيانات وصلاحيات المديرين',
                actions: ['edit', 'update_permissions'],
            },
            {
                id: 'admins:delete',
                section: 'admins',
                label: 'حذف المديرين',
                description: 'حذف وتعطيل المديرين',
                actions: ['delete', 'suspend'],
            },
        ],
    },
    {
        id: 'support',
        label: 'الدعم الفني',
        icon: 'TicketIcon',
        permissions: [
            {
                id: 'support:view',
                section: 'support',
                label: 'عرض التذاكر',
                description: 'عرض تذاكر الدعم الفني',
                actions: ['view', 'search'],
            },
            {
                id: 'support:manage',
                section: 'support',
                label: 'إدارة التذاكر',
                description: 'الرد على التذاكر وإدارتها',
                actions: ['reply', 'assign', 'close', 'reopen'],
            },
        ],
    },
    {
        id: 'reports',
        label: 'التقارير',
        icon: 'ChartBarIcon',
        permissions: [
            {
                id: 'reports:view',
                section: 'reports',
                label: 'عرض التقارير',
                description: 'عرض جميع التقارير والإحصائيات',
                actions: ['view', 'export'],
            },
            {
                id: 'reports:generate',
                section: 'reports',
                label: 'إنشاء تقارير',
                description: 'إنشاء تقارير مخصصة',
                actions: ['generate', 'schedule'],
            },
        ],
    },
    {
        id: 'promotions',
        label: 'الترويج والإعلانات',
        icon: 'SparklesIcon',
        permissions: [
            {
                id: 'promotions:view',
                section: 'promotions',
                label: 'عرض الترويج',
                description: 'عرض الإعلانات المميزة',
                actions: ['view'],
            },
            {
                id: 'promotions:manage',
                section: 'promotions',
                label: 'إدارة الترويج',
                description: 'إدارة باقات الترويج والإعلانات المميزة',
                actions: ['create', 'edit', 'delete', 'approve'],
            },
            {
                id: 'advertising:view',
                section: 'promotions',
                label: 'عرض طلبات الإعلانات',
                description: 'عرض طلبات الخدمات الإعلانية ومراسلات الفريق',
                actions: ['view', 'search', 'export'],
            },
            {
                id: 'advertising:manage',
                section: 'promotions',
                label: 'إدارة طلبات الإعلانات',
                description: 'متابعة وإدارة طلبات الإعلانات وتعيين المسؤولين',
                actions: ['edit', 'assign', 'complete', 'reject', 'delete'],
            },
        ],
    },
    {
        id: 'security',
        label: 'الحماية والأمان',
        icon: 'ShieldCheckIcon',
        permissions: [
            {
                id: 'security:view',
                section: 'security',
                label: 'عرض سجلات الأمان',
                description: 'عرض سجلات الدخول والنشاط',
                actions: ['view', 'search', 'export'],
            },
            {
                id: 'security:manage',
                section: 'security',
                label: 'إدارة الأمان',
                description: 'إدارة إعدادات الأمان والحظر',
                actions: ['block_ip', 'unblock', 'reset_password'],
            },
        ],
    },
    {
        id: 'content',
        label: 'إدارة المحتوى',
        icon: 'DocumentTextIcon',
        permissions: [
            {
                id: 'content:view',
                section: 'content',
                label: 'عرض المحتوى',
                description: 'عرض صفحات وأقسام الموقع',
                actions: ['view'],
            },
            {
                id: 'content:manage',
                section: 'content',
                label: 'إدارة المحتوى',
                description: 'تعديل محتوى الموقع والأقسام',
                actions: ['edit', 'publish', 'unpublish'],
            },
        ],
    },
    {
        id: 'settings',
        label: 'الإعدادات',
        icon: 'Cog6ToothIcon',
        permissions: [
            {
                id: 'settings:view',
                section: 'settings',
                label: 'عرض الإعدادات',
                description: 'عرض إعدادات النظام',
                actions: ['view'],
            },
            {
                id: 'settings:manage',
                section: 'settings',
                label: 'تعديل الإعدادات',
                description: 'تعديل إعدادات النظام العامة',
                actions: ['edit', 'reset'],
            },
        ],
    },
];

// ============================================
// دوال مساعدة
// ============================================

/**
 * الحصول على جميع الصلاحيات كقائمة مسطحة
 */
export function getAllPermissions(): Permission[] {
    const permissions: Permission[] = [];
    ADMIN_SECTIONS.forEach(section => {
        permissions.push(...section.permissions);
    });
    return permissions;
}

/**
 * الحصول على جميع معرفات الصلاحيات
 */
export function getAllPermissionIds(): string[] {
    return getAllPermissions().map(p => p.id);
}

/**
 * الحصول على صلاحيات قسم معين
 */
export function getSectionPermissions(sectionId: string): Permission[] {
    const section = ADMIN_SECTIONS.find(s => s.id === sectionId);
    return section?.permissions || [];
}

/**
 * التحقق من وجود صلاحية
 */
export function hasPermission(userPermissions: string[], permissionId: string): boolean {
    // المدير الأعلى لديه جميع الصلاحيات
    if (userPermissions.includes('*')) return true;
    return userPermissions.includes(permissionId);
}

/**
 * التحقق من وجود أي صلاحية في قسم
 */
export function hasSectionAccess(userPermissions: string[], sectionId: string): boolean {
    if (userPermissions.includes('*')) return true;
    const sectionPermissions = getSectionPermissions(sectionId);
    return sectionPermissions.some(p => userPermissions.includes(p.id));
}

/**
 * الحصول على الصلاحيات الافتراضية حسب الدور
 */
export function getDefaultPermissionsByRole(role: string): string[] {
    switch (role) {
        case 'SUPER_ADMIN':
            return ['*']; // جميع الصلاحيات
        case 'ADMIN':
            return getAllPermissionIds().filter(p =>
                !p.startsWith('admins:') &&
                !p.startsWith('settings:manage')
            );
        case 'MODERATOR':
            return [
                'dashboard:view',
                'users:view',
                'auctions:view',
                'auctions:manage',
                'marketplace:view',
                'marketplace:manage',
                'support:view',
                'support:manage',
                'advertising:view',
                'advertising:manage',
            ];
        case 'SUPPORT':
            return [
                'dashboard:view',
                'users:view',
                'support:view',
                'support:manage',
            ];
        case 'FINANCE':
            return [
                'dashboard:view',
                'wallets:view',
                'wallets:manage',
                'wallets:transactions',
                'reports:view',
            ];
        case 'VIEWER':
            return [
                'dashboard:view',
                'users:view',
                'auctions:view',
                'marketplace:view',
                'reports:view',
            ];
        default:
            return ['dashboard:view'];
    }
}

/**
 * تنسيق الصلاحيات للعرض في الواجهة
 */
export function formatPermissionsForUI(): {
    sections: Array<{
        id: string;
        label: string;
        icon: string;
        permissions: Array<{
            id: string;
            label: string;
            description: string;
        }>;
    }>;
} {
    return {
        sections: ADMIN_SECTIONS.map(section => ({
            id: section.id,
            label: section.label,
            icon: section.icon,
            permissions: section.permissions.map(p => ({
                id: p.id,
                label: p.label,
                description: p.description,
            })),
        })),
    };
}

// تصدير افتراضي
export default {
    ADMIN_SECTIONS,
    getAllPermissions,
    getAllPermissionIds,
    getSectionPermissions,
    hasPermission,
    hasSectionAccess,
    getDefaultPermissionsByRole,
    formatPermissionsForUI,
};
