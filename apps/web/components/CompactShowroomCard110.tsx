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
import FireIcon from '@heroicons/react/24/outline/FireIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';

interface CompactShowroomCard110Props {
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
    featured?: boolean;
    experienceYears?: number;
    openingHours?: string;
    owner?: {
      name: string;
      verified: boolean;
    };
  };
  onContactClick?: (id: string) => void;
  onChatClick?: (id: string) => void;
  onShareClick?: (id: string) => void;
  onFavoriteClick?: (id: string) => void;
}

const CompactShowroomCard110: React.FC<CompactShowroomCard110Props> = ({
  item,
  onContactClick,
  onChatClick,
  onShareClick,
  onFavoriteClick,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    onFavoriteClick?.(item.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShareClick?.(item.id);
  };

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContactClick?.(item.id);
  };

  const handleChat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChatClick?.(item.id);
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

  const getImageList = () => {
    return item.images && item.images.length > 0
      ? item.images
      : ['https://via.placeholder.com/144x110?text=معرض'];
  };

  return (
    <div
      className="mb-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl transition-all duration-200 hover:scale-[1.01] hover:border-blue-200 hover:shadow-2xl"
      style={{ height: '110px' }}
    >
      <div className="flex h-full">
        {/* قسم الصورة - مصغر للارتفاع 110px */}
        <div className="group/image relative h-full w-36 flex-shrink-0 overflow-hidden">
          <Link href={`/showrooms/${item.id}`} className="block h-full">
            <img
              src={getImageList()[currentImageIndex]}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/144x110/f3f4f6/9ca3af?text=معرض';
              }}
            />
          </Link>

          {/* أسهم التنقل - مصغرة جداً */}
          {getImageList().length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-0.5 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-black/70 p-0.5 text-white opacity-0 transition-all duration-200 hover:bg-black/90 hover:opacity-100 group-hover/image:opacity-100"
                aria-label="الصورة السابقة"
              >
                <ChevronLeftIcon className="h-2 w-2" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-0.5 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-black/70 p-0.5 text-white opacity-0 transition-all duration-200 hover:bg-black/90 hover:opacity-100 group-hover/image:opacity-100"
                aria-label="الصورة التالية"
              >
                <ChevronRightIcon className="h-2 w-2" />
              </button>
            </>
          )}

          {/* مؤشرات الصور - مصغرة جداً */}
          {getImageList().length > 1 && (
            <div className="absolute bottom-0.5 left-1/2 z-20 flex -translate-x-1/2 gap-0.5">
              {getImageList()
                .slice(0, 2)
                .map((_, index) => (
                  <div
                    key={index}
                    className={`h-0.5 w-0.5 rounded-full transition-colors ${
                      currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
            </div>
          )}

          {/* عداد الصور - مصغر جداً */}
          <div className="absolute bottom-0.5 right-0.5 flex items-center gap-0.5 rounded bg-black/70 px-1 py-0.5 text-xs text-white">
            <CameraIcon className="h-1.5 w-1.5" />
            <span className="text-xs">{getImageList().length}</span>
          </div>

          {/* أزرار الإجراءات - مصغرة جداً */}
          <div className="absolute right-0.5 top-0.5 flex flex-col gap-0.5">
            <button
              onClick={handleShare}
              className="rounded border border-gray-300 bg-white/90 p-0.5 text-gray-600 transition-colors hover:bg-gray-50"
            >
              <ShareIcon className="h-2 w-2" />
            </button>
            <button
              onClick={handleToggleFavorite}
              className="rounded border border-gray-300 bg-white/90 p-0.5 transition-colors hover:bg-gray-50"
            >
              {isFavorite ? (
                <HeartSolid className="h-2 w-2 text-red-500" />
              ) : (
                <HeartIcon className="h-2 w-2 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* قسم المحتوى - مضغوط للارتفاع 110px */}
        <div className="flex flex-1 flex-col justify-between p-2">
          {/* الجزء العلوي - مضغوط جداً */}
          <div className="mb-1 flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center gap-1">
                <Link href={`/showrooms/${item.id}`}>
                  <h1 className="line-clamp-1 cursor-pointer text-xs font-bold text-gray-900 transition-colors hover:text-blue-600">
                    {item.title}
                  </h1>
                </Link>
                {item.verified && <CheckCircleIcon className="h-2.5 w-2.5 text-blue-500" />}
              </div>

              <div className="mb-0.5 flex items-center gap-0.5">
                <MapPinIcon className="h-2 w-2 text-gray-500" />
                <span className="line-clamp-1 text-xs text-gray-600">{item.location}</span>
              </div>

              <p className="line-clamp-1 text-xs text-gray-600">{item.description}</p>
            </div>
          </div>

          {/* الإحصائيات - مضغوطة جداً */}
          <div className="mb-1 grid grid-cols-4 gap-1 text-center">
            <div className="rounded bg-gradient-to-br from-blue-50 to-blue-100 p-0.5 transition-transform duration-200 hover:scale-105">
              <div className="flex justify-center">
                <BuildingStorefrontIcon className="h-2 w-2 text-blue-600" />
              </div>
              <div className="text-xs font-bold text-blue-900">{item.totalCars}</div>
              <div className="text-xs text-blue-700">إجمالي</div>
            </div>
            <div className="rounded bg-gradient-to-br from-green-50 to-green-100 p-0.5 transition-transform duration-200 hover:scale-105">
              <div className="flex justify-center">
                <FireIcon className="h-2 w-2 text-green-600" />
              </div>
              <div className="text-xs font-bold text-green-900">{item.activeCars}</div>
              <div className="text-xs text-green-700">متاحة</div>
            </div>
            <div className="rounded bg-gradient-to-br from-yellow-50 to-yellow-100 p-0.5 transition-transform duration-200 hover:scale-105">
              <div className="flex justify-center">
                <StarSolid className="h-2 w-2 text-yellow-600" />
              </div>
              <div className="text-xs font-bold text-yellow-900">{formatRating(item.rating)}</div>
              <div className="text-xs text-yellow-700">تقييم</div>
            </div>
            <div className="rounded bg-gradient-to-br from-purple-50 to-purple-100 p-0.5 transition-transform duration-200 hover:scale-105">
              <div className="flex justify-center">
                <ClockIcon className="h-2 w-2 text-purple-600" />
              </div>
              <div className="text-xs font-bold text-purple-900">{item.experienceYears || 0}</div>
              <div className="text-xs text-purple-700">سنوات</div>
            </div>
          </div>

          {/* معلومات إضافية - مضغوطة جداً */}
          <div className="mb-1 grid grid-cols-2 gap-0.5">
            <div className="flex items-center gap-0.5 rounded bg-gradient-to-r from-gray-50 to-gray-100 p-0.5 transition-colors hover:from-gray-100 hover:to-gray-200">
              <PhoneIcon className="h-1.5 w-1.5 text-gray-600" />
              <div>
                <div className="text-xs font-medium text-gray-900">رقم الهاتف</div>
                <div className="line-clamp-1 text-xs text-gray-600">{item.phone || ''}</div>
              </div>
            </div>
            <div className="flex items-center gap-0.5 rounded bg-gradient-to-r from-gray-50 to-gray-100 p-0.5 transition-colors hover:from-gray-100 hover:to-gray-200">
              <BuildingStorefrontIcon className="h-1.5 w-1.5 text-gray-600" />
              <div>
                <div className="text-xs font-medium text-gray-900">المالك</div>
                <div className="text-xs text-gray-600">{item.owner?.name || 'مستخدم تجريبي'}</div>
              </div>
            </div>
          </div>

          {/* الأزرار - مضغوطة جداً */}
          <div className="flex gap-0.5">
            <button
              onClick={handleContact}
              className="flex flex-1 items-center justify-center gap-0.5 rounded bg-blue-600 px-1 py-0.5 text-xs font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700"
            >
              <PhoneIcon className="h-2 w-2" />
              <span className="text-xs">اتصال</span>
            </button>
            <button
              onClick={handleChat}
              className="flex flex-1 items-center justify-center gap-0.5 rounded border border-blue-600 bg-white px-1 py-0.5 text-xs font-medium text-blue-600 transition-all duration-200 hover:scale-105 hover:bg-blue-50"
            >
              <ChatBubbleLeftRightIcon className="h-2 w-2" />
              <span className="text-xs">مراسلة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactShowroomCard110;
