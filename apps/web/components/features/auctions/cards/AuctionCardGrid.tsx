/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import HandRaisedIcon from '@heroicons/react/24/outline/HandRaisedIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import { HeartIcon as HeartSolid, SignalIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import React from 'react';
import DateLocationInfo from '../../../DateLocationInfo';
// formatCityRegion تم استبداله بعرض location + area مباشرة

import { maskLibyanPhoneFirst7Xxx } from '../../../../utils/phoneUtils';
import { SmartFeaturedBadge } from '../../../ui/FeaturedBadge';
import SimpleImageRenderer from '../../../ui/SimpleImageRenderer';
import SimpleCircularAuctionTimer from '../timer/SimpleCircularAuctionTimer';

interface AuctionCardGridProps {
  car: {
    id: string | number;
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
    fuelType?: string; // نوع الوقود
    transmission?: string; // ناقل الحركة
    bodyType?: string; // نوع الهيكل
    color?: string; // اللون
    doors?: number; // عدد الأبواب
    type: string;
    phone: string;
    isAuction: boolean;
    auctionType: 'upcoming' | 'live' | 'ended' | 'sold';
    auctionStartTime: string;
    auctionEndTime: string;
    reservePrice?: string;
    buyerName?: string | null;
    isSold?: boolean;
    currentPrice?: string;
    startingPrice?: string;
    image: string;
    imageList?: string[];
    description: string;
    featured?: boolean;
    promotionPackage?: string;
    car?: {
      carImages?: Array<{ fileUrl: string; isPrimary?: boolean }>;
    };
  };
  onContactClick: (car: AuctionCardGridProps['car']) => void;
  onChatClick: (car: AuctionCardGridProps['car']) => void;
  onBidClick: (car: AuctionCardGridProps['car']) => void;
  onFavoriteClick: (auctionId: string | number) => void;
  onReminderClick?: (carId: string | number) => void;
  onCardClick?: (car: AuctionCardGridProps['car']) => void; // للتوجيه المخصص عند النقر على البطاقة
  isFavorite: boolean;
  hasReminder?: boolean;
  externalTick?: number;
  isYardAuction?: boolean; // إخفاء زر المزايدة لمزادات الساحات
}

