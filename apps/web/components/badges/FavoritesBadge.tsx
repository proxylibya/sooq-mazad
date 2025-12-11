import React, { useEffect, useCallback } from 'react';
import { useFavorites } from '../../hooks/useFavorites';
import { useBadgeCounts } from '../../hooks/useBadgeCounts';
import useAuth from '../../hooks/useAuth';
import EnhancedBadge from '../ui/EnhancedBadge';

interface FavoritesBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

const FavoritesBadge: React.FC<FavoritesBadgeProps> = ({
  size = 'md',
  position = 'top-right',
  className = '',
}) => {
  const { user } = useAuth();
  const { favoritesCount } = useFavorites();
  const { favorites: badgeCount, setFavoritesCount } = useBadgeCounts();

  // تحديث العداد عند تغيير favoritesCount من useFavorites
  useEffect(() => {
    if (typeof favoritesCount === 'number' && favoritesCount >= 0) {
      setFavoritesCount(favoritesCount);
    }
  }, [favoritesCount, setFavoritesCount]);

  // إذا لم يكن المستخدم مسجل الدخول، لا نعرض العداد
  if (!user) return null;

  return (
    <EnhancedBadge
      count={badgeCount}
      size={size}
      position={position}
      color="red"
      animate={true}
      className={className}
    />
  );
};

export default FavoritesBadge;
