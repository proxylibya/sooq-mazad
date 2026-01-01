/**
 * مكون صغير لعرض التقييم في البطاقات
 * يظهر النجوم والمتوسط بشكل مضغوط
 */

import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

interface RatingCardProps {
  /** معرف العنصر */
  itemId: string;
  /** نوع العنصر */
  itemType: 'car' | 'auction' | 'transport' | 'showroom' | 'company';
  /** عرض النص أو النجوم فقط */
  showText?: boolean;
  /** حجم النجوم */
  size?: 'sm' | 'md';
  /** فئات CSS إضافية */
  className?: string;
  /** اختياري: تقييم حساب المستخدم مباشرة */
  userId?: string;
}

interface RatingStats {
  averageRating: number;
  totalReviews: number;
}

const RatingCard: React.FC<RatingCardProps> = ({
  itemId,
  itemType,
  showText = true,
  size = 'sm',
  className = '',
  userId,
}) => {
  const [stats, setStats] = useState<RatingStats>({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(false);
  // جلب إحصائيات التقييم
  useEffect(() => {
    const fetchStats = async () => {
      // أولوية لتقييم المستخدم إذا تم تمرير userId
      if (!userId && (!itemId || !itemType)) return;

      setLoading(true);
      try {
        const params = new URLSearchParams(
          userId ? { userId, type: 'received' } : { itemId, itemType },
        );

        const response = await fetch(`/api/reviews?${params.toString()}`);
        const data = await response.json();

        if (data?.success && data?.data) {
          setStats({
            averageRating: data.data.averageRating || 0,
            totalReviews: data.data.totalReviews || 0,
          });
        }
      } catch (error) {
        console.error('خطأ في جلب إحصائيات التقييم:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [itemId, itemType, userId]);

  // رسم النجوم
  const renderStars = () => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= Math.round(stats.averageRating) ? (
              <StarSolid className={`${sizeClasses[size]} text-amber-500`} />
            ) : (
              <StarOutline className={`${sizeClasses[size]} text-gray-300`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  // إذا لم توجد تقييمات، لا نعرض شيء
  if (!loading && stats.totalReviews === 0) {
    return null;
  }

  // في حالة التحميل
  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarOutline
              key={star}
              className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} animate-pulse text-gray-200`}
            />
          ))}
        </div>
        {showText && <span className="text-xs text-gray-400">...</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {renderStars()}
      {showText && stats.totalReviews > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <span className="font-medium">{stats.averageRating.toFixed(1)}</span>
          <span>({stats.totalReviews})</span>
        </div>
      )}
    </div>
  );
};

export default RatingCard;
