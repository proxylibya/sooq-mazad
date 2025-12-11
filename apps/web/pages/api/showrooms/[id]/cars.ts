import { NextApiRequest, NextApiResponse } from 'next';
import { dbHelpers } from '../../../../lib/prisma';
import { keydbClient } from '../../../../lib/keydb';
import { ApiEnhancer } from '../../../../utils/api-enhancer';

interface CarsResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<CarsResponse>) {
  const enhancer = new ApiEnhancer();

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'معرف المعرض مطلوب',
      });
    }

    switch (req.method) {
      case 'GET':
        return await getShowroomCars(req, res, enhancer, id);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          success: false,
          error: 'طريقة غير مدعومة',
        });
    }
  } catch (error) {
    console.error('خطأ في API سيارات المعرض:', error);
    const errorResponse = enhancer.handleError(error, 'getShowroomCars');
    return res.status(500).json(errorResponse);
  }
}

// جلب سيارات معرض محدد
async function getShowroomCars(
  req: NextApiRequest,
  res: NextApiResponse<CarsResponse>,
  enhancer: ApiEnhancer,
  showroomId: string,
) {
  try {
    const { cursor, limit = '12', status = 'AVAILABLE' } = req.query;

    const limitNum = parseInt(limit as string);

    // إنشاء مفتاح cache
    const cacheKey = `showroom:${showroomId}:cars:${cursor || 'first'}:${limit}:${status}`;

    // محاولة جلب البيانات من KeyDB أولاً
    try {
      const cachedData = await keydbClient.get(cacheKey);
      if (cachedData) {
        console.log('[KeyDB] تم جلب سيارات المعرض من الذاكرة المؤقتة');
        return res.status(200).json(JSON.parse(cachedData));
      }
    } catch (cacheError) {
      console.warn('[KeyDB] خطأ في جلب البيانات من الذاكرة المؤقتة:', cacheError);
    }

    // التحقق من وجود المعرض أولاً
    const showroom = await dbHelpers.prisma.showrooms.findUnique({
      where: { id: showroomId },
      select: { id: true, name: true },
    });

    if (!showroom) {
      return res.status(404).json({
        success: false,
        error: 'المعرض غير موجود',
      });
    }

    // بناء شروط البحث
    const where: any = {
      showroomId: showroomId,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    // بناء queryOptions مع Cursor Pagination
    const queryOptions: any = {
      where,
      take: limitNum + 1,
      include: {
        carImages: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            isPrimary: true,
          },
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        },
        seller: {
          select: {
            id: true,
            name: true,
            phone: true,
            verified: true,
            profileImage: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor as string };
      queryOptions.skip = 1;
    }

    // جلب السيارات مع معالجة الأخطاء
    let cars = [];
    try {
      cars = await dbHelpers.prisma.cars.findMany(queryOptions);
    } catch (dbError) {
      console.error('خطأ في جلب السيارات من قاعدة البيانات:', dbError);
      // إرجاع قائمة فارغة بدلاً من خطأ
      cars = [];
    }

    // التحقق من وجود صفحة تالية
    const hasNextPage = cars.length > limitNum;
    if (hasNextPage) {
      cars.pop();
    }

    // حساب العدد الإجمالي مع معالجة الأخطاء
    let total = 0;
    try {
      total = await dbHelpers.prisma.cars.count({ where });
    } catch (countError) {
      console.error('خطأ في حساب عدد السيارات:', countError);
      total = cars.length; // استخدام عدد السيارات المجلبة كبديل
    }

    // تنسيق البيانات
    const formattedCars = cars.map((car) => ({
      id: car.id,
      title: car.title,
      brand: car.brand,
      model: car.model,
      year: car.year,
      price: car.price,
      images: car.carImages.map((img) => img.fileUrl),
      mileage: car.mileage,
      fuelType: car.fuelType,
      transmission: car.transmission,
      condition: car.condition,
      location: car.location,
      featured: car.featured,
      urgent: car.urgent,
      status: car.status,
      createdAt: car.createdAt.toISOString(),
      seller: car.seller,
    }));

    const nextCursor =
      hasNextPage && formattedCars.length > 0 ? formattedCars[formattedCars.length - 1].id : null;

    const responseData = enhancer.successResponse(
      {
        cars: formattedCars,
        showroom: {
          id: showroom.id,
          name: showroom.name,
        },
        pagination: {
          limit: limitNum,
          total,
          hasNextPage,
          nextCursor,
        },
      },
      undefined,
      'تم جلب سيارات المعرض بنجاح',
    );

    // حفظ البيانات في KeyDB للمرة القادمة (مدة انتهاء الصلاحية: 5 دقائق)
    try {
      await keydbClient.setex(cacheKey, 300, JSON.stringify(responseData));
      console.log('[KeyDB] تم حفظ سيارات المعرض في الذاكرة المؤقتة');
    } catch (cacheError) {
      console.warn('[KeyDB] خطأ في حفظ البيانات في الذاكرة المؤقتة:', cacheError);
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('خطأ في جلب سيارات المعرض:', error);
    const errorResponse = enhancer.handleError(error, 'getShowroomCars');
    return res.status(500).json(errorResponse);
  }
}
