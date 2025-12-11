import { QuickAuctionBadge } from '@/components/UniversalAuctionBadge';
import ContactButton from '@/components/common/ui/buttons/ContactButton';
import { resolveImages } from '@/lib/services/UnifiedImageService';
import { translateCondition } from '@/utils/carTranslations';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import FireIcon from '@heroicons/react/24/outline/FireIcon';
import HandRaisedIcon from '@heroicons/react/24/outline/HandRaisedIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import SimpleImageRenderer from '../../../ui/SimpleImageRenderer';
// formatCityRegion تم استبداله بعرض location + area مباشرة
const AuctionStats = React.lazy(() => import('../status/AuctionStats'));

interface ModernAuctionCardProps {
  car: {
    id: number;
    title: string;
    price: string;
    currentBid: string;
    startingBid: string;
    finalBid?: string | null;
    bidCount: number;
    location: string;
    area?: string;
    time: string;
    images: number | string[];
    condition: string;
    brand: string;
    model: string;
    year: string;
    mileage: string;
    type: string;
    phone: string;
    isAuction: boolean;
    auctionType: 'upcoming' | 'live' | 'ended' | 'sold';
    auctionStartTime: string;
    auctionEndTime: string;
    reservePrice?: string;
    buyerName?: string | null;
    image: string;
    imageList?: string[];
    description: string;
    transmission?: string;
    featured?: boolean;
    promotionPackage?: string;
  };
  onContactClick: (car: ModernAuctionCardProps['car']) => void;
  onChatClick: (car: ModernAuctionCardProps['car']) => void;
  onBidClick: (car: ModernAuctionCardProps['car']) => void;
  onFavoriteClick: (auctionId: number) => void;
  onReminderClick?: (carId: number) => void;
  isFavorite: boolean;
  hasReminder?: boolean;
}

