/**
 * Server-Side Content Fetching - جلب البيانات من الخادم
 * =====================================================
 * 
 * يُستخدم في getServerSideProps أو getStaticProps
 * لجلب إعدادات المحتوى قبل تحميل الصفحة
 */

import type { ContentVisibilityConfig } from './index';
import { DEFAULT_ELEMENTS, DEFAULT_SECTIONS } from './index';

// تخزين مؤقت على مستوى الخادم
let cachedConfig: ContentVisibilityConfig | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30 * 1000; // 30 ثانية

/**
 * جلب إعدادات المحتوى للـ SSR
 * يُستخدم في _app.tsx أو الصفحات الفردية
 */
export async function getContentVisibilityConfig(): Promise<ContentVisibilityConfig> {
    const now = Date.now();

    // التحقق من التخزين المؤقت
    if (cachedConfig && (now - cacheTimestamp) < CACHE_DURATION) {
        return { ...cachedConfig, source: 'cache' };
    }

    try {
        // استيراد Prisma ديناميكياً
        const prismaModule = await import('../../lib/prisma');
        const prisma = prismaModule.default;

        // جلب البيانات من قاعدة البيانات
        const [sections, elements] = await Promise.all([
            prisma.site_sections.findMany({
                orderBy: { navbarOrder: 'asc' },
            }).catch(() => []),
            prisma.site_elements.findMany({
                orderBy: { displayOrder: 'asc' },
            }).catch(() => []),
        ]);

        // إذا وجدت بيانات، استخدمها
        if (sections.length > 0) {
            cachedConfig = {
                sections: sections as any,
                elements: elements as any,
                lastUpdated: now,
                source: 'database',
            };
            cacheTimestamp = now;
            return cachedConfig;
        }
    } catch (error) {
        console.warn('[SSR] فشل في جلب إعدادات المحتوى:', error);
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
 * مسح التخزين المؤقت
 */
export function invalidateContentCache(): void {
    cachedConfig = null;
    cacheTimestamp = 0;
}

/**
 * دالة مساعدة للحصول على البيانات في getServerSideProps
 */
export async function withContentVisibility<T extends Record<string, any>>(
    getServerSidePropsFunc?: (context: any) => Promise<{ props: T; }>
) {
    return async (context: any) => {
        const contentConfig = await getContentVisibilityConfig();

        let additionalProps: T = {} as T;

        if (getServerSidePropsFunc) {
            const result = await getServerSidePropsFunc(context);
            additionalProps = result.props;
        }

        return {
            props: {
                ...additionalProps,
                contentVisibilityConfig: contentConfig,
            },
        };
    };
}
