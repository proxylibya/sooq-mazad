import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import CameraIcon from '@heroicons/react/24/outline/CameraIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ChevronLeftIcon from '@heroicons/react/24/outline/ChevronLeftIcon';
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import FireIcon from '@heroicons/react/24/outline/FireIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React, { useState } from 'react';
import SafeImage from './SafeImage';
import { FavoriteButton } from './ui/FavoriteButton';

interface ShowroomCardProps {
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
    openingHours: string;
    verified: boolean;
    type: string;
    specialties: string[];
    services: string[];
    features: string[];
    featured?: boolean;
    user?: {
      id: string;
      name: string;
      phone: string;
      verified: boolean;
    };
  };
  onContactClick?: (id: string) => void;
  onChatClick?: (id: string) => void;
  onShareClick?: (id: string) => void;
}

const ShowroomCard: React.FC<ShowroomCardProps> = ({
  item,
  onContactClick,
  onChatClick,
  onShareClick,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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
      : ['https://via.placeholder.com/128x120?text=معرض'];
  };

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:scale-[1.01] hover:border-blue-200 hover:shadow-md"
      style={{ height: '110px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* تخطيط أفقي مدمج */}
      <div className="flex h-full">
        {/* قسم الصورة - محسن للارتفاع 110px */}
        <div className="group/image relative h-full w-36 flex-shrink-0 overflow-hidden">
          <Link href={`/showrooms/${item.id}`} className="block h-full">
            <SafeImage
              src={getImageList()[currentImageIndex]}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              fallbackSrc="/images/showrooms/default-showroom.svg"
            />
          </Link>

          {/* أسهم التنقل بين الصور - مصغرة */}
          {getImageList().length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-0.5 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-black/70 p-0.5 text-white opacity-0 transition-all duration-200 hover:bg-black/90 hover:opacity-100 group-hover/image:opacity-100"
              >
                <ChevronLeftIcon className="h-2.5 w-2.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-0.5 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-black/70 p-0.5 text-white opacity-0 transition-all duration-200 hover:bg-black/90 hover:opacity-100 group-hover/image:opacity-100"
              >
                <ChevronRightIcon className="h-2.5 w-2.5" />
              </button>
            </>
          )}

          {/* مؤشرات الصور - مصغرة */}
          {getImageList().length > 1 && (
            <div className="absolute bottom-0.5 left-1/2 z-20 flex -translate-x-1/2 gap-0.5">
              {getImageList()
                .slice(0, 3)
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

          {/* عداد الصور - مصغر */}
          <div className="absolute bottom-0.5 right-0.5 flex items-center gap-0.5 rounded bg-black/70 px-1 py-0.5 text-xs text-white">
            <CameraIcon className="h-1.5 w-1.5" />
            <span className="text-xs">{getImageList().length}</span>
          </div>

          {/* أزرار الإجراءات على الصورة - مصغرة */}
          <div className="absolute right-0.5 top-0.5 flex flex-col gap-0.5">
            <FavoriteButton
              type="showroom"
              itemId={item.id}
              size="sm"
              variant="overlay"
              className="!p-0.5"
            />
            <button
              onClick={handleShare}
              className="rounded-full bg-white/90 p-0.5 shadow-sm transition-all duration-200 hover:scale-110 hover:bg-white"
            >
              <ShareIcon className="h-2.5 w-2.5 text-gray-600" />
            </button>
          </div>

          {/* شارات خاصة - مصغرة */}
          <div className="absolute bottom-0.5 left-0.5 flex flex-col gap-0.5">
            {item.featured && (
              <div className="flex items-center gap-0.5 rounded bg-gradient-to-r from-yellow-500 to-orange-500 px-1 py-0.5 text-xs font-bold text-white shadow-sm">
                <FireIcon className="h-1.5 w-1.5" />
                <span className="text-xs">مميز</span>
              </div>
            )}
            {item.verified && (
              <div className="rounded bg-gradient-to-r from-blue-500 to-blue-600 px-1 py-0.5 text-xs font-bold text-white shadow-sm">
                <span className="text-xs">موثق</span>
              </div>
            )}
          </div>
        </div>

        {/* قسم المحتوى - محسن للارتفاع 110px */}
        <div className="flex flex-1 flex-col justify-between p-2">
          {/* الجزء العلوي - مضغوط */}
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
                <MapPinIcon className="h-2.5 w-2.5 text-gray-500" />
                <span className="line-clamp-1 text-xs text-gray-600">{item.location}</span>
              </div>

              <p className="line-clamp-1 text-xs text-gray-600">{item.description}</p>
            </div>
          </div>

          {/* الإحصائيات المصغرة - مضغوطة */}
          <div className="mb-1 grid grid-cols-3 gap-1 text-center">
            <div className="rounded bg-gradient-to-br from-blue-50 to-blue-100 p-1 transition-transform duration-200 hover:scale-105">
              <div className="flex justify-center">
                <BuildingStorefrontIcon className="h-2.5 w-2.5 text-blue-600" />
              </div>
              <div className="text-xs font-bold text-blue-900">{item.totalCars}</div>
              <div className="text-xs text-blue-700">إجمالي</div>
            </div>
            <div className="rounded bg-gradient-to-br from-green-50 to-green-100 p-1 transition-transform duration-200 hover:scale-105">
              <div className="flex justify-center">
                <CheckCircleIcon className="h-2.5 w-2.5 text-green-600" />
              </div>
              <div className="text-xs font-bold text-green-900">{item.activeCars}</div>
              <div className="text-xs text-green-700">متاحة</div>
            </div>
            <div className="rounded bg-gradient-to-br from-yellow-50 to-yellow-100 p-1 transition-transform duration-200 hover:scale-105">
              <div className="flex justify-center">
                <StarSolid className="h-2.5 w-2.5 text-yellow-600" />
              </div>
              <div className="text-xs font-bold text-yellow-900">{formatRating(item.rating)}</div>
              <div className="text-xs text-yellow-700">تقييم</div>
            </div>
          </div>

          {/* معلومات إضافية - مضغوطة */}
          <div className="mb-1 grid grid-cols-2 gap-0.5">
            <div className="flex items-center gap-0.5 rounded bg-gradient-to-r from-gray-50 to-gray-100 p-0.5 transition-colors hover:from-gray-100 hover:to-gray-200">
              <PhoneIcon className="h-2 w-2 text-gray-600" />
              <div>
                <div className="text-xs font-medium text-gray-900">هاتف</div>
                <div className="line-clamp-1 text-xs text-gray-600" dir="ltr">
                  {item.phone}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5 rounded bg-gradient-to-r from-gray-50 to-gray-100 p-0.5 transition-colors hover:from-gray-100 hover:to-gray-200">
              <ClockIcon className="h-2 w-2 text-gray-600" />
              <div>
                <div className="text-xs font-medium text-gray-900">ساعات</div>
                <div className="text-xs text-gray-600">{item.openingHours || '9-18'}</div>
              </div>
            </div>
          </div>

          {/* الأزرار المحسنة - مضغوطة */}
          <div className="flex gap-0.5">
            <button
              onClick={handleContact}
              className="flex flex-1 items-center justify-center gap-0.5 rounded bg-blue-600 px-1.5 py-1 text-xs font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700"
            >
              <PhoneIcon className="h-2.5 w-2.5" />
              <span className="text-xs">اتصال</span>
            </button>
            <button
              onClick={handleChat}
              className="flex flex-1 items-center justify-center gap-0.5 rounded border border-blue-600 bg-white px-1.5 py-1 text-xs font-medium text-blue-600 transition-all duration-200 hover:scale-105 hover:bg-blue-50"
            >
              <ChatBubbleLeftRightIcon className="h-2.5 w-2.5" />
              <span className="text-xs">مراسلة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowroomCard;
