import { Prisma } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '../../../lib/auth';
import { dbHelpers } from '../../../lib/prisma';
import CachedReviewService from '../../../lib/services/cachedReviewService';

interface ReviewRequest {
  rating: number;
  comment?: string;
  reviewerId: string;
  targetUserId?: string;
  itemId: string;
  itemType: 'car' | 'auction' | 'transport' | 'showroom' | 'company';
  // Legacy support
  carId?: string;
  auctionId?: string;
  serviceType?: string;
  parentId?: string; // دعم الرد على التعليقات
}

// نوع داخلي لنتائج الخدمة لتجنب any
type ServiceReviewRecord = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string | Date;
  reviewer?: {
    name?: string | null;
    profileImage?: string | null;
    verified?: boolean | null;
  };
  replies?: unknown[];
};

type CreatedReview = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string | Date;
};

interface ReviewResponse {
  success: boolean;
  message?: string;
  data?: {
    reviews?: Array<{
      id: string;
      rating: number;
      comment?: string;
      createdAt: string;
      reviewer?: {
        name?: string;
        profileImage?: string;
        verified?: boolean;
      };
    }>;
    totalReviews?: number;
    averageRating?: number;
    review?: {
      id: string;
      rating: number;
      comment?: string;
      createdAt: string;
    };
    ratingDistribution?: Record<number, number>;
  };
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ReviewResponse>) {
  try {
    switch (req.method) {
      case 'GET':
        return await getReviews(req, res);
      case 'POST':
        return await createReview(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          success: false,
          error: 'طريقة غير مدعومة',
        });
    }
  } catch (error) {
    console.error('خطأ في API التقييمات:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
}

// جلب التقييمات - نسخة مبسطة
async function getReviews(req: NextApiRequest, res: NextApiResponse<ReviewResponse>) {
  try {
    const {
      userId,
      type = 'received',
      itemId,
      itemType,
      limit = '10',
      offset = '0',
    } = req.query;

    if (!userId && !itemId) {
      return res.status(400).json({
        success: false,
        error: 'معرف المستخدم أو العنصر مطلوب',
      });
    }

    console.log('📝 [GET Reviews] جلب التقييمات:', {
      userId,
      itemId,
      itemType,
      type,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    // جلب التقييمات عبر الخدمة الموحّدة مع Cache
    const serviceResult = await CachedReviewService.getReviews({
      userId: typeof userId === 'string' ? userId : undefined,
      type: typeof type === 'string' ? (type as 'received' | 'given') : 'received',
      itemId: typeof itemId === 'string' ? itemId : undefined,
      itemType: typeof itemType === 'string'
        ? (itemType as 'car' | 'auction' | 'transport' | 'showroom' | 'company')
        : undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    const srvData = serviceResult?.data || {};

    // تطبيع createdAt إلى ISO string للواجهة
    const normalizedReviews = ((srvData.reviews as ServiceReviewRecord[] | undefined) || []).map((r: ServiceReviewRecord) => ({
      id: r.id,
      rating: r.rating,
      comment: typeof r.comment === 'string' ? r.comment : undefined,
      createdAt: typeof r.createdAt === 'string' ? new Date(r.createdAt).toISOString() : (r.createdAt as Date).toISOString(),
      reviewer: r.reviewer
        ? {
          name: r.reviewer.name,
          profileImage: r.reviewer.profileImage,
          verified: r.reviewer.verified,
        }
        : undefined,
      // تمرير الردود كما هي إن وُجدت (الواجهة تتعامل معها اختيارياً)
      replies: r.replies,
    }));

    return res.status(200).json({
      success: true,
      data: {
        reviews: normalizedReviews,
        totalReviews: srvData.totalReviews || 0,
        averageRating: srvData.averageRating || 0,
        ratingDistribution: srvData.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
    });
  } catch (error) {
    console.error('🚨 [GET Reviews] خطأ في جلب التقييمات:', error);
    console.error('🚨 [GET Reviews] تفاصيل الخطأ:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      query: req.query
    });
    return res.status(500).json({
      success: false,
      error: 'فشل في جلب التقييمات',
    });
  }
}

// إنشاء تقييم جديد - نسخة مبسطة
async function createReview(req: NextApiRequest, res: NextApiResponse<ReviewResponse>) {
  try {
    console.log('🚀 [API Reviews] بدء إنشاء تقييم جديد...');

    const {
      rating,
      comment = '',
      targetUserId,
      itemId,
      itemType,
      parentId,
    }: ReviewRequest = req.body;

    // استخراج التوكن من header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    console.log('🔑 [API Reviews] التحقق من التوكن:', {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      tokenLength: token?.length || 0
    });

    // التحقق من المصادقة - verifyAuth تتوقع token string
    const decodedToken = await verifyAuth(token || undefined);
    if (!decodedToken || !decodedToken.userId) {
      console.log('❌ [API Reviews] فشل المصادقة - لا يوجد token صالح');
      return res.status(401).json({
        success: false,
        error: 'يجب تسجيل الدخول أولاً'
      });
    }

    console.log('✅ [API Reviews] تم التحقق من المصادقة:', { userId: decodedToken.userId });
    const reviewerId = decodedToken.userId;

    // إذا كان الطلب ردّاً على تعليق، نسمح بالتقييم 0 (تعليق فقط)
    if ((!parentId && (!rating || rating < 1 || rating > 5)) || (parentId && (rating < 0 || rating > 5))) {
      return res.status(400).json({
        success: false,
        error: 'التقييم يجب أن يكون بين 1 و 5',
      });
    }

    if (!itemId || !itemType) {
      return res.status(400).json({
        success: false,
        error: 'معرف العنصر ونوعه مطلوبان',
      });
    }

    // التحقق من وجود العنصر لتفادي أخطاء المفتاح الخارجي
    const prisma = dbHelpers.prisma;
    if (itemType === 'car') {
      const carExists = await prisma.cars.findUnique({ where: { id: itemId }, select: { id: true } });
      if (!carExists) {
        return res.status(404).json({ success: false, error: 'العنصر (سيارة) غير موجود' });
      }
    } else if (itemType === 'auction') {
      const auctionExists = await prisma.auctions.findUnique({ where: { id: itemId }, select: { id: true } });
      if (!auctionExists) {
        return res.status(404).json({ success: false, error: 'العنصر (مزاد) غير موجود' });
      }
    } else if (itemType === 'transport') {
      const transportExists = await prisma.transport_services.findUnique({ where: { id: itemId }, select: { id: true } });
      if (!transportExists) {
        return res.status(404).json({ success: false, error: 'العنصر (خدمة نقل) غير موجود' });
      }
    }

    // التحقق من targetUserId (اختياري): إن كان غير صالح نحوله إلى null لتفادي خطأ FK
    let safeTargetUserId: string | null = null;
    if (targetUserId && typeof targetUserId === 'string' && targetUserId.trim()) {
      const userExists = await prisma.users.findUnique({ where: { id: targetUserId }, select: { id: true } });
      safeTargetUserId = userExists ? targetUserId : null;
    }

    // منع المستخدم من تقييم نفسه
    if (targetUserId && targetUserId === reviewerId) {
      return res.status(400).json({
        success: false,
        error: 'لا يمكن تقييم نفسك',
      });
    }

    // إنشاء التقييم عبر الخدمة الموحّدة مع إبطال Cache الذكي
    const result = await CachedReviewService.createReview({
      rating: parentId ? (rating || 0) : rating,
      comment,
      reviewerId,
      targetUserId: safeTargetUserId || undefined,
      itemId,
      itemType,
      parentId,
    });

    if (!result?.success) {
      throw new Error('FAILED_TO_CREATE_REVIEW');
    }

    const created = (result as { success: boolean; data: CreatedReview; }).data;
    const createdAtISO = typeof created.createdAt === 'string'
      ? new Date(created.createdAt).toISOString()
      : (created.createdAt as Date).toISOString();

    console.log('✅ [API Reviews] تم إنشاء التقييم بنجاح');

    return res.status(201).json({
      success: true,
      data: {
        review: {
          id: created.id,
          rating: created.rating,
          comment: created.comment ?? undefined,
          createdAt: createdAtISO,
        },
      },
      message: 'تم إنشاء التقييم بنجاح',
    });
  } catch (error) {
    console.error('🚨 [API Reviews] خطأ في إنشاء التقييم:', error);

    // معالجة أخطاء قاعدة البيانات
    const err = error as Partial<Prisma.PrismaClientKnownRequestError> & { code?: string; meta?: unknown; };
    const message = error instanceof Error ? error.message : '';
    if (typeof err === 'object' && err && ('code' in err || 'meta' in err)) {
      console.error('🔎 [API Reviews] تفاصيل الخطأ:', { code: err.code, meta: err.meta });
    }

    // تقييم مكرر (سواء من قيود فريدة أو تحقق مسبق)
    if (
      (error instanceof Error && message.includes('Unique constraint')) ||
      (error instanceof Error && message.includes('لقد قمت بتقييم هذا العنصر مسبقاً')) ||
      (error instanceof Error && message.toLowerCase().includes('already rated'))
    ) {
      return res.status(409).json({
        success: false,
        error: 'لقد قمت بتقييم هذا العنصر مسبقاً',
      });
    }

    // Prisma: Unique constraint violation
    if (err?.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'لقد قمت بتقييم هذا العنصر مسبقاً',
      });
    }

    // خطأ علاقات قاعدة البيانات (مفتاح خارجي غير صالح)
    if (err?.code === 'P2003' || (error instanceof Error && /foreign key/i.test(message))) {
      return res.status(400).json({
        success: false,
        error: 'بيانات غير صالحة: تأكد من صحة المعرّفات (itemId / targetUserId) ثم أعد المحاولة',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'فشل في إنشاء التقييم',
    });
  }
}
