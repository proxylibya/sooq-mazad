/**
 * API تحديث حالة التوفر لخدمات النقل
 * Transport Service Availability Toggle API
 */

import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import apiResponse from '../../../lib/api/response';
import prisma from '../../../lib/prisma';
import { isTransportOwner } from '../../../utils/accountTypeUtils';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // استخراج التوكن من الهيدر أو الكوكيز
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.cookies.token;

        if (!token) {
            return apiResponse.unauthorized(res, 'رمز المصادقة مطلوب');
        }

        let decoded: JwtPayload & { userId?: string; };
        try {
            decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { userId?: string; };
        } catch {
            return apiResponse.unauthorized(res, 'رمز المصادقة غير صحيح');
        }

        if (!decoded.userId) {
            return apiResponse.unauthorized(res, 'معرف المستخدم غير موجود في التوكن');
        }

        // التحقق من نوع الحساب
        const user = await prisma.users.findUnique({
            where: { id: decoded.userId },
            select: { accountType: true },
        });

        if (!user || !isTransportOwner(user.accountType)) {
            return apiResponse.forbidden(res, 'هذه الخدمة متاحة فقط لحسابات خدمات النقل');
        }

        switch (req.method) {
            case 'GET':
                return await getAvailability(req, res, decoded.userId);
            case 'PUT':
                return await updateAvailability(req, res, decoded.userId);
            default:
                return apiResponse.methodNotAllowed(res, ['GET', 'PUT']);
        }
    } catch (error) {
        console.error('خطأ في API التوفر:', error);
        return apiResponse.serverError(res, 'خطأ في الخادم');
    }
}

// جلب حالة التوفر لجميع خدمات المستخدم
async function getAvailability(req: NextApiRequest, res: NextApiResponse, userId: string) {
    const services = await prisma.transport_services.findMany({
        where: { userId },
        select: {
            id: true,
            title: true,
            isAvailable: true,
            availabilityNote: true,
            status: true,
        },
    });

    // حساب الإحصائيات
    const stats = {
        total: services.length,
        available: services.filter(s => s.isAvailable && s.status === 'ACTIVE').length,
        unavailable: services.filter(s => !s.isAvailable).length,
        inactive: services.filter(s => s.status !== 'ACTIVE').length,
    };

    return apiResponse.ok(res, {
        services,
        stats,
    });
}

// تحديث حالة التوفر
async function updateAvailability(req: NextApiRequest, res: NextApiResponse, userId: string) {
    const { serviceId, isAvailable, availabilityNote, updateAll } = req.body;

    // تحديث جميع الخدمات مرة واحدة
    if (updateAll !== undefined) {
        const result = await prisma.transport_services.updateMany({
            where: { userId },
            data: {
                isAvailable: updateAll,
                availabilityNote: availabilityNote || null,
            },
        });

        return apiResponse.ok(res, {
            message: updateAll ? 'تم تفعيل جميع الخدمات' : 'تم إيقاف جميع الخدمات',
            updatedCount: result.count,
        });
    }

    // تحديث خدمة واحدة
    if (!serviceId) {
        return apiResponse.badRequest(res, 'معرف الخدمة مطلوب');
    }

    // التحقق من ملكية الخدمة
    const service = await prisma.transport_services.findFirst({
        where: {
            id: serviceId,
            userId,
        },
    });

    if (!service) {
        return apiResponse.notFound(res, 'الخدمة غير موجودة أو غير مصرح لك بتعديلها');
    }

    const updatedService = await prisma.transport_services.update({
        where: { id: serviceId },
        data: {
            isAvailable: isAvailable !== undefined ? isAvailable : !service.isAvailable,
            availabilityNote: availabilityNote !== undefined ? availabilityNote : service.availabilityNote,
        },
        select: {
            id: true,
            title: true,
            isAvailable: true,
            availabilityNote: true,
        },
    });

    return apiResponse.ok(res, {
        service: updatedService,
        message: updatedService.isAvailable
            ? 'تم تفعيل الخدمة - أنت الآن متاح لاستقبال الطلبات'
            : 'تم إيقاف الخدمة - لن تظهر في نتائج البحث',
    });
}
