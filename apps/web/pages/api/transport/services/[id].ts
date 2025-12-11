import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';

// دالة للحصول على معرف المستخدم من التوكن
const getUserIdFromToken = async (req: NextApiRequest): Promise<string | null> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, secret) as JwtPayload & {
      userId?: string;
      id?: string;
    };
    return decoded.userId || decoded.id || null;
  } catch (error) {
    console.error('خطأ في التحقق من التوكن:', error);
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // التحقق من صحة معرف الخدمة
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'معرف الخدمة مطلوب',
        });
      }

      // جلب تفاصيل خدمة النقل: جرّب ACTIVE أولاً ثم fallback لأي حالة
      let service = await prisma.transport_services.findFirst({
        where: {
          id: id,
          status: 'ACTIVE', // تفضيل الخدمات النشطة أولاً
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

      if (!service) {
        // Fallback: السماح بأي حالة لإظهار التفاصيل مع تعليم التوفر من status
        service = await prisma.transport_services.findUnique({
          where: { id: id as string },
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
      }

      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'خدمة النقل غير موجودة',
        });
      }

      // تنسيق البيانات
      // ضمان وجود رقم الهاتف - من contactPhone أو من المستخدم
      const finalPhone = service.contactPhone || service.users?.phone || '';

      const formattedService = {
        id: service.id,
        title: service.title,
        description: service.description,
        truckType: service.truckType,
        capacity: service.capacity,
        serviceArea: service.serviceArea,
        pricePerKm: service.pricePerKm,
        availableDays: service.availableDays,
        contactPhone: finalPhone, // استخدام القيمة المضمونة
        images: service.images
          ? service.images
            .split(',')
            .map((img) => img.trim())
            .filter((img) => img)
          : [],
        features: service.features ? service.features.split(',').filter((f) => f.trim()) : [],
        commission: service.commission,
        status: service.status,
        createdAt: service.createdAt.toISOString(),
        // بيانات الترويج
        featured: service.featured || false,
        promotionPackage: service.promotionPackage || 'free',
        promotionDays: service.promotionDays || 0,
        promotionStartDate: service.promotionStartDate?.toISOString() || null,
        promotionEndDate: service.promotionEndDate?.toISOString() || null,
        promotionPriority: service.promotionPriority || 0,
        user: {
          id: service.users.id,
          name: service.users.name,
          phone: service.users.phone,
          verified: service.users.verified,
          profileImage: service.users.profileImage,
          accountType: service.users.accountType,
        },
      };

      return res.status(200).json({
        success: true,
        data: formattedService,
      });
    } catch (error) {
      console.error('خطأ في جلب تفاصيل خدمة النقل:', error);
      return res.status(500).json({
        success: false,
        error: 'خطأ في الخادم',
      });
    }
  } else if (req.method === 'PUT') {
    // تحديث خدمة النقل (للمالك فقط)
    try {
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
      } = req.body;

      // التحقق من صحة المستخدم
      const userId = await getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'يجب تسجيل الدخول أولاً',
        });
      }

      // التحقق من ملكية الخدمة
      const existingService = await prisma.transport_services.findFirst({
        where: {
          id: id as string,
          userId: userId,
        },
      });

      if (!existingService) {
        return res.status(404).json({
          success: false,
          error: 'خدمة النقل غير موجودة أو ليس لديك صلاحية للوصول إليها',
        });
      }

      const updatedService = await prisma.transport_services.update({
        where: {
          id: id as string,
        },
        data: {
          title,
          description,
          truckType,
          capacity: capacity ? parseInt(capacity) : undefined,
          serviceArea: Array.isArray(serviceArea) ? serviceArea.join(',') : serviceArea,
          pricePerKm: pricePerKm ? parseFloat(pricePerKm) : null,
          availableDays: Array.isArray(availableDays) ? availableDays.join(',') : availableDays,
          contactPhone,
          images: Array.isArray(images) ? images.join(',') : images || '',
          features: Array.isArray(features) ? features.join(',') : features,
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
        data: updatedService,
        message: 'تم تحديث خدمة النقل بنجاح',
      });
    } catch (error) {
      console.error('خطأ في تحديث خدمة النقل:', error);
      return res.status(500).json({
        success: false,
        error: 'خطأ في تحديث خدمة النقل',
      });
    }
  } else if (req.method === 'DELETE') {
    // حذف خدمة النقل (للمالك فقط)
    try {
      // التحقق من صحة المستخدم
      const userId = await getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'يجب تسجيل الدخول أولاً',
        });
      }

      // التحقق من ملكية الخدمة
      const existingService = await prisma.transport_services.findFirst({
        where: {
          id: id as string,
          userId: userId,
        },
      });

      if (!existingService) {
        return res.status(404).json({
          success: false,
          error: 'خدمة النقل غير موجودة أو ليس لديك صلاحية للوصول إليها',
        });
      }

      await prisma.transport_services.delete({
        where: {
          id: id as string,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'تم حذف خدمة النقل بنجاح',
      });
    } catch (error) {
      console.error('خطأ في حذف خدمة النقل:', error);
      return res.status(500).json({
        success: false,
        error: 'خطأ في حذف خدمة النقل',
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({
      success: false,
      error: `الطريقة ${req.method} غير مدعومة`,
    });
  }
}
