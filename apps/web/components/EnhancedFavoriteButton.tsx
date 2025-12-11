import React, { useState } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useFavoriteActions } from '../hooks/useFavoriteActions';
import { useBadgeCounts } from '../hooks/useBadgeCounts';
import useAuth from '../hooks/useAuth';

interface EnhancedFavoriteButtonProps {
  carId?: string;
  auctionId?: string;
  showroomId?: string;
  transportId?: string;
  itemTitle?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
}

const EnhancedFavoriteButton: React.FC<EnhancedFavoriteButtonProps> = ({
  carId,
  auctionId,
  showroomId,
  transportId,
  itemTitle = 'هذا العنصر',
  size = 'md',
  showText = false,
  className = '',
  onToggle,
}) => {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, isLoading, error } = useFavoriteActions();
  const { favorites: favoritesCount } = useBadgeCounts();

  const [isOptimistic, setIsOptimistic] = useState(false);
  const [lastAction, setLastAction] = useState<'add' | 'remove' | null>(null);

  const isCurrentlyFavorite = isFavorite(carId, auctionId, showroomId, transportId) || isOptimistic;

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const handleToggle = async () => {
    if (!user) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }

    if (isLoading) return;

    const wasCurrentlyFavorite = isCurrentlyFavorite;

    setIsOptimistic(!wasCurrentlyFavorite);
    setLastAction(!wasCurrentlyFavorite ? 'add' : 'remove');

    try {
      const success = await toggleFavorite(carId, auctionId, showroomId, transportId);

      if (success) {
        onToggle?.(success);
        const actionText = !wasCurrentlyFavorite ? 'تم إضافة' : 'تم حذف';
        const directionText = !wasCurrentlyFavorite ? 'إلى' : 'من';
      } else {
        setIsOptimistic(wasCurrentlyFavorite);
        console.error('❌ فشل في تحديث المفضلة');
      }
    } catch (err) {
      setIsOptimistic(wasCurrentlyFavorite);
      console.error('❌ خطأ في تحديث المفضلة:', err);
    }
  };

  const getButtonClass = () => {
    const baseClass = `inline-flex items-center justify-center rounded-lg border transition-all duration-200 ${buttonSizes[size]}`;

    if (isCurrentlyFavorite) {
      return `${baseClass} border-red-300 bg-red-50 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`;
    } else {
      return `${baseClass} border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`${getButtonClass()} ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
        title={
          isCurrentlyFavorite
            ? `إزالة "${itemTitle}" من المفضلة`
            : `إضافة "${itemTitle}" إلى المفضلة`
        }
        aria-label={
          isCurrentlyFavorite
            ? `إزالة "${itemTitle}" من المفضلة`
            : `إضافة "${itemTitle}" إلى المفضلة`
        }
      >
        <div
          className={`${isLoading ? 'animate-pulse' : ''} ${lastAction ? 'animate-pulse-once' : ''}`}
        >
          {isCurrentlyFavorite ? (
            <HeartSolid className={`${iconSizes[size]} text-red-500`} />
          ) : (
            <HeartIcon className={iconSizes[size]} />
          )}
        </div>

        {showText && (
          <span className="mr-2 text-sm font-medium">
            {isCurrentlyFavorite ? 'مفضل' : 'إضافة للمفضلة'}
          </span>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/50">
            <div className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-red-500" />
          </div>
        )}
      </button>

      {error && (
        <div className="absolute left-0 top-full z-10 mt-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600 shadow-sm">
          {typeof error === 'string' ? error : (error as any)?.message || 'حدث خطأ'}
        </div>
      )}

      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -right-2 -top-2 rounded bg-blue-100 px-1 py-0.5 text-xs text-blue-800">
          {favoritesCount}
        </div>
      )}
    </div>
  );
};

export default EnhancedFavoriteButton;
