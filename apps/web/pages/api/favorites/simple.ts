import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

// دالة لإنشاء ID فريد
function generateId(): string {
  return 'fav_' + crypto.randomUUID().replace(/-/g, '').substring(0, 20);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // إعداد headers للاستجابة الآمنة
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  try {
    // التحقق من المصادقة
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'غير مصرح لك بالوصول',
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET غير موجود في متغيرات البيئة');
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
      console.error('خطأ في التحقق من الرمز المميز:', error);
      return res.status(401).json({
        success: false,
        error: 'رمز المصادقة غير صحيح',
      });
    }

    if (req.method === 'GET') {
      try {
        // استعلام مبسط للمفضلة
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
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 50, // حد أقصى 50 عنصر
        });

        console.log(`✅ [Favorites API] تم جلب ${favorites.length} عنصر للمستخدم ${userId}`);

        return res.status(200).json({
          success: true,
          data: favorites,
          count: favorites.length,
          message: 'تم جلب المفضلة بنجاح',
        });

      } catch (dbError: any) {
        console.error('❌ [Favorites API] خطأ في قاعدة البيانات:', {
          error: dbError.message,
          code: dbError.code,
          userId,
        });

        // معالجة أخطاء قاعدة البيانات
        let errorMessage = 'خطأ في قاعدة البيانات';
        let statusCode = 500;

        if (dbError.code === 'P2021') {
          errorMessage = 'جدول المفضلة غير موجود';
          statusCode = 503;
        } else if (dbError.code === 'P2024') {
          errorMessage = 'انتهت مهلة الاتصال';
          statusCode = 504;
        } else if (dbError.message?.includes('connect')) {
          errorMessage = 'خطأ في الاتصال بقاعدة البيانات';
          statusCode = 503;
        }

        return res.status(statusCode).json({
          success: false,
          error: errorMessage,
          code: dbError.code || 'UNKNOWN_ERROR',
        });
      }

    } else if (req.method === 'POST') {
      const { type, itemId } = req.body;

      if (!type || !itemId) {
        return res.status(400).json({
          success: false,
          error: 'نوع العنصر ومعرفه مطلوبان',
        });
      }

      try {
        const now = new Date();
        const favoriteData: any = {
          id: generateId(),
          userId,
          updatedAt: now,
        };

        // تحديد نوع المفضلة
        switch (type) {
          case 'car':
            favoriteData.carId = itemId.toString();
            break;
          case 'auction':
            favoriteData.auctionId = itemId.toString();
            break;
          case 'showroom':
            favoriteData.showroomId = itemId.toString();
            break;
          case 'transport':
            favoriteData.transportServiceId = itemId.toString();
            break;
          default:
            return res.status(400).json({
              success: false,
              error: 'نوع العنصر غير مدعوم',
            });
        }

        // التحقق من عدم وجود مسبق (بدون id و updatedAt)
        const checkCondition: any = { userId };
        if (favoriteData.carId) checkCondition.carId = favoriteData.carId;
        if (favoriteData.auctionId) checkCondition.auctionId = favoriteData.auctionId;
        if (favoriteData.showroomId) checkCondition.showroomId = favoriteData.showroomId;
        if (favoriteData.transportServiceId) checkCondition.transportServiceId = favoriteData.transportServiceId;

        const existing = await prisma.favorites.findFirst({
          where: checkCondition,
        });

        if (existing) {
          return res.status(409).json({
            success: false,
            error: 'العنصر موجود في المفضلة مسبقاً',
            code: 'ALREADY_EXISTS',
          });
        }

        // إضافة للمفضلة
        const favorite = await prisma.favorites.create({
          data: favoriteData,
        });

        console.log(`✅ [Favorites API] تم إضافة ${type}:${itemId} للمفضلة للمستخدم ${userId}`);

        return res.status(201).json({
          success: true,
          data: favorite,
          message: 'تم إضافة العنصر للمفضلة بنجاح',
        });

      } catch (dbError: any) {
        console.error('❌ [Favorites API] خطأ في إضافة المفضلة:', dbError);
        return res.status(500).json({
          success: false,
          error: 'خطأ في إضافة العنصر للمفضلة',
        });
      }

    } else if (req.method === 'DELETE') {
      const { type, itemId, favoriteId } = req.body;

      try {
        const whereCondition: any = { userId };

        if (favoriteId) {
          whereCondition.id = favoriteId;
        } else if (type && itemId) {
          switch (type) {
            case 'car':
              whereCondition.carId = itemId.toString();
              break;
            case 'auction':
              whereCondition.auctionId = itemId.toString();
              break;
            case 'showroom':
              whereCondition.showroomId = itemId.toString();
              break;
            case 'transport':
              whereCondition.transportServiceId = itemId.toString();
              break;
            default:
              return res.status(400).json({
                success: false,
                error: 'نوع العنصر غير مدعوم',
              });
          }
        } else {
          return res.status(400).json({
            success: false,
            error: 'يجب تحديد معرف المفضلة أو نوع العنصر ومعرفه',
          });
        }

        const deleted = await prisma.favorites.deleteMany({
          where: whereCondition,
        });

        if (deleted.count === 0) {
          return res.status(404).json({
            success: false,
            error: 'العنصر غير موجود في المفضلة',
          });
        }

        console.log(`✅ [Favorites API] تم حذف ${deleted.count} عنصر من المفضلة للمستخدم ${userId}`);

        return res.status(200).json({
          success: true,
          message: 'تم حذف العنصر من المفضلة بنجاح',
        });

      } catch (dbError: any) {
        console.error('❌ [Favorites API] خطأ في حذف المفضلة:', dbError);
        return res.status(500).json({
          success: false,
          error: 'خطأ في حذف العنصر من المفضلة',
        });
      }

    } else {
      return res.status(405).json({
        success: false,
        error: 'طريقة HTTP غير مدعومة',
      });
    }

  } catch (error: any) {
    console.error('❌ [Favorites API] خطأ عام:', error);

    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
