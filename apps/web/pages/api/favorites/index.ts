import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

// دالة لإنشاء ID فريد (مشابه لـ cuid)
function generateId(): string {
  return 'fav_' + crypto.randomUUID().replace(/-/g, '').substring(0, 20);
}

// تخزين مؤقت للطلبات لمنع التكرار
const requestCache = new Map<string, { timestamp: number; data: any; }>();
const CACHE_DURATION = 5000; // 5 ثوانٍ

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // إعداد headers للاستجابة JSON
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  // التأكد من إرجاع JSON صحيح دائماً
  const sendJsonResponse = (statusCode: number, data: any) => {
    try {
      return res.status(statusCode).json(data);
    } catch (error) {
      console.error('خطأ في إرسال JSON response:', error);
      return res.status(500).end('{"success":false,"error":"خطأ في الخادم"}');
    }
  };

  try {
    // التحقق من المصادقة
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    if (!token) {
      return sendJsonResponse(401, {
        success: false,
        error: 'غير مصرح لك بالوصول',
      });
    }

    // التحقق من وجود JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('فشل JWT_SECRET غير موجود في متغيرات البيئة');
      return res.status(500).json({
        success: false,
        error: 'خطأ في إعدادات الخادم',
      });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      userId = decoded.userId || decoded.id;

      if (!userId) {
        throw new Error('معرف المستخدم غير موجود في الرمز المميز');
      }
    } catch (error) {
      console.error('خطأ في التحقق من الرمز المميز:', {
        error: error instanceof Error ? error.message : 'خطأ غير معروف',
        tokenLength: token?.length || 0,
        tokenStart: token?.substring(0, 20) || 'غير موجود',
      });
      return res.status(401).json({
        success: false,
        error: 'رمز المصادقة غير صحيح',
      });
    }

    // منع الطلبات المتكررة السريعة للـ GET requests
    if (req.method === 'GET') {
      const cacheKey = `favorites_${userId}`;
      const cached = requestCache.get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_DURATION) {
        return res.status(200).json(cached.data);
      }
    }

    if (req.method === 'GET') {
      // جلب قائمة المفضلة للمستخدم مع معالجة آمنة للأخطاء
      try {
        console.log(`🔍 [Favorites API] جلب المفضلة للمستخدم: ${userId}`);

        // اختبار الاتصال بقاعدة البيانات أولاً
        try {
          await prisma.$queryRaw`SELECT 1`;
          console.log('✅ [Favorites API] اتصال قاعدة البيانات ناجح');
        } catch (connError) {
          console.error('❌ [Favorites API] فشل اتصال قاعدة البيانات:', connError);
          return res.status(503).json({
            success: false,
            error: 'تعذر الاتصال بقاعدة البيانات',
            code: 'DB_CONNECTION_FAILED',
            details: connError instanceof Error ? connError.message : 'خطأ غير معروف',
          });
        }

        // استعلام مبسط أولاً للتأكد من عمل قاعدة البيانات
        const favoritesCount = await prisma.favorites.count({
          where: {
            userId: userId,
          },
        });

        console.log(`📊 [Favorites API] عدد المفضلة: ${favoritesCount}`);

        // إذا كانت المفضلة فارغة، إرجاع استجابة فورية
        if (favoritesCount === 0) {
          const emptyResponse = {
            success: true,
            data: [],
            count: 0,
            message: 'لا توجد عناصر في المفضلة',
          };

          // حفظ في التخزين المؤقت
          const cacheKey = `favorites_${userId}`;
          requestCache.set(cacheKey, {
            timestamp: Date.now(),
            data: emptyResponse,
          });

          return res.status(200).json(emptyResponse);
        }

        // استعلام مع include محدود لتجنب الأخطاء
        // ملاحظة: أسماء العلاقات يجب أن تتطابق مع schema.prisma
        const favorites = await prisma.favorites.findMany({
          where: {
            userId: userId,
          },
          select: {
            id: true,
            carId: true,
            auctionId: true,
            showroomId: true,
            transportServiceId: true,
            createdAt: true,
            // العلاقات بأسمائها الصحيحة من schema.prisma
            cars: {
              select: {
                id: true,
                title: true,
                price: true,
                brand: true,
                model: true,
                year: true,
                condition: true,
                location: true,
                featured: true,
              },
            },
            auctions: {
              select: {
                id: true,
                title: true,
                startPrice: true,
                currentPrice: true,
                endDate: true,
                status: true,
              },
            },
            showrooms: {
              select: {
                id: true,
                name: true,
                description: true,
                city: true,
                area: true,
                phone: true,
                verified: true,
              },
            },
            transport_services: {
              select: {
                id: true,
                title: true,
                description: true,
                truckType: true,
                serviceArea: true,
                pricePerKm: true,
                contactPhone: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 100, // حد أقصى للحماية
        });

        console.log(`✅ [Favorites API] تم جلب ${favorites.length} عنصر بنجاح`);

        // تنسيق البيانات مع معالجة مبسطة وآمنة
        // ملاحظة: استخدام أسماء العلاقات الصحيحة من schema.prisma
        const formattedFavorites = favorites.map((favorite) => {
          let type = 'unknown';
          let itemId = '';
          let title = 'عنصر';
          let additionalData = {};

          try {
            if (favorite.cars && favorite.carId) {
              type = 'marketplace';
              itemId = favorite.carId;
              title = favorite.cars.title || `${favorite.cars.brand || ''} ${favorite.cars.model || ''} ${favorite.cars.year || ''}`.trim() || 'سيارة';

              additionalData = {
                price: favorite.cars.price,
                brand: favorite.cars.brand,
                model: favorite.cars.model,
                year: favorite.cars.year,
                condition: favorite.cars.condition,
                location: favorite.cars.location,
                featured: favorite.cars.featured,
                images: [],
              };

            } else if (favorite.auctions && favorite.auctionId) {
              type = 'auction';
              itemId = favorite.auctionId;
              title = favorite.auctions.title || 'مزاد سيارة';

              additionalData = {
                startingPrice: favorite.auctions.startPrice,
                currentPrice: favorite.auctions.currentPrice,
                endTime: favorite.auctions.endDate,
                status: favorite.auctions.status,
              };

            } else if (favorite.showrooms && favorite.showroomId) {
              type = 'showroom';
              itemId = favorite.showroomId;
              title = favorite.showrooms.name || 'معرض سيارات';

              additionalData = {
                description: favorite.showrooms.description,
                location: favorite.showrooms.city && favorite.showrooms.area
                  ? `${favorite.showrooms.city}, ${favorite.showrooms.area}`
                  : favorite.showrooms.city || favorite.showrooms.area || '',
                phone: favorite.showrooms.phone,
                verified: favorite.showrooms.verified,
              };

            } else if (favorite.transport_services && favorite.transportServiceId) {
              type = 'transport';
              itemId = favorite.transportServiceId;
              title = favorite.transport_services.title || 'خدمة نقل';

              additionalData = {
                description: favorite.transport_services.description,
                truckType: favorite.transport_services.truckType,
                serviceArea: favorite.transport_services.serviceArea,
                pricePerKm: favorite.transport_services.pricePerKm,
                contactPhone: favorite.transport_services.contactPhone,
              };
            }

          } catch (itemError) {
            console.error(`⚠️ [Favorites API] خطأ في معالجة عنصر المفضلة ${favorite.id}:`, itemError);
          }

          return {
            id: favorite.id,
            type,
            itemId,
            title,
            createdAt: favorite.createdAt,
            ...additionalData,
          };
        });

        const responseData = {
          success: true,
          data: formattedFavorites,
          count: formattedFavorites.length,
        };

        // حفظ في التخزين المؤقت
        const cacheKey = `favorites_${userId}`;
        requestCache.set(cacheKey, {
          timestamp: Date.now(),
          data: responseData,
        });

        return res.status(200).json(responseData);

      } catch (dbError) {
        const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
        const errorStack = dbError instanceof Error ? dbError.stack : undefined;

        console.error('❌ [Favorites API] خطأ في قاعدة البيانات:', {
          error: errorMessage,
          userId,
          stack: errorStack?.substring(0, 1000),
          name: dbError instanceof Error ? dbError.name : 'Unknown',
        });

        // تحديد نوع الخطأ
        let errorCode = 'DATABASE_ERROR';
        let userMessage = 'خطأ في قاعدة البيانات';

        if (errorMessage.includes('connect')) {
          errorCode = 'DB_CONNECTION_ERROR';
          userMessage = 'تعذر الاتصال بقاعدة البيانات';
        } else if (errorMessage.includes('timeout')) {
          errorCode = 'DB_TIMEOUT';
          userMessage = 'انتهت مهلة الاتصال بقاعدة البيانات';
        } else if (errorMessage.includes('relation') || errorMessage.includes('does not exist')) {
          errorCode = 'SCHEMA_ERROR';
          userMessage = 'خطأ في بنية قاعدة البيانات';
        }

        return res.status(500).json({
          success: false,
          error: userMessage,
          code: errorCode,
          details: errorMessage,
          debug: {
            timestamp: new Date().toISOString(),
            userId: userId?.substring(0, 10) + '...',
          },
        });
      }
    } else if (req.method === 'POST') {
      // إضافة عنصر للمفضلة
      const { carId, auctionId, type, itemId } = req.body;

      // دعم النظام الجديد مع type و itemId
      let finalCarId, finalAuctionId, finalTransportId, finalShowroomId;

      if (type && itemId) {
        if (type === 'car') {
          finalCarId = itemId;
        } else if (type === 'auction') {
          finalAuctionId = itemId;
        } else if (type === 'transport') {
          finalTransportId = itemId;
        } else if (type === 'showroom') {
          finalShowroomId = itemId;
        } else {
          return res.status(400).json({
            success: false,
            error: 'نوع العنصر غير مدعوم',
          });
        }
      } else {
        // النظام القديم
        finalCarId = carId;
        finalAuctionId = auctionId;
      }

      if (!finalCarId && !finalAuctionId && !finalTransportId && !finalShowroomId) {
        return res.status(400).json({
          success: false,
          error: 'يجب تحديد معرف العنصر ونوعه',
        });
      }

      // التأكد من عدم إضافة أكثر من نوع واحد
      const typesCount = [finalCarId, finalAuctionId, finalTransportId].filter(Boolean).length;
      if (typesCount > 1) {
        return res.status(400).json({
          success: false,
          error: 'لا يمكن إضافة أكثر من نوع واحد في نفس الوقت',
        });
      }

      // تحويل المعرفات إلى strings (حسب schema Prisma)
      const processedCarId = finalCarId ? finalCarId.toString() : null;
      const processedAuctionId = finalAuctionId ? finalAuctionId.toString() : null;
      const processedTransportId = finalTransportId ? finalTransportId.toString() : null;
      const processedShowroomId = finalShowroomId ? finalShowroomId.toString() : null;

      try {
        // التحقق من وجود العنصر مسبقاً
        const whereCondition: any = { userId: userId };

        if (processedCarId) {
          whereCondition.carId = processedCarId;
        } else if (processedAuctionId) {
          whereCondition.auctionId = processedAuctionId;
        } else if (processedTransportId) {
          whereCondition.transportServiceId = processedTransportId;
        } else if (processedShowroomId) {
          whereCondition.showroomId = processedShowroomId;
        }

        const existingFavorite = await prisma.favorites.findFirst({
          where: whereCondition,
        });

        if (existingFavorite) {
          return res.status(409).json({
            success: false,
            error: 'العنصر موجود في المفضلة مسبقاً',
            code: 'ALREADY_EXISTS',
          });
        }

        // إضافة للمفضلة
        const now = new Date();
        const favoriteData: any = {
          id: generateId(),
          userId: userId,
          updatedAt: now,
        };

        if (processedCarId) {
          favoriteData.carId = processedCarId;
        } else if (processedAuctionId) {
          favoriteData.auctionId = processedAuctionId;
        } else if (processedTransportId) {
          favoriteData.transportServiceId = processedTransportId;
        } else if (processedShowroomId) {
          favoriteData.showroomId = processedShowroomId;
        }

        console.log('📝 [Favorites API] إنشاء مفضلة جديدة:', {
          id: favoriteData.id,
          userId: userId,
          carId: processedCarId,
          auctionId: processedAuctionId,
        });

        const favorite = await prisma.favorites.create({
          data: favoriteData,
        });

        // مسح التخزين المؤقت عند التحديث
        const cacheKey = `favorites_${userId}`;
        requestCache.delete(cacheKey);

        return res.status(201).json({
          success: true,
          data: favorite,
          message: 'تم إضافة العنصر للمفضلة بنجاح',
        });
      } catch (dbError) {
        console.error('خطأ في قاعدة البيانات عند إضافة المفضلة:', {
          error: dbError,
          userId,
          carId: processedCarId,
          auctionId: processedAuctionId,
          message: dbError instanceof Error ? dbError.message : 'خطأ غير معروف',
        });
        return res.status(500).json({
          success: false,
          error: 'خطأ في إضافة العنصر للمفضلة',
          details:
            process.env.NODE_ENV === 'development'
              ? dbError instanceof Error
                ? dbError.message
                : 'خطأ غير معروف'
              : undefined,
        });
      }
    } else if (req.method === 'DELETE') {
      // حذف عنصر من المفضلة
      const { carId, auctionId, type, itemId, favoriteId } = req.body;

      // دعم حذف باستخدام معرف المفضلة مباشرة
      if (favoriteId) {
        try {
          const deletedFavorite = await prisma.favorites.deleteMany({
            where: {
              id: favoriteId,
              userId: userId, // التأكد من أن المفضلة تخص المستخدم الحالي
            },
          });

          if (deletedFavorite.count === 0) {
            return res.status(404).json({
              success: false,
              error: 'العنصر غير موجود في المفضلة أو لا تملك صلاحية حذفه',
            });
          }

          // مسح التخزين المؤقت عند التحديث
          const cacheKey = `favorites_${userId}`;
          requestCache.delete(cacheKey);

          return res.status(200).json({
            success: true,
            message: 'تم حذف العنصر من المفضلة بنجاح',
          });
        } catch (dbError) {
          console.error('خطأ في قاعدة البيانات عند حذف المفضلة بالمعرف:', {
            error: dbError,
            userId,
            favoriteId,
            message: dbError instanceof Error ? dbError.message : 'خطأ غير معروف',
          });
          return res.status(500).json({
            success: false,
            error: 'خطأ في حذف العنصر من المفضلة',
            details:
              process.env.NODE_ENV === 'development'
                ? dbError instanceof Error
                  ? dbError.message
                  : 'خطأ غير معروف'
                : undefined,
          });
        }
      }

      // دعم النظام الجديد مع type و itemId
      let finalCarId, finalAuctionId, finalTransportId, finalShowroomId;

      if (type && itemId) {
        if (type === 'car') {
          finalCarId = itemId;
        } else if (type === 'auction') {
          finalAuctionId = itemId;
        } else if (type === 'transport') {
          finalTransportId = itemId;
        } else if (type === 'showroom') {
          finalShowroomId = itemId;
        } else {
          return res.status(400).json({
            success: false,
            error: 'نوع العنصر غير مدعوم',
          });
        }
      } else {
        // النظام القديم
        finalCarId = carId;
        finalAuctionId = auctionId;
      }

      if (!finalCarId && !finalAuctionId && !finalTransportId && !finalShowroomId) {
        return res.status(400).json({
          success: false,
          error: 'يجب تحديد معرف العنصر ونوعه أو معرف المفضلة',
        });
      }

      // تحويل المعرفات إلى strings (حسب schema Prisma)
      const processedCarId = finalCarId ? finalCarId.toString() : null;
      const processedAuctionId = finalAuctionId ? finalAuctionId.toString() : null;
      const processedTransportId = finalTransportId ? finalTransportId.toString() : null;
      const processedShowroomId = finalShowroomId ? finalShowroomId.toString() : null;

      try {
        const whereCondition: any = { userId: userId };

        if (processedCarId) {
          whereCondition.carId = processedCarId;
        } else if (processedAuctionId) {
          whereCondition.auctionId = processedAuctionId;
        } else if (processedTransportId) {
          whereCondition.transportServiceId = processedTransportId;
        } else if (processedShowroomId) {
          whereCondition.showroomId = processedShowroomId;
        }

        const deletedFavorite = await prisma.favorites.deleteMany({
          where: whereCondition,
        });

        if (deletedFavorite.count === 0) {
          return res.status(404).json({
            success: false,
            error: 'العنصر غير موجود في المفضلة',
          });
        }

        // مسح التخزين المؤقت عند التحديث
        const cacheKey = `favorites_${userId}`;
        requestCache.delete(cacheKey);

        return res.status(200).json({
          success: true,
          message: 'تم حذف العنصر من المفضلة بنجاح',
        });
      } catch (dbError) {
        console.error('خطأ في قاعدة البيانات عند حذف المفضلة:', {
          error: dbError,
          userId,
          carId: processedCarId,
          auctionId: processedAuctionId,
          message: dbError instanceof Error ? dbError.message : 'خطأ غير معروف',
        });
        return res.status(500).json({
          success: false,
          error: 'خطأ في حذف العنصر من المفضلة',
          details:
            process.env.NODE_ENV === 'development'
              ? dbError instanceof Error
                ? dbError.message
                : 'خطأ غير معروف'
              : undefined,
        });
      }
    } else {
      return res.status(405).json({
        success: false,
        error: 'طريقة غير مدعومة',
      });
    }
  } catch (error) {
    console.error('خطأ في API المفضلة:', error);

    // معالجة أخطاء محددة
    if (error instanceof Error) {
      if (error.message.includes('JWT')) {
        return res.status(401).json({
          success: false,
          error: 'رمز المصادقة غير صحيح',
        });
      }

      if (error.message.includes('Prisma') || error.message.includes('database')) {
        return res.status(503).json({
          success: false,
          error: 'خطأ في قاعدة البيانات',
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
}
