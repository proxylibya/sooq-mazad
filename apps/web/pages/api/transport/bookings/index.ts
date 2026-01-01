/**
 * API حجوزات خدمات النقل
 * Transport Bookings API - Enterprise Grade
 */

import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import apiResponse from '../../../../lib/api/response';
import prisma from '../../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// حالات الحجز
export const BOOKING_STATUS = {
    PENDING: 'PENDING',       // في انتظار القبول
    ACCEPTED: 'ACCEPTED',     // تم القبول
    IN_PROGRESS: 'IN_PROGRESS', // جاري التنفيذ
    COMPLETED: 'COMPLETED',   // مكتمل
    CANCELLED: 'CANCELLED',   // ملغي
    REJECTED: 'REJECTED',     // مرفوض
} as const;

export const BOOKING_STATUS_LABELS: Record<string, string> = {
    PENDING: 'في انتظار القبول',
    ACCEPTED: 'تم القبول',
    IN_PROGRESS: 'جاري التنفيذ',
    COMPLETED: 'مكتمل',
    CANCELLED: 'ملغي',
    REJECTED: 'مرفوض',
};

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
    try {
        const user = getUserFromToken(req);

        switch (req.method) {
            case 'GET':
                return await getBookings(req, res, user);
            case 'POST':
                return await createBooking(req, res, user);
            default:
                return apiResponse.methodNotAllowed(res, ['GET', 'POST']);
        }
    } catch (error) {
        console.error('خطأ في API الحجوزات:', error);
        return apiResponse.serverError(res, 'خطأ في الخادم');
    }
}

// جلب الحجوزات
async function getBookings(req: NextApiRequest, res: NextApiResponse, user: { userId: string; } | null) {
    const {
        page = '1',
        limit = '20',
        status,
        role, // customer | provider
        serviceId,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // بناء شروط البحث
    const where: any = {};

    console.log('📋 [Bookings API] جلب الحجوزات:', { userId: user?.userId, role, status });

    // إذا كان المستخدم مسجل دخول، نجلب حجوزاته فقط
    if (user?.userId) {
        if (role === 'provider') {
            where.providerId = user.userId;
        } else {
            where.customerId = user.userId;
        }
    }

    console.log('📋 [Bookings API] شروط البحث:', where);

    if (status && status !== 'all') {
        where.status = status;
    }

    if (serviceId) {
        where.serviceId = serviceId;
    }

    const [bookings, total] = await Promise.all([
        prisma.transport_bookings.findMany({
            where,
            include: {
                service: {
                    select: {
                        id: true,
                        title: true,
                        truckType: true,
                        pricePerKm: true,
                        images: true,
                    },
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
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
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limitNum,
        }),
        prisma.transport_bookings.count({ where }),
    ]);

    console.log(`✅ [Bookings API] تم العثور على ${bookings.length} حجز من أصل ${total}`);

    return apiResponse.ok(res, {
        bookings,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        },
    });
}

// إنشاء حجز جديد
async function createBooking(req: NextApiRequest, res: NextApiResponse, user: { userId: string; } | null) {
    // التحقق من تسجيل الدخول
    if (!user?.userId) {
        return apiResponse.unauthorized(res, 'يجب تسجيل الدخول لإنشاء حجز');
    }

    const {
        serviceId,
        // معلومات العميل
        customerName,
        customerPhone,
        customerEmail,
        // معلومات النقل
        fromCity,
        toCity,
        pickupAddress,
        deliveryAddress,
        // معلومات السيارة
        carMake,
        carModel,
        carYear,
        carColor,
        carPlateNumber,
        // تفاصيل الخدمة
        serviceType = 'standard',
        preferredDate,
        preferredTime,
        specialInstructions,
        // خيارات إضافية
        insurance = false,
        tracking = false,
        expressService = false,
        // السعر المقدر
        estimatedPrice,
        distance,
    } = req.body;

    // التحقق من البيانات المطلوبة
    if (!serviceId || !customerName || !customerPhone || !fromCity || !toCity || !preferredDate) {
        return apiResponse.badRequest(res, 'البيانات المطلوبة ناقصة');
    }

    // جلب معلومات الخدمة
    const service = await prisma.transport_services.findUnique({
        where: { id: serviceId },
        select: {
            id: true,
            userId: true,
            title: true,
            isAvailable: true,
            status: true,
        },
    });

    if (!service) {
        return apiResponse.notFound(res, 'الخدمة غير موجودة');
    }

    if (service.status !== 'ACTIVE') {
        return apiResponse.badRequest(res, 'الخدمة غير متاحة حالياً');
    }

    if (!service.isAvailable) {
        return apiResponse.badRequest(res, 'مقدم الخدمة غير متاح حالياً');
    }

    // إنشاء الحجز
    const booking = await prisma.transport_bookings.create({
        data: {
            serviceId,
            customerId: user.userId,
            providerId: service.userId,
            customerName,
            customerPhone,
            customerEmail,
            fromCity,
            toCity,
            pickupAddress: pickupAddress || fromCity,
            deliveryAddress: deliveryAddress || toCity,
            carMake,
            carModel,
            carYear,
            carColor,
            carPlateNumber,
            serviceType,
            preferredDate: new Date(preferredDate),
            preferredTime,
            specialInstructions,
            insurance,
            tracking,
            expressService,
            estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : null,
            distance: distance ? parseFloat(distance) : null,
            status: BOOKING_STATUS.PENDING,
        },
        include: {
            service: {
                select: {
                    title: true,
                    truckType: true,
                },
            },
            provider: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                },
            },
        },
    });

    // TODO: إرسال إشعار لمقدم الخدمة
    // await sendNotification(service.userId, 'NEW_BOOKING', booking);

    return apiResponse.created(res, {
        booking,
        message: 'تم إنشاء الحجز بنجاح',
    });
}
