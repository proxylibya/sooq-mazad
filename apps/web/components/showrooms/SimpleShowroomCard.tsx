import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { quickDecodeName } from '../../utils/universalNameDecoder';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import CheckBadgeIcon from '@heroicons/react/24/outline/CheckBadgeIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CalendarDaysIcon from '@heroicons/react/24/outline/CalendarDaysIcon';
import ScaleIcon from '@heroicons/react/24/outline/ScaleIcon';
import DevicePhoneMobileIcon from '@heroicons/react/24/outline/DevicePhoneMobileIcon';
import CameraIcon from '@heroicons/react/24/outline/CameraIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

import { UnifiedNavigationArrows } from '../ui/NavigationArrows';
import useAuthProtection from '../../hooks/useAuthProtection';
import LoginModal from '../auth/LoginModal';
import useAuth from '../../hooks/useAuth';
import { useFavorites } from '../../hooks/useFavorites';
import SimpleImage from '../SimpleImage';
import ShowroomImages from './ShowroomImages';

interface Showroom {
  id: string;
  name: string;
  description: string;
  location: string;
  city: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  totalCars: number;
  activeCars: number;
  images: string[];
  verified: boolean;
  featured: boolean;
  vehicleTypes: string[];
  specialties: string[];
  establishedYear: number;
  openingHours: string;
  type: string;
  user: {
    id: string;
    name: string;
    phone: string;
    verified: boolean;
    profileImage?: string;
    accountType: string;
    rating?: number;
    totalReviews?: number;
  };
}

interface SimpleShowroomCardProps {
  showroom: Showroom;
  viewMode?: 'grid' | 'list';
  onClick?: () => void;
}

