import { NextApiRequest, NextApiResponse } from 'next';
import { dbHelpers } from '../../../lib/prisma';
import { createApiHandler, validateMethod, ApiEnhancer } from '../../../utils/api-enhancer';
import { keydbClient } from '../../../lib/keydb';

interface MyShowroomsResponse {
  success: boolean;
  data?: {
    showrooms: any[];
    total: number;
  };
  error?: string;
}

export default createApiHandler(
  async (req: NextApiRequest, res: NextApiResponse<MyShowroomsResponse>, enhancer: ApiEnhancer) => {
    if (!validateMethod(req, res, ['GET', 'PUT', 'DELETE'])) return;

    switch (req.method) {
      case 'GET':
        return await getMyShowrooms(req, res, enhancer);
      case 'PUT':
        return await updateShowroomStatus(req, res, enhancer);
      case 'DELETE':
        return await deleteShowroom(req, res, enhancer);
    }
  },
);

// جلب المعارض الخاصة بالمستخدم
async function getMyShowrooms(
  req: NextApiRequest,
  res: NextApiResponse<MyShowroomsResponse>,
  enhancer: ApiEnhancer,
) {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'معرف المستخدم مطلوب',
      });
    }

    // إنشاء مفتاح cache
    const cacheKey = `user:${userId}:showrooms`;

    // محاولة جلب البيانات من KeyDB أولاً
    try {
      const cachedData = await keydbClient.get(cacheKey);
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }
    } catch (cacheError) {
      console.warn('[KeyDB] خطأ في جلب البيانات من الذاكرة المؤقتة:', cacheError);
    }

    // التحقق من وجود المستخدم وأنه من نوع SHOWROOM
    const user = await dbHelpers.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        accountType: true,
        name: true,
        phone: true,
        verified: true,
      },
    });

    if (!user || user.accountType !== 'SHOWROOM') {
      return res.status(403).json({
        success: false,
        error: 'غير مصرح لك بالوصول لهذه البيانات',
      });
    }

    // جلب المعارض التابعة للمستخدم
    const showrooms = await dbHelpers.prisma.showrooms.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: {
            cars: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // تحويل البيانات للتنسيق المطلوب
    // محول JSON مرن للتعامل مع القيم المخزنة كسلاسل نصية أو JSON
    const parseJsonFlexible = (val: any, fallback: any[] = []) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed) return fallback;
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try {
            return JSON.parse(trimmed);
          } catch {
            return fallback;
          }
        }
        // إن كانت قيمة نصية عادية (مثل "سيارات") أعدها كمصفوفة ذات عنصر واحد
        return [trimmed];
      }
      return fallback;
    };

    const formattedShowrooms = showrooms.map((showroom) => ({
      id: showroom.id,
      name: showroom.name,
      description: showroom.description,
      images: parseJsonFlexible(showroom.images, []),
      phone: showroom.phone,
      email: showroom.email,
      website: showroom.website,
      city: showroom.city,
      area: showroom.area,
      address: showroom.address,
      rating: showroom.rating || 0,
      reviewsCount: showroom.reviewsCount || 0,
      totalCars: showroom._count.cars,
      activeCars: showroom.activeCars,
      verified: showroom.verified,
      featured: showroom.featured,
      status: showroom.status,
      vehicleTypes: parseJsonFlexible(showroom.vehicleTypes, []),
      specialties: parseJsonFlexible(showroom.specialties, []),
      openingHours: showroom.openingHours,
      establishedYear: showroom.establishedYear,
      createdAt: showroom.createdAt,
      updatedAt: showroom.updatedAt,
    }));

    const responseData = enhancer.successResponse(
      {
        showrooms: formattedShowrooms,
        total: formattedShowrooms.length,
        user: {
          name: user.name,
          phone: user.phone,
          verified: user.verified,
        },
      },
      undefined,
      'تم جلب المعارض بنجاح',
    );

    // حفظ البيانات في KeyDB للمرة القادمة (مدة انتهاء الصلاحية: 5 دقائق)
    try {
      await keydbClient.setex(cacheKey, 300, JSON.stringify(responseData));
    } catch (cacheError) {
      console.warn('[KeyDB] خطأ في حفظ البيانات في الذاكرة المؤقتة:', cacheError);
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('خطأ في جلب معارض المستخدم:', error);
    const errorResponse = enhancer.handleError(error, 'getMyShowrooms');
    return res.status(500).json(errorResponse);
  }
}

