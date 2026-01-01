import { NextApiRequest, NextApiResponse } from 'next';
import { dbHelpers } from '../../../lib/prisma';
import { keydbClient } from '../../../lib/keydb';
import { ApiEnhancer } from '../../../utils/api-enhancer';

interface RecentActivitiesResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RecentActivitiesResponse>,
) {
  const enhancer = new ApiEnhancer();

  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({
        success: false,
        error: 'طريقة غير مدعومة',
      });
    }

    const { userId, limit = '10' } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'معرف المستخدم مطلوب',
      });
    }

    const limitNum = parseInt(limit as string);

    // إنشاء مفتاح cache
    const cacheKey = `showroom:activities:${userId}:${limit}`;

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
      select: { id: true, accountType: true },
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
      select: { id: true, name: true },
    });

    const showroomIds = showrooms.map((s) => s.id);

    // جلب النشاطات الأخيرة
    const activities = [];

    // 1. السيارات المضافة حديثاً
    const recentCars = await dbHelpers.prisma.cars.findMany({
      where: {
        showroomId: { in: showroomIds },
      },
      include: {
        showroom: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limitNum,
    });

    recentCars.forEach((car) => {
      activities.push({
        id: `car_${car.id}`,
        type: 'car_added',
        title: 'تم إضافة سيارة جديدة',
        description: `${car.brand} ${car.model} ${car.year}`,
        details: `في معرض ${car.showroom?.name}`,
        time: car.createdAt,
        icon: 'car',
        color: 'blue',
        link: `/marketplace/${car.id}`,
      });
    });

    // 2. المعارض المنشأة حديثاً
    const recentShowrooms = await dbHelpers.prisma.showrooms.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    recentShowrooms.forEach((showroom) => {
      activities.push({
        id: `showroom_${showroom.id}`,
        type: 'showroom_created',
        title: 'تم إنشاء معرض جديد',
        description: showroom.name,
        details: `في ${showroom.city}`,
        time: showroom.createdAt,
        icon: 'showroom',
        color: 'green',
        link: `/showrooms/${showroom.id}`,
      });
    });

    // ترتيب النشاطات حسب التاريخ
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // أخذ العدد المطلوب فقط
    const limitedActivities = activities.slice(0, limitNum);

    // تنسيق التواريخ
    const formattedActivities = limitedActivities.map((activity) => ({
      ...activity,
      timeAgo: getTimeAgo(new Date(activity.time)),
      formattedTime: new Date(activity.time).toLocaleString('ar-LY'),
    }));

    const responseData = enhancer.successResponse(
      {
        activities: formattedActivities,
        total: activities.length,
      },
      undefined,
      'تم جلب النشاطات الأخيرة بنجاح',
    );

    // حفظ البيانات في KeyDB للمرة القادمة (مدة انتهاء الصلاحية: 2 دقيقة)
    try {
      await keydbClient.setex(cacheKey, 120, JSON.stringify(responseData));
    } catch (cacheError) {
      console.warn('[KeyDB] خطأ في حفظ البيانات في الذاكرة المؤقتة:', cacheError);
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('خطأ في جلب النشاطات الأخيرة:', error);
    const errorResponse = enhancer.handleError(error, 'getRecentActivities');
    return res.status(500).json(errorResponse);
  }
}

// دالة لحساب الوقت المنقضي
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'منذ لحظات';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `منذ ${minutes} دقيقة`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `منذ ${hours} ساعة`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `منذ ${days} يوم`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `منذ ${months} شهر`;
  }
}
