/**
 * خدمة موحدة للتقييمات والمراجعات
 * نظام شامل مثل الشركات الكبيرة
 */

import { Prisma } from '@prisma/client';
import { logger } from '../logger';
import { prisma } from '../prisma';

export interface ReviewData {
  rating: number;
  comment?: string;
  reviewerId: string;
  targetUserId?: string;
  itemId: string;
  itemType: 'car' | 'auction' | 'transport' | 'showroom' | 'company';
  parentId?: string; // دعم الرد على التعليقات
}

export interface ReviewFilters {
  itemId?: string;
  itemType?: 'car' | 'auction' | 'transport' | 'showroom' | 'company';
  userId?: string;
  type?: 'received' | 'given';
  limit?: number;
  offset?: number;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

/**
 * خدمة التقييمات الموحدة
 */
export class ReviewService {
  /**
   * إنشاء تقييم جديد
   */
  static async createReview(data: ReviewData) {
    try {
      // 1. التحقق من صحة البيانات
      // السماح بـ rating = 0 عند الرد على تعليق
      if (!data.parentId && (!data.rating || data.rating < 1 || data.rating > 5)) {
        throw new Error('التقييم يجب أن يكون بين 1 و 5');
      }

      if (!data.reviewerId || !data.itemId || !data.itemType) {
        throw new Error('البيانات المطلوبة ناقصة');
      }

      // 2. التحقق من عدم تقييم النفس
      if (data.targetUserId && data.reviewerId === data.targetUserId) {
        throw new Error('لا يمكنك تقييم نفسك');
      }

      // 3. التحقق من عدم وجود تقييم سابق
      if (!data.parentId) {
        const existingReview = await this.checkDuplicateReview(data);
        if (existingReview) {
          throw new Error('لقد قمت بتقييم هذا العنصر مسبقاً');
        }
      }

      // 4. تحديد الحقول حسب نوع العنصر
      const reviewFields = this.mapItemTypeToFields(data.itemType, data.itemId);

      // 5. إنشاء التقييم في معاملة ذرية
      const review = await prisma.$transaction(async (tx) => {
        logger.debug('[ReviewService] بيانات إنشاء التقييم', {
          rating: data.rating,
          reviewerId: data.reviewerId,
          targetUserId: data.targetUserId,
          itemId: data.itemId,
          itemType: data.itemType
        });

        // إنشاء التقييم - بناء البيانات بشكل صريح
        const createData: Prisma.reviewsUncheckedCreateInput = {
          id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          rating: data.rating,
          comment: data.comment || '',
          reviewerId: data.reviewerId,
          targetUserId: data.targetUserId || null,
          serviceType: data.itemType,
          isVerified: false,
          isHelpful: 0,
          isNotHelpful: 0,
          parentId: data.parentId || null,
          updatedAt: new Date(),
          // إضافة الحقل المناسب حسب نوع العنصر
          carId: data.itemType === 'car' ? data.itemId : null,
          auctionId: data.itemType === 'auction' ? data.itemId : null,
          transportServiceId: data.itemType === 'transport' ? data.itemId : null,
        };

        const newReview = await tx.reviews.create({
          data: createData,
          include: {
            users_reviews_reviewerIdTousers: {
              select: {
                id: true,
                name: true,
                profileImage: true,
                verified: true,
              },
            },
            users_reviews_targetUserIdTousers: data.targetUserId ? {
              select: {
                id: true,
                name: true,
                profileImage: true,
                verified: true,
              },
            } : undefined,
          },
        });

        logger.info('[ReviewService] تم إنشاء التقييم بنجاح', { reviewId: newReview.id });

        // تحديث تقييم المستخدم المستهدف (فقط إذا كان موجود)
        if (data.targetUserId) {
          logger.debug('[ReviewService] تحديث تقييم المستخدم المستهدف', { targetUserId: data.targetUserId });
          await this.updateUserRatingInTransaction(tx, data.targetUserId);

          // تحديث عدد التقييمات للمستخدم المستهدف
          await tx.users.update({
            where: { id: data.targetUserId },
            data: {
              totalReviews: {
                increment: 1,
              },
            },
          });
        } else {
          logger.debug('[ReviewService] تقييم بدون targetUserId - تخطي تحديث المستخدم');
        }

        return newReview;
      });

      logger.info('تم إنشاء تقييم جديد', { reviewId: review.id, itemType: data.itemType });
      return { success: true, data: review };
    } catch (error) {
      logger.error('فشل في إنشاء التقييم', error as Error);
      console.error('🚨 [ReviewService] خطأ مفصل:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        code: (error as any)?.code,
        meta: (error as any)?.meta,
        data: {
          rating: data.rating,
          reviewerId: data.reviewerId,
          itemId: data.itemId,
          itemType: data.itemType,
          targetUserId: data.targetUserId
        }
      });
      throw error;
    }
  }