// تحديث حالة المعرض (تفعيل/إلغاء تفعيل)
async function updateShowroomStatus(
  req: NextApiRequest,
  res: NextApiResponse<MyShowroomsResponse>,
  enhancer: ApiEnhancer,
) {
  try {
    const { showroomId, action, userId } = req.body;

    if (!showroomId || !action || !userId) {
      return res.status(400).json({
        success: false,
        error: 'بيانات غير مكتملة',
      });
    }

    // التحقق من ملكية المعرض
    const showroom = await dbHelpers.prisma.showrooms.findFirst({
      where: {
        id: showroomId,
        ownerId: userId,
      },
    });

    if (!showroom) {
      return res.status(404).json({
        success: false,
        error: 'المعرض غير موجود أو غير مملوك لك',
      });
    }

    const updateData: any = {};

    switch (action) {
      case 'approve':
        updateData.status = 'APPROVED';
        break;
      case 'suspend':
        updateData.status = 'SUSPENDED';
        break;
      case 'toggle_featured':
        updateData.featured = !showroom.featured;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'إجراء غير صحيح',
        });
    }

    // تحديث المعرض
    const updatedShowroom = await dbHelpers.prisma.showrooms.update({
      where: { id: showroomId },
      data: updateData,
    });

    // مسح cache المستخدم
    try {
      await keydbClient.del(`user:${userId}:showrooms`);
      await keydbClient.del(`showroom:dashboard:${userId}`);
    } catch (cacheError) {
      console.warn('[KeyDB] خطأ في مسح الذاكرة المؤقتة:', cacheError);
    }

    return res
      .status(200)
      .json(
        enhancer.successResponse({ showroom: updatedShowroom }, undefined, 'تم تحديث المعرض بنجاح'),
      );
  } catch (error) {
    console.error('خطأ في تحديث المعرض:', error);
    const errorResponse = enhancer.handleError(error, 'updateShowroomStatus');
    return res.status(500).json(errorResponse);
  }
}

// حذف المعرض
async function deleteShowroom(
  req: NextApiRequest,
  res: NextApiResponse<MyShowroomsResponse>,
  enhancer: ApiEnhancer,
) {
  try {
    const { showroomId, userId } = req.body;

    if (!showroomId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'بيانات غير مكتملة',
      });
    }

    // التحقق من ملكية المعرض
    const showroom = await dbHelpers.prisma.showrooms.findFirst({
      where: {
        id: showroomId,
        ownerId: userId,
      },
      include: {
        _count: {
          select: {
            cars: true,
          },
        },
      },
    });

    if (!showroom) {
      return res.status(404).json({
        success: false,
        error: 'المعرض غير موجود أو غير مملوك لك',
      });
    }

    // التحقق من وجود سيارات في المعرض
    if (showroom._count.cars > 0) {
      return res.status(400).json({
        success: false,
        error: 'لا يمكن حذف المعرض لأنه يحتوي على سيارات. يرجى حذف جميع السيارات أولاً.',
      });
    }

    // حذف المعرض
    await dbHelpers.prisma.showrooms.delete({
      where: { id: showroomId },
    });

    // مسح cache المستخدم
    try {
      await keydbClient.del(`user:${userId}:showrooms`);
      await keydbClient.del(`showroom:dashboard:${userId}`);
    } catch (cacheError) {
      console.warn('[KeyDB] خطأ في مسح الذاكرة المؤقتة:', cacheError);
    }

    return res
      .status(200)
      .json(
        enhancer.successResponse(
          { deletedShowroomId: showroomId },
          undefined,
          'تم حذف المعرض بنجاح',
        ),
      );
  } catch (error) {
    console.error('خطأ في حذف المعرض:', error);
    const errorResponse = enhancer.handleError(error, 'deleteShowroom');
    return res.status(500).json(errorResponse);
  }
}
