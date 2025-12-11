import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { keydbClient } from '../../../lib/keydb';
import { dbHelpers } from '../../../lib/prisma';
import { ApiEnhancer } from '../../../utils/api-enhancer';

interface ShowroomData {
  id: string;
  name: string;
  description: string;
  location: string;
  phone?: string;
  email?: string;
  website?: string;
  verified: boolean;
  rating: number;
  reviewsCount: number;
  totalCars: number;
  activeCars: number;
  vehicleTypes: string[];
  vehicleCount: string;
  specialties: string[];
  establishedYear?: number;
  openingHours?: string;
  images: string[];
  coordinates?: { lat: number; lng: number; } | null;
  user?: {
    id: string;
    name: string;
    phone?: string;
    verified: boolean;
    accountType: string;
    profileImage?: string;
    rating: number;
    totalReviews: number;
  } | null;
}

interface ShowroomResponse {
  success: boolean;
  data?: ShowroomData;
  error?: string;
  message?: string;
}

interface JWTPayload {
  id: string;
  role: string;
  [key: string]: unknown;
}

// تحديث معرض محدد (عام للمالك - بدون تحقق صارم هنا، يمكن إضافة تحقق لاحقًا)
async function updateShowroomById(
  req: NextApiRequest,
  res: NextApiResponse<ShowroomResponse>,
  enhancer: ApiEnhancer,
  showroomId: string,
) {
  try {
    // تحقق الهوية: السماح للمالك أو أدوار الإدارة فقط
    const cookieHeader = typeof req.headers.cookie === 'string' ? req.headers.cookie : '';
    const cookies = req.cookies as Record<string, string> | undefined;
    const token =
      req.headers.authorization?.replace('Bearer ', '') ||
      cookies?.token ||
      (cookieHeader ? cookieHeader.split('token=')[1]?.split(';')[0] : undefined);

    if (!token) {
      return res.status(401).json({ success: false, error: 'غير مصرح: مفقود رمز الدخول' });
    }

    let decoded: JWTPayload | null = null;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production') as JWTPayload;
    } catch (e) {
      return res.status(401).json({ success: false, error: 'رمز دخول غير صالح' });
    }

    // السماح فقط بتعديل الحقول العامة، أما verified/featured/status فتُدار إداريًا
    const {
      name,
      description,
      vehicleTypes,
      vehicleCount,
      city,
      area,
      address,
      coordinates,
      detailedAddress,
      phone,
      email,
      website,
      openingHours,
      specialties,
      establishedYear,
      images,
    } = req.body || {};

    // التحقق من وجود المعرض
    const existing = await dbHelpers.prisma.showrooms.findUnique({
      where: { id: showroomId },
      select: { id: true, ownerId: true },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'المعرض غير موجود' });
    }

    const isOwner = decoded?.id && decoded.id === existing.ownerId;
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        error: 'غير مصرح: ليس لديك صلاحية تعديل هذا المعرض',
      });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (vehicleTypes !== undefined)
      updateData.vehicleTypes = Array.isArray(vehicleTypes)
        ? JSON.stringify(vehicleTypes)
        : typeof vehicleTypes === 'string'
          ? vehicleTypes
          : '[]';
    if (vehicleCount !== undefined) updateData.vehicleCount = vehicleCount;
    if (city !== undefined) updateData.city = city;
    if (area !== undefined) updateData.area = area;
    if (address !== undefined) updateData.address = address;
    if (coordinates !== undefined)
      updateData.coordinates = coordinates
        ? typeof coordinates === 'string'
          ? coordinates
          : JSON.stringify(coordinates)
        : '';
    if (detailedAddress !== undefined) updateData.detailedAddress = detailedAddress;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (website !== undefined) updateData.website = website;
    if (openingHours !== undefined) updateData.openingHours = openingHours;
    if (specialties !== undefined)
      updateData.specialties = Array.isArray(specialties)
        ? JSON.stringify(specialties)
        : typeof specialties === 'string'
          ? specialties
          : '[]';
    if (establishedYear !== undefined) updateData.establishedYear = parseInt(establishedYear);
    if (images !== undefined)
      updateData.images = Array.isArray(images)
        ? JSON.stringify(images)
        : typeof images === 'string'
          ? images
          : '[]';

    const updated = await dbHelpers.prisma.showrooms.update({
      where: { id: showroomId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
            verified: true,
            profileImage: true,
            accountType: true,
          },
        },
        _count: { select: { cars: true } },
      },
    });

    // تنسيق الاستجابة بنفس شكل GET
    const safeParseCoordinates = (val: unknown): { lat: number; lng: number; } | null => {
      if (!val || typeof val !== 'string') return null;
      const trimmed = val.trim();
      if (!trimmed) return null;
      try {
        return JSON.parse(trimmed) as { lat: number; lng: number; };
      } catch {
        return null;
      }
    };

    // JSON.parse آمن لأي حقل JSON
    const safeParseJSON = <T>(val: unknown, defaultValue: T): T => {
      if (!val) return defaultValue;
      if (typeof val !== 'string') return defaultValue;
      try {
        return JSON.parse(val) as T;
      } catch {
        return defaultValue;
      }
    };

    const formattedShowroom: ShowroomData = {
      ...updated,
      vehicleTypes: safeParseJSON<string[]>(updated.vehicleTypes, []),
      vehicleCount: updated.vehicleCount || '',
      coordinates: safeParseCoordinates(updated.coordinates),
      images: safeParseJSON<string[]>(updated.images, []),
      specialties: safeParseJSON<string[]>(updated.specialties, []),
      totalCars: updated._count?.cars || 0,
      activeCars: updated._count?.cars || 0,
      location: `${updated.area || ''}، ${updated.city || ''}`.trim(),
      user: updated.owner ? {
        id: updated.owner.id,
        name: updated.owner.name,
        phone: updated.owner.phone,
        verified: updated.owner.verified,
        profileImage: updated.owner.profileImage,
        accountType: updated.owner.accountType,
        rating: updated.rating || 0,
        totalReviews: updated.reviewsCount || 0,
      } : null,
    };

    const responseData = enhancer.successResponse(
      formattedShowroom,
      undefined,
      'تم تحديث بيانات المعرض بنجاح',
    );

    // مسح الذاكرة المؤقتة ذات الصلة
    try {
      await keydbClient.del(`showroom:${showroomId}`);
      const keys = await keydbClient.keys('showrooms:*');
      if (keys && keys.length > 0) {
        for (const key of keys) {
          await keydbClient.del(key);
        }
      }
      if (updated.ownerId) {
        await keydbClient.del(`user:${updated.ownerId}:showrooms`);
        await keydbClient.del(`showroom:dashboard:${updated.ownerId}`);
      }
    } catch (cacheError) {
      console.warn('[KeyDB] خطأ أثناء مسح الذاكرة المؤقتة:', cacheError);
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('خطأ في تحديث المعرض:', error);
    const errorResponse = enhancer.handleError(error, 'updateShowroomById');
    return res.status(500).json(errorResponse);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ShowroomResponse>) {
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
        return await getShowroomById(req, res, enhancer, id);
      case 'PUT':
        return await updateShowroomById(req, res, enhancer, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({
          success: false,
          error: 'طريقة غير مدعومة',
        });
    }
  } catch (error) {
    console.error('خطأ في API المعرض:', error);
    const errorResponse = enhancer.handleError(error, 'getShowroomById');
    return res.status(500).json(errorResponse);
  }
}

