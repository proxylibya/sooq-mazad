import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

function parseImages(images: unknown, carImages?: { fileUrl: string; isPrimary: boolean; }[]) {
  // Prefer dedicated carImages if present
  if (Array.isArray(carImages) && carImages.length > 0) {
    return carImages.map((img) => img.fileUrl).filter(Boolean);
  }

  if (Array.isArray(images)) {
    return images.filter((v) => typeof v === 'string' && v.trim());
  }

  if (typeof images === 'string') {
    const trimmed = images.trim();
    if (!trimmed) return [];
    try {
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const arr = JSON.parse(trimmed);
        if (Array.isArray(arr)) {
          return arr.filter((v) => typeof v === 'string' && v.trim());
        }
      }
    } catch {
      // ignore JSON parse error and try comma-separated
    }
    return trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt((req.query.limit as string) || '20', 10)));
    const status = ((req.query.status as string) || 'AVAILABLE').toUpperCase();
    const isAuction = req.query.isAuction === 'true' ? true :
      req.query.isAuction === 'false' ? false : undefined;

    const where: any = {
      status,
    };

    // إضافة فلتر isAuction إذا تم تحديده صراحة
    if (isAuction !== undefined) {
      where.isAuction = isAuction;
    }
    // لا نضيف فلتر افتراضي - دع النظام يجد جميع السيارات المتاحة

    console.log('🔍 [API /api/cars] معاملات الطلب:', { page, limit, status, isAuction });
    console.log('🔍 [API /api/cars] شروط الاستعلام:', where);
    console.log('🔍 [API /api/cars] البحث عن:', `status='${status}' AND isAuction=${isAuction}`);

    let total: number;
    let results: any[];
    try {
      [total, results] = await Promise.all([
        prisma.cars.count({ where }),
        prisma.cars.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            brand: true,
            model: true,
            year: true,
            price: true,
            mileage: true,
            fuelType: true,
            transmission: true,
            bodyType: true,
            condition: true,
            location: true,
            color: true,
            images: true,
            sellerId: true,
            status: true,
            featured: true,
            promotionPackage: true,
            promotionDays: true,
            promotionStartDate: true,
            promotionEndDate: true,
            promotionPriority: true,
            createdAt: true,
            description: true,
            // الحقول الإضافية المطلوبة لصفحة التفاصيل
            interiorColor: true,
            seatCount: true,
            regionalSpecs: true,
            chassisNumber: true,
            engineNumber: true,
            vehicleType: true,
            manufacturingCountry: true,
            customsStatus: true,
            licenseStatus: true,
            insuranceStatus: true,
            paymentMethod: true,
            features: true,
            // مختصر بيانات البائع
            users: {
              select: {
                id: true,
                name: true,
                phone: true,
                verified: true,
                profileImage: true,
                accountType: true,
                rating: true,
              },
            },
            // بيانات المعرض المختصرة
            showrooms: {
              select: {
                id: true,
                name: true,
                verified: true,
                rating: true,
              },
            },
            // الصور الأساسية (أولوية المعالجة)
            car_images: {
              select: { fileUrl: true, isPrimary: true },
              take: 3,
              orderBy: [{ isPrimary: 'desc' as const }, { createdAt: 'asc' as const }],
            },
          },
        }),
      ]);

      console.log('🔍 [API /api/cars] نتائج الاستعلام:', { total, resultsCount: results.length });
      if (results.length > 0) {
        console.log('🔍 [API /api/cars] أول سيارة:', {
          id: results[0].id,
          title: results[0].title,
          status: results[0].status,
          hasChassisNumber: !!(results[0] as any).chassisNumber,
          hasEngineNumber: !!(results[0] as any).engineNumber,
          hasFeatures: !!(results[0] as any).features
        });
      }
    } catch (err: any) {
      const message: string = err?.message || '';
      const isMissingIsAuctionColumn =
        typeof message === 'string' &&
        message.toLowerCase().includes('isauction') &&
        (message.toLowerCase().includes('does not exist') ||
          message.toLowerCase().includes('unknown column'));

      if (!isMissingIsAuctionColumn) {
        throw err;
      }

      // إعادة تنفيذ الاستعلامات بدون فلتر isAuction للتوافق مع قواعد بيانات لم تُحدّث بعد
      const fallbackWhere: any = { ...where };
      delete fallbackWhere.isAuction;

      [total, results] = await Promise.all([
        prisma.cars.count({ where: fallbackWhere }),
        prisma.cars.findMany({
          where: fallbackWhere,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            brand: true,
            model: true,
            year: true,
            price: true,
            mileage: true,
            fuelType: true,
            transmission: true,
            bodyType: true,
            condition: true,
            location: true,
            color: true,
            images: true,
            sellerId: true,
            status: true,
            featured: true,
            promotionPackage: true,
            promotionDays: true,
            promotionStartDate: true,
            promotionEndDate: true,
            promotionPriority: true,
            createdAt: true,
            description: true,
            // الحقول الإضافية المطلوبة لصفحة التفاصيل
            interiorColor: true,
            seatCount: true,
            regionalSpecs: true,
            chassisNumber: true,
            engineNumber: true,
            vehicleType: true,
            manufacturingCountry: true,
            customsStatus: true,
            licenseStatus: true,
            insuranceStatus: true,
            paymentMethod: true,
            features: true,
            users: {
              select: {
                id: true,
                name: true,
                phone: true,
                verified: true,
                profileImage: true,
                accountType: true,
                rating: true,
              },
            },
            showrooms: {
              select: {
                id: true,
                name: true,
                verified: true,
                rating: true,
              },
            },
            car_images: {
              select: { fileUrl: true, isPrimary: true },
              take: 3,
              orderBy: [{ isPrimary: 'desc' as const }, { createdAt: 'asc' as const }],
            },
          },
        }),
      ]);
    }

    const cars = results.map((car) => {
      const images = parseImages(car.images as any, (car as any).car_images);

      // تجميع البيانات الإضافية في features object كما تتوقعه صفحة التفاصيل
      const additionalFeatures = {
        bodyType: car.bodyType || '',
        fuelType: car.fuelType || '',
        transmission: car.transmission || '',
        regionalSpec: (car as any).regionalSpecs || '',
        exteriorColor: car.color || '',
        interiorColor: (car as any).interiorColor || '',
        seatCount: (car as any).seatCount || '',
        chassisNumber: (car as any).chassisNumber || '',
        engineNumber: (car as any).engineNumber || '',
        vehicleType: (car as any).vehicleType || '',
        manufacturingCountry: (car as any).manufacturingCountry || '',
        customsStatus: (car as any).customsStatus || '',
        licenseStatus: (car as any).licenseStatus || '',
        insuranceStatus: (car as any).insuranceStatus || '',
        paymentMethod: (car as any).paymentMethod || '',
      };

      // دمج مع features الموجودة (الكماليات) 
      let combinedFeatures = [];
      try {
        if ((car as any).features) {
          const existingFeatures = JSON.parse((car as any).features);
          if (Array.isArray(existingFeatures)) {
            combinedFeatures = existingFeatures;
          }
        }
      } catch (e) {
        // تجاهل خطأ JSON parsing
      }

      return {
        id: car.id,
        title: car.title,
        brand: car.brand,
        model: car.model,
        year: car.year,
        price: car.price,
        mileage: car.mileage,
        fuelType: car.fuelType,
        transmission: car.transmission,
        bodyType: car.bodyType,
        condition: car.condition,
        color: car.color,
        images: images.length > 0 ? images : ['/images/cars/default-car.svg'],
        status: car.status,
        featured: car.featured,
        createdAt: car.createdAt,
        sellerId: car.sellerId,
        description: (car as any).description || '',
        // البيانات مُجمعة في features object كما تتوقعه صفحة التفاصيل
        features: {
          ...additionalFeatures,
          // إضافة الكماليات كمصفوفة منفصلة
          amenities: combinedFeatures,
        },
        // لتوافق الواجهة الأمامية التي تتوقع user
        user: (car as any).users
          ? {
            id: (car as any).users.id,
            name: (car as any).users.name,
            phone: (car as any).users.phone || '',
            verified: (car as any).users.verified,
            profileImage: (car as any).users.profileImage,
            accountType: (car as any).users.accountType,
            rating: (car as any).users.rating,
          }
          : {
            id: car.sellerId,
            name: 'مستخدم غير معروف',
            phone: '',
            verified: false,
          },
        showroom: (car as any).showrooms || null,
      };
    });

    res.setHeader('Cache-Control', 'private, max-age=0, no-cache, no-store');
    return res.status(200).json({
      success: true,
      data: {
        cars,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('/api/cars error:', error);
    // لا نكسر الواجهة الأمامية: نعيد استجابة فارغة بنفس البنية
    return res.status(200).json({
      success: true,
      data: {
        cars: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
      mock: true,
      message: 'Database unavailable or query error',
    });
  }
}
