/**
 * خدمة المشاهدات الموحدة - Unified Views Service
 * ================================================
 * تجمع جميع عمليات المشاهدات في مكان واحد لتجنب التكرار والتضارب
 * 
 * @author SooqMazad Team
 * @version 1.0.0
 */

import { prisma } from '../../../lib/prisma';

// Logger بسيط للتوافق
const logger = {
    info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
    warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args),
    error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args),
    debug: (msg: string, ...args: any[]) => console.debug(`[DEBUG] ${msg}`, ...args),
};

// ============================================
// الأنواع والواجهات
// ============================================

export type ContentType = 'car' | 'auction' | 'showroom' | 'user' | 'yard';

export interface ViewEventData {
    contentId: string;
    contentType: ContentType;
    userId?: string | null;
    sessionId?: string;
    page?: string;
    referrer?: string;
    deviceInfo?: DeviceInfo;
    locationInfo?: LocationInfo;
}

export interface DeviceInfo {
    browser: string;
    os: string;
    device: 'Desktop' | 'Mobile' | 'Tablet';
}

export interface LocationInfo {
    country: string;
    city: string;
}

export interface ViewsStats {
    totalViews: number;
    todayViews: number;
    weekViews: number;
    monthViews: number;
    deviceBreakdown: {
        mobile: number;
        desktop: number;
        tablet: number;
    };
    sourceBreakdown: {
        direct: number;
        search: number;
        social: number;
        referral: number;
    };
}

// ============================================
// دوال مساعدة موحدة
// ============================================

/**
 * تحليل معلومات المتصفح والجهاز من User-Agent
 */
export function parseUserAgent(userAgent: string): DeviceInfo {
    let browser = 'Unknown';
    let os = 'Unknown';
    let device: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';

    // Browser detection
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edg')) browser = 'Edge';
    else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera';

    // OS detection
    if (userAgent.includes('Windows NT')) os = 'Windows';
    else if (userAgent.includes('Mac OS X')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

    // Device detection
    if (
        userAgent.includes('Mobile') ||
        (userAgent.includes('Android') && !userAgent.includes('Tablet'))
    ) {
        device = 'Mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
        device = 'Tablet';
    }

    return { browser, os, device };
}

/**
 * استخراج معلومات الموقع من عنوان IP
 * ملاحظة: في الإنتاج، استخدم خدمة GeoIP مثل MaxMind
 */
export function getLocationFromIP(ip: string): LocationInfo {
    // Default to Libya for local/private IPs
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return { country: 'Libya', city: 'Tripoli' };
    }

    // في الإنتاج، دمج مع MaxMind أو خدمة مشابهة
    return { country: 'Libya', city: 'Tripoli' };
}

/**
 * توليد معرف جلسة فريد
 */
export function generateSessionId(ip: string, userAgent: string): string {
    const timestamp = Date.now();
    const hourTimestamp = Math.floor(timestamp / (1000 * 60 * 60)); // Round to hour
    return Buffer.from(`${ip}-${userAgent}-${hourTimestamp}`).toString('base64').substring(0, 16);
}

/**
 * استخراج مصدر الزيارة من referrer
 */
export function getTrafficSource(referrer?: string): 'direct' | 'search' | 'social' | 'referral' {
    if (!referrer) return 'direct';

    const ref = referrer.toLowerCase();

    // محركات البحث
    if (ref.includes('google') || ref.includes('bing') || ref.includes('yahoo') || ref.includes('duckduckgo')) {
        return 'search';
    }

    // وسائل التواصل الاجتماعي
    if (ref.includes('facebook') || ref.includes('twitter') || ref.includes('instagram') ||
        ref.includes('linkedin') || ref.includes('tiktok') || ref.includes('whatsapp')) {
        return 'social';
    }

    return 'referral';
}

// ============================================
// خدمة المشاهدات الموحدة
// ============================================

class ViewsService {
    private static instance: ViewsService;

    private constructor() { }

    public static getInstance(): ViewsService {
        if (!ViewsService.instance) {
            ViewsService.instance = new ViewsService();
        }
        return ViewsService.instance;
    }

