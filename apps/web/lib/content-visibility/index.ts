/**
 * نظام إدارة المحتوى المتقدم - Enterprise Content Visibility System
 * ============================================================
 * 
 * نظام موحد ومحسن للتحكم في إظهار/إخفاء المحتوى بدون وميض
 * يدعم SSR و Client-side مع تخزين مؤقت متقدم
 * 
 * @version 2.0.0
 * @author Sooq Mazad Team
 */

// ============================================
// Types & Interfaces
// ============================================

export type SectionStatus = 'ACTIVE' | 'DISABLED' | 'MAINTENANCE' | 'COMING_SOON' | 'MEMBERS_ONLY';

export interface SiteSection {
    id: string;
    slug: string;
    name: string;
    description?: string;
    icon?: string;
    status: SectionStatus;
    message?: string;
    showInNavbar: boolean;
    showInMobileMenu: boolean;
    showInFooter: boolean;
    showInHomepage: boolean;
    showHomeButton: boolean;
    showHomeCard: boolean;
    navbarOrder: number;
    footerOrder: number;
    homepageOrder: number;
    pageUrl: string;
    primaryColor?: string;
    secondaryColor?: string;
}

export interface SiteElement {
    id: string;
    key: string;
    name: string;
    description?: string;
    pageType: string;
    elementType: string;
    category?: string;
    isVisible: boolean;
    isInteractive: boolean;
    displayOrder: number;
    sectionId?: string;
}

export interface ContentVisibilityConfig {
    sections: SiteSection[];
    elements: SiteElement[];
    lastUpdated: number;
    source: 'database' | 'cache' | 'default';
}

// ============================================
// Default Data - البيانات الافتراضية
// ============================================

export const DEFAULT_SECTIONS: SiteSection[] = [
    {
        id: 'sec-auctions',
        slug: 'auctions',
        name: 'سوق المزاد',
        description: 'مزادات السيارات المباشرة',
        icon: 'ScaleIcon',
        status: 'ACTIVE',
        showInNavbar: true,
        showInMobileMenu: true,
        showInFooter: true,
        showInHomepage: true,
        showHomeButton: true,
        showHomeCard: true,
        navbarOrder: 1,
        footerOrder: 1,
        homepageOrder: 1,
        pageUrl: '/auctions',
        primaryColor: '#f59e0b',
        secondaryColor: '#d97706',
    },
    {
        id: 'sec-marketplace',
        slug: 'marketplace',
        name: 'السوق الفوري',
        description: 'بيع وشراء السيارات مباشرة',
        icon: 'ShoppingBagIcon',
        status: 'ACTIVE',
        showInNavbar: true,
        showInMobileMenu: true,
        showInFooter: true,
        showInHomepage: true,
        showHomeButton: true,
        showHomeCard: true,
        navbarOrder: 2,
        footerOrder: 2,
        homepageOrder: 2,
        pageUrl: '/marketplace',
        primaryColor: '#3b82f6',
        secondaryColor: '#2563eb',
    },
    {
        id: 'sec-yards',
        slug: 'yards',
        name: 'الساحات',
        description: 'ساحات عرض السيارات',
        icon: 'MapPinIcon',
        status: 'ACTIVE',
        showInNavbar: true,
        showInMobileMenu: true,
        showInFooter: true,
        showInHomepage: true,
        showHomeButton: true,
        showHomeCard: true,
        navbarOrder: 3,
        footerOrder: 3,
        homepageOrder: 3,
        pageUrl: '/yards',
        primaryColor: '#10b981',
        secondaryColor: '#059669',
    },
    {
        id: 'sec-showrooms',
        slug: 'showrooms',
        name: 'المعارض',
        description: 'معارض السيارات',
        icon: 'BuildingStorefrontIcon',
        status: 'ACTIVE',
        showInNavbar: true,
        showInMobileMenu: true,
        showInFooter: true,
        showInHomepage: true,
        showHomeButton: true,
        showHomeCard: true,
        navbarOrder: 4,
        footerOrder: 4,
        homepageOrder: 4,
        pageUrl: '/showrooms',
        primaryColor: '#14b8a6',
        secondaryColor: '#0d9488',
    },
    {
        id: 'sec-transport',
        slug: 'transport',
        name: 'خدمات النقل',
        description: 'خدمات نقل السيارات',
        icon: 'TruckIcon',
        status: 'ACTIVE',
        showInNavbar: true,
        showInMobileMenu: true,
        showInFooter: true,
        showInHomepage: true,
        showHomeButton: true,
        showHomeCard: true,
        navbarOrder: 5,
        footerOrder: 5,
        homepageOrder: 5,
        pageUrl: '/transport',
        primaryColor: '#f97316',
        secondaryColor: '#ea580c',
    },
    {
        id: 'sec-companies',
        slug: 'companies',
        name: 'الشركات',
        description: 'شركات السيارات',
        icon: 'BuildingOfficeIcon',
        status: 'ACTIVE',
        showInNavbar: true,
        showInMobileMenu: true,
        showInFooter: true,
        showInHomepage: true,
        showHomeButton: true,
        showHomeCard: true,
        navbarOrder: 6,
        footerOrder: 6,
        homepageOrder: 6,
        pageUrl: '/companies',
        primaryColor: '#8b5cf6',
        secondaryColor: '#7c3aed',
    },
];