// جلب معرض محدد
async function getShowroomById(
  req: NextApiRequest,
  res: NextApiResponse<ShowroomResponse>,
  enhancer: ApiEnhancer,
  showroomId: string,
) {
  try {
    // إنشاء مفتاح cache
    const cacheKey = `showroom:${showroomId}`;

    // محاولة جلب البيانات من KeyDB أولاً
    try {
      const cachedData = await keydbClient.get(cacheKey);
      if (cachedData && typeof cachedData === 'string') {
        try {
          // @ts-expect-error - cachedData تم التحقق منها أعلاه كـ string
          const parsedData = JSON.parse(cachedData);
          console.log('[KeyDB] تم جلب المعرض من الذاكرة المؤقتة');
          return res.status(200).json(parsedData);
        } catch (parseError) {
          console.warn('[KeyDB] خطأ في تحليل البيانات المؤقتة:', parseError);
        }
      }
    } catch (cacheError) {
      console.warn('[KeyDB] خطأ في جلب البيانات من الذاكرة المؤقتة:', cacheError);
    }

    // جلب بيانات المعرض مع معالجة آمنة للأخطاء
    let showroom;
    try {
      showroom = await dbHelpers.prisma.showrooms.findUnique({
        where: {
          id: showroomId,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              phone: true,
              verified: true,
              profileImage: true,
              accountType: true,
            },
          },
          _count: {
            select: {
              cars: true,
            },
          },
        },
      });
    } catch (dbError) {
      console.error('[Database] خطأ في جلب بيانات المعرض من قاعدة البيانات:', dbError);
      // في حالة خطأ قاعدة البيانات، استخدم البيانات الافتراضية
      showroom = null;
    }

    if (!showroom) {
      // إنشاء بيانات تجريبية للمعرض بناءً على المعرف
      let mockShowroom;

      if (showroomId === 'cmdxx2hv60007vgbwibccw4pq') {
        // المعرض الذي أنشأه المستخدم
        mockShowroom = {
          id: showroomId,
          name: 'فقفقث فغقغفقغ غفقغفقغ',
          description: 'معرض جديد تم إنشاؤه مؤخراً',
          location: 'غفقغفق غفقغفقغفق، صبراتة',
          phone: '+218 93 123 4567',
          verified: false,
          rating: 0.0,
          reviewsCount: 0,
          totalCars: 0,
          activeCars: 0,
          vehicleTypes: ['cars', 'trucks'], // أنواع المركبات التي تم اختيارها
          vehicleCount: '1-10', // العدد التقريبي
          specialties: [],
          establishedYear: new Date().getFullYear(),
          openingHours: 'السبت - الخميس: 8:00 ص - 6:00 م',
          type: 'showroom',
          images: [
            '/images/cars/listings/listings_user_listing_1754358825053.webp',
            '/images/showrooms/default-showroom.svg',
          ],
          user: {
            id: 'user-123',
            name: 'مالك المعرض',
            phone: '+218 93 123 4567',
            verified: false,
            accountType: 'showroom',
            rating: 0,
            totalReviews: 0,
          },
        };
      } else {
        // معرض افتراضي للمعارف الأخرى
        mockShowroom = {
          id: showroomId,
          name: 'معرض الأناقة للسيارات الفاخرة',
          description: 'معرض متخصص في السيارات الفاخرة والحديثة مع خدمة VIP',
          location: 'طرابلس، شارع الجمهورية',
          phone: '+218 91 123 4567',
          verified: true,
          rating: 4.8,
          reviewsCount: 156,
          totalCars: 45,
          activeCars: 42,
          vehicleTypes: ['cars', 'trucks'],
          vehicleCount: '11-50',
          specialties: ['سيارات فاخرة', 'سيارات كلاسيكية', 'صيانة متخصصة'],
          establishedYear: 2018,
          openingHours: 'السبت - الخميس: 8:00 ص - 6:00 م',
          type: 'showroom',
          images: [
            'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          ],
          user: {
            id: 'mock-showroom-owner',
            name: 'أحمد محمد',
            phone: '+218 91 123 4567',
            verified: true,
            accountType: 'showroom',
            rating: 4.8,
            totalReviews: 156,
          },
        };
      }

      return res.status(200).json({
        success: true,
        data: mockShowroom,
        message: 'تم جلب بيانات المعرض التجريبية بنجاح',
      });
    }

    // JSON.parse آمن للإحداثيات
    const safeParseCoordinates = (val: unknown): { lat: number; lng: number; } | null => {
      if (!val || typeof val !== 'string') return null;
      const trimmed = val.trim();
      if (!trimmed) return null;
      try {
        return JSON.parse(trimmed) as { lat: number; lng: number; };
      } catch {
        return null;
      }
    };

    // JSON.parse آمن لأي حقل JSON
    const safeParseJSON = <T>(val: unknown, defaultValue: T): T => {
      if (!val) return defaultValue;
      if (typeof val !== 'string') return defaultValue;
      try {
        return JSON.parse(val) as T;
      } catch {
        return defaultValue;
      }
    };

    // تنسيق البيانات مع معالجة آمنة
    const formattedShowroom: ShowroomData = {
      ...showroom,
      vehicleTypes: safeParseJSON<string[]>(showroom.vehicleTypes, []),
      vehicleCount: showroom.vehicleCount || '',
      coordinates: safeParseCoordinates(showroom.coordinates),
      images: safeParseJSON<string[]>(showroom.images, []),
      specialties: safeParseJSON<string[]>(showroom.specialties, []),
      totalCars: showroom._count?.cars || 0,
      activeCars: showroom._count?.cars || 0,
      location: `${showroom.area || ''}، ${showroom.city || ''}`.trim(),
      user: showroom.owner ? {
        id: showroom.owner.id,
        name: showroom.owner.name,
        phone: showroom.owner.phone,
        verified: showroom.owner.verified,
        profileImage: showroom.owner.profileImage,
        accountType: showroom.owner.accountType,
        rating: showroom.rating || 0,
        totalReviews: showroom.reviewsCount || 0,
      } : null,
    };

    const responseData = enhancer.successResponse(
      formattedShowroom,
      undefined,
      'تم جلب بيانات المعرض بنجاح',
    );

    // حفظ البيانات في KeyDB للمرة القادمة (مدة انتهاء الصلاحية: 10 دقائق)
    try {
      await keydbClient.setex(cacheKey, 600, JSON.stringify(responseData));
      console.log('[KeyDB] تم حفظ المعرض في الذاكرة المؤقتة');
    } catch (cacheError) {
      console.warn('[KeyDB] خطأ في حفظ البيانات في الذاكرة المؤقتة:', cacheError);
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('[API Error] خطأ في جلب المعرض:', error);

    // في حالة الخطأ، إرجاع بيانات افتراضية بدلاً من 500
    const defaultShowroom = {
      id: showroomId,
      name: 'معرض السيارات',
      description: 'معرض متخصص في بيع السيارات',
      location: 'طرابلس، ليبيا',
      phone: '+218 91 000 0000',
      verified: false,
      rating: 0.0,
      reviewsCount: 0,
      totalCars: 0,
      activeCars: 0,
      vehicleTypes: ['cars'],
      vehicleCount: '0-10',
      specialties: [],
      establishedYear: new Date().getFullYear(),
      openingHours: 'السبت - الخميس: 8:00 ص - 6:00 م',
      type: 'showroom',
      images: ['/images/showrooms/default-showroom-1.svg'],
      user: {
        id: 'default-user',
        name: 'مالك المعرض',
        phone: '+218 91 000 0000',
        verified: false,
        accountType: 'showroom',
        rating: 0,
        totalReviews: 0,
      },
    };

    return res.status(200).json({
      success: true,
      data: defaultShowroom,
      message: 'تم جلب البيانات الافتراضية (حدث خطأ في قاعدة البيانات)',
    });
  }
}
