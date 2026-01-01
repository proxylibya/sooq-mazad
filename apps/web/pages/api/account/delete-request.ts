/**
 * API لطلب حذف الحساب وإلغائه
 * POST: طلب حذف الحساب (يبدأ العد التنازلي 30 يوم)
 * DELETE: إلغاء طلب الحذف
 * GET: الحصول على حالة طلب الحذف
 */

import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const DELETION_DELAY_DAYS = 30;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
        return res.status(401).json({ error: 'غير مصرح' });
    }

    const userId = session.user.id;

    try {
        switch (req.method) {
            case 'GET': {
                // الحصول على حالة طلب الحذف
                const user = await prisma.users.findUnique({
                    where: { id: userId },
                    select: {
                        scheduledDeletionAt: true,
                        deletionRequestedAt: true,
                        isDeleted: true,
                    },
                });

                if (!user) {
                    return res.status(404).json({ error: 'المستخدم غير موجود' });
                }

                return res.status(200).json({
                    hasPendingDeletion: !!user.scheduledDeletionAt,
                    scheduledDeletionAt: user.scheduledDeletionAt,
                    deletionRequestedAt: user.deletionRequestedAt,
                    isDeleted: user.isDeleted,
                });
            }

            case 'POST': {
                // طلب حذف الحساب
                const { password, reason } = req.body;

                // التحقق من المستخدم
                const user = await prisma.users.findUnique({
                    where: { id: userId },
                    include: {
                        user_passwords: true,
                    },
                });

                if (!user) {
                    return res.status(404).json({ error: 'المستخدم غير موجود' });
                }

                // التحقق من عدم وجود طلب حذف مسبق
                if (user.scheduledDeletionAt) {
                    return res.status(400).json({
                        error: 'يوجد طلب حذف معلق بالفعل',
                        scheduledDeletionAt: user.scheduledDeletionAt,
                    });
                }

                // حساب تاريخ الحذف (30 يوم من الآن)
                const scheduledDeletionAt = new Date();
                scheduledDeletionAt.setDate(scheduledDeletionAt.getDate() + DELETION_DELAY_DAYS);

                // تحديث المستخدم
                await prisma.users.update({
                    where: { id: userId },
                    data: {
                        scheduledDeletionAt,
                        deletionRequestedAt: new Date(),
                        status: 'PENDING_DELETION',
                    },
                });

                // تسجيل النشاط
                await prisma.activity_logs.create({
                    data: {
                        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        userId,
                        action: 'ACCOUNT_DELETION_REQUESTED',
                        details: JSON.stringify({
                            reason: reason || 'لم يتم تحديد سبب',
                            scheduledDeletionAt: scheduledDeletionAt.toISOString(),
                        }),
                        ipAddress: req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown',
                        userAgent: req.headers['user-agent'] || 'unknown',
                    },
                });

                return res.status(200).json({
                    success: true,
                    message: 'تم تقديم طلب حذف الحساب. سيتم حذف حسابك بعد 30 يوم.',
                    scheduledDeletionAt,
                    deletionRequestedAt: new Date(),
                });
            }

            case 'DELETE': {
                // إلغاء طلب الحذف
                const user = await prisma.users.findUnique({
                    where: { id: userId },
                    select: {
                        scheduledDeletionAt: true,
                    },
                });

                if (!user) {
                    return res.status(404).json({ error: 'المستخدم غير موجود' });
                }

                if (!user.scheduledDeletionAt) {
                    return res.status(400).json({ error: 'لا يوجد طلب حذف معلق' });
                }

                // إلغاء طلب الحذف
                await prisma.users.update({
                    where: { id: userId },
                    data: {
                        scheduledDeletionAt: null,
                        deletionRequestedAt: null,
                        status: 'ACTIVE',
                    },
                });

                // تسجيل النشاط
                await prisma.activity_logs.create({
                    data: {
                        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        userId,
                        action: 'ACCOUNT_DELETION_CANCELLED',
                        details: JSON.stringify({
                            cancelledAt: new Date().toISOString(),
                        }),
                        ipAddress: req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown',
                        userAgent: req.headers['user-agent'] || 'unknown',
                    },
                });

                return res.status(200).json({
                    success: true,
                    message: 'تم إلغاء طلب حذف الحساب بنجاح',
                });
            }

            default:
                res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
                return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
        }
    } catch (error) {
        console.error('خطأ في معالجة طلب حذف الحساب:', error);
        return res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
}