export const DEFAULT_ELEMENTS: SiteElement[] = [
    { id: 'el-1', key: 'hero_banner', name: 'البانر الرئيسي', pageType: 'homepage', elementType: 'section', category: 'hero', isVisible: true, isInteractive: true, displayOrder: 1 },
    { id: 'el-2', key: 'search_bar', name: 'شريط البحث', pageType: 'homepage', elementType: 'component', category: 'navigation', isVisible: true, isInteractive: true, displayOrder: 2 },
    { id: 'el-3', key: 'main_categories', name: 'الأقسام الرئيسية', pageType: 'homepage', elementType: 'section', category: 'navigation', isVisible: true, isInteractive: true, displayOrder: 3 },
    { id: 'el-4', key: 'featured_auctions', name: 'المزادات المميزة', pageType: 'homepage', elementType: 'section', category: 'content', isVisible: true, isInteractive: true, displayOrder: 4 },
    { id: 'el-5', key: 'premium_cars_ads', name: 'الإعلانات المميزة', pageType: 'homepage', elementType: 'section', category: 'advertisement', isVisible: true, isInteractive: true, displayOrder: 5 },
    { id: 'el-6', key: 'business_packages', name: 'حزم الأعمال', pageType: 'homepage', elementType: 'section', category: 'advertisement', isVisible: true, isInteractive: true, displayOrder: 6 },
    { id: 'el-7', key: 'cta_section', name: 'قسم CTA', pageType: 'homepage', elementType: 'section', category: 'content', isVisible: true, isInteractive: true, displayOrder: 7 },
    { id: 'el-8', key: 'site_stats', name: 'إحصائيات الموقع', pageType: 'homepage', elementType: 'section', category: 'information', isVisible: true, isInteractive: false, displayOrder: 8 },
];

// ============================================
// Server-side Cache - تخزين مؤقت على الخادم
// ============================================

let serverCache: ContentVisibilityConfig | null = null;
let serverCacheTime: number = 0;
const SERVER_CACHE_DURATION = 60 * 1000; // 60 ثانية

/**
 * جلب إعدادات المحتوى من الخادم (للـ SSR)
 */
export async function getContentVisibilityServer(): Promise<ContentVisibilityConfig> {
    const now = Date.now();

    // التحقق من التخزين المؤقت
    if (serverCache && (now - serverCacheTime) < SERVER_CACHE_DURATION) {
        return { ...serverCache, source: 'cache' };
    }

    try {
        // استيراد Prisma ديناميكياً لتجنب مشاكل client-side
        const { default: prisma } = await import('../prisma');

        const [sections, elements] = await Promise.all([
            prisma.site_sections.findMany({
                orderBy: { navbarOrder: 'asc' },
            }),
            prisma.site_elements.findMany({
                orderBy: { displayOrder: 'asc' },
            }),
        ]);

        if (sections.length > 0) {
            serverCache = {
                sections: sections as SiteSection[],
                elements: elements as SiteElement[],
                lastUpdated: now,
                source: 'database',
            };
            serverCacheTime = now;
            return serverCache;
        }
    } catch (error) {
        console.warn('[ContentVisibility] خطأ في جلب البيانات من DB:', error);
    }

    // إرجاع البيانات الافتراضية
    return {
        sections: DEFAULT_SECTIONS,
        elements: DEFAULT_ELEMENTS,
        lastUpdated: now,
        source: 'default',
    };
}

/**
 * مسح التخزين المؤقت (يُستدعى عند تحديث البيانات)
 */
export function clearContentCache(): void {
    serverCache = null;
    serverCacheTime = 0;
}

// ============================================
// Helper Functions - دوال مساعدة
// ============================================

/**
 * فلترة الأقسام حسب الموقع
 */
export function filterSections(
    sections: SiteSection[],
    location: 'navbar' | 'mobile' | 'footer' | 'homepage'
): SiteSection[] {
    return sections
        .filter((s) => {
            if (s.status === 'DISABLED') return false;
            switch (location) {
                case 'navbar': return s.showInNavbar;
                case 'mobile': return s.showInMobileMenu;
                case 'footer': return s.showInFooter;
                case 'homepage': return s.showInHomepage;
                default: return true;
            }
        })
        .sort((a, b) => {
            switch (location) {
                case 'footer': return a.footerOrder - b.footerOrder;
                case 'homepage': return a.homepageOrder - b.homepageOrder;
                default: return a.navbarOrder - b.navbarOrder;
            }
        });
}

/**
 * التحقق من حالة القسم
 */
export function isSectionActive(sections: SiteSection[], slug: string): boolean {
    const section = sections.find((s) => s.slug === slug);
    return section?.status === 'ACTIVE';
}

/**
 * التحقق من ظهور القسم
 */
export function isSectionVisible(
    sections: SiteSection[],
    slug: string,
    location: 'navbar' | 'mobile' | 'footer' | 'homepage' | 'button' | 'card'
): boolean {
    const section = sections.find((s) => s.slug === slug);
    if (!section || section.status === 'DISABLED') return false;

    switch (location) {
        case 'navbar': return section.showInNavbar;
        case 'mobile': return section.showInMobileMenu;
        case 'footer': return section.showInFooter;
        case 'homepage': return section.showInHomepage;
        case 'button': return section.showHomeButton;
        case 'card': return section.showHomeCard;
        default: return true;
    }
}

/**
 * التحقق من ظهور العنصر
 */
export function isElementVisible(elements: SiteElement[], key: string): boolean {
    const element = elements.find((e) => e.key === key);
    return element?.isVisible ?? true;
}

/**
 * الحصول على قسم بواسطة slug
 */
export function getSection(sections: SiteSection[], slug: string): SiteSection | null {
    return sections.find((s) => s.slug === slug) || null;
}
