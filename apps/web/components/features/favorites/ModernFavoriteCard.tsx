import React, { useState } from 'react';
import { useRouter } from 'next/router';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';

interface ModernFavoriteCardProps {
  item: any;
  onRemove: (item: any) => void;
  viewMode?: 'grid' | 'list';
}

const ModernFavoriteCard: React.FC<ModernFavoriteCardProps> = ({
  item,
  onRemove,
  viewMode = 'grid',
}) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  // دوال مساعدة
  const formatNumber = (num: string | number) => {
    if (!num) return '0';
    return parseInt(num.toString().replace(/,/g, '')).toLocaleString();
  };

  const getFirstImage = (item: any) => {
    // التحقق من وجود صور في المصفوفة
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      // إذا كانت الصورة عبارة عن كائن مع url
      if (typeof item.images[0] === 'object' && item.images[0].url) {
        return item.images[0].url;
      }
      // إذا كانت الصورة عبارة عن string مباشر
      if (typeof item.images[0] === 'string') {
        return item.images[0];
      }
    }

    // التحقق من صورة واحدة
    if (item.image) {
      return typeof item.image === 'object' ? item.image.url : item.image;
    }

    // التحقق من صور السيارة
    if (item.car?.carImages && Array.isArray(item.car.carImages) && item.car.carImages.length > 0) {
      const carImage = item.car.carImages[0];
      return typeof carImage === 'object' ? carImage.fileUrl : carImage;
    }

    // صورة افتراضية محسنة
    return '/images/placeholder-car.svg';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'منذ يوم';
    if (diffDays === 2) return 'منذ يومين';
    if (diffDays <= 7) return `منذ ${diffDays} أيام`;
    return date.toLocaleDateString('ar-LY');
  };

  // دالة محسنة للانتقال لصفحة التفاصيل
  const viewDetails = () => {
    try {
      if (!item.itemId) {
        console.error('معرف العنصر غير موجود:', item);
        return;
      }

      if (item.type === 'auction') {
        router.push(`/auctions/${item.itemId}`);
      } else if (item.type === 'marketplace') {
        router.push(`/marketplace/${item.itemId}`);
      } else {
        console.error('نوع العنصر غير معروف:', item.type);
        // محاولة التنقل إلى الصفحة الافتراضية
        router.push(`/marketplace/${item.itemId}`);
      }
    } catch (error) {
      console.error('خطأ في التنقل:', error);
    }
  };

  // دالة لحذف من المفضلة
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(item);
  };

  if (viewMode === 'list') {
    return (
      <div
        className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
        onClick={viewDetails}
      >
        <div className="flex h-32">
          {/* الصورة */}
          <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <img
              src={imageError ? '/images/placeholder-car.svg' : getFirstImage(item)}
              alt={item.title || 'صورة العنصر'}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
              loading="lazy"
            />
            {/* شارة النوع */}
            <div
              className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-bold text-white ${
                item.type === 'auction' ? 'bg-red-500' : 'bg-blue-500'
              }`}
            >
              {item.type === 'auction' ? 'مزاد' : 'فوري'}
            </div>
            {/* زر الحذف */}
            <button
              onClick={handleRemove}
              className="absolute left-2 top-2 rounded-full bg-white/90 p-2 text-red-500 transition-colors hover:bg-red-50"
              aria-label="إزالة من المفضلة"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>

          {/* المحتوى */}
          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <h3 className="mb-2 line-clamp-2 text-lg font-bold">{item.title}</h3>
              <div className="mb-2 flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span className="text-sm">{item.location || 'طرابلس'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="text-sm">{formatDate(item.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-blue-600">
                {formatNumber(item.price || item.currentPrice || item.startingPrice || 0)} د.ل
              </p>
              {item.images?.length > 1 && (
                <div className="flex items-center gap-1 text-gray-500">
                  <EyeIcon className="h-4 w-4" />
                  <span className="text-sm">{item.images.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // العرض الشبكي (مثل ملف الاختبار)
  return (
    <div
      className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
      onClick={viewDetails}
    >
      <div className="relative">
        <img
          src={getFirstImage(item)}
          alt={item.title}
          className="h-48 w-full object-cover"
          onError={() => setImageError(true)}
        />

        {/* شارة النوع */}
        <div
          className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-bold text-white shadow-lg ${
            item.type === 'auction' ? 'bg-red-500' : 'bg-blue-500'
          }`}
        >
          {item.type === 'auction' ? 'مزاد' : 'فوري'}
        </div>

        {/* شارة مباشر للمزادات النشطة */}
        {item.type === 'auction' && item.status === 'LIVE' && (
          <div className="absolute right-2 top-2 animate-pulse rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
            مباشر
          </div>
        )}

        {/* زر الحذف */}
        <button
          onClick={handleRemove}
          className="absolute left-2 top-2 rounded-full bg-white/90 p-2 text-red-500 shadow-lg transition-colors hover:bg-red-50"
          aria-label="إزالة من المفضلة"
        >
          <TrashIcon className="h-4 w-4" />
        </button>

        {/* عدد الصور */}
        {item.images?.length > 1 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/80 px-2 py-1 text-xs text-white shadow-lg">
            <EyeIcon className="h-3 w-3" />
            <span className="font-medium">{item.images.length}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 text-lg font-bold">{item.title}</h3>
        <div className="mb-3 flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-1">
            <MapPinIcon className="h-4 w-4" />
            <span className="text-sm">{item.location || 'طرابلس'}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span className="text-sm">{formatDate(item.createdAt)}</span>
          </div>
        </div>
        <p className="text-xl font-bold text-blue-600">
          {formatNumber(item.price || item.currentPrice || item.startingPrice || 0)} د.ل
        </p>
      </div>
    </div>
  );
};

export default ModernFavoriteCard;
