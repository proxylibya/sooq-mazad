/**
 * API إدارة حجز فردي
 * Single Booking Management API
 */

import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import apiResponse from '../../../../lib/api/response';
import prisma from '../../../../lib/prisma';
import { BOOKING_STATUS } from './index';

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
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return apiResponse.badRequest(res, 'معرف الحجز مطلوب');
    }

    try {
        const user = getUserFromToken(req);

        switch (req.method) {
            case 'GET':
                return await getBooking(req, res, id, user);
            case 'PUT':
                return await updateBooking(req, res, id, user);
            case 'DELETE':
                return await cancelBooking(req, res, id, user);
            default:
                return apiResponse.methodNotAllowed(res, ['GET', 'PUT', 'DELETE']);
        }
    } catch (error) {
        console.error('خطأ في API الحجز:', error);
        return apiResponse.serverError(res, 'خطأ في الخادم');
    }
}

// جلب تفاصيل حجز
async function getBooking(req: NextApiRequest, res: NextApiResponse, id: string, user: { userId: string; } | null) {
    const booking = await prisma.transport_bookings.findUnique({
        where: { id },
        include: {
            service: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    truckType: true,
                    capacity: true,
                    pricePerKm: true,
                    images: true,
                    contactPhone: true,
                },
            },
            customer: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true,
                    profileImage: true,
                },
            },
            provider: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    profileImage: true,
                    verified: true,
                    rating: true,
                },
            },
        },
    });

    if (!booking) {
        return apiResponse.notFound(res, 'الحجز غير موجود');
    }

    // التحقق من صلاحية الوصول (العميل أو مقدم الخدمة فقط)
    if (user?.userId &&
        booking.customerId !== user.userId &&
        booking.providerId !== user.userId) {
        return apiResponse.forbidden(res, 'غير مصرح لك بعرض هذا الحجز');
    }

    return apiResponse.ok(res, { booking });
}

// تحديث حجز (قبول، رفض، تحديث الحالة)
async function updateBooking(req: NextApiRequest, res: NextApiResponse, id: string, user: { userId: string; } | null) {
    if (!user?.userId) {
        return apiResponse.unauthorized(res, 'يجب تسجيل الدخول');
    }

    const {
        action, // accept, reject, start, complete, updatePrice
        providerNotes,
        finalPrice,
        cancellationReason,
    } = req.body;

    // جلب الحجز الحالي
    const booking = await prisma.transport_bookings.findUnique({
        where: { id },
        select: {
            id: true,
            status: true,
            customerId: true,
            providerId: true,
        },
    });

    if (!booking) {
        return apiResponse.notFound(res, 'الحجز غير موجود');
    }

    // التحقق من صلاحية التحديث
    const isProvider = booking.providerId === user.userId;
    const isCustomer = booking.customerId === user.userId;

    if (!isProvider && !isCustomer) {
        return apiResponse.forbidden(res, 'غير مصرح لك بتحديث هذا الحجز');
    }

    // معالجة الإجراء المطلوب
    let updateData: any = {};

    switch (action) {
        case 'accept':
            if (!isProvider) {
                return apiResponse.forbidden(res, 'فقط مقدم الخدمة يمكنه قبول الحجز');
            }
            if (booking.status !== BOOKING_STATUS.PENDING) {
                return apiResponse.badRequest(res, 'لا يمكن قبول هذا الحجز');
            }
            updateData = {
                status: BOOKING_STATUS.ACCEPTED,
                acceptedAt: new Date(),
                providerNotes,
                finalPrice: finalPrice ? parseFloat(finalPrice) : undefined,
            };
            break;

        case 'reject':
            if (!isProvider) {
                return apiResponse.forbidden(res, 'فقط مقدم الخدمة يمكنه رفض الحجز');
            }
            if (booking.status !== BOOKING_STATUS.PENDING) {
                return apiResponse.badRequest(res, 'لا يمكن رفض هذا الحجز');
            }
            updateData = {
                status: BOOKING_STATUS.REJECTED,
                providerNotes,
                cancellationReason: cancellationReason || 'تم الرفض من قبل مقدم الخدمة',
            };
            break;

        case 'start':
            if (!isProvider) {
                return apiResponse.forbidden(res, 'فقط مقدم الخدمة يمكنه بدء التنفيذ');
            }
            if (booking.status !== BOOKING_STATUS.ACCEPTED) {
                return apiResponse.badRequest(res, 'يجب قبول الحجز أولاً');
            }
            updateData = {
                status: BOOKING_STATUS.IN_PROGRESS,
                startedAt: new Date(),
            };
            break;

        case 'complete':
            if (!isProvider) {
                return apiResponse.forbidden(res, 'فقط مقدم الخدمة يمكنه إكمال الحجز');
            }
            if (booking.status !== BOOKING_STATUS.IN_PROGRESS) {
                return apiResponse.badRequest(res, 'يجب بدء التنفيذ أولاً');
            }
            updateData = {
                status: BOOKING_STATUS.COMPLETED,
                completedAt: new Date(),
                finalPrice: finalPrice ? parseFloat(finalPrice) : undefined,
                providerNotes,
            };
            break;

        case 'updatePrice':
            if (!isProvider) {
                return apiResponse.forbidden(res, 'فقط مقدم الخدمة يمكنه تحديث السعر');
            }
            updateData = {
                finalPrice: finalPrice ? parseFloat(finalPrice) : undefined,
                providerNotes,
            };
            break;

        default:
            // تحديث عام للملاحظات فقط
            if (isProvider) {
                updateData.providerNotes = providerNotes;
            }
    }

    const updatedBooking = await prisma.transport_bookings.update({
        where: { id },
        data: updateData,
        include: {
            service: {
                select: { title: true },
            },
            customer: {
                select: { id: true, name: true },
            },
            provider: {
                select: { id: true, name: true },
            },
        },
    });

    // TODO: إرسال إشعار للطرف الآخر
    // await sendStatusNotification(updatedBooking);

    return apiResponse.ok(res, {
        booking: updatedBooking,
        message: getActionMessage(action),
    });
}

