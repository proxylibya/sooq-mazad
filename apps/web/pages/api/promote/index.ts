/**
 * API لترويج الإعلانات
 * POST: إنشاء ترويج جديد
 * GET: الحصول على حالة الترويج
 */

import prisma from '@/lib/prisma';
import {
    EntityType,
    PROMOTION_PACKAGES,
    PromotionPackage,
    calculatePromotionEndDate,
} from '@/lib/promotion/promotion-system';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface PromoteRequest {
    entityType: EntityType;
    entityId: string;
    packageType: PromotionPackage;
    paymentMethod: 'wallet' | 'libyana' | 'madar';
}

interface JwtPayload {
    userId: string;
    phone: string;
    role: string;
}

/**
 * دالة للحصول على المستخدم من الـ token
 */
async function getUserFromRequest(req: NextApiRequest): Promise<{ id: string; } | null> {
    try {
        // محاولة الحصول على التوكن من الـ cookie
        const tokenFromCookie = req.cookies?.token;

        // محاولة الحصول على التوكن من الـ header
        const authHeader = req.headers.authorization;
        const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

        const token = tokenFromCookie || tokenFromHeader;

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        if (!decoded?.userId) {
            return null;
        }

        return { id: decoded.userId };
    } catch (error) {
        console.error('خطأ في التحقق من التوكن:', error);
        return null;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        return handlePromote(req, res);
    } else if (req.method === 'GET') {
        return handleGetStatus(req, res);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

async function handlePromote(req: NextApiRequest, res: NextApiResponse) {
    try {
        const user = await getUserFromRequest(req);
        if (!user?.id) {
            return res.status(401).json({ error: 'غير مصرح - سجل الدخول أولاً', code: 'UNAUTHORIZED' });
        }

        const userId = user.id;
        const { entityType: rawEntityType, entityId, packageType, paymentMethod } = req.body as PromoteRequest;

        // تحويل أنواع الإعلانات - instant و marketplace تعني سيارة في السوق الفوري
        const entityType = (['instant', 'marketplace'].includes(rawEntityType as string) ? 'car' : rawEntityType) as EntityType;

        // التحقق من صحة البيانات
        if (!entityType || !entityId || !packageType) {
            return res.status(400).json({ error: 'بيانات غير مكتملة', code: 'INVALID_DATA' });
        }

        // الحصول على تفاصيل الباقة
        const packageConfig = PROMOTION_PACKAGES[packageType];
        if (!packageConfig || packageConfig.price === 0) {
            return res.status(400).json({ error: 'باقة غير صالحة', code: 'INVALID_PACKAGE' });
        }

        // التحقق من ملكية الإعلان
        console.log('[Promote API] التحقق من الملكية:', { entityType, entityId, userId });
        const ownershipCheck = await checkOwnership(entityType, entityId, userId);
        console.log('[Promote API] نتيجة التحقق:', ownershipCheck);
        if (!ownershipCheck.valid) {
            return res.status(403).json({
                error: 'لا تملك صلاحية ترويج هذا الإعلان',
                code: 'NOT_OWNER',
                debug: { entityType, entityId, userId }
            });
        }

        // معالجة الدفع
        if (paymentMethod === 'wallet') {
            // التحقق من رصيد المحفظة
            const wallet = await prisma.wallets.findUnique({
                where: { userId },
                include: { local_wallets: true },
            });

            if (!wallet || !wallet.local_wallets) {
                return res.status(400).json({ error: 'المحفظة غير موجودة', code: 'NO_WALLET' });
            }

            const balance = wallet.local_wallets.balance || 0;
            if (balance < packageConfig.price) {
                return res.status(400).json({
                    error: 'رصيد المحفظة غير كافٍ',
                    code: 'INSUFFICIENT_BALANCE',
                    required: packageConfig.price,
                    available: balance,
                });
            }

            // خصم المبلغ من المحفظة
            await prisma.local_wallets.update({
                where: { walletId: wallet.id },
                data: { balance: { decrement: packageConfig.price } },
            });

            // تسجيل المعاملة
            await prisma.transactions.create({
                data: {
                    id: uuidv4(),
                    type: 'DEBIT',
                    amount: packageConfig.price,
                    currency: 'LYD',
                    description: `ترويج ${getEntityTypeName(entityType)} - ${packageConfig.name}`,
                    status: 'COMPLETED',
                    walletId: wallet.id,
                    metadata: JSON.stringify({
                        entityType,
                        entityId,
                        packageType,
                        days: packageConfig.days,
                    }),
                },
            });
        } else if (paymentMethod === 'libyana' || paymentMethod === 'madar') {
            // ⚠️ الدفع عبر بوابات الدفع الخارجية - يجب إنشاء طلب دفع معلق
            // لا يتم تفعيل الترويج حتى يتم تأكيد الدفع من البوابة

            // إنشاء طلب دفع معلق
            const pendingPayment = await prisma.promotion_transactions.create({
                data: {
                    id: uuidv4(),
                    userId,
                    entityType,
                    entityId,
                    packageType,
                    amount: packageConfig.price,
                    currency: 'LYD',
                    paymentMethod,
                    days: packageConfig.days,
                    startDate: null, // سيتم تحديدها عند تأكيد الدفع
                    endDate: null,
                    status: 'PENDING', // معلق حتى تأكيد الدفع
                },
            });

            // إرجاع رابط الدفع للمستخدم
            return res.status(200).json({
                success: true,
                requiresPayment: true,
                paymentId: pendingPayment.id,
                message: 'يرجى إكمال الدفع عبر ' + (paymentMethod === 'libyana' ? 'ليبيانا' : 'مدار'),
                paymentUrl: `/payment/${paymentMethod}?transactionId=${pendingPayment.id}&amount=${packageConfig.price}`,
                data: {
                    entityType,
                    entityId,
                    packageType,
                    amount: packageConfig.price,
                },
            });
        } else {
            return res.status(400).json({
                error: 'طريقة الدفع غير مدعومة',
                code: 'INVALID_PAYMENT_METHOD'
            });
        }

        // حساب تواريخ الترويج (فقط للدفع عبر المحفظة)
        const startDate = new Date();
        const endDate = calculatePromotionEndDate(startDate, packageConfig.days);

        // تحديث الإعلان
        await updateEntityPromotion(entityType, entityId, {
            featured: true,
            promotionPackage: packageType,
            promotionDays: packageConfig.days,
            promotionStartDate: startDate,
            promotionEndDate: endDate,
            promotionPriority: packageConfig.priority,
        });

        // تسجيل عملية الترويج
        await prisma.promotion_transactions.create({
            data: {
                id: uuidv4(),
                userId,
                entityType,
                entityId,
                packageType,
                amount: packageConfig.price,
                currency: 'LYD',
                paymentMethod,
                days: packageConfig.days,
                startDate,
                endDate,
                status: 'ACTIVE',
            },
        });

        return res.status(200).json({
            success: true,
            message: 'تم ترويج الإعلان بنجاح',
            data: {
                entityType,
                entityId,
                packageType,
                startDate,
                endDate,
                days: packageConfig.days,
            },
        });
    } catch (error) {
        console.error('خطأ في ترويج الإعلان:', error);
        return res.status(500).json({ error: 'حدث خطأ في الخادم', code: 'SERVER_ERROR' });
    }
}

async function handleGetStatus(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { entityType, entityId } = req.query;

        if (!entityType || !entityId) {
            return res.status(400).json({ error: 'بيانات غير مكتملة' });
        }

        const entity = await getEntityPromotion(entityType as EntityType, entityId as string);

        if (!entity) {
            return res.status(404).json({ error: 'الإعلان غير موجود' });
        }

        const isActive =
            entity.featured && entity.promotionEndDate && new Date(entity.promotionEndDate) > new Date();

        return res.status(200).json({
            success: true,
            data: {
                featured: entity.featured,
                promotionPackage: entity.promotionPackage,
                promotionDays: entity.promotionDays,
                promotionStartDate: entity.promotionStartDate,
                promotionEndDate: entity.promotionEndDate,
                promotionPriority: entity.promotionPriority,
                isActive,
                daysRemaining: isActive
                    ? Math.ceil(
                        (new Date(entity.promotionEndDate!).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24),
                    )
                    : 0,
            },
        });
    } catch (error) {
        console.error('خطأ في جلب حالة الترويج:', error);
        return res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
}

// التحقق من ملكية الإعلان
async function checkOwnership(
    entityType: EntityType,
    entityId: string,
    userId: string,
): Promise<{ valid: boolean; details?: any; }> {
    try {
        console.log('[checkOwnership] بدء التحقق:', { entityType, entityId, userId });
        switch (entityType) {
            case 'car': {
                const car = await prisma.cars.findUnique({
                    where: { id: entityId },
                    select: { sellerId: true, id: true, title: true },
                });
                console.log('[checkOwnership] السيارة:', car);
                console.log('[checkOwnership] مقارنة:', { carSellerId: car?.sellerId, userId, match: car?.sellerId === userId });
                return { valid: car?.sellerId === userId, details: { found: !!car, sellerId: car?.sellerId } };
            }
            case 'auction': {
                const auction = await prisma.auctions.findUnique({
                    where: { id: entityId },
                    select: { sellerId: true },
                });
                return { valid: auction?.sellerId === userId };
            }
            case 'showroom': {
                const showroom = await prisma.showrooms.findUnique({
                    where: { id: entityId },
                    select: { ownerId: true },
                });
                return { valid: showroom?.ownerId === userId };
            }
            case 'transport': {
                const transport = await prisma.transport_services.findUnique({
                    where: { id: entityId },
                    select: { userId: true },
                });
                return { valid: transport?.userId === userId };
            }
            default:
                return { valid: false };
        }
    } catch {
        return { valid: false };
    }
}

// تحديث الترويج في الإعلان
async function updateEntityPromotion(
    entityType: EntityType,
    entityId: string,
    data: {
        featured: boolean;
        promotionPackage: string;
        promotionDays: number;
        promotionStartDate: Date;
        promotionEndDate: Date;
        promotionPriority: number;
    },
) {
    switch (entityType) {
        case 'car':
            return prisma.cars.update({ where: { id: entityId }, data });
        case 'auction':
            return prisma.auctions.update({ where: { id: entityId }, data });
        case 'showroom':
            return prisma.showrooms.update({ where: { id: entityId }, data });
        case 'transport':
            return prisma.transport_services.update({ where: { id: entityId }, data });
    }
}

// جلب بيانات الترويج للإعلان
async function getEntityPromotion(entityType: EntityType, entityId: string) {
    const select = {
        featured: true,
        promotionPackage: true,
        promotionDays: true,
        promotionStartDate: true,
        promotionEndDate: true,
        promotionPriority: true,
    };

    switch (entityType) {
        case 'car':
            return prisma.cars.findUnique({ where: { id: entityId }, select });
        case 'auction':
            return prisma.auctions.findUnique({ where: { id: entityId }, select });
        case 'showroom':
            return prisma.showrooms.findUnique({ where: { id: entityId }, select });
        case 'transport':
            return prisma.transport_services.findUnique({ where: { id: entityId }, select });
        default:
            return null;
    }
}

function getEntityTypeName(type: EntityType): string {
    switch (type) {
        case 'car':
            return 'سيارة';
        case 'auction':
            return 'مزاد';
        case 'showroom':
            return 'معرض';
        case 'transport':
            return 'خدمة نقل';
        default:
            return 'إعلان';
    }
}
