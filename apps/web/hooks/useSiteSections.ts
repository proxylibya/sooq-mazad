/**
 * Hook لجلب إعدادات الأقسام من قاعدة البيانات
 * يستخدم في Navbar و Footer و Homepage لتطبيق إعدادات الإظهار/الإخفاء
 */

import { useEffect, useState } from 'react';

export interface SiteSection {
    id: string;
    slug: string;
    name: string;
    description?: string;
    icon?: string;
    status: 'ACTIVE' | 'DISABLED' | 'MAINTENANCE' | 'COMING_SOON' | 'MEMBERS_ONLY';
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

interface UseSiteSectionsResult {
    sections: SiteSection[];
    loading: boolean;
    error: string | null;
    // دوال مساعدة
    getSectionBySlug: (slug: string) => SiteSection | undefined;
    isVisible: (slug: string, location: 'navbar' | 'footer' | 'homepage' | 'mobileMenu') => boolean;
    getNavbarSections: () => SiteSection[];
    getFooterSections: () => SiteSection[];
    getHomepageSections: () => SiteSection[];
    getMobileMenuSections: () => SiteSection[];
}

// Cache للبيانات لتجنب الطلبات المتكررة
let cachedSections: SiteSection[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // دقيقة واحدة

export function useSiteSections(): UseSiteSectionsResult {
    const [sections, setSections] = useState<SiteSection[]>(cachedSections || []);
    const [loading, setLoading] = useState(!cachedSections);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSections = async () => {
            // استخدام الـ cache إذا كان حديثاً
            if (cachedSections && Date.now() - lastFetchTime < CACHE_DURATION) {
                setSections(cachedSections);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch('/api/site-sections', {
                    credentials: 'same-origin',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.sections) {
                        cachedSections = data.sections;
                        lastFetchTime = Date.now();
                        setSections(data.sections);
                    }
                }
            } catch (err) {
                console.error('Error fetching site sections:', err);
                setError('فشل في جلب إعدادات الأقسام');
            } finally {
                setLoading(false);
            }
        };

        fetchSections();
    }, []);

    // جلب قسم بواسطة slug
    const getSectionBySlug = (slug: string): SiteSection | undefined => {
        return sections.find((s) => s.slug === slug);
    };

    // التحقق من إمكانية الظهور
    const isVisible = (
        slug: string,
        location: 'navbar' | 'footer' | 'homepage' | 'mobileMenu',
    ): boolean => {
        const section = getSectionBySlug(slug);
        if (!section) return true; // افتراضي: يظهر إذا لم يوجد تكوين

        // القسم معطل = لا يظهر في أي مكان
        if (section.status === 'DISABLED') return false;

        switch (location) {
            case 'navbar':
                return section.showInNavbar;
            case 'footer':
                return section.showInFooter;
            case 'homepage':
                return section.showInHomepage;
            case 'mobileMenu':
                return section.showInMobileMenu;
            default:
                return true;
        }
    };

    // جلب أقسام النافبار مرتبة
    const getNavbarSections = (): SiteSection[] => {
        return sections
            .filter((s) => s.status !== 'DISABLED' && s.showInNavbar)
            .sort((a, b) => a.navbarOrder - b.navbarOrder);
    };

    // جلب أقسام الفوتر مرتبة
    const getFooterSections = (): SiteSection[] => {
        return sections
            .filter((s) => s.status !== 'DISABLED' && s.showInFooter)
            .sort((a, b) => a.footerOrder - b.footerOrder);
    };

    // جلب أقسام الصفحة الرئيسية مرتبة
    const getHomepageSections = (): SiteSection[] => {
        return sections
            .filter((s) => s.status !== 'DISABLED' && s.showInHomepage)
            .sort((a, b) => a.homepageOrder - b.homepageOrder);
    };

    // جلب أقسام قائمة الموبايل مرتبة
    const getMobileMenuSections = (): SiteSection[] => {
        return sections
            .filter((s) => s.status !== 'DISABLED' && s.showInMobileMenu)
            .sort((a, b) => a.navbarOrder - b.navbarOrder);
    };

    return {
        sections,
        loading,
        error,
        getSectionBySlug,
        isVisible,
        getNavbarSections,
        getFooterSections,
        getHomepageSections,
        getMobileMenuSections,
    };
}

// دالة لتحديث الـ cache (تستخدم بعد حفظ التغييرات في لوحة التحكم)
export function invalidateSiteSectionsCache() {
    cachedSections = null;
    lastFetchTime = 0;
}

export default useSiteSections;