    /**
     * تسجيل مشاهدة لمحتوى معين (سيارة، مزاد، معرض، إلخ)
     */
    async recordView(data: ViewEventData): Promise<boolean> {
        try {
            const { contentId, contentType, userId, sessionId, page, referrer, deviceInfo, locationInfo } = data;

            if (!contentId || !contentType) {
                logger.warn('[ViewsService] معرف المحتوى أو نوعه مفقود');
                return false;
            }

            // 1. تحديث عداد المشاهدات في الجدول الأساسي
            await this.incrementViewCount(contentId, contentType);

            // 2. تسجيل حدث المشاهدة في جدول التحليلات (للإحصائيات التفصيلية)
            if (sessionId || userId) {
                await this.recordAnalyticsEvent({
                    contentId,
                    contentType,
                    userId,
                    sessionId,
                    page,
                    referrer,
                    deviceInfo,
                    locationInfo,
                });
            }

            logger.info(`[ViewsService] تم تسجيل مشاهدة: ${contentType}/${contentId}`);
            return true;
        } catch (error) {
            logger.error('[ViewsService] خطأ في تسجيل المشاهدة:', error);
            return false;
        }
    }

    /**
     * زيادة عداد المشاهدات في الجدول الأساسي
     */
    private async incrementViewCount(contentId: string, contentType: ContentType): Promise<void> {
        try {
            switch (contentType) {
                case 'car':
                    await prisma.cars.update({
                        where: { id: contentId },
                        data: { views: { increment: 1 } },
                    });
                    break;

                case 'auction':
                    await prisma.auctions.update({
                        where: { id: contentId },
                        data: { views: { increment: 1 } },
                    });
                    break;

                case 'showroom':
                    await prisma.showrooms.update({
                        where: { id: contentId },
                        data: { views: { increment: 1 } },
                    });
                    break;

                case 'yard':
                    // الساحات لا تحتوي على حقل views - نتخطى
                    break;

                default:
                    logger.warn(`[ViewsService] نوع محتوى غير مدعوم: ${contentType}`);
            }
        } catch (error) {
            // تجاهل الأخطاء إذا كان المحتوى غير موجود
            logger.debug(`[ViewsService] فشل تحديث عداد المشاهدات لـ ${contentType}/${contentId}`);
        }
    }