const ModernAuctionCard: React.FC<ModernAuctionCardProps> = ({
  car,
  onContactClick,
  onChatClick,
  onBidClick,
  onFavoriteClick,
  onReminderClick: _onReminderClick,
  isFavorite,
  hasReminder: _hasReminder,
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, _setCurrentImageIndex] = useState(0);

  // معالجة الصور باستخدام النظام الموحد
  const imageData = resolveImages(
    {
      imageList: car.imageList,
      images: car.images,
      image: car.image,
      car: (car as any).car,
    },
    'auction',
  );

  const getImageList = (): string[] => imageData.urls;

  // دوال التنقل بين الصور (غير مستخدمة حالياً)
  // const nextImage = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   const images = getImageList();
  //   setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  // };

  // const prevImage = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   const images = getImageList();
  //   setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  // };

  // معالج النقر على البطاقة
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    router.push(`/auction/${car.id}`);
  };

  // تحديد معلومات حالة المزاد
  const getAuctionStatusInfo = () => {
    switch (car.auctionType) {
      case 'live':
        return {
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          label: 'مزاد مباشر',
          icon: <FireIcon className="h-4 w-4" />,
          pulse: true,
        };
      case 'upcoming':
        return {
          color: 'from-amber-500 to-orange-500',
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200',
          label: 'مزاد قادم',
          icon: <CalendarIcon className="h-4 w-4" />,
          pulse: false,
        };
      case 'sold':
        return {
          color: 'from-green-500 to-green-600',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          label: 'تم البيع',
          icon: <TrophyIcon className="h-4 w-4" />,
          pulse: false,
        };
      case 'ended':
        return {
          color: 'from-gray-400 to-gray-500',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200',
          label: 'مزاد منتهي',
          icon: <TrophyIcon className="h-4 w-4" />,
          pulse: false,
        };
      default:
        return {
          color: 'from-gray-400 to-gray-500',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200',
          label: 'غير محدد',
          icon: null,
          pulse: false,
        };
    }
  };

  const statusInfo = getAuctionStatusInfo();

  // تنسيق الأرقام
  const formatNumber = (num: string | number) => {
    const numStr = typeof num === 'string' ? num : num.toString();
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // تحديد السعر المعروض
  const getDisplayPrice = () => {
    if (car.auctionType === 'ended' && car.finalBid) {
      return car.finalBid;
    }
    if (car.auctionType === 'upcoming') {
      return car.startingBid;
    }
    return car.currentBid;
  };

  // تحديد نص السعر
  const getPriceLabel = () => {
    if (car.auctionType === 'ended') {
      return 'السعر النهائي';
    }
    if (car.auctionType === 'upcoming') {
      return 'سعر البداية';
    }
    return 'المزايدة الحالية';
  };

  return (
    <div
      className={`group relative rounded-2xl border-2 bg-white shadow-lg ${statusInfo.borderColor} cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${isHovered ? 'ring-4 ring-blue-100' : ''}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* شريط الحالة العلوي */}
      <div
        className={`h-2 bg-gradient-to-r ${statusInfo.color} ${statusInfo.pulse ? 'animate-pulse' : ''}`}
      />

      {/* قسم الصورة */}
      <div className="group relative h-56 overflow-hidden">
        <SimpleImageRenderer
          images={imageData.urls}
          carImages={(car as any).car?.carImages || null}
          alt={car.title}
          className="h-full w-full transition-transform duration-500 group-hover:scale-110"
          showNavigation={true}
        />

        {/* عداد الصور */}
        {getImageList().length > 1 && (
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-sm text-white backdrop-blur-sm">
            <PhotoIcon className="h-4 w-4" />
            {currentImageIndex + 1}/{getImageList().length}
          </div>
        )}

        {/* شارة الحالة */}
        <div
          className={`absolute right-4 top-4 bg-gradient-to-r ${statusInfo.color} z-20 flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-white shadow-lg ${statusInfo.pulse ? 'animate-pulse' : ''}`}
        >
          {statusInfo.icon}
          <span>{statusInfo.label}</span>
          {statusInfo.pulse && <div className="h-2 w-2 animate-ping rounded-full bg-white" />}
        </div>

        {/* شارة إعلان مميز - تصميم ذهبي بارز */}
        {(car.featured || (car.promotionPackage && car.promotionPackage !== 'free')) && (
          <div className="absolute left-3 top-3 z-30">
            <div className="flex items-center gap-1.5 rounded-lg border-2 border-yellow-300 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 px-2.5 py-1.5 shadow-lg">
              <svg
                className="h-4 w-4 text-white drop-shadow"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <span className="text-sm font-bold text-white drop-shadow">إعلان مميز</span>
            </div>
          </div>
        )}

        {/* زر المفضلة */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteClick(car.id);
          }}
          className={`absolute ${car.featured ? 'left-4 top-14' : 'left-4 top-4'} z-20 rounded-full p-2 transition-all duration-200 ${
            isFavorite
              ? 'scale-110 bg-red-500 text-white shadow-lg'
              : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          {isFavorite ? <HeartSolid className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
        </button>

        {/* عدد المشاهدات */}
        <div className="absolute bottom-4 left-4 flex items-start gap-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
          <EyeIcon className="h-3 w-3" />
          <span>{Math.floor(Math.random() * 100) + 50}</span>
        </div>
      </div>

      {/* قسم المحتوى */}
      <div className="space-y-4 p-6">
        {/* العنوان والمعلومات الأساسية */}
        <div className="space-y-3">
          <h3 className="line-clamp-2 text-xl font-bold leading-tight text-gray-900 transition-colors group-hover:text-blue-600">
            {car.title && car.title.trim()
              ? car.title.trim()
              : car.brand && car.model && car.brand !== 'غير محدد' && car.model !== 'غير محدد'
                ? `${car.brand} ${car.model}`
                : 'سيارة للمزاد'}
          </h3>

          {/* التاريخ والمدينة */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
                data-slot="icon"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                ></path>
              </svg>
              <span>
                {new Date().toLocaleDateString('ar-LY', {
                  day: 'numeric',
                  month: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
                data-slot="icon"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                ></path>
              </svg>
              <span>{car.location}</span>
            </div>
          </div>

          {/* معلومات السيارة - 6 خصائص في سطر واحد */}
          <div className="text-sm text-gray-600">
            <div className="flex flex-wrap items-start gap-1 text-xs">
              {/* الماركة */}
              {car.brand && car.brand !== 'غير محدد' && (
                <span className="font-medium text-gray-800">{car.brand}</span>
              )}

              {/* الموديل */}
              {car.model && car.model !== 'غير محدد' && (
                <>
                  {car.brand && car.brand !== 'غير محدد' && (
                    <span className="text-gray-400">-</span>
                  )}
                  <span className="font-medium text-gray-800">{car.model}</span>
                </>
              )}

              {/* السنة */}
              {car.year && car.year !== 'غير محدد' && (
                <>
                  {((car.brand && car.brand !== 'غير محدد') ||
                    (car.model && car.model !== 'غير محدد')) && (
                    <span className="text-gray-400">-</span>
                  )}
                  <span className="text-gray-600">{car.year}</span>
                </>
              )}

              {/* المسافة المقطوعة */}
              {car.mileage && car.mileage !== 'غير محدد' && car.mileage !== '0 كم' && (
                <>
                  {((car.brand && car.brand !== 'غير محدد') ||
                    (car.model && car.model !== 'غير محدد') ||
                    (car.year && car.year !== 'غير محدد')) && (
                    <span className="text-gray-400">-</span>
                  )}
                  <span className="text-gray-600">{car.mileage}</span>
                </>
              )}

              {/* ناقل الحركة */}
              {car.transmission && car.transmission !== 'غير محدد' && (
                <>
                  {((car.brand && car.brand !== 'غير محدد') ||
                    (car.model && car.model !== 'غير محدد') ||
                    (car.year && car.year !== 'غير محدد') ||
                    (car.mileage && car.mileage !== 'غير محدد' && car.mileage !== '0 كم')) && (
                    <span className="text-gray-400">-</span>
                  )}
                  <span className="text-gray-600">{car.transmission}</span>
                </>
              )}

              {/* الحالة */}
              {car.condition && car.condition !== 'غير محدد' && (
                <>
                  {((car.brand && car.brand !== 'غير محدد') ||
                    (car.model && car.model !== 'غير محدد') ||
                    (car.year && car.year !== 'غير محدد') ||
                    (car.mileage && car.mileage !== 'غير محدد' && car.mileage !== '0 كم') ||
                    (car.transmission && car.transmission !== 'غير محدد')) && (
                    <span className="text-gray-400">-</span>
                  )}
                  <span className="text-gray-500">{translateCondition(car.condition)}</span>
                </>
              )}
            </div>
          </div>

          {/* الموقع */}
          <div className="flex items-start gap-2 text-gray-500">
            <MapPinIcon className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">
              {(() => {
                // عرض آمن ومستقر للموقع والمنطقة
                const cityName = car.location || 'طرابلس';
                const areaName =
                  car.area &&
                  typeof car.area === 'string' &&
                  car.area.trim() &&
                  car.area !== 'غير محدد'
                    ? car.area.trim()
                    : '';

                return areaName ? `${cityName}، ${areaName}` : cityName;
              })()}
            </span>
          </div>
        </div>

        {/* قسم السعر والمزايدة */}
        <div className={`${statusInfo.bgColor} rounded-xl border p-4 ${statusInfo.borderColor}`}>
          <div className="space-y-2 text-center">
            <div className="text-sm text-gray-600">{getPriceLabel()}</div>
            <div className={`text-3xl font-bold ${statusInfo.textColor} price-value`}>
              {formatNumber(getDisplayPrice())}
              <span className="mr-2 text-lg">د.ل</span>
            </div>

            {/* معلومات المزايدة */}
            <div className="flex items-start justify-between text-sm">
              <span className="text-gray-600">{car.bidCount} مزايدة</span>
            </div>
          </div>
        </div>

        {/* شارة المزاد الذكية */}
        <div className="flex justify-center">
          <QuickAuctionBadge.Premium
            auctionType={car.auctionType}
            startTime={car.auctionStartTime}
            endTime={car.auctionEndTime}
            buyerName={car.buyerName}
          />
        </div>

        {/* إحصائيات المزاد */}
        <React.Suspense
          fallback={
            <div className="flex items-center justify-center p-3">
              <div
                className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                style={{ width: 24, height: 24 }}
                role="status"
                aria-label="جاري التحميل"
              />
            </div>
          }
        >
          <AuctionStats
            bidCount={car.bidCount}
            auctionType={car.auctionType}
            size="small"
            layout="horizontal"
          />
        </React.Suspense>

        {/* معلومات المزاد المنتهي */}
        {car.auctionType === 'ended' && car.buyerName && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
            <div className="text-sm font-medium text-green-600">تم البيع لـ {car.buyerName}</div>
          </div>
        )}

        {/* أزرار التفاعل - في سطر واحد */}
        <div className="flex w-full gap-2 border-t border-gray-100 pt-4">
          <ContactButton
            phone={car.phone}
            onClick={(e) => {
              e.stopPropagation();
              onContactClick(car);
            }}
            className="flex-1 justify-center rounded-xl px-3 py-2"
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              onChatClick(car);
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 px-3 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:scale-105 hover:bg-gray-200"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            <span>رسالة</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onBidClick(car);
            }}
            disabled={car.auctionType === 'ended'}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
              car.auctionType === 'ended'
                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                : car.auctionType === 'upcoming'
                  ? 'bg-amber-100 text-amber-700 hover:scale-105 hover:bg-amber-200'
                  : 'bg-blue-100 text-blue-700 hover:scale-105 hover:bg-blue-200'
            }`}
          >
            <HandRaisedIcon className="h-4 w-4" />
            <span>
              {car.auctionType === 'ended'
                ? 'انتهى'
                : car.auctionType === 'upcoming'
                  ? 'تذكير'
                  : 'مزايدة'}
            </span>
          </button>
        </div>
      </div>

      {/* تأثير الإضاءة عند التمرير */}
      {isHovered && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
      )}
    </div>
  );
};

export default ModernAuctionCard;
