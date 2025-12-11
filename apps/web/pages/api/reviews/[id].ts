import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { ReviewService } from '../../../lib/services/reviewService';
import { logger } from '../../../lib/utils/logger';

interface ReviewResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ReviewResponse>) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'معرف التقييم مطلوب',
      });
    }

    switch (req.method) {
      case 'GET':
        return await getReview(req, res, id);
      case 'PUT':
        return await updateReview(req, res, id);
      case 'DELETE':
        return await deleteReview(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          error: 'طريقة غير مدعومة',
        });
    }
  } catch (error) {
    logger.error('خطأ في API التقييم:', error as Error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
}

// جلب تقييم محدد
async function getReview(
  req: NextApiRequest,
  res: NextApiResponse<ReviewResponse>,
  reviewId: string,
) {
  try {
    // استخدام Prisma للبحث المباشر عن التقييم بـ ID
    // ملاحظة: أسماء العلاقات يجب أن تتطابق مع schema.prisma
    const review = await prisma.reviews.findUnique({
      where: { id: reviewId },
      include: {
        users_reviews_reviewerIdTousers: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            verified: true,
          },
        },
        users_reviews_targetUserIdTousers: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            verified: true,
          },
        },
        cars: {
          select: {
            id: true,
            title: true,
            brand: true,
            model: true,
            year: true,
          },
        },
        auctions: {
          select: {
            id: true,
            title: true,
          },
        },
        transport_services: {
          select: {
            id: true,
            title: true,
            truckType: true,
          },
        },
      },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'التقييم غير موجود',
      });
    }

    return res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    logger.error('خطأ في جلب التقييم', error as Error);
    return res.status(500).json({
      success: false,
      error: 'فشل في جلب التقييم',
    });
  }
}

// تحديث تقييم
async function updateReview(
  req: NextApiRequest,
  res: NextApiResponse<ReviewResponse>,
  reviewId: string,
) {
  try {
    const { rating, comment } = req.body;

    // التحقق من المصادقة - verifyAuth ترجع VerifiedUser | null
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    const user = await verifyAuth(token);
    if (!user || !user.userId) {
      return res.status(401).json({ success: false, error: 'غير مصرح - يجب تسجيل الدخول' });
    }
    const userId = user.userId;

    // التحقق من صحة البيانات
    if (rating && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'التقييم يجب أن يكون رقم بين 1 و 5',
      });
    }

    // استخدام الخدمة الموحدة
    const result = await ReviewService.updateReview(reviewId, userId, {
      rating,
      comment,
    });

    return res.status(200).json({
      ...result,
      message: 'تم تحديث التقييم بنجاح',
    });
  } catch (error) {
    logger.error('خطأ في تحديث التقييم', error as Error);

    if (error instanceof Error) {
      if (error.message.includes('غير مسموح')) {
        return res.status(403).json({ success: false, error: error.message });
      }
      if (error.message.includes('غير موجود')) {
        return res.status(404).json({ success: false, error: error.message });
      }
    }

    return res.status(500).json({
      success: false,
      error: 'فشل في تحديث التقييم',
    });
  }
}

// حذف تقييم
async function deleteReview(
  req: NextApiRequest,
  res: NextApiResponse<ReviewResponse>,
  reviewId: string,
) {
  try {
    // التحقق من المصادقة - verifyAuth ترجع VerifiedUser | null
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    const user = await verifyAuth(token);
    if (!user || !user.userId) {
      return res.status(401).json({ success: false, error: 'غير مصرح - يجب تسجيل الدخول' });
    }
    const userId = user.userId;

    // استخدام الخدمة الموحدة
    const result = await ReviewService.deleteReview(reviewId, userId);

    return res.status(200).json({
      ...result,
      message: 'تم حذف التقييم بنجاح',
    });
  } catch (error) {
    logger.error('خطأ في حذف التقييم', error as Error);

    if (error instanceof Error) {
      if (error.message.includes('غير مسموح')) {
        return res.status(403).json({ success: false, error: error.message });
      }
      if (error.message.includes('غير موجود')) {
        return res.status(404).json({ success: false, error: error.message });
      }
    }

    return res.status(500).json({
      success: false,
      error: 'فشل في حذف التقييم',
    });
  }
}