const SimpleShowroomCard: React.FC<SimpleShowroomCardProps> = ({
  showroom,
  viewMode = 'list',
  onClick,
}) => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  // تم إزالة متغيرات إدارة الصور لأنها أصبحت في ShowroomImageGallery

  // استخدام نظام الحماية
  const {
    isAuthenticated,
    showAuthModal,
    setShowAuthModal,
    requireLogin,
    handleAuthSuccess,
    handleAuthClose,
  } = useAuthProtection({
    showModal: true,
  });

  // فحص ما إذا كان المستخدم الحالي هو مالك المعرض
  const isCurrentUserOwner =
    currentUser &&
    showroom.user &&
    String(currentUser.id).trim() === String(showroom.user.id).trim();

  // تسجيل للتشخيص
  // معالج النقر على البطاقة
  const handleCardClick = (e: React.MouseEvent) => {
    // تجنب التنقل إذا تم النقر على الأزرار أو أسهم التنقل
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    if (onClick) {
      onClick();
    } else {
      router.push(`/showrooms/${showroom.id}`);
    }
  };

  // معالج المفضلة
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    await toggleFavorite(undefined, undefined, showroom.id);
  };

  // معالج النقر المزدوج للانتقال مباشرة إلى صفحة التفاصيل
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/showrooms/${showroom.id}`);
  };

  // معالج النقر على أزرار التواصل
  const handleContactClick = (e: React.MouseEvent, type: 'call' | 'chat') => {
    e.stopPropagation();

    const actionText = type === 'call' ? 'للاتصال بالمعرض' : 'لإرسال رسالة';

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (type === 'call') {
      // فتح صفحة تفاصيل المعرض مباشرة بدلاً من صفحة contact
      router.push(`/showroom/${showroom.id}`);
    } else {
      router.push(
        `/messages?chat=${showroom.user.id}&name=${encodeURIComponent(quickDecodeName(showroom.user.name))}&phone=${encodeURIComponent(showroom.phone)}&type=showroom`,
      );
    }
  };

  // تم نقل دوال التنقل بين الصور إلى ShowroomImageGallery

  const formatSpecialties = (specialties: string[]) => {
    if (!specialties || specialties.length === 0) return 'معرض عام';
    if (specialties.length <= 2) return specialties.join(' - ');
    return `${specialties.slice(0, 2).join(' - ')} +${specialties.length - 2}`;
  };

  const formatOpeningHours = (hours: string) => {
    if (!hours) return 'غير محدد';
    return hours;
  };

  // ترجمة أنواع المركبات من الإنجليزية إلى العربية
  const translateVehicleType = (type: string) => {
    const translations: { [key: string]: string } = {
      cars: 'سيارات',
      trucks: 'شاحنات',
      motorcycles: 'دراجات نارية',
      bicycles: 'دراجات هوائية',
      boats: 'قوارب',
      other: 'أخرى',
      // إضافة ترجمات أخرى حسب الحاجة
      سيارات: 'سيارات',
      شاحنات: 'شاحنات',
      'دراجات نارية': 'دراجات نارية',
      'دراجات هوائية': 'دراجات هوائية',
      قوارب: 'قوارب',
      أخرى: 'أخرى',
    };
    return translations[type] || type;
  };

  // تم نقل معالجة الصور إلى ShowroomImages الجديد

  // التصميم الجديد المطابق للتصميم المرجعي (وضع الشبكة)
  if (viewMode === 'grid') {
    return (
      <>
        <div
          className="group relative flex max-h-[420px] w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg sm:max-h-[450px]"
          onClick={handleCardClick}
          onDoubleClick={handleDoubleClick}
          title="انقر مرة واحدة لعرض المعلومات السريعة، انقر مرتين للانتقال إلى صفحة التفاصيل"
        >
          {/* شارة التحقق للمعارض المتحققة */}
          {showroom.verified && (
            <div className="absolute right-3 top-3 z-30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
                data-slot="icon"
                className="h-6 w-6 text-green-500 drop-shadow-lg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                ></path>
              </svg>
            </div>
          )}

          {/* قسم الصورة مع معرض الصور - ملتصق بحافة البطاقة */}
          <div className="group relative h-48 w-full overflow-hidden rounded-t-xl sm:h-52">
            <ShowroomImages
              showroomId={showroom.id}
              showroomName={showroom.name}
              className="h-full w-full rounded-t-xl"
              showNavigation={true}
              showIndicators={true}
            />
            {showroom.featured && (
              <span className="pointer-events-none absolute bottom-3 left-3 z-30 select-none rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-md sm:px-3 sm:py-1 sm:text-xs">
                مميز
              </span>
            )}
          </div>

          {/* تفاصيل المعرض */}
          <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
            <div>
              {/* العنوان الرئيسي */}
              <h3 className="mb-2 line-clamp-2 text-base font-bold text-gray-900 transition-colors group-hover:text-blue-600 sm:mb-3 sm:text-lg">
                {showroom.name}
              </h3>

              {/* عدد السيارات والموقع */}
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-600 sm:mb-3 sm:gap-4">
                <div className="flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                    className="h-4 w-4 text-blue-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
                    ></path>
                  </svg>
                  <span className="font-medium">
                    {showroom.totalCars ? `${showroom.totalCars} سيارة` : '0 سيارة'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                    className="h-4 w-4 text-gray-500"
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
                  <span className="truncate">{showroom.location}</span>
                </div>
              </div>

              {/* التقييم */}
              <div className="rating-container mb-3 flex items-center gap-2 sm:mb-4">
                <div className="rating-stars flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      className={`h-4 w-4 ${
                        star <= Math.round(showroom.rating || 0)
                          ? 'fill-current text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                      ></path>
                    </svg>
                  ))}
                </div>
                <span className="rating-text text-sm font-semibold text-gray-700">
                  {showroom.rating ? showroom.rating.toFixed(1) : '0.0'}
                </span>
                <span className="text-xs text-gray-500">({showroom.reviewsCount || 0} تقييم)</span>
              </div>

              {/* أنواع المركبات */}
              {((showroom.vehicleTypes && showroom.vehicleTypes.length > 0) ||
                (showroom.specialties && showroom.specialties.length > 0)) && (
                <div className="mb-3 sm:mb-4">
                  <div className="flex flex-wrap gap-1.5">
                    {/* عرض vehicleTypes أولاً، ثم specialties كبديل */}
                    {(showroom.vehicleTypes && showroom.vehicleTypes.length > 0
                      ? showroom.vehicleTypes
                      : showroom.specialties || []
                    )
                      .slice(0, 2)
                      .map((type, index) => (
                        <span
                          key={index}
                          className="rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
                        >
                          {showroom.vehicleTypes && showroom.vehicleTypes.length > 0
                            ? translateVehicleType(type)
                            : type}
                        </span>
                      ))}
                    {(showroom.vehicleTypes && showroom.vehicleTypes.length > 0
                      ? showroom.vehicleTypes
                      : showroom.specialties || []
                    ).length > 2 && (
                      <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        +
                        {(showroom.vehicleTypes && showroom.vehicleTypes.length > 0
                          ? showroom.vehicleTypes
                          : showroom.specialties || []
                        ).length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* حاوية الأزرار المعاد تصميمها بالكامل - وضع الشبكة */}
            <div className="border-t border-gray-100 pt-2">
              <div
                className="flex w-full items-stretch gap-2"
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  height: '36px',
                }}
              >
                {/* زر الاتصال */}
                <button
                  onClick={(e) => handleContactClick(e, 'call')}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 px-2 text-xs font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-md"
                  style={{
                    height: '36px',
                    minHeight: '36px',
                    maxHeight: '36px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg
                    className="h-3 w-3 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L6.16 10.928c-.652.35-.852 1.17-.43 1.768C6.98 14.528 9.472 17.02 11.304 18.27c.598.422 1.418.222 1.768-.43l1.541-4.064a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z"
                    />
                  </svg>
                  <span className="text-xs">اتصال</span>
                </button>

                {/* زر المراسلة */}
                <button
                  onClick={(e) => handleContactClick(e, 'chat')}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-blue-600 bg-white px-2 text-xs font-semibold text-blue-600 transition-all hover:bg-blue-50 hover:shadow-md"
                  style={{
                    height: '36px',
                    minHeight: '36px',
                    maxHeight: '36px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg
                    className="h-3 w-3 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="text-xs">مراسلة</span>
                </button>

                {/* زر المفضلة */}
                <button
                  onClick={handleFavoriteClick}
                  className={`flex items-center justify-center rounded-lg border transition-all hover:shadow-md ${
                    isFavorite(undefined, undefined, showroom.id)
                      ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{
                    height: '36px',
                    width: '36px',
                    minHeight: '36px',
                    maxHeight: '36px',
                    minWidth: '36px',
                    maxWidth: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label={
                    isFavorite(undefined, undefined, showroom.id)
                      ? 'إزالة من المفضلة'
                      : 'إضافة للمفضلة'
                  }
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* نافذة تسجيل الدخول */}
        <LoginModal isOpen={showAuthModal} onClose={handleAuthClose} />
      </>
    );
  }

  // تصميم وضع القائمة (مطابق للتصميم المرجعي)
  return (
    <>
      <div
        className="group relative flex h-[220px] cursor-pointer flex-row-reverse overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
        onClick={handleCardClick}
        onDoubleClick={handleDoubleClick}
        title="انقر مرة واحدة لعرض المعلومات السريعة، انقر مرتين للانتقال إلى صفحة التفاصيل"
      >
        {/* شارة التحقق للمعارض المتحققة */}
        {showroom.verified && (
          <div className="absolute right-4 top-4 z-30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
              className="h-6 w-6 text-green-500 drop-shadow-lg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
              ></path>
            </svg>
          </div>
        )}

        {/* تفاصيل المعرض */}
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            {/* العنوان الرئيسي */}
            <h3 className="mb-3 line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">
              {showroom.name}
            </h3>

            {/* عدد السيارات والموقع */}
            <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
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
                    d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
                  ></path>
                </svg>
                <span>{showroom.totalCars ? `${showroom.totalCars} سيارة` : '0 سيارة'}</span>
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
                <span>{showroom.location}</span>
              </div>
            </div>

            {/* التقييم */}
            <div className="rating-container mb-4 flex items-center gap-2">
              <div className="rating-stars flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                    className={`h-4 w-4 ${
                      star <= Math.round(showroom.rating || 0)
                        ? 'fill-current text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                    ></path>
                  </svg>
                ))}
              </div>
              <span className="rating-text text-sm font-medium text-gray-700">
                {showroom.rating ? showroom.rating.toFixed(1) : '0.0'}
              </span>
            </div>

            {/* أنواع المركبات */}
            {((showroom.vehicleTypes && showroom.vehicleTypes.length > 0) ||
              (showroom.specialties && showroom.specialties.length > 0)) && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {/* عرض vehicleTypes أولاً، ثم specialties كبديل */}
                  {(showroom.vehicleTypes && showroom.vehicleTypes.length > 0
                    ? showroom.vehicleTypes
                    : showroom.specialties || []
                  )
                    .slice(0, 2)
                    .map((type, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                      >
                        {showroom.vehicleTypes && showroom.vehicleTypes.length > 0
                          ? translateVehicleType(type)
                          : type}
                      </span>
                    ))}
                  {(showroom.vehicleTypes && showroom.vehicleTypes.length > 0
                    ? showroom.vehicleTypes
                    : showroom.specialties || []
                  ).length > 2 && (
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      +
                      {(showroom.vehicleTypes && showroom.vehicleTypes.length > 0
                        ? showroom.vehicleTypes
                        : showroom.specialties || []
                      ).length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* حاوية الأزرار المعاد تصميمها بالكامل */}
          <div className="mt-2 w-full">
            <div
              className="flex w-full items-stretch gap-2"
              style={{
                display: 'flex',
                alignItems: 'stretch',
                height: '32px',
              }}
            >
              {/* زر الاتصال */}
              <button
                onClick={(e) => handleContactClick(e, 'call')}
                className="flex flex-1 items-center justify-center gap-1 rounded-md bg-blue-600 px-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                style={{
                  height: '32px',
                  minHeight: '32px',
                  maxHeight: '32px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg
                  className="h-3 w-3 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L6.16 10.928c-.652.35-.852 1.17-.43 1.768C6.98 14.528 9.472 17.02 11.304 18.27c.598.422 1.418.222 1.768-.43l1.541-4.064a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z"
                  />
                </svg>
                <span className="truncate text-xs">
                  {showroom.phone ? `${showroom.phone.slice(0, 3)}xxxxx` : '093xxxxx'}
                </span>
              </button>

              {/* زر المراسلة */}
              <button
                onClick={(e) => handleContactClick(e, 'chat')}
                className="flex flex-1 items-center justify-center gap-1 rounded-md border border-blue-600 bg-white px-2 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                style={{
                  height: '32px',
                  minHeight: '32px',
                  maxHeight: '32px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg
                  className="h-3 w-3 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="text-xs">مراسلة</span>
              </button>

              {/* زر المفضلة */}
              <button
                onClick={handleFavoriteClick}
                className={`flex items-center justify-center rounded-md border transition-colors ${
                  isFavorite(undefined, undefined, showroom.id)
                    ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                }`}
                style={{
                  height: '32px',
                  width: '32px',
                  minHeight: '32px',
                  maxHeight: '32px',
                  minWidth: '32px',
                  maxWidth: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label={
                  isFavorite(undefined, undefined, showroom.id)
                    ? 'إزالة من المفضلة'
                    : 'إضافة للمفضلة'
                }
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* قسم الصورة مع معرض الصور - ملتصق بحافة البطاقة */}
        <div className="group relative h-[220px] w-72 flex-shrink-0 overflow-hidden rounded-r-xl">
          <ShowroomImages
            showroomId={showroom.id}
            showroomName={showroom.name}
            className="h-[220px] w-full rounded-r-xl"
            showNavigation={true}
            showIndicators={true}
          />

          {/* شارات إضافية */}
          <div className="absolute bottom-3 left-3 z-30 flex flex-col gap-1">
            {showroom.featured && (
              <span className="pointer-events-none select-none rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-lg sm:px-3 sm:py-1 sm:text-xs">
                مميز
              </span>
            )}
          </div>
        </div>
      </div>

      {/* نافذة تسجيل الدخول */}
      <LoginModal isOpen={showAuthModal} onClose={handleAuthClose} />
    </>
  );
};

export default SimpleShowroomCard;