// إلغاء حجز
async function cancelBooking(req: NextApiRequest, res: NextApiResponse, id: string, user: { userId: string; } | null) {
    if (!user?.userId) {
        return apiResponse.unauthorized(res, 'يجب تسجيل الدخول');
    }

    const { cancellationReason } = req.body || {};

    const booking = await prisma.transport_bookings.findUnique({
        where: { id },
        select: {
            id: true,
            status: true,
            customerId: true,
            providerId: true,
        },
    });

    if (!booking) {
        return apiResponse.notFound(res, 'الحجز غير موجود');
    }

    const isProvider = booking.providerId === user.userId;
    const isCustomer = booking.customerId === user.userId;

    if (!isProvider && !isCustomer) {
        return apiResponse.forbidden(res, 'غير مصرح لك بإلغاء هذا الحجز');
    }

    // لا يمكن إلغاء حجز مكتمل أو ملغي بالفعل
    if ([BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REJECTED].includes(booking.status as any)) {
        return apiResponse.badRequest(res, 'لا يمكن إلغاء هذا الحجز');
    }

    const cancelledBooking = await prisma.transport_bookings.update({
        where: { id },
        data: {
            status: BOOKING_STATUS.CANCELLED,
            cancelledAt: new Date(),
            cancellationReason: cancellationReason ||
                (isCustomer ? 'تم الإلغاء من قبل العميل' : 'تم الإلغاء من قبل مقدم الخدمة'),
        },
    });

    return apiResponse.ok(res, {
        booking: cancelledBooking,
        message: 'تم إلغاء الحجز بنجاح',
    });
}

// رسائل الإجراءات
function getActionMessage(action: string): string {
    const messages: Record<string, string> = {
        accept: 'تم قبول الحجز بنجاح',
        reject: 'تم رفض الحجز',
        start: 'تم بدء تنفيذ الحجز',
        complete: 'تم إكمال الحجز بنجاح',
        updatePrice: 'تم تحديث السعر',
    };
    return messages[action] || 'تم تحديث الحجز';
}