    /**
     * تسجيل حدث المشاهدة في جدول التحليلات
     */
    private async recordAnalyticsEvent(data: ViewEventData): Promise<void> {
        try {
            const eventId = `view_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            await prisma.analytics_events.create({
                data: {
                    id: eventId,
                    sessionId: data.sessionId || 'anonymous',
                    eventType: 'USER_ACTION' as any,
                    eventName: `${data.contentType}_view`,
                    category: data.contentType,
                    label: data.contentId,
                    page: data.page,
                    referrer: data.referrer,
                    browser: data.deviceInfo?.browser,
                    os: data.deviceInfo?.os,
                    device: data.deviceInfo?.device,
                    country: data.locationInfo?.country,
                    city: data.locationInfo?.city,
                    ...(data.userId ? { users: { connect: { id: data.userId } } } : {}),
                },
            });
        } catch (error) {
            // تجاهل أخطاء التسجيل - لا تؤثر على تجربة المستخدم
            logger.debug('[ViewsService] فشل تسجيل حدث التحليلات');
        }
    }

    /**
     * جلب إحصائيات المشاهدات لمحتوى معين
     */
    async getViewsStats(contentId: string, contentType: ContentType): Promise<ViewsStats> {
        try {
            const now = new Date();
            const todayStart = new Date(now.setHours(0, 0, 0, 0));
            const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            // جلب إجمالي المشاهدات من الجدول الأساسي
            const totalViews = await this.getTotalViews(contentId, contentType);

            // جلب المشاهدات من جدول التحليلات للفترات الزمنية
            const [todayViews, weekViews, monthViews] = await Promise.all([
                this.getViewsCount(contentId, contentType, todayStart),
                this.getViewsCount(contentId, contentType, weekStart),
                this.getViewsCount(contentId, contentType, monthStart),
            ]);

            // جلب تفصيل الأجهزة
            const deviceBreakdown = await this.getDeviceBreakdown(contentId, contentType);

            // جلب تفصيل المصادر
            const sourceBreakdown = await this.getSourceBreakdown(contentId, contentType);

            return {
                totalViews,
                todayViews,
                weekViews,
                monthViews,
                deviceBreakdown,
                sourceBreakdown,
            };
        } catch (error) {
            logger.error('[ViewsService] خطأ في جلب إحصائيات المشاهدات:', error);
            return {
                totalViews: 0,
                todayViews: 0,
                weekViews: 0,
                monthViews: 0,
                deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
                sourceBreakdown: { direct: 0, search: 0, social: 0, referral: 0 },
            };
        }
    }

    /**
     * جلب إجمالي المشاهدات من الجدول الأساسي
     */
    private async getTotalViews(contentId: string, contentType: ContentType): Promise<number> {
        try {
            let result: any;

            switch (contentType) {
                case 'car':
                    result = await prisma.cars.findUnique({
                        where: { id: contentId },
                        select: { views: true },
                    });
                    break;

                case 'auction':
                    result = await prisma.auctions.findUnique({
                        where: { id: contentId },
                        select: { views: true },
                    });
                    break;

                case 'showroom':
                    result = await prisma.showrooms.findUnique({
                        where: { id: contentId },
                        select: { views: true },
                    });
                    break;

                default:
                    return 0;
            }

            return result?.views || 0;
        } catch {
            return 0;
        }
    }

    /**
     * جلب عدد المشاهدات من جدول التحليلات لفترة معينة
     */
    private async getViewsCount(contentId: string, contentType: ContentType, since: Date): Promise<number> {
        try {
            const count = await prisma.analytics_events.count({
                where: {
                    eventType: 'USER_ACTION',
                    category: contentType,
                    label: contentId,
                    createdAt: { gte: since },
                },
            });
            return count;
        } catch {
            return 0;
        }
    }

    /**
     * جلب تفصيل المشاهدات حسب الجهاز
     */
    private async getDeviceBreakdown(contentId: string, contentType: ContentType): Promise<{ mobile: number; desktop: number; tablet: number; }> {
        try {
            const events = await prisma.analytics_events.groupBy({
                by: ['device'],
                where: {
                    eventType: 'USER_ACTION',
                    category: contentType,
                    label: contentId,
                },
                _count: { id: true },
            });

            const breakdown = { mobile: 0, desktop: 0, tablet: 0 };
            events.forEach((e: any) => {
                const device = (e.device || 'Desktop').toLowerCase();
                if (device === 'mobile') breakdown.mobile = e._count.id;
                else if (device === 'tablet') breakdown.tablet = e._count.id;
                else breakdown.desktop = e._count.id;
            });

            return breakdown;
        } catch {
            return { mobile: 0, desktop: 0, tablet: 0 };
        }
    }

    /**
     * جلب تفصيل المشاهدات حسب المصدر
     */
    private async getSourceBreakdown(contentId: string, contentType: ContentType): Promise<{ direct: number; search: number; social: number; referral: number; }> {
        try {
            const events = await prisma.analytics_events.findMany({
                where: {
                    eventType: 'USER_ACTION',
                    category: contentType,
                    label: contentId,
                },
                select: { referrer: true },
            });

            const breakdown = { direct: 0, search: 0, social: 0, referral: 0 };
            events.forEach((e: any) => {
                const source = getTrafficSource(e.referrer);
                breakdown[source]++;
            });

            return breakdown;
        } catch {
            return { direct: 0, search: 0, social: 0, referral: 0 };
        }
    }

    /**
     * جلب المشاهدات اليومية لآخر n يوم
     */
    async getDailyViews(contentId: string, contentType: ContentType, days: number = 7): Promise<Array<{ date: string; views: number; }>> {
        try {
            const result: Array<{ date: string; views: number; }> = [];

            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);

                const nextDay = new Date(date);
                nextDay.setDate(nextDay.getDate() + 1);

                const count = await prisma.analytics_events.count({
                    where: {
                        eventType: 'USER_ACTION',
                        category: contentType,
                        label: contentId,
                        createdAt: {
                            gte: date,
                            lt: nextDay,
                        },
                    },
                });

                result.push({
                    date: date.toISOString().split('T')[0],
                    views: count,
                });
            }

            return result;
        } catch {
            return [];
        }
    }

    /**
     * تسجيل مشاهدة سيارة
     */
    async recordCarView(carId: string, data?: Partial<ViewEventData>): Promise<boolean> {
        return this.recordView({
            contentId: carId,
            contentType: 'car',
            ...data,
        });
    }

    /**
     * تسجيل مشاهدة مزاد
     */
    async recordAuctionView(auctionId: string, data?: Partial<ViewEventData>): Promise<boolean> {
        return this.recordView({
            contentId: auctionId,
            contentType: 'auction',
            ...data,
        });
    }

    /**
     * تسجيل مشاهدة معرض
     */
    async recordShowroomView(showroomId: string, data?: Partial<ViewEventData>): Promise<boolean> {
        return this.recordView({
            contentId: showroomId,
            contentType: 'showroom',
            ...data,
        });
    }
}

// تصدير النسخة الوحيدة من الخدمة
export const viewsService = ViewsService.getInstance();

// تصدير الدوال المساعدة للاستخدام المباشر
export default viewsService;
