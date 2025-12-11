/**
 * مكون خلاصة التقييمات - يظهر في رأس الصفحات
 * عرض سريع للتقييم العام والتوزيع
 */

import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import React, { useEffect, useState } from 'react';

interface ReviewSummaryProps {
  /** معرف العنصر */
  itemId: string;
  /** نوع العنصر */
  itemType: 'car' | 'auction' | 'transport' | 'showroom' | 'company';
  /** فئات CSS إضافية */
  className?: string;
  /** عرض مبسط أو مفصل */
  variant?: 'simple' | 'detailed';
}

interface RatingDistribution {
  [key: number]: number;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  itemId,
  itemType,
  className = '',
  variant = 'simple',
}) => {
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [loading, setLoading] = useState(false);

  // جلب الإحصائيات
  useEffect(() => {
    const fetchStats = async () => {
      if (!itemId || !itemType) return;

      setLoading(true);
      try {
        const params = new URLSearchParams({
          itemId,
          itemType,
        });

        const response = await fetch(`/api/reviews/statistics?${params}`);
        const data = await response.json();

        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('خطأ في جلب إحصائيات التقييم:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [itemId, itemType]);

  // رسم النجوم
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= Math.round(rating) ? (
              <StarSolid className={`${sizeClasses[size]} text-yellow-400`} />
            ) : (
              <StarOutline className={`${sizeClasses[size]} text-gray-300`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  // العرض المبسط
  if (variant === 'simple') {
    if (loading) {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarOutline key={star} className="h-4 w-4 animate-pulse text-gray-200" />
            ))}
          </div>
        </div>
      );
    }

    if (stats.totalReviews === 0) {
      return (
        <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarOutline key={star} className="h-4 w-4 text-gray-300" />
            ))}
          </div>
          <span className="text-sm">لا توجد تقييمات</span>
        </div>
      );
    }

    return (
      <div
        className={`flex items-center gap-2 max-sm:flex-col max-sm:items-end max-sm:gap-1 ${className}`}
      >
        {renderStars(stats.averageRating, 'sm')}
        <div className="flex items-center gap-1 text-sm">
          <span className="font-medium text-gray-900">{stats.averageRating.toFixed(1)}</span>
          <span className="text-gray-600">({stats.totalReviews} تقييم)</span>
        </div>
      </div>
    );
  }

  // العرض المفصل
  if (loading) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-8 w-16 rounded bg-gray-200"></div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarOutline key={star} className="h-5 w-5 text-gray-200" />
              ))}
            </div>
          </div>
          <div className="h-4 w-24 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (stats.totalReviews === 0) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-gray-50 p-4 text-center ${className}`}>
        <div className="mb-2 flex justify-center">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarOutline key={star} className="h-6 w-6 text-gray-300" />
            ))}
          </div>
        </div>
        <p className="text-gray-600">لم يتم تقييم هذا العنصر بعد</p>
        <p className="text-sm text-gray-500">كن أول من يشارك رأيه</p>
      </div>
    );
  }

  // حساب التوزيع النسبي
  const distributionPercentages = Object.entries(stats.ratingDistribution)
    .reverse() // من 5 إلى 1
    .map(([rating, count]) => ({
      rating: parseInt(rating),
      count,
      percentage: stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0,
    }));

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="mb-1 flex justify-center">{renderStars(stats.averageRating)}</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">تقييم ممتاز</div>
            <div className="text-sm text-gray-600">
              {stats.totalReviews} {stats.totalReviews === 1 ? 'تقييم' : 'تقييمات'}
            </div>
          </div>
        </div>
      </div>

      {/* Distribution */}
      <div className="space-y-2">
        {distributionPercentages.map(({ rating, count, percentage }) => (
          <div key={rating} className="flex items-center gap-3">
            <span className="flex w-12 items-center gap-1 text-sm font-medium text-gray-700">
              {rating}
              <StarSolid className="h-4 w-4 text-yellow-400" />
            </span>
            <div className="h-2 flex-1 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-8 text-xs text-gray-600">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSummary;
