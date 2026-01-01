/**
 * API موحد لبدء المحادثات
 * Unified Start Conversation API
 * 
 * يدعم جميع أنواع الإعلانات: سيارات، مزادات، نقل
 * ويربط المحادثة بالإعلان المناسب
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../lib/prisma';
import { verifyToken } from '../../middleware/auth';
import { withApiRateLimit } from '../../utils/rateLimiter';

interface StartConversationRequest {
    // معرف المستخدم الآخر (البائع/مقدم الخدمة)
    otherUserId: string;
    // نوع الإعلان
    type: 'car' | 'auction' | 'transport' | 'direct';
    // معرف الإعلان (اختياري حسب النوع)
    itemId?: string;
    // رسالة أولية (اختياري)
    initialMessage?: string;
}

interface ApiResponse {
    success: boolean;
    message?: string;
    data?: {
        conversationId: string;
        isNew: boolean;
        otherUser?: {
            id: string;
            name: string;
        };
    };
    error?: string;
}

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse>
) {
    // فقط POST مسموح
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'طريقة غير مدعومة',
        });
    }

    try {
        // التحقق من المصادقة
        const authUser = await verifyToken(req);

        if (!authUser?.id) {
            return res.status(401).json({
                success: false,
                error: 'يجب تسجيل الدخول للمراسلة',
            });
        }

        const {
            otherUserId,
            type = 'direct',
            itemId,
            initialMessage
        }: StartConversationRequest = req.body;

        // التحقق من البيانات المطلوبة
        if (!otherUserId) {
            return res.status(400).json({
                success: false,
                error: 'معرف المستخدم الآخر مطلوب',
            });
        }

        // منع المستخدم من مراسلة نفسه
        if (otherUserId === authUser.id) {
            return res.status(400).json({
                success: false,
                error: 'لا يمكنك مراسلة نفسك',
            });
        }

        // التحقق من وجود المستخدم الآخر
        const otherUser = await prisma.users.findUnique({
            where: { id: otherUserId },
            select: { id: true, name: true },
        });

        if (!otherUser) {
            return res.status(404).json({
                success: false,
                error: 'المستخدم غير موجود',
            });
        }

        // تحديد معرفات الربط حسب نوع الإعلان
        let carId: string | null = null;
        let auctionId: string | null = null;
        let transportServiceId: string | null = null;
        let conversationTitle: string | null = null;

        // جلب معلومات الإعلان حسب النوع
        if (type === 'car' && itemId) {
            const car = await prisma.cars.findUnique({
                where: { id: itemId },
                select: { id: true, title: true, sellerId: true },
            });

            if (car) {
                carId = car.id;
                conversationTitle = `استفسار عن: ${car.title}`;

                // التحقق من أن البائع هو المستخدم الآخر
                if (car.sellerId !== otherUserId) {
                    return res.status(400).json({
                        success: false,
                        error: 'البائع غير مطابق للإعلان',
                    });
                }
            }
        } else if (type === 'auction' && itemId) {
            const auction = await prisma.auctions.findUnique({
                where: { id: itemId },
                select: { id: true, title: true, sellerId: true },
            });

            if (auction) {
                auctionId = auction.id;
                conversationTitle = `استفسار عن مزاد: ${auction.title}`;

                // التحقق من أن البائع هو المستخدم الآخر
                if (auction.sellerId !== otherUserId) {
                    return res.status(400).json({
                        success: false,
                        error: 'البائع غير مطابق للمزاد',
                    });
                }
            }
        } else if (type === 'transport' && itemId) {
            const service = await prisma.transport_services.findUnique({
                where: { id: itemId },
                select: { id: true, title: true, userId: true },
            });

            if (service) {
                transportServiceId = service.id;
                conversationTitle = `استفسار عن: ${service.title}`;

                // التحقق من أن مقدم الخدمة هو المستخدم الآخر
                if (service.userId !== otherUserId) {
                    return res.status(400).json({
                        success: false,
                        error: 'مقدم الخدمة غير مطابق',
                    });
                }
            }
        }

        // البحث عن محادثة موجودة
        const whereClause: any = {
            type: 'DIRECT',
            AND: [
                { conversation_participants: { some: { userId: authUser.id } } },
                { conversation_participants: { some: { userId: otherUserId } } },
            ],
        };

        // إضافة شرط الإعلان إذا وجد
        if (carId) {
            whereClause.carId = carId;
        } else if (auctionId) {
            whereClause.auctionId = auctionId;
        } else if (transportServiceId) {
            whereClause.transportServiceId = transportServiceId;
        }

        const existingConversation = await prisma.conversations.findFirst({
            where: whereClause,
            include: {
                conversation_participants: true,
            },
        });

        if (existingConversation) {
            // إرسال الرسالة الأولية إذا وجدت
            if (initialMessage?.trim()) {
                await prisma.messages.create({
                    data: {
                        id: uuidv4(),
                        conversationId: existingConversation.id,
                        senderId: authUser.id,
                        content: initialMessage.trim(),
                        type: 'TEXT',
                        status: 'SENT',
                    },
                });

                // تحديث وقت آخر رسالة
                await prisma.conversations.update({
                    where: { id: existingConversation.id },
                    data: { lastMessageAt: new Date(), updatedAt: new Date() },
                });
            }

            return res.status(200).json({
                success: true,
                message: 'تم العثور على محادثة موجودة',
                data: {
                    conversationId: existingConversation.id,
                    isNew: false,
                    otherUser: {
                        id: otherUser.id,
                        name: otherUser.name || 'مستخدم',
                    },
                },
            });
        }

        // إنشاء محادثة جديدة
        const conversationId = uuidv4();
        const now = new Date();

        await prisma.conversations.create({
            data: {
                id: conversationId,
                title: conversationTitle,
                type: 'DIRECT',
                carId,
                auctionId,
                transportServiceId,
                createdAt: now,
                updatedAt: now,
                lastMessageAt: now,
                conversation_participants: {
                    create: [
                        {
                            id: uuidv4(),
                            userId: authUser.id,
                            role: 'MEMBER',
                            joinedAt: now,
                        },
                        {
                            id: uuidv4(),
                            userId: otherUserId,
                            role: 'MEMBER',
                            joinedAt: now,
                        },
                    ],
                },
            },
        });

        // إرسال الرسالة الأولية إذا وجدت
        if (initialMessage?.trim()) {
            await prisma.messages.create({
                data: {
                    id: uuidv4(),
                    conversationId: conversationId,
                    senderId: authUser.id,
                    content: initialMessage.trim(),
                    type: 'TEXT',
                    status: 'SENT',
                },
            });
        }

        console.log(`✅ [Start Conversation] تم إنشاء محادثة جديدة: ${conversationId}`);

        return res.status(201).json({
            success: true,
            message: 'تم إنشاء المحادثة بنجاح',
            data: {
                conversationId,
                isNew: true,
                otherUser: {
                    id: otherUser.id,
                    name: otherUser.name || 'مستخدم',
                },
            },
        });

    } catch (error) {
        console.error('[Start Conversation Error]:', error);
        return res.status(500).json({
            success: false,
            error: 'حدث خطأ في بدء المحادثة',
        });
    }
}

// تطبيق Rate Limiting
export default withApiRateLimit(handler, {
    maxAttempts: 30, // 30 طلب في الدقيقة
    windowMs: 60 * 1000,
});