  /**
   * جلب التقييمات حسب الفلاتر
   */
  static async getReviews(filters: ReviewFilters) {
    try {
      const { limit = 20, offset = 0 } = filters;

      // بناء شروط الاستعلام
      const where: Record<string, any> = { parentId: null };

      // فلترة حسب العنصر
      if (filters.itemId && filters.itemType) {
        const itemFields = this.mapItemTypeToFields(filters.itemType, filters.itemId);
        logger.debug('[ReviewService] تحويل العنصر', {
          itemType: filters.itemType,
          itemId: filters.itemId,
          itemFields: itemFields
        });
        Object.assign(where, itemFields);
      }

      // فلترة حسب المستخدم
      if (filters.userId) {
        if (filters.type === 'received') {
          where.targetUserId = filters.userId;
        } else if (filters.type === 'given') {
          where.reviewerId = filters.userId;
        }
      }

      logger.debug('[ReviewService] شروط البحث النهائية', { where });

      // جلب التقييمات
      const reviews = await prisma.reviews.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          users_reviews_reviewerIdTousers: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              verified: true,
            },
          },
          other_reviews: {
            orderBy: { createdAt: 'asc' },
            include: {
              users_reviews_reviewerIdTousers: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                  verified: true,
                },
              },
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

      logger.debug('[ReviewService] نتائج البحث', {
        reviewsFound: reviews.length,
        sampleReview: reviews[0] ? {
          id: reviews[0].id,
          rating: reviews[0].rating,
          auctionId: reviews[0].auctionId,
          carId: reviews[0].carId
        } : null
      });

      // جلب الإحصائيات
      const stats = await this.getReviewStats(filters.itemId, filters.itemType);

