/**
 * API السوق الفوري الموحد - مع النظام الجديد للصور
 */

import { NextApiRequest, NextApiResponse } from 'next';
import apiResponse from '../../lib/api/response';
import { logger } from '../../lib/core/logging/UnifiedLogger';
import { getVehiclesWithImages, resolveVehicleImages } from '../../lib/services/universal/vehicleService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    logger.info('API السوق الفوري - طلب جديد', {
      method: req.method,
      query: req.query,
      ip: req.headers['x-forwarded-for'] || 'unknown',
    });

    switch (req.method) {
      case 'GET':
        return await getMarketplaceCars(req, res);
      default:
        return apiResponse.methodNotAllowed(res, ['GET']);
    }
  } catch (error) {
    logger.error('خطأ في API السوق الفوري:', error);
    return apiResponse.serverError(
      res,
      'خطأ في الخادم',
      error instanceof Error ? error.message : 'خطأ غير محدد',
      { route: 'api/marketplace' },
      'SERVER_ERROR'
    );
  }
}

async function getMarketplaceCars(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      page = '1',
      limit = '20',
      brand,
      model,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      condition,
      location,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    logger.info('جلب سيارات السوق الفوري', {
      page: pageNum,
      limit: limitNum,
      filters: { brand, model, condition, location }
    });

    // استخدام النظام الموحد لجلب السيارات
    const { vehicles, total } = await getVehiclesWithImages({
      limit: limitNum,
      offset: offset,
      status: 'AVAILABLE',
      isAuction: false, // فقط سيارات السوق الفوري (ليس مزاد)
      featured: featured === 'true' ? true : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    // تطبيق فلاتر إضافية حسب الحاجة
    let filteredVehicles = vehicles;

    if (brand && brand !== 'all') {
      filteredVehicles = filteredVehicles.filter(car =>
        car.brand.toLowerCase() === (brand as string).toLowerCase()
      );
    }

    if (model) {
      filteredVehicles = filteredVehicles.filter(car =>
        car.model.toLowerCase().includes((model as string).toLowerCase())
      );
    }

    if (condition && condition !== 'all') {
      filteredVehicles = filteredVehicles.filter(car =>
        car.condition === condition
      );
    }

    if (location) {
      filteredVehicles = filteredVehicles.filter(car =>
        car.location.toLowerCase().includes((location as string).toLowerCase())
      );
    }

    if (minPrice) {
      filteredVehicles = filteredVehicles.filter(car =>
        car.price >= parseFloat(minPrice as string)
      );
    }

    if (maxPrice) {
      filteredVehicles = filteredVehicles.filter(car =>
        car.price <= parseFloat(maxPrice as string)
      );
    }

    if (minYear) {
      filteredVehicles = filteredVehicles.filter(car =>
        car.year >= parseInt(minYear as string)
      );
    }

    if (maxYear) {
      filteredVehicles = filteredVehicles.filter(car =>
        car.year <= parseInt(maxYear as string)
      );
    }

    // ترتيب الإعلانات: المميزة أولاً ثم حسب الأولوية ثم الأحدث
    const sortedVehicles = [...filteredVehicles].sort((a: any, b: any) => {
      // المميزة أولاً
      const aFeatured = a.featured ? 1 : 0;
      const bFeatured = b.featured ? 1 : 0;
      if (aFeatured !== bFeatured) return bFeatured - aFeatured;

      // ثم حسب أولوية الترويج
      const aPriority = a.promotionPriority || 0;
      const bPriority = b.promotionPriority || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;

      // ثم الأحدث
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return bDate - aDate;
    });

    // تنسيق البيانات للعرض
    const formattedCars = sortedVehicles.map((vehicle: any) => {
      // استخدام resolveVehicleImages لاستخراج الصور الصحيحة
      const resolvedImages = resolveVehicleImages(vehicle);

      return {
        id: vehicle.id,
        title: vehicle.title,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        condition: vehicle.condition,
        mileage: vehicle.mileage,
        location: vehicle.location,
        description: vehicle.description,
        features: vehicle.features,
        images: resolvedImages, // الصور المستخرجة بشكل صحيح
        carImages: vehicle.carImages, // البيانات الجديدة للصور (للتوافق)
        seller: vehicle.seller,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
        // بيانات الترويج
        featured: vehicle.featured || false,
        promotionPackage: vehicle.promotionPackage || 'free',
        promotionEndDate: vehicle.promotionEndDate,
        promotionPriority: vehicle.promotionPriority || 0,
        // بيانات إضافية للعرض
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        bodyType: vehicle.bodyType,
        color: vehicle.color,
        interiorColor: vehicle.interiorColor,
        seatCount: vehicle.seatCount,
      };
    });

    logger.info(`تم جلب ${formattedCars.length} سيارة من السوق الفوري من أصل ${total}`);

    return apiResponse.ok(
      res,
      {
        cars: formattedCars,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total,
          pages: Math.ceil(total / limitNum),
          hasNextPage: pageNum * limitNum < total,
        },
      },
      { route: 'api/marketplace', message: 'تم جلب سيارات السوق الفوري بنجاح' },
      'OK'
    );

  } catch (error) {
    logger.error('خطأ في جلب سيارات السوق الفوري:', error);
    return apiResponse.serverError(
      res,
      'خطأ في جلب سيارات السوق الفوري',
      error instanceof Error ? error.message : 'خطأ غير محدد',
      { route: 'api/marketplace' },
      'FETCH_ERROR'
    );
  }
}
