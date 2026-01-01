import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { isTransportOwner } from '../../../utils/accountTypeUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { serviceId } = req.query;
    console.log(`[manage-service] ${req.method} request for serviceId: ${serviceId}`);

    // استخراج التوكن من الهيدر
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[manage-service] No auth header');
      return res.status(401).json({ success: false, error: 'رمز المصادقة مطلوب' });
    }
    const token = authHeader.substring(7);
    let decoded: JwtPayload & { userId?: string; id?: string; };
    try {
      // استخدم نفس السر الافتراضي المستخدم في AuthSystem لضمان التوافق
      const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      decoded = jwt.verify(token, secret) as JwtPayload & {
        userId?: string;
        id?: string;
      };
      console.log('[manage-service] Token decoded, userId:', decoded.userId || decoded.id);
    } catch (error) {
      console.log('[manage-service] Token verification failed:', error);
      return res.status(401).json({ success: false, error: 'رمز المصادقة غير صحيح' });
    }

    // استخدام userId أو id من التوكن
    const tokenUserId = decoded.userId || decoded.id;
    if (!tokenUserId) {
      console.log('[manage-service] No userId in token');
      return res.status(401).json({ success: false, error: 'رمز المصادقة لا يحتوي على معرف المستخدم' });
    }

    // التحقق من نوع الحساب
    const user = await prisma.users.findUnique({
      where: { id: tokenUserId },
      select: { id: true, accountType: true, verified: true, phone: true },
    });

    console.log('[manage-service] User found:', user ? { id: user.id, accountType: user.accountType } : 'NOT FOUND');

    if (!user || !isTransportOwner(user.accountType)) {
      return res.status(403).json({
        success: false,
        error: 'هذه الخدمة متاحة فقط لحسابات خدمات النقل',
      });
    }

    if (req.method === 'PUT') {
      // تعديل خدمة النقل
      const {
        title,
        description,
        truckType,
        capacity,
        serviceArea,
        pricePerKm,
        availableDays,
        contactPhone,
        images,
        features,
        commission,
      } = req.body;

      console.log('[manage-service] PUT request body:', { title, truckType, capacity, serviceArea, availableDays });

      // البحث عن الخدمة أولاً
      const existingService = await prisma.transport_services.findUnique({
        where: { id: serviceId as string },
      });

      if (!existingService) {
        console.log('[manage-service] Service not found:', serviceId);
        return res.status(404).json({
          success: false,
          error: 'الخدمة غير موجودة',
        });
      }

      console.log('[manage-service] Service found, owner userId:', existingService.userId, ', current user:', tokenUserId);

      // التحقق من ملكية الخدمة
      // السماح بالتعديل إذا:
      // 1. userId يطابق صاحب الخدمة
      // 2. أو رقم هاتف المستخدم يطابق contactPhone (للخدمات المُنشأة من admin)
      const isOwner = existingService.userId === tokenUserId;
      const phoneMatches = user.phone && existingService.contactPhone &&
        (user.phone === existingService.contactPhone ||
          user.phone.replace(/\D/g, '').endsWith(existingService.contactPhone.replace(/\D/g, '').slice(-9)));

      console.log('[manage-service] Ownership check - isOwner:', isOwner, ', phoneMatches:', phoneMatches);

      if (!isOwner && !phoneMatches) {
        console.log('[manage-service] User does not own this service and phone does not match');
        return res.status(403).json({
          success: false,
          error: 'ليس لديك صلاحية لتعديل هذه الخدمة',
        });
      }

      // إذا كان المستخدم يطابق بالهاتف لكن ليس المالك، نقل الملكية إليه
      const shouldTransferOwnership = !isOwner && phoneMatches;
      if (shouldTransferOwnership) {
        console.log('[manage-service] نقل ملكية الخدمة من', existingService.userId, 'إلى', tokenUserId);
      }

      // تحديث الخدمة
      const updatedService = await prisma.transport_services.update({
        where: { id: serviceId as string },
        data: {
          // نقل الملكية إذا لزم الأمر
          ...(shouldTransferOwnership ? { userId: tokenUserId } : {}),
          title: title || existingService.title,
          description: description || existingService.description,
          truckType: truckType || existingService.truckType,
          capacity: capacity ? Number(capacity) : existingService.capacity,
          serviceArea: serviceArea
            ? Array.isArray(serviceArea)
              ? serviceArea.join(',')
              : serviceArea
            : existingService.serviceArea,
          pricePerKm:
            pricePerKm === '' ? null : pricePerKm ? Number(pricePerKm) : existingService.pricePerKm,
          availableDays: availableDays
            ? Array.isArray(availableDays)
              ? availableDays.join(',')
              : availableDays
            : existingService.availableDays,
          contactPhone: contactPhone || existingService.contactPhone,
          images: images
            ? Array.isArray(images)
              ? images.join(',')
              : images
            : existingService.images,
          features: features
            ? Array.isArray(features)
              ? features.join(',')
              : features
            : existingService.features,
          commission: commission ? Number(commission) : existingService.commission,
          updatedAt: new Date(),
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              phone: true,
              verified: true,
              profileImage: true,
              accountType: true,
            },
          },
        },
      });

      return res.status(200).json({
        success: true,
        message: 'تم تحديث الخدمة بنجاح',
        service: updatedService,
      });
    } else if (req.method === 'DELETE') {
      // حذف خدمة النقل

      // البحث عن الخدمة
      const existingService = await prisma.transport_services.findUnique({
        where: { id: serviceId as string },
      });

      if (!existingService) {
        return res.status(404).json({
          success: false,
          error: 'الخدمة غير موجودة',
        });
      }

      // التحقق من ملكية الخدمة
      const isOwnerDel = existingService.userId === tokenUserId;
      const phoneMatchesDel = user.phone && existingService.contactPhone &&
        (user.phone === existingService.contactPhone ||
          user.phone.replace(/\D/g, '').endsWith(existingService.contactPhone.replace(/\D/g, '').slice(-9)));

      if (!isOwnerDel && !phoneMatchesDel) {
        return res.status(403).json({
          success: false,
          error: 'ليس لديك صلاحية لحذف هذه الخدمة',
        });
      }

      // حذف الخدمة
      await prisma.transport_services.delete({
        where: { id: serviceId as string },
      });

      return res.status(200).json({
        success: true,
        message: 'تم حذف الخدمة بنجاح',
      });
    } else if (req.method === 'GET') {
      // عرض تفاصيل خدمة النقل

      const service = await prisma.transport_services.findUnique({
        where: { id: serviceId as string },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              phone: true,
              verified: true,
              profileImage: true,
              accountType: true,
            },
          },
        },
      });

      if (!service) {
        console.log('[manage-service] GET - Service not found:', serviceId);
        return res.status(404).json({
          success: false,
          error: 'الخدمة غير موجودة',
        });
      }

      // التحقق من ملكية الخدمة
      const isOwnerGet = service.userId === tokenUserId;
      const phoneMatchesGet = user.phone && service.contactPhone &&
        (user.phone === service.contactPhone ||
          user.phone.replace(/\D/g, '').endsWith(service.contactPhone.replace(/\D/g, '').slice(-9)));

      console.log('[manage-service] GET - Ownership check - isOwner:', isOwnerGet, ', phoneMatches:', phoneMatchesGet);

      if (!isOwnerGet && !phoneMatchesGet) {
        console.log('[manage-service] GET - User does not own this service');
        return res.status(403).json({
          success: false,
          error: 'ليس لديك صلاحية لعرض هذه الخدمة',
        });
      }

      // تنسيق البيانات قبل الإرسال
      const formattedService = {
        ...service,
        images: service.images
          ? service.images
            .split(',')
            .map((img) => img.trim())
            .filter((img) => img)
          : [],
        features: service.features
          ? service.features
            .split(',')
            .map((f) => f.trim())
            .filter((f) => f)
          : [],
        serviceArea: service.serviceArea
          ? service.serviceArea
            .split(',')
            .map((area) => area.trim())
            .filter((area) => area)
          : [],
        availableDays: service.availableDays
          ? service.availableDays
            .split(',')
            .map((day) => day.trim())
            .filter((day) => day)
          : [],
      };

      return res.status(200).json({
        success: true,
        service: formattedService,
      });
    } else {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('خطأ في إدارة خدمة النقل:', error);
    return res.status(500).json({ success: false, error: 'خطأ في الخادم' });
  } finally {
    // استخدام Prisma Singleton، لا نقوم بالإغلاق هنا
  }
}