      return {
        success: true,
        data: {
          reviews,
          totalReviews: stats.totalReviews,
          averageRating: stats.averageRating,
          ratingDistribution: stats.ratingDistribution
        }
      };
    } catch (error) {
      logger.error('فشل في جلب التقييمات', error as Error);
      throw error;
    }
  }

  /**
   * جلب إحصائيات التقييمات
   */
  static async getReviewStats(itemId?: string, itemType?: string): Promise<ReviewStats> {
    try {
      const where: Record<string, any> = { parentId: null };

      if (itemId && itemType) {
        const itemFields = this.mapItemTypeToFields(itemType, itemId);
        logger.debug('[ReviewStats] شروط البحث', {
          itemId,
          itemType,
          itemFields,
          finalWhere: { ...where, ...itemFields }
        });
        Object.assign(where, itemFields);
      }

      const [totalReviews, avgRating, distribution] = await Promise.all([
        // إجمالي التقييمات
        prisma.reviews.count({ where }),

        // متوسط التقييم
        prisma.reviews.aggregate({
          where,
          _avg: { rating: true },
        }),

        // توزيع التقييمات
        prisma.reviews.groupBy({
          where,
          by: ['rating'],
          _count: { rating: true },
        }),
      ]);

      // تحويل التوزيع إلى كائن
      const ratingDistribution: { [key: number]: number; } = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      distribution.forEach((item) => {
        ratingDistribution[item.rating] = item._count.rating;
      });

      return {
        totalReviews,
        averageRating: avgRating._avg.rating || 0,
        ratingDistribution,
      };
    } catch (error) {
      logger.error('فشل في جلب إحصائيات التقييمات', error as Error);
      throw error;
    }
  }

  /**
   * تحديث تقييم موجود
   */
  static async updateReview(
    reviewId: string,
    userId: string,
    data: { rating?: number; comment?: string; },
  ) {
    try {
      // التحقق من وجود التقييم والصلاحية
      const existingReview = await prisma.reviews.findUnique({
        where: { id: reviewId },
      });

      if (!existingReview) {
        throw new Error('التقييم غير موجود');
      }

      if (existingReview.reviewerId !== userId) {
        throw new Error('غير مسموح لك بتعديل هذا التقييم');
      }

      // تحديث التقييم
      const updatedReview = await prisma.$transaction(async (tx) => {
        const review = await tx.reviews.update({
          where: { id: reviewId },
          data: {
            ...(data.rating && { rating: data.rating }),
            ...(data.comment !== undefined && { comment: data.comment }),
            updatedAt: new Date(),
          },
          include: {
            users_reviews_reviewerIdTousers: {
              select: {
                id: true,
                name: true,
                profileImage: true,
                verified: true,
              },
            },
          },
        });

        // إعادة حساب التقييم إذا تم تغيير الدرجة (فقط إذا كان targetUserId موجود)
        if (data.rating && existingReview.targetUserId) {
          await this.updateUserRatingInTransaction(tx, existingReview.targetUserId);
        }

        return review;
      });

      logger.info('تم تحديث التقييم', { reviewId });
      return { success: true, data: updatedReview };
    } catch (error) {
      logger.error('فشل في تحديث التقييم', error as Error);
      throw error;
    }
  }

  /**
   * حذف تقييم
   */
  static async deleteReview(reviewId: string, userId: string) {
    try {
      // التحقق من الصلاحية
      const existingReview = await prisma.reviews.findUnique({
        where: { id: reviewId },
      });

      if (!existingReview) {
        throw new Error('التقييم غير موجود');
      }

      if (existingReview.reviewerId !== userId) {
        throw new Error('غير مسموح لك بحذف هذا التقييم');
      }

      // حذف التقييم
      await prisma.$transaction(async (tx) => {
        await tx.reviews.delete({
          where: { id: reviewId },
        });

        // تحديث تقييم المستخدم
        await this.updateUserRatingInTransaction(tx, existingReview.targetUserId);

        // تقليل عدد التقييمات (فقط إذا كان targetUserId موجود)
        if (existingReview.targetUserId) {
          await tx.users.update({
            where: { id: existingReview.targetUserId },
            data: {
              totalReviews: {
                decrement: 1,
              },
            },
          });
        }
      });

      logger.info('تم حذف التقييم', { reviewId });
      return { success: true };
    } catch (error) {
      logger.error('فشل في حذف التقييم', error as Error);
      throw error;
    }
  }

  /**
   * تحديث مفيد/غير مفيد للتقييم
   */
  static async updateHelpfulness(reviewId: string, type: 'helpful' | 'notHelpful') {
    try {
      const field = type === 'helpful' ? 'isHelpful' : 'isNotHelpful';

      const review = await prisma.reviews.update({
        where: { id: reviewId },
        data: {
          [field]: {
            increment: 1,
          },
        },
      });

      return { success: true, data: review };
    } catch (error) {
      logger.error('فشل في تحديث مفيد/غير مفيد', error as Error);
      throw error;
    }
  }

  /**
   * التحقق من وجود تقييم سابق
   */
  private static async checkDuplicateReview(data: ReviewData): Promise<boolean> {
    const where: Record<string, any> = {
      reviewerId: data.reviewerId,
    };

    const itemFields = this.mapItemTypeToFields(data.itemType, data.itemId);
    Object.assign(where, itemFields);

    const existing = await prisma.reviews.findFirst({ where });
    return !!existing;
  }

  /**
   * تحديث تقييم المستخدم داخل معاملة
   */
  private static async updateUserRatingInTransaction(tx: any, userId: string | null) {
    // تجاهل إذا كان userId غير موجود (للمزادات)
    if (!userId) {
      return;
    }

    const reviews = await tx.reviews.findMany({
      where: { targetUserId: userId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      await tx.users.update({
        where: { id: userId },
        data: { rating: 0 },
      });
      return;
    }

    const averageRating = reviews.reduce((sum: number, r: { rating: number; }) => sum + r.rating, 0) / reviews.length;

    await tx.users.update({
      where: { id: userId },
      data: {
        rating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
      },
    });
  }

  /**
   * تحويل نوع العنصر إلى حقول قاعدة البيانات
   */
  private static mapItemTypeToFields(
    itemType: string,
    itemId: string,
  ): { carId?: string; auctionId?: string; transportServiceId?: string; targetUserId?: string; } {
    switch (itemType) {
      case 'car':
        return { carId: itemId };
      case 'auction':
        return { auctionId: itemId };
      case 'transport':
        return { transportServiceId: itemId };
      case 'user':
        // التقييمات المستهدفة لمستخدم معين
        return { targetUserId: itemId };
      case 'showroom':
      case 'company':
        // المعارض والشركات تُعامل كتقييمات للمستخدم المالك
        // يجب إضافة حقول خاصة بها في schema مستقبلاً
        return { targetUserId: itemId };
      default:
        logger.warn('[ReviewService] نوع عنصر غير معروف', { itemType });
        return {};
    }
  }
}
