/**
 * API جلب الساحات للموقع العام
 * Public Yards API
 * 
 * إصلاح جذري: عرض جميع الساحات غير المعطلة
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    // إرجاع بيانات فارغة افتراضية في حالة أي خطأ
    const emptyResponse = {
        success: true,
        yards: [],
        stats: {
            total: 0,
            totalInDatabase: 0,
            totalCapacity: 0,
            activeAuctions: 0,
            auctionStats: { upcoming: 0, live: 0, sold: 0, ended: 0 },
        },
    };

    try {
        const { city, search } = req.query;

        // جلب عدد الساحات الكلي
        let totalCount = 0;
        try {
            totalCount = await prisma.yards.count();
            console.log(`[Yards API] إجمالي الساحات في قاعدة البيانات: ${totalCount}`);
        } catch (countError) {
            console.error('[Yards API] خطأ في عد الساحات:', countError);
            return res.status(200).json(emptyResponse);
        }

        // بناء شروط البحث - إظهار جميع الساحات ما عدا المعطلة
        const where: any = {
            // إظهار جميع الساحات ما عدا INACTIVE و SUSPENDED
            status: { notIn: ['INACTIVE', 'SUSPENDED'] }
        };

        // فلتر المدينة
        if (city && city !== 'all') {
            where.city = city as string;
        }

        // فلتر البحث
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { city: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        // جلب الساحات
        let yards: any[] = [];
        try {
            yards = await prisma.yards.findMany({
                where,
                include: {
                    auctions: {
                        where: {
                            status: { in: ['ACTIVE', 'PENDING', 'UPCOMING'] },
                        },
                        select: { id: true },
                    },
                },
                orderBy: [
                    { sortOrder: 'asc' },
                    { featured: 'desc' },
                    { verified: 'desc' },
                    { createdAt: 'desc' },
                ],
            });
            console.log(`[Yards API] تم جلب ${yards.length} ساحة`);
        } catch (queryError) {
            console.error('[Yards API] خطأ في استعلام الساحات:', queryError);
            // محاولة استعلام أبسط بدون include
            try {
                yards = await prisma.yards.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                });
                console.log('[Yards API] نجح الاستعلام البسيط');
            } catch (simpleError) {
                console.error('[Yards API] فشل الاستعلام البسيط أيضاً:', simpleError);
                throw simpleError;
            }
        }

        // تحويل البيانات للعرض
        const transformedYards = yards.map(yard => ({
            id: yard.id,
            slug: yard.slug,
            name: yard.name,
            description: yard.description,
            image: yard.image || '/placeholder.svg',
            images: yard.images || [],
            city: yard.city,
            area: yard.area,
            address: yard.address,
            phone: yard.phone,
            phones: yard.phones || [],
            email: yard.email,
            auctionDays: yard.auctionDays || [],
            auctionTimeFrom: yard.auctionTimeFrom,
            auctionTimeTo: yard.auctionTimeTo,
            capacity: yard.capacity,
            verified: yard.verified,
            featured: yard.featured,
            rating: yard.rating,
            reviewsCount: yard.reviewsCount || 0,
            activeAuctions: yard.auctions?.length || 0,
            services: yard.services || [],
            vehicleTypes: yard.vehicleTypes || [],
            managerName: yard.managerName,
            managerPhone: yard.managerPhone,
        }));

        // إحصائيات الساحات
        const stats = {
            total: yards.length,
            totalInDatabase: totalCount,
            totalCapacity: yards.reduce((sum, y) => sum + (y.capacity || 0), 0),
            activeAuctions: yards.reduce((sum, y) => sum + (y.auctions?.length || 0), 0),
        };

        // إحصائيات المزادات حسب الحالة
        const yardIds = yards.map(y => y.id);
        let auctionStats = { upcoming: 0, live: 0, sold: 0, ended: 0 };

        if (yardIds.length > 0) {
            try {
                const [upcomingCount, liveCount, endedCount] = await Promise.all([
                    // مزادات قادمة (PENDING أو UPCOMING)
                    prisma.auctions.count({
                        where: {
                            yardId: { in: yardIds },
                            status: { in: ['PENDING', 'UPCOMING'] },
                        },
                    }),
                    // مزادات مباشرة (ACTIVE)
                    prisma.auctions.count({
                        where: {
                            yardId: { in: yardIds },
                            status: 'ACTIVE',
                        },
                    }),
                    // مزادات منتهية (ENDED أو CANCELLED)
                    prisma.auctions.count({
                        where: {
                            yardId: { in: yardIds },
                            status: { in: ['ENDED', 'CANCELLED'] },
                        },
                    }),
                ]);

                auctionStats = {
                    upcoming: upcomingCount,
                    live: liveCount,
                    sold: 0, // لا يوجد حالة SOLD في enum
                    ended: endedCount,
                };
            } catch (statsError) {
                console.error('[Yards API] خطأ في إحصائيات المزادات:', statsError);
            }
        }

        return res.status(200).json({
            success: true,
            yards: transformedYards,
            stats: {
                ...stats,
                auctionStats,
            },
        });
    } catch (error: unknown) {
        console.error('[Yards API Error]:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return res.status(200).json({
            ...emptyResponse,
            message: process.env.NODE_ENV === 'development'
                ? `خطأ: ${errorMessage}`
                : 'لا توجد ساحات حالياً',
        });
    }
}
