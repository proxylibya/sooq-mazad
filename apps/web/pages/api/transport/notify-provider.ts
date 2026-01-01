/**
 * API لإرسال إشعار ورسالة لمقدم خدمة النقل عند إنشاء طلب جديد
 * Transport Provider Notification API
 */

import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import apiResponse from '../../../lib/api/response';
import prisma from '../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// دالة استخراج المستخدم من التوكن
function getUserFromToken(req: NextApiRequest): { userId: string; } | null {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.cookies.token;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { userId?: string; };
        if (!decoded.userId) return null;
        return { userId: decoded.userId };
    } catch {
        return null;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return apiResponse.methodNotAllowed(res, ['POST']);
    }

    try {
        const user = getUserFromToken(req);
        if (!user?.userId) {
            return apiResponse.unauthorized(res, 'يجب تسجيل الدخول');
        }

        const {
            bookingId,
            providerId,
            serviceId,
            customerName,
            fromCity,
            toCity,
            preferredDate,
        } = req.body;

        if (!bookingId || !providerId || !serviceId) {
            return apiResponse.badRequest(res, 'البيانات المطلوبة ناقصة');
        }

        // جلب بيانات العميل
        const customer = await prisma.users.findUnique({
            where: { id: user.userId },
            select: {
                id: true,
                name: true,
                phone: true,
                profileImage: true,
            },
        });

        // جلب بيانات الخدمة
        const service = await prisma.transport_services.findUnique({
            where: { id: serviceId },
            select: {
                id: true,
                title: true,
                truckType: true,
            },
        });

        // 1. إنشاء إشعار لمقدم الخدمة
        await prisma.notifications.create({
            data: {
                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: providerId,
                type: 'MESSAGE',
                title: 'طلب نقل جديد',
                message: `لديك طلب نقل جديد من ${customerName || customer?.name || 'عميل'} - من ${fromCity} إلى ${toCity}`,
                isRead: false,
                metadata: {
                    bookingId,
                    serviceId,
                    customerId: user.userId,
                    customerName: customerName || customer?.name,
                    fromCity,
                    toCity,
                    preferredDate,
                    notificationType: 'transport_booking',
                },
            },
        });

        // 2. إنشاء أو جلب محادثة خدمة النقل
        let conversation = await prisma.conversations.findFirst({
            where: {
                transportServiceId: serviceId,
                conversation_participants: {
                    some: { userId: user.userId },
                },
            },
        });

        if (!conversation) {
            // إنشاء محادثة جديدة
            conversation = await prisma.conversations.create({
                data: {
                    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    title: `طلب نقل - ${service?.title || 'خدمة نقل'}`,
                    type: 'DIRECT', // استخدام DIRECT مع transportServiceId للتمييز
                    transportServiceId: serviceId,
                    lastMessageAt: new Date(),
                    updatedAt: new Date(),
                    conversation_participants: {
                        create: [
                            {
                                id: `part_${Date.now()}_1`,
                                userId: user.userId,
                                role: 'MEMBER',
                            },
                            {
                                id: `part_${Date.now()}_2`,
                                userId: providerId,
                                role: 'MEMBER',
                            },
                        ],
                    },
                },
            });
        }

        // 3. إرسال رسالة بطاقة الطلب
        const bookingCardMessage = createBookingCardMessage({
            bookingId,
            customerName: customerName || customer?.name || 'عميل',
            customerPhone: customer?.phone || undefined,
            fromCity,
            toCity,
            preferredDate,
            serviceTitle: service?.title || 'خدمة نقل',
        });

        await prisma.messages.create({
            data: {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                conversationId: conversation.id,
                senderId: user.userId,
                content: bookingCardMessage.content,
                type: 'TEXT', // استخدام TEXT مع metadata لتحديد نوع البطاقة
                status: 'SENT',
                metadata: JSON.stringify(bookingCardMessage.metadata),
                updatedAt: new Date(),
            },
        });

        // تحديث آخر رسالة في المحادثة
        await prisma.conversations.update({
            where: { id: conversation.id },
            data: {
                lastMessageAt: new Date(),
                updatedAt: new Date(),
            },
        });

        console.log(`✅ [Notify Provider] تم إرسال إشعار ورسالة لمقدم الخدمة ${providerId}`);

        return apiResponse.ok(res, {
            success: true,
            message: 'تم إرسال الإشعار والرسالة بنجاح',
            conversationId: conversation.id,
        });
    } catch (error) {
        console.error('❌ [Notify Provider] خطأ:', error);
        return apiResponse.serverError(res, 'خطأ في إرسال الإشعار');
    }
}

// دالة إنشاء بطاقة الطلب للرسالة (بدون إيموجي)
function createBookingCardMessage(data: {
    bookingId: string;
    customerName: string;
    customerPhone?: string;
    fromCity: string;
    toCity: string;
    preferredDate: string;
    serviceTitle: string;
}) {
    const formattedDate = data.preferredDate
        ? new Date(data.preferredDate).toLocaleDateString('ar-LY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : 'غير محدد';

    // رسالة نصية بسيطة بدون إيموجي للعرض كـ fallback
    const shortBookingId = data.bookingId.slice(-8).toUpperCase();

    return {
        content: `طلب نقل جديد\n\nالخدمة: ${data.serviceTitle}\nالعميل: ${data.customerName}\nمن: ${data.fromCity}\nإلى: ${data.toCity}\nالتاريخ: ${formattedDate}\n\nرقم الطلب: #${shortBookingId}`,
        metadata: {
            type: 'transport_booking_card',
            bookingId: data.bookingId,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            fromCity: data.fromCity,
            toCity: data.toCity,
            preferredDate: data.preferredDate,
            serviceTitle: data.serviceTitle,
            actions: [
                { label: 'اتصل الآن', action: 'call', variant: 'success' },
                { label: 'مراسلة', action: 'chat', variant: 'primary' },
                { label: 'نسخ الرقم', action: 'copy', variant: 'secondary' },
                { label: 'قبول الطلب', action: 'accept', variant: 'success' },
                { label: 'رفض الطلب', action: 'reject', variant: 'danger' },
            ],
        },
    };
}
