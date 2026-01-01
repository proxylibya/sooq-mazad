import React, { useState } from 'react';
import Link from 'next/link';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import ChevronLeftIcon from '@heroicons/react/24/outline/ChevronLeftIcon';
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon';
import CameraIcon from '@heroicons/react/24/outline/CameraIcon';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useFavorites } from '../hooks/useFavorites';
import SafeImage from './SafeImage';

interface CompactShowroomCardProps {
  item: {
    id: string;
    title: string;
    location: string;
    phone: string;
    rating: number;
    reviewsCount: number;
    totalCars: number;
    activeCars: number;
    images: string[];
    description: string;
    verified: boolean;
    type: string;
    owner?: {
      name: string;
      verified: boolean;
    };
  };
  onContactClick?: (id: string) => void;
  onChatClick?: (id: string) => void;
}

const CompactShowroomCard: React.FC<CompactShowroomCardProps> = ({
  item,
  onContactClick,
  onChatClick,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(item.id, 'showroom');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // منطق المشاركة
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === item.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? item.images.length - 1 : prev - 1));
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  return (
    <div
      className="mb-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
      style={{ height: '120px' }}
    >
      <div className="flex h-full">
        {/* قسم الصورة */}
        <div className="group relative h-full w-40 flex-shrink-0">
          <SafeImage
            src={
              item.images[currentImageIndex] ||
              'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            }
            alt={item.title}
            className="h-full w-full object-cover"
            fallbackSrc="/images/showrooms/default-showroom.svg"
          />

          {/* أسهم التنقل */}
          {item.images.length > 1 && (
            <>
              <button
                className="absolute left-1 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-black/70 p-1 text-white opacity-0 transition-all duration-200 hover:bg-black/90 hover:opacity-100 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
              >
                <ChevronLeftIcon className="h-3 w-3" />
              </button>
              <button
                className="absolute right-1 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-black/70 p-1 text-white opacity-0 transition-all duration-200 hover:bg-black/90 hover:opacity-100 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
              >
                <ChevronRightIcon className="h-3 w-3" />
              </button>
            </>
          )}

          {/* مؤشرات الصور */}
          {item.images.length > 1 && (
            <div className="absolute bottom-1 left-1/2 z-20 flex -translate-x-1/2 gap-0.5">
              {item.images.slice(0, 3).map((_, index) => (
                <div
                  key={index}
                  className={`h-1 w-1 rounded-full transition-colors ${
                    currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* عداد الصور */}
          <div className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded bg-black/70 px-1 py-0.5 text-xs text-white">
            <CameraIcon className="h-2 w-2" />
            {item.images.length}
          </div>

          {/* أزرار الإجراءات */}
          <div className="absolute right-1 top-1 flex flex-col gap-1">
            <button
              onClick={handleToggleFavorite}
              className="rounded border border-gray-300 bg-white/90 p-1 text-gray-600 transition-colors hover:bg-gray-50"
            >
              {isFavorite(item.id, 'showroom') ? (
                <HeartSolid className="h-3 w-3 text-red-500" />
              ) : (
                <HeartIcon className="h-3 w-3" />
              )}
            </button>
            <button
              onClick={handleShare}
              className="rounded border border-gray-300 bg-white/90 p-1 text-gray-600 transition-colors hover:bg-gray-50"
            >
              <ShareIcon className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* قسم المحتوى */}
        <div className="flex flex-1 flex-col justify-between p-3">
          {/* الجزء العلوي */}
          <div className="mb-2 flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Link href={`/showrooms/${item.id}`}>
                  <h1 className="line-clamp-1 cursor-pointer text-sm font-bold text-gray-900 hover:text-blue-600">
                    {item.title}
                  </h1>
                </Link>
                {item.verified && <CheckCircleIcon className="h-3 w-3 text-blue-500" />}
              </div>

              <div className="mb-1 flex items-center gap-1">
                <MapPinIcon className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600">{item.location}</span>
              </div>

              <p className="line-clamp-1 text-xs text-gray-600">{item.description}</p>
            </div>
          </div>

          {/* الإحصائيات */}
          <div className="mb-2 grid grid-cols-3 gap-2 text-center">
            <div className="rounded bg-gradient-to-br from-blue-50 to-blue-100 p-1">
              <div className="flex justify-center">
                <BuildingStorefrontIcon className="h-3 w-3 text-blue-600" />
              </div>
              <div className="text-xs font-bold text-blue-900">{item.totalCars}</div>
              <div className="text-xs text-blue-700">إجمالي السيارات</div>
            </div>
            <div className="rounded bg-gradient-to-br from-green-50 to-green-100 p-1">
              <div className="flex justify-center">
                <CheckCircleIcon className="h-3 w-3 text-green-600" />
              </div>
              <div className="text-xs font-bold text-green-900">{item.activeCars}</div>
              <div className="text-xs text-green-700">السيارات المتاحة</div>
            </div>
            <div className="rounded bg-gradient-to-br from-yellow-50 to-yellow-100 p-1">
              <div className="flex justify-center">
                <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-600" />
              </div>
              <div className="text-xs font-bold text-yellow-900">{formatRating(item.rating)}</div>
              <div className="text-xs text-yellow-700">التقييم</div>
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="mb-2 grid grid-cols-2 gap-1">
            <div className="flex items-center gap-1 rounded bg-gradient-to-r from-gray-50 to-gray-100 p-1">
              <PhoneIcon className="h-2 w-2 text-gray-600" />
              <div>
                <div className="text-xs font-medium text-gray-900">رقم الهاتف</div>
                <div className="text-xs text-gray-600" dir="ltr">{item.phone}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded bg-gradient-to-r from-gray-50 to-gray-100 p-1">
              <BuildingStorefrontIcon className="h-2 w-2 text-gray-600" />
              <div>
                <div className="text-xs font-medium text-gray-900">المالك</div>
                <div className="text-xs text-gray-600">{item.owner?.name || 'مستخدم تجريبي'}</div>
              </div>
            </div>
          </div>

          {/* الأزرار */}
          <div className="flex gap-1">
            <button
              onClick={() => onContactClick?.(item.id)}
              className="flex flex-1 items-center justify-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              <PhoneIcon className="h-3 w-3" />
              اتصال
            </button>
            <button
              onClick={() => onChatClick?.(item.id)}
              className="flex flex-1 items-center justify-center gap-1 rounded border border-blue-600 bg-white px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
            >
              <ChatBubbleLeftRightIcon className="h-3 w-3" />
              مراسلة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactShowroomCard;
