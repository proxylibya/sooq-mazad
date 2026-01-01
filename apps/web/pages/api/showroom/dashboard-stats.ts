import { NextApiRequest, NextApiResponse } from 'next';
import { dbHelpers } from '../../../lib/prisma';
import { keydbClient } from '../../../lib/keydb';
import { ApiEnhancer } from '../../../utils/api-enhancer';

interface DashboardStatsResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardStatsResponse>,
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

    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'معرف المستخدم مطلوب',
      });
    }

    // إنشاء مفتاح cache
    const cacheKey = `showroom:dashboard:${userId}`;

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
      select: { id: true, accountType: true, name: true },
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
    });

    // جلب السيارات التابعة للمعارض
    const showroomIds = showrooms.map((s) => s.id);
    const cars = await dbHelpers.prisma.cars.findMany({
      where: {
        showroomId: { in: showroomIds },
      },
      select: {
        id: true,
        status: true,
        featured: true,
        urgent: true,
        createdAt: true,
        price: true,
        views: true,
      },
    });

    // حساب الإحصائيات
    const totalShowrooms = showrooms.length;
    const totalCars = cars.length;
    const activeCars = cars.filter((car) => car.status === 'AVAILABLE').length;
    const featuredCars = cars.filter((car) => car.featured).length;
    const urgentCars = cars.filter((car) => car.urgent).length;
    const totalViews = cars.reduce((sum, car) => sum + (car.views || 0), 0);

    // إحصائيات الشهر الحالي
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const carsThisMonth = cars.filter((car) => new Date(car.createdAt) >= currentMonth).length;

    // متوسط السعر
    const averagePrice =
      cars.length > 0 ? cars.reduce((sum, car) => sum + car.price, 0) / cars.length : 0;

    // أعلى وأقل سعر
    const prices = cars.map((car) => car.price);
    const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;

    // إحصائيات المعارض
    const verifiedShowrooms = showrooms.filter((s) => s.verified).length;
    const featuredShowrooms = showrooms.filter((s) => s.featured).length;

    // بيانات الرسم البياني للسيارات المضافة خلال آخر 7 أيام
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const carsCount = cars.filter((car) => {
        const carDate = new Date(car.createdAt);
        return carDate >= date && carDate < nextDate;
      }).length;

      last7Days.push({
        date: date.toISOString().split('T')[0],
        cars: carsCount,
      });
    }

    const dashboardStats = {
      overview: {
        totalShowrooms,
        totalCars,
        activeCars,
        totalViews,
        carsThisMonth,
        verifiedShowrooms,
        featuredShowrooms,
      },
      cars: {
        total: totalCars,
        active: activeCars,
        featured: featuredCars,
        urgent: urgentCars,
        averagePrice,
        highestPrice,
        lowestPrice,
      },
      showrooms: {
        total: totalShowrooms,
        verified: verifiedShowrooms,
        featured: featuredShowrooms,
        averageRating:
          showrooms.reduce((sum, s) => sum + (s.rating || 0), 0) / (totalShowrooms || 1),
      },
      charts: {
        last7Days,
        statusDistribution: [
          { name: 'متاحة', value: activeCars, color: '#10B981' },
          {
            name: 'مباعة',
            value: cars.filter((c) => c.status === 'SOLD').length,
            color: '#F59E0B',
          },
          {
            name: 'معلقة',
            value: cars.filter((c) => c.status === 'PENDING').length,
            color: '#EF4444',
          },
        ],
      },
      recentActivity: cars
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((car) => ({
          id: car.id,
          type: 'car_added',
          createdAt: car.createdAt,
        })),
    };

    const responseData = enhancer.successResponse(
      dashboardStats,
      undefined,
      'تم جلب إحصائيات المعرض بنجاح',
    );

    // حفظ البيانات في KeyDB للمرة القادمة (مدة انتهاء الصلاحية: 5 دقائق)
    try {
      await keydbClient.setex(cacheKey, 300, JSON.stringify(responseData));
    } catch (cacheError) {
      console.warn('[KeyDB] خطأ في حفظ البيانات في الذاكرة المؤقتة:', cacheError);
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('خطأ في جلب إحصائيات المعرض:', error);
    const errorResponse = enhancer.handleError(error, 'getShowroomDashboardStats');
    return res.status(500).json(errorResponse);
  }
}