const AuctionCardGrid: React.FC<AuctionCardGridProps> = ({
  car,
  onContactClick,
  onChatClick,
  onBidClick,
  onFavoriteClick,
  onReminderClick,
  onCardClick,
  isFavorite,
  hasReminder,
  externalTick,
  isYardAuction = false,
}) => {
  const router = useRouter();

  const { ref: visRef, isIntersecting } = useIntersectionObserver({
    triggerOnce: false,
    threshold: 0.1,
    rootMargin: '200px',
  });

  // شارة ديناميكية للمزاد القادم: تتحول إلى "بعد قليل" عندما يتبقى ≤ 60 دقيقة
  const isSoonToLive = React.useMemo(() => {
    if (!car?.auctionStartTime) return false;
    const startMs = Date.parse(car.auctionStartTime);
    if (!Number.isFinite(startMs)) return false;
    const diff = startMs - Date.now();
    return diff > 0 && diff <= 60 * 60 * 1000; // ≤ ساعة
  }, [car?.auctionStartTime, externalTick]);

  // معالج النقر على البطاقة - يستخدم onCardClick المخصص إذا كان متاحاً
  const handleCardClick = (e: React.MouseEvent) => {
    // تجنب التنقل إذا تم النقر على الأزرار أو أسهم التنقل
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    // استخدام التوجيه المخصص إذا كان متاحاً (مثل مزادات الساحات)
    if (onCardClick) {
      onCardClick(car);
    } else {
      router.push(`/auction/${car.id}`);
    }
  };

  // تم إزالة getAuctionStatusInfo - لم تعد مطلوبة لأن الشارة ستظهر من العداد الدائري

  return (
    <div
      className="auction-card-grid mx-auto max-h-[400px] min-h-[240px] w-full max-w-sm cursor-pointer overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 hover:shadow-md lg:max-h-[350px] xl:max-h-[300px]"
      ref={visRef}
      onClick={handleCardClick}
      style={{ minHeight: '520px' }} // زيادة الارتفاع لتتسع للعداد الدائري
    >
      {/* قسم الصورة مع التنقل - محسن */}
      <div className="group relative h-56 overflow-hidden bg-gray-100 sm:h-64 md:h-72 lg:h-80 xl:h-80">
        {/* شارة إعلان مميز - استخدام المكون الموحد */}
        {(car.featured || (car.promotionPackage && car.promotionPackage !== 'free')) && (
          <div className="absolute left-2 top-2 z-50" style={{ zIndex: 9999 }}>
            <SmartFeaturedBadge
              packageType={car.promotionPackage}
              featured={car.featured}
              size="sm"
            />
          </div>
        )}

        <SimpleImageRenderer
          images={
            Array.isArray(car.images)
              ? car.images
              : typeof car.images === 'string'
                ? [car.images]
                : []
          }
          carImages={car.car?.carImages || []}
          alt={car.title}
          className="h-full w-full"
          showNavigation={true}
        />

        {/* تأثير متقدم للمزاد المباشر - وهج أحمر */}
        {car.auctionType === 'live' && (
          <div className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-t from-red-600/30 via-transparent to-transparent"></div>
        )}

        {/* تأثير متقدم للمزاد - overlay مع نص */}
        {car.isSold ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-green-600/30">
            <div className="rounded-lg bg-white/95 px-4 py-2 shadow-xl">
              <span className="text-base font-bold text-green-700">تم البيع</span>
            </div>
          </div>
        ) : (
          car.auctionType === 'ended' && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="rounded-lg bg-white/95 px-4 py-2 shadow-xl">
                <span className="text-base font-bold text-gray-900">انتهى المزاد</span>
              </div>
            </div>
          )
        )}

        {/* شارة حالة المزاد الاحترافية */}
        <div className="absolute right-2 top-2 z-20">
          {car.auctionType === 'live' && (
            <div className="flex animate-pulse items-center gap-1.5 rounded-md bg-gradient-to-r from-red-600 to-red-500 px-2 py-1 shadow-md backdrop-blur-sm">
              <SignalIcon className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-bold text-white">مزاد مباشر</span>
            </div>
          )}

          {car.auctionType === 'upcoming' && (
            <div
              className={`flex items-center gap-1.5 rounded-md bg-gradient-to-r from-amber-600 to-amber-500 px-2 py-1 shadow-md backdrop-blur-sm ${
                isSoonToLive ? 'animate-pulse' : ''
              }`}
              style={isSoonToLive ? { boxShadow: '0 0 10px rgba(245, 158, 11, 0.45)' } : undefined}
            >
              {isSoonToLive && (
                <span className="relative mr-0.5 inline-flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-200"></span>
                </span>
              )}
              <ClockIcon className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-bold text-white">
                {isSoonToLive ? 'بعد قليل' : 'قريباً'}
              </span>
            </div>
          )}

          {car.isSold ? (
            <div className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-green-600 to-green-500 px-2 py-1 shadow-md backdrop-blur-sm">
              <CheckCircleIcon className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-bold text-white">تم البيع</span>
            </div>
          ) : (
            car.auctionType === 'ended' && (
              <div className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-gray-600 to-gray-500 px-2 py-1 shadow-md backdrop-blur-sm">
                <CheckCircleIcon className="h-3.5 w-3.5 text-white" />
                <span className="text-xs font-bold text-white">منتهي</span>
              </div>
            )
          )}
        </div>

        {/* زر المفضلة - في أسفل يسار الصورة */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteClick(car.id);
          }}
          className={`absolute bottom-2 left-2 z-30 rounded-full p-1.5 shadow-md ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-white'
          }`}
        >
          {isFavorite ? <HeartSolid className="h-4 w-4" /> : <HeartIcon className="h-4 w-4" />}
        </button>
      </div>

      {/* قسم المحتوى - مبسط */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* العنوان - مبسط */}
        <h3 className="mb-2 line-clamp-2 text-sm font-bold text-gray-900 transition-colors hover:text-blue-600 sm:text-base">
          {car.title}
        </h3>

        {/* التاريخ والمدينة */}
        <DateLocationInfo
          date={car.auctionStartTime ? new Date(car.auctionStartTime) : new Date()}
          location={car.location}
          className="mb-2"
          size="sm"
        />

        {/* معلومات السيارة المحسنة - 6 خصائص في سطر واحد */}
        <div className="mb-2 text-sm text-gray-600">
          <div className="flex flex-wrap items-start gap-1 text-xs">
            {/* الماركة */}
            {car.brand && car.brand !== 'غير محدد' && (
              <span className="font-medium text-gray-800">{car.brand}</span>
            )}

            {/* الموديل */}
            {car.model && car.model !== 'غير محدد' && (
              <>
                {car.brand && car.brand !== 'غير محدد' && <span className="text-gray-400">•</span>}
                <span className="font-medium text-gray-800">{car.model}</span>
              </>
            )}

            {/* السنة */}
            {car.year && car.year !== 'غير محدد' && (
              <>
                {((car.brand && car.brand !== 'غير محدد') ||
                  (car.model && car.model !== 'غير محدد')) && (
                  <span className="text-gray-400">•</span>
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
                  <span className="text-gray-400">•</span>
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
                  <span className="text-gray-400">•</span>
                )}
                <span className="text-gray-600">{car.transmission}</span>
              </>
            )}

            {/* نوع الوقود */}
            {car.fuelType && car.fuelType !== 'غير محدد' && (
              <>
                {((car.brand && car.brand !== 'غير محدد') ||
                  (car.model && car.model !== 'غير محدد') ||
                  (car.year && car.year !== 'غير محدد') ||
                  (car.mileage && car.mileage !== 'غير محدد' && car.mileage !== '0 كم') ||
                  (car.transmission && car.transmission !== 'غير محدد')) && (
                  <span className="text-gray-400">•</span>
                )}
                <span className="text-gray-500">{car.fuelType}</span>
              </>
            )}
          </div>
        </div>

        {/* الموقع */}
        <div className="mt-2 flex items-start gap-1 text-gray-500">
          <MapPinIcon className="h-3 w-3" />
          <span className="truncate text-xs">
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

        {/* العداد الدائري للمزاد - العداد الكامل بالحجم المتوسط */}
        <div className="auction-timer-container mt-3 flex items-center justify-center">
          <div
            className="sm:scale-80 md:scale-85 scale-75 lg:scale-90 auction-lg:scale-95 xl:scale-100"
            style={{ contain: 'content', willChange: 'transform, opacity' }}
          >
            {/* العداد الكامل مع تصغير متدرج للشاشات المختلفة */}
            {/* scale-75: للشاشات الصغيرة جداً (أقل من 640px) */}
            {/* sm:scale-80: للشاشات الصغيرة (640px+) */}
            {/* md:scale-85: للشاشات المتوسطة الصغيرة (768px+) */}
            {/* lg:scale-90: للشاشات المتوسطة (1024px+) */}
            {/* auction-lg:scale-95: للشاشات الكبيرة (1142px+) */}
            {/* xl:scale-100: للشاشات الكبيرة جداً (1280px+) */}
            <SimpleCircularAuctionTimer
              endTime={car.auctionEndTime}
              startTime={car.auctionStartTime}
              currentBid={
                car.currentBid ||
                car.currentPrice ||
                car.startingBid ||
                car.startingPrice ||
                car.price ||
                '0'
              }
              bidCount={car.bidCount}
              startingBid={car.startingBid}
              reservePrice={car.reservePrice}
              auctionStatus={car.auctionType}
              externalTick={isIntersecting ? externalTick : -1}
            />
          </div>
        </div>
        {/* فاصل */}
        <div className="auction-timer-spacer mb-3"></div>

        {/* أزرار التفاعل - في سطر واحد */}
        <div className="auction-action-buttons mt-auto flex w-full gap-1 sm:gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onContactClick(car);
            }}
            className={`flex flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1.5 font-medium transition-colors sm:px-2 sm:py-2 ${
              isYardAuction
                ? 'bg-blue-600 text-sm text-white hover:bg-blue-700'
                : 'bg-gray-100 text-xs text-gray-700 hover:bg-gray-200'
            }`}
          >
            <PhoneIcon
              className={`flex-shrink-0 ${isYardAuction ? 'h-4 w-4' : 'h-3 w-3 sm:h-4 sm:w-4'}`}
            />
            <span
              className={`auction-button-text ${isYardAuction ? 'text-sm' : 'text-xs'}`}
              dir="ltr"
            >
              {maskLibyanPhoneFirst7Xxx(car.phone)}
            </span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onChatClick(car);
            }}
            className="flex flex-1 items-center justify-center gap-1 rounded-md bg-gray-100 px-1.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 sm:px-2 sm:py-2"
          >
            <ChatBubbleLeftRightIcon className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
            <span className="auction-button-text text-xs">رسالة</span>
          </button>

          {/* زر المزايدة - يختفي في مزادات الساحات */}
          {!isYardAuction && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBidClick(car);
              }}
              className={`flex flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-xs font-medium transition-colors sm:px-2 sm:py-2 ${
                car.auctionType === 'ended' || car.isSold
                  ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  : car.auctionType === 'upcoming'
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <HandRaisedIcon className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
              <span className="auction-button-text text-xs">
                {car.auctionType === 'live' ? 'مزايدة' : 'عرض التفاصيل'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionCardGrid;
