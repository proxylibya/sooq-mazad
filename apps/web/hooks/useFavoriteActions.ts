/**
 * Hook مبسط لإدارة إجراءات المفضلة
 * ملاحظة: هذا الـ hook هو واجهة مبسطة لـ useFavorites
 * العدادات تُحدَّث تلقائياً داخل useFavorites - لا حاجة لتحديث إضافي
 *
 * @deprecated استخدم useFavorites مباشرة بدلاً من هذا الـ hook
 */
import { useFavorites } from './useFavorites';

interface UseFavoriteActionsReturn {
  isFavorite: (
    carId?: string,
    auctionId?: string,
    showroomId?: string,
    transportId?: string,
  ) => boolean;
  toggleFavorite: (
    carId?: string,
    auctionId?: string,
    showroomId?: string,
    transportId?: string,
  ) => Promise<boolean>;
  addToFavorites: (
    carId?: string,
    auctionId?: string,
    showroomId?: string,
    transportId?: string,
  ) => Promise<boolean>;
  removeFromFavorites: (
    carId?: string,
    auctionId?: string,
    showroomId?: string,
    transportId?: string,
  ) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook محسن لإدارة إجراءات المفضلة
 * يعيد توجيه جميع الوظائف إلى useFavorites الرئيسي
 * العدادات تُحدَّث تلقائياً - لا تحديث مزدوج
 */
export const useFavoriteActions = (): UseFavoriteActionsReturn => {
  const {
    isFavorite,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
    isLoading,
    error,
  } = useFavorites();

  // إرجاع الدوال مباشرة من useFavorites بدون أي تعديل
  // العدادات تُحدَّث داخل useFavorites تلقائياً
  return {
    isFavorite,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
    isLoading,
    error,
  };
};

export default useFavoriteActions;
