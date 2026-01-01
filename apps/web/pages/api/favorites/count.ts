import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// استخدام singleton pattern لـ Prisma

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

  if (req.method !== 'GET') {
    return sendJsonResponse(405, {
      success: false,
      error: 'طريقة غير مدعومة',
    });
  }

  try {
    // التحقق من المصادقة
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    if (!token) {
      return sendJsonResponse(401, {
        success: false,
        error: 'غير مصرح لك بالوصول',
      });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId || decoded.id;

      if (!userId) {
        throw new Error('معرف المستخدم غير موجود في الرمز المميز');
      }
    } catch (error) {
      console.error('خطأ في التحقق من الرمز المميز:', error);
      return sendJsonResponse(401, {
        success: false,
        error: 'رمز المصادقة غير صحيح',
      });
    }

    // حساب عدد المفضلة
    try {
      const favoritesCount = await prisma.favorites.count({
        where: {
          userId: userId,
        },
      });

      return sendJsonResponse(200, {
        success: true,
        count: favoritesCount,
      });
    } catch (dbError) {
      console.error('خطأ في قاعدة البيانات عند حساب المفضلة:', {
        error: dbError,
        userId,
        message: dbError instanceof Error ? dbError.message : 'خطأ غير معروف',
      });

      // تحديد نوع الخطأ
      let errorMessage = 'خطأ في حساب المفضلة';
      let statusCode = 500;

      if (dbError instanceof Error) {
        if (dbError.message.includes('connect') || dbError.message.includes('ECONNREFUSED')) {
          errorMessage = 'خطأ في الاتصال بقاعدة البيانات';
          statusCode = 503;
        } else if (dbError.message.includes('timeout')) {
          errorMessage = 'انتهت مهلة الاتصال بقاعدة البيانات';
          statusCode = 504;
        }
      }

      return sendJsonResponse(statusCode, {
        success: false,
        error: errorMessage,
        details:
          process.env.NODE_ENV === 'development'
            ? dbError instanceof Error
              ? dbError.message
              : 'خطأ غير معروف'
            : undefined,
      });
    }
  } catch (error) {
    console.error('خطأ عام في API حساب المفضلة:', error);

    // معالجة أخطاء محددة
    if (error instanceof Error) {
      if (error.message.includes('JWT')) {
        return sendJsonResponse(401, {
          success: false,
          error: 'رمز المصادقة غير صحيح',
        });
      }

      if (error.message.includes('Prisma') || error.message.includes('database')) {
        return sendJsonResponse(503, {
          success: false,
          error: 'خطأ في قاعدة البيانات',
        });
      }
    }

    return sendJsonResponse(500, {
      success: false,
      error: 'خطأ في الخادم',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
}
