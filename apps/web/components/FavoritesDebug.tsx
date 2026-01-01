import React from 'react';
import { useFavorites } from '../hooks/useFavorites';
import useAuth from '../hooks/useAuth';

const FavoritesDebug: React.FC = () => {
  const { user } = useAuth();
  const { favorites, favoritesCount, isLoading, error } = useFavorites();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-gray-300 bg-white p-4 shadow-lg">
      <h3 className="mb-2 text-sm font-bold">🐛 معلومات المفضلة</h3>

      <div className="space-y-1 text-xs">
        <div>
          <strong>المستخدم:</strong> {user ? user.name : 'غير مسجل'}
        </div>

        <div>
          <strong>Token:</strong>{' '}
          {typeof window !== 'undefined' && localStorage.getItem('token') ? 'موجود' : 'غير موجود'}
        </div>

        <div>
          <strong>العدد:</strong> {favoritesCount}
        </div>

        <div>
          <strong>التحميل:</strong> {isLoading ? 'نعم' : 'لا'}
        </div>

        <div>
          <strong>الخطأ:</strong>{' '}
          {error
            ? typeof error === 'string'
              ? error
              : (error as any)?.message || 'خطأ غير محدد'
            : 'لا يوجد'}
        </div>

        <div>
          <strong>المفضلة:</strong> {favorites.length} عنصر
        </div>
      </div>
    </div>
  );
};

export default FavoritesDebug;
