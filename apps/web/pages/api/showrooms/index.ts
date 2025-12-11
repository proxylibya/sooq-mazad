import { generateCacheKey, getCachedQuery, invalidateCachePattern } from '@/lib/cache/queryCache';
import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

// Helpers to safely parse JSON-like columns that might contain arrays stored as JSON or comma-separated strings
const parseJsonFlexible = (val: any, fallback: any[] = []) => {
  try {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return fallback;
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        return JSON.parse(trimmed);
      }
      return [trimmed];
    }
    return fallback;
  } catch {
    return fallback;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getShowrooms(req, res);
      case 'POST':
        return await createShowroom(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Showrooms API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function getShowrooms(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      city,
      search,
      sortBy = 'createdAt',
      sortDir = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      status: 'APPROVED'
    };

    if (city && city !== 'all') {
      where.city = city;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } },
        { area: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // التحقق من اتصال Prisma
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      console.error('خطأ في الاتصال بقاعدة البيانات:', dbError);
      return res.status(200).json({
        success: true,
        data: {
          showrooms: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0,
          },
        },
        mock: true,
        message: 'قاعدة البيانات غير متاحة حالياً. يرجى التأكد من تشغيل PostgreSQL',
      });
    }

    // Generate cache key from query parameters
    const cacheKey = generateCacheKey({
      page,
      limit,
      status,
      city,
      search,
      sortBy,
      sortDir,
    });

    // بناء queryOptions مع Offset Pagination
    const queryOptions: any = {
      where,
      skip,
      take: limitNum,
      select: {
        id: true,
        name: true,
        description: true,
        city: true,
        area: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        rating: true,
        reviewsCount: true,
        images: true,
        verified: true,
        featured: true,
        specialties: true,
        vehicleTypes: true,
        establishedYear: true,
        openingHours: true,
        createdAt: true,
        updatedAt: true,
        // بيانات المالك المختصرة
        owner: {
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
        // عدد السيارات فقط بدون جلب جميع البيانات
        _count: {
          select: {
            cars: true,
          },
        },
      },
      orderBy: {
        [sortBy as string]: sortDir,
      },
    };

    let showrooms: any[] = [];
    let total = 0;

    try {
      [showrooms, total] = await getCachedQuery(
        `showrooms-list:${cacheKey}`,
        async () =>
          await Promise.all([
            prisma.showrooms.findMany(queryOptions),
            prisma.showrooms.count({ where }),
          ]),
        { ttl: 120, prefix: 'api' }, // Cache لمدة 120 ثانية
      );
    } catch (queryError) {
      console.error('خطأ في استعلام المعارض:', queryError);

      // إرجاع قائمة فارغة بدلاً من بيانات وهمية
      return res.status(200).json({
        success: true,
        data: {
          showrooms: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            pages: 0,
          },
        },
        message: 'لا توجد معارض متاحة حالياً',
      });
    }

    // Transform data to match the expected format
    const transformedShowrooms = showrooms.map((showroom) => ({
      id: showroom.id,
      name: showroom.name,
      description: showroom.description,
      location: `${showroom.area}, ${showroom.city}`,
      city: showroom.city,
      area: showroom.area,
      address: showroom.address,
      phone: showroom.phone,
      email: showroom.email,
      website: showroom.website,
      rating: showroom.rating || 0,
      reviewsCount: showroom.reviewsCount || 0,
      totalCars: showroom._count.cars,
      activeCars: showroom._count.cars, // تقريبي - يمكن تحسينه لاحقاً
      images: (() => {
        const allImages = parseJsonFlexible(showroom.images, []);
        const validImages = allImages.filter((img: string) =>
          img && !img.includes('unsplash.com') && !img.includes('placeholder')
        );
        return validImages.length > 0 ? validImages : ['/images/showrooms/default-showroom.svg'];
      })(),
      verified: showroom.verified,
      featured: showroom.featured,
      specialties: parseJsonFlexible(showroom.specialties, []),
      vehicleTypes: parseJsonFlexible(showroom.vehicleTypes, []),
      establishedYear: showroom.establishedYear,
      openingHours: showroom.openingHours,
      type: 'showroom',
      user: {
        id: showroom.owner.id,
        name: showroom.owner.name,
        phone: showroom.owner.phone,
        verified: showroom.owner.verified,
        profileImage: showroom.owner.profileImage,
        accountType: showroom.owner.accountType,
        rating: showroom.owner.rating || 0,
      },
      createdAt: showroom.createdAt,
      updatedAt: showroom.updatedAt,
    }));

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      data: {
        showrooms: transformedShowrooms,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: totalPages,
        },
      },
    });
  } catch (error) {
    console.error('Showrooms API getShowrooms error:', error);

    // Return mock data in development if database fails
    if (process.env.NODE_ENV !== 'production') {
      return res.status(200).json({
        success: true,
        data: {
          showrooms: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0,
          },
        },
        mock: true,
        message: 'Using mock response in development due to data source error',
      });
    }

    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function createShowroom(req: NextApiRequest, res: NextApiResponse) {
  try {
    const showroomData = req.body || {};

    try {
      // Determine ownerId
      const ownerId: string | undefined = showroomData.ownerId;
      if (!ownerId) {
        return res.status(400).json({ success: false, error: 'Owner ID is required' });
      }

      // Normalize stringified fields
      const vehicleTypesStr = Array.isArray(showroomData.vehicleTypes)
        ? JSON.stringify(showroomData.vehicleTypes)
        : typeof showroomData.vehicleTypes === 'string'
          ? showroomData.vehicleTypes
          : '[]';

      const imagesStr = Array.isArray(showroomData.images)
        ? JSON.stringify(showroomData.images)
        : typeof showroomData.images === 'string'
          ? showroomData.images
          : '[]';

      const coordinatesStr = showroomData.coordinates
        ? typeof showroomData.coordinates === 'string'
          ? showroomData.coordinates
          : JSON.stringify(showroomData.coordinates)
        : undefined;

      const specialtiesStr = Array.isArray(showroomData.specialties)
        ? JSON.stringify(showroomData.specialties)
        : typeof showroomData.specialties === 'string'
          ? showroomData.specialties
          : undefined;

      // Persist showroom
      const created = await prisma.showrooms.create({
        data: {
          name: showroomData.name,
          description: showroomData.description || '',
          vehicleTypes: vehicleTypesStr,
          vehicleCount: showroomData.vehicleCount || '',
          city: showroomData.city || '',
          area: showroomData.area || '',
          address: showroomData.address || '',
          coordinates: coordinatesStr,
          detailedAddress: showroomData.detailedAddress,
          images: imagesStr,
          phone: showroomData.phone,
          email: showroomData.email,
          website: showroomData.website,
          openingHours: showroomData.openingHours,
          specialties: specialtiesStr,
          establishedYear: showroomData.establishedYear
            ? parseInt(String(showroomData.establishedYear))
            : null,
          verified: true,
          featured: !!showroomData.featured,
          status: 'APPROVED',
          rating: 0,
          reviewsCount: 0,
          totalCars: 0,
          activeCars: 0,
          soldCars: 0,
          ownerId: ownerId!,
        },
      });

      // Transform response similar to GET
      // إبطال كاش قوائم المعارض لضمان ظهور المعرض الجديد فوراً
      try {
        await invalidateCachePattern('showrooms-list:*', 'api');
      } catch (e) {
        // تجاهل أي أخطاء في الكاش
      }

      return res.status(201).json({
        success: true,
        data: {
          id: created.id,
          status: created.status,
          createdAt: created.createdAt,
        },
        message: 'تم إنشاء المعرض بنجاح',
      });
    } catch (dbError) {
      // Development fallback when database/Prisma is unavailable
      if (process.env.NODE_ENV === 'development') {
        console.warn('Database unavailable in development, using fallback for showroom creation');

        const mockCreated = {
          id: `mock-showroom-${Date.now()}`,
          status: 'PENDING' as const,
          createdAt: new Date(),
        };

        return res.status(201).json({
          success: true,
          data: mockCreated,
          message: 'تم إنشاء المعرض بنجاح (وضع التطوير)',
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('خطأ في إنشاء المعرض:', error);
    return res.status(500).json({ success: false, error: 'حدث خطأ أثناء إنشاء المعرض' });
  }
}
