/**
 * زر المفضلة الموحد - مكون واحد لجميع أنواع المفضلة
 * Unified Favorite Button Component
 */
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import React, { useCallback, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { useFavorites } from '../../hooks/useFavorites';

export type FavoriteItemType = 'car' | 'auction' | 'showroom' | 'transport';

interface FavoriteButtonProps {
  /** نوع العنصر */
  type: FavoriteItemType;
  /** معرف العنصر */
  itemId: string;
  /** حجم الزر */
  size?: 'sm' | 'md' | 'lg';
  /** نمط الزر */
  variant?: 'default' | 'overlay' | 'minimal' | 'card';
  /** إظهار النص */
  showLabel?: boolean;
  /** نص مخصص */
  label?: string;
  /** كلاس إضافي */
  className?: string;
  /** دالة تُستدعى عند طلب تسجيل الدخول */
  onRequireLogin?: () => void;
  /** دالة تُستدعى عند نجاح/فشل العملية */
  onToggle?: (success: boolean, isFavorite: boolean) => void;
  /** إيقاف انتشار الحدث */
  stopPropagation?: boolean;
  /** تعطيل الزر */
  disabled?: boolean;
}

// أحجام الأيقونات
const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

// أنماط الأزرار
const buttonVariants = {
  default:
    'rounded-full p-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500/50',
  overlay:
    'rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-110',
  minimal: 'p-1 transition-colors duration-200 hover:text-red-500',
  card: 'absolute top-2 right-2 z-10 rounded-full bg-white/90 p-2 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-110',
};

/**
 * مكون زر المفضلة الموحد
 * يدعم جميع أنواع العناصر: سيارات، مزادات، معارض، نقل
 */
const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  type,
  itemId,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  className = '',
  onRequireLogin,
  onToggle,
  stopPropagation = true,
  disabled = false,
}) => {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const [isProcessing, setIsProcessing] = useState(false);

  // التحقق من حالة المفضلة حسب النوع
  const checkIsFavorite = useCallback((): boolean => {
    if (!itemId) return false;
    switch (type) {
      case 'car':
        return isFavorite(itemId);
      case 'auction':
        return isFavorite(undefined, itemId);
      case 'showroom':
        return isFavorite(undefined, undefined, itemId);
      case 'transport':
        return isFavorite(undefined, undefined, undefined, itemId);
      default:
        return false;
    }
  }, [type, itemId, isFavorite]);

  const isFav = checkIsFavorite();

  // معالج النقر على الزر
  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      if (stopPropagation) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (disabled || isProcessing || isLoading) return;

      // التحقق من تسجيل الدخول
      if (!user) {
        if (onRequireLogin) {
          onRequireLogin();
        }
        return;
      }

      setIsProcessing(true);

      try {
        let success = false;
        switch (type) {
          case 'car':
            success = await toggleFavorite(itemId);
            break;
          case 'auction':
            success = await toggleFavorite(undefined, itemId);
            break;
          case 'showroom':
            success = await toggleFavorite(undefined, undefined, itemId);
            break;
          case 'transport':
            success = await toggleFavorite(undefined, undefined, undefined, itemId);
            break;
        }

        if (onToggle) {
          onToggle(success, !isFav);
        }
      } catch (error) {
        console.error('خطأ في تبديل المفضلة:', error);
        if (onToggle) {
          onToggle(false, isFav);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [
      type,
      itemId,
      user,
      isFav,
      disabled,
      isProcessing,
      isLoading,
      stopPropagation,
      toggleFavorite,
      onRequireLogin,
      onToggle,
    ],
  );

  // تحديد النص
  const buttonLabel = label || (isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة');

  // تحديد الألوان
  const iconColor = isFav ? 'text-red-500' : 'text-gray-600';
  const hoverColor = isFav ? 'hover:text-red-600' : 'hover:text-red-500';

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isProcessing || isLoading}
      className={` ${buttonVariants[variant]} ${iconColor} ${hoverColor} ${disabled || isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className} `}
      aria-label={buttonLabel}
      title={buttonLabel}
    >
      <span className="flex items-center gap-1.5">
        {isProcessing ? (
          <span
            className={`${iconSizes[size]} animate-spin rounded-full border-2 border-current border-t-transparent`}
          />
        ) : isFav ? (
          <HeartSolid className={`${iconSizes[size]} text-red-500`} />
        ) : (
          <HeartOutline className={iconSizes[size]} />
        )}
        {showLabel && <span className="text-sm font-medium">{buttonLabel}</span>}
      </span>
    </button>
  );
};

export default FavoriteButton;

// تصدير مسمى للاستيراد المباشر
export { FavoriteButton };
