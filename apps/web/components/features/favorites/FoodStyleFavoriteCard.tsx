import React from 'react';
import { useRouter } from 'next/router';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import HandRaisedIcon from '@heroicons/react/24/outline/HandRaisedIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

interface FoodStyleFavoriteCardProps {
  item: any;
  viewMode: 'list' | 'grid';
  onRemove: (item: any) => void;
}

const FoodStyleFavoriteCard: React.FC<FoodStyleFavoriteCardProps> = ({
  item,
  viewMode,
  onRemove,
}) => {
  const router = useRouter();

  // دوال مساعدة
  const formatNumber = (num: string | number) => {
    if (!num) return '0';
    return parseInt(num.toString().replace(/,/g, '')).toLocaleString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFirstImage = (item: any) => {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0].url || item.images[0];
    }
    if (item.car?.carImages && Array.isArray(item.car.carImages) && item.car.carImages.length > 0) {
      return item.car.carImages[0].fileUrl || item.car.carImages[0];
    }
    return '/images/placeholder-car.svg';
  };

  const getImagesCount = (item: any) => {
    if (item.images && Array.isArray(item.images)) {
      return item.images.length;
    }
    if (item.car?.carImages && Array.isArray(item.car.carImages)) {
      return item.car.carImages.length;
    }
    return 0;
  };

  // دوال الإجراءات
  const viewDetails = () => {
    if (item.type === 'auction') {
      router.push(`/auctions/${item.itemId}`);
    } else {
      router.push(`/marketplace/${item.itemId}`);
    }
  };

  const handleCall = () => {
    if (item.seller?.phone) {
      window.open(`tel:${item.seller.phone}`);
    }
  };

  const handleMessage = () => {
    if (item.seller?.id) {
      router.push(`/chat/${item.seller.id}`);
    }
  };

  // تقييم وهمي للعرض
  const rating = 4.2 + Math.random() * 0.8; // تقييم بين 4.2 و 5.0
  const reviewCount = Math.floor(Math.random() * 500) + 50; // عدد المراجعات

  if (viewMode === 'list') {
    return (
      <div
        className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        onClick={viewDetails}
      >
        <div className="flex h-28">
          {/* صورة مدمجة */}
          <div className="relative h-full w-28 flex-shrink-0 overflow-hidden rounded-r-xl">
            <img
              src={getFirstImage(item)}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />

            {/* زر المفضلة */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item);
              }}
              className="absolute left-1 top-1 rounded-full bg-white/90 p-1 text-red-500 transition-all hover:scale-110 hover:bg-white"
              aria-label="إزالة من المفضلة"
            >
              <HeartSolid className="h-3 w-3" />
            </button>
          </div>

          {/* محتوى مدمج */}
          <div className="flex flex-1 flex-col justify-between p-3">
            <div>
              <h3 className="mb-1 line-clamp-1 text-sm font-bold text-gray-900">{item.title}</h3>

              {/* تقييم ومعلومات سريعة */}
              <div className="mb-2 flex items-center gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                  <span>({reviewCount})</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3" />
                  <span>{item.location || 'طرابلس'}</span>
                </div>
              </div>

              {/* السعر */}
              <div className="text-sm font-bold text-green-600">
                {formatNumber(item.price || item.currentPrice || item.startingPrice)} دينار
              </div>
            </div>

            {/* أزرار سريعة */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCall();
                }}
                className="flex-1 rounded-lg bg-blue-50 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
              >
                اتصال
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMessage();
                }}
                className="flex-1 rounded-lg bg-green-50 py-1 text-xs font-medium text-green-600 transition-colors hover:bg-green-100"
              >
                رسالة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // العرض الشبكي - مستوحى من تطبيقات الطعام
  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      onClick={viewDetails}
    >
      {/* صورة العنصر */}
      <div className="relative h-40 overflow-hidden bg-gray-100">
        <img
          src={getFirstImage(item)}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* تدرج في الأسفل */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent" />

        {/* شارة نوع العنصر */}
        <div
          className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm ${
            item.type === 'auction' ? 'bg-blue-500/90' : 'bg-green-500/90'
          }`}
        >
          {item.type === 'auction' ? 'مزاد' : 'فوري'}
        </div>

        {/* زر المفضلة */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item);
          }}
          className="absolute left-2 top-2 rounded-full bg-white/90 p-1.5 text-red-500 transition-all hover:scale-110 hover:bg-white"
          aria-label="إزالة من المفضلة"
        >
          <HeartSolid className="h-4 w-4" />
        </button>

        {/* معلومات سريعة */}
        <div className="absolute bottom-2 left-2 right-2 text-white">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <EyeIcon className="h-3 w-3" />
              <span>{getImagesCount(item)} صور</span>
            </div>
            {item.type === 'auction' && (
              <div className="animate-pulse rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium">
                مباشر
              </div>
            )}
          </div>
        </div>
      </div>

      {/* محتوى البطاقة */}
      <div className="p-3">
        {/* العنوان */}
        <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-tight text-gray-900">
          {item.title}
        </h3>

        {/* تقييم ومعلومات */}
        <div className="mb-2 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span>({reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPinIcon className="h-3 w-3" />
            <span className="truncate">{item.location || 'طرابلس'}</span>
          </div>
        </div>

        {/* السعر */}
        <div className="mb-3 text-center">
          <div className="text-lg font-bold text-green-600">
            {formatNumber(item.price || item.currentPrice || item.startingPrice)} دينار
          </div>
          {item.type === 'auction' && <div className="text-xs text-gray-500">السعر الحالي</div>}
        </div>

        {/* أزرار الإجراءات */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCall();
            }}
            className="flex items-center justify-center gap-1 rounded-lg bg-blue-50 py-2 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
          >
            <PhoneIcon className="h-3 w-3" />
            اتصال
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMessage();
            }}
            className="flex items-center justify-center gap-1 rounded-lg bg-green-50 py-2 text-xs font-medium text-green-600 transition-colors hover:bg-green-100"
          >
            <ChatBubbleLeftRightIcon className="h-3 w-3" />
            رسالة
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodStyleFavoriteCard;
