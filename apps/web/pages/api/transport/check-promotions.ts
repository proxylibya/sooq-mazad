/**
 * API للتحقق من انتهاء صلاحية الترويج وتحديث الحالات
 * Check Transport Promotions Expiry API
 */

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const now = new Date();

        // البحث عن الخدمات التي انتهت صلاحية ترويجها
        const expiredPromotions = await prisma.transport_services.findMany({
            where: {
                featured: true,
                promotionEndDate: {
                    lt: now,
                },
            },
            select: {
                id: true,
                title: true,
                userId: true,
                promotionPackage: true,
                promotionEndDate: true,
            },
        });

        if (expiredPromotions.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'لا توجد ترويجات منتهية الصلاحية',
                expired: 0,
            });
        }

        // تحديث الخدمات المنتهية
        const updateResult = await prisma.transport_services.updateMany({
            where: {
                id: {
                    in: expiredPromotions.map((p) => p.id),
                },
            },
            data: {
                featured: false,
                promotionPackage: 'free',
                promotionPriority: 0,
                updatedAt: new Date(),
            },
        });

        // إنشاء إشعارات للمستخدمين
        for (const promo of expiredPromotions) {
            try {
                await prisma.notifications.create({
                    data: {
                        id: `notif_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`,
                        userId: promo.userId,
                        type: 'INFO',
                        title: 'انتهت صلاحية الترويج',
                        message: `انتهت صلاحية ترويج خدمتك "${promo.title}". يمكنك تجديد الترويج للظهور في المقدمة مرة أخرى.`,
                        data: JSON.stringify({
                            serviceId: promo.id,
                            previousPackage: promo.promotionPackage,
                        }),
                        isRead: false,
                    },
                });
            } catch {
                // تجاهل أخطاء الإشعارات
            }
        }

        // البحث عن الخدمات التي ستنتهي صلاحيتها قريباً (خلال 3 أيام)
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        const expiringSoon = await prisma.transport_services.findMany({
            where: {
                featured: true,
                promotionEndDate: {
                    gte: now,
                    lte: threeDaysFromNow,
                },
            },
            select: {
                id: true,
                title: true,
                userId: true,
                promotionEndDate: true,
            },
        });

        // إنشاء إشعارات تذكير
        for (const promo of expiringSoon) {
            const daysLeft = Math.ceil(
                (promo.promotionEndDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );
            try {
                await prisma.notifications.create({
                    data: {
                        id: `notif_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`,
                        userId: promo.userId,
                        type: 'WARNING',
                        title: 'ترويجك ينتهي قريباً',
                        message: `ترويج خدمتك "${promo.title}" سينتهي خلال ${daysLeft} ${daysLeft === 1 ? 'يوم' : 'أيام'}. جدد الآن للحفاظ على ظهورك المميز.`,
                        data: JSON.stringify({
                            serviceId: promo.id,
                            daysLeft,
                        }),
                        isRead: false,
                    },
                });
            } catch {
                // تجاهل أخطاء الإشعارات
            }
        }

        return res.status(200).json({
            success: true,
            message: 'تم التحقق من الترويجات بنجاح',
            expired: updateResult.count,
            expiringSoon: expiringSoon.length,
            details: {
                expiredServices: expiredPromotions.map((p) => ({
                    id: p.id,
                    title: p.title,
                })),
                expiringServices: expiringSoon.map((p) => ({
                    id: p.id,
                    title: p.title,
                    expiresAt: p.promotionEndDate,
                })),
            },
        });
    } catch (error) {
        console.error('خطأ في التحقق من الترويجات:', error);
        return res.status(500).json({
            success: false,
            error: 'خطأ في الخادم',
        });
    }
}
