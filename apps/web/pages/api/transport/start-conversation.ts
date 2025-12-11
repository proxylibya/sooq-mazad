/**
 * API بدء محادثة مع مقدم خدمة نقل
 * Start Conversation with Transport Service Provider
 */

import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import apiResponse from '../../../lib/api/response';
import prisma from '../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return apiResponse.methodNotAllowed(res, ['POST']);
    }

    try {
        // استخراج التوكن
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.cookies.token;

        if (!token) {
            return apiResponse.unauthorized(res, 'يجب تسجيل الدخول للمراسلة');
        }

        let userId: string;
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { userId?: string; };
            if (!decoded.userId) {
                return apiResponse.unauthorized(res, 'معرف المستخدم غير موجود');
            }
            userId = decoded.userId;
        } catch {
            return apiResponse.unauthorized(res, 'رمز المصادقة غير صحيح');
        }

        const { serviceId, initialMessage } = req.body;

        if (!serviceId) {
            return apiResponse.badRequest(res, 'معرف الخدمة مطلوب');
        }

        // جلب معلومات الخدمة ومقدمها
        const service = await prisma.transport_services.findUnique({
            where: { id: serviceId },
            select: {
                id: true,
                title: true,
                userId: true,
                users: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!service) {
            return apiResponse.notFound(res, 'الخدمة غير موجودة');
        }

        // منع المستخدم من مراسلة نفسه
        if (service.userId === userId) {
            return apiResponse.badRequest(res, 'لا يمكنك مراسلة نفسك');
        }

        // البحث عن محادثة موجودة بين المستخدمين لنفس الخدمة
        const existingConversation = await prisma.conversations.findFirst({
            where: {
                transportServiceId: serviceId,
                conversation_participants: {
                    every: {
                        userId: {
                            in: [userId, service.userId],
                        },
                    },
                },
            },
            include: {
                conversation_participants: true,
            },
        });

        if (existingConversation) {
            // ارسال رسالة في المحادثة الموجودة اذا كان هناك رسالة اولية
            if (initialMessage?.trim()) {
                await prisma.messages.create({
                    data: {
                        id: uuidv4(),
                        conversationId: existingConversation.id,
                        senderId: userId,
                        content: initialMessage.trim(),
                        type: 'TEXT',
                        status: 'SENT',
                    },
                });

                // تحديث وقت اخر رسالة
                await prisma.conversations.update({
                    where: { id: existingConversation.id },
                    data: { lastMessageAt: new Date(), updatedAt: new Date() },
                });
            }

            return apiResponse.ok(res, {
                conversationId: existingConversation.id,
                isNew: false,
                message: 'تم العثور على محادثة موجودة',
            });
        }

        // انشاء محادثة جديدة
        const conversationId = uuidv4();
        const now = new Date();

        await prisma.conversations.create({
            data: {
                id: conversationId,
                title: `استفسار عن: ${service.title}`,
                type: 'DIRECT',
                transportServiceId: serviceId,
                createdAt: now,
                updatedAt: now,
                lastMessageAt: now,
                conversation_participants: {
                    create: [
                        {
                            id: uuidv4(),
                            userId: userId,
                            role: 'MEMBER',
                            joinedAt: now,
                        },
                        {
                            id: uuidv4(),
                            userId: service.userId,
                            role: 'MEMBER',
                            joinedAt: now,
                        },
                    ],
                },
            },
        });

        // ارسال الرسالة الاولية اذا وجدت
        if (initialMessage?.trim()) {
            await prisma.messages.create({
                data: {
                    id: uuidv4(),
                    conversationId: conversationId,
                    senderId: userId,
                    content: initialMessage.trim(),
                    type: 'TEXT',
                    status: 'SENT',
                },
            });
        }

        return apiResponse.ok(res, {
            conversationId,
            isNew: true,
            message: 'تم انشاء المحادثة بنجاح',
            serviceName: service.title,
            providerName: service.users?.name,
        });
    } catch (error) {
        console.error('خطأ في بدء المحادثة:', error);
        return apiResponse.serverError(res, 'حدث خطأ في بدء المحادثة');
    }
}
