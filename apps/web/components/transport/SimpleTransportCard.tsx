import CameraIcon from '@heroicons/react/24/outline/CameraIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import CheckBadgeIcon from '@heroicons/react/24/outline/CheckBadgeIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import PauseIcon from '@heroicons/react/24/outline/PauseIcon';
import PencilSquareIcon from '@heroicons/react/24/outline/PencilSquareIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import PlayIcon from '@heroicons/react/24/outline/PlayIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { quickDecodeName } from '../../utils/universalNameDecoder';

import useAuth from '../../hooks/useAuth';
import useAuthProtection from '../../hooks/useAuthProtection';
import { useFavorites } from '../../hooks/useFavorites';
import { maskLibyanPhoneFirst7Xxx } from '../../utils/phoneUtils';
import { translateVehicleType } from '../../utils/transportTranslations';
import LoginModal from '../auth/LoginModal';
import { UnifiedNavigationArrows } from '../ui/NavigationArrows';
import SimpleSpinner from '../ui/SimpleSpinner';
import TransportCardImage from '../ui/TransportCardImage';
import TransportRouteDisplay from './TransportRouteDisplay';

interface TransportService {
  id: string;
  title: string;
  description: string;
  truckType: string;
  capacity: number;
  serviceArea: string;
  address?: string;
  pricePerKm: number | null;
  availableDays: string;
  contactPhone: string;
  images: string[] | string;
  features: string[];
  commission: number;
  status?: string; // ACTIVE, PAUSED, INACTIVE
  createdAt: string;
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

interface SimpleTransportCardProps {
  service: TransportService;
  viewMode?: 'grid' | 'list';
  showOwnerActions?: boolean;
  onEdit?: (serviceId: string) => void;
  onDelete?: (serviceId: string) => void;
  onPause?: (serviceId: string) => void;
  onActivate?: (serviceId: string) => void;
}

const SimpleTransportCard: React.FC<SimpleTransportCardProps> = ({
  service,
  viewMode = 'list',
  showOwnerActions = false,
  onEdit,
  onDelete,
  onPause,
  onActivate,
}) => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // استخدام نظام الحماية
  const { isAuthenticated, showAuthModal, setShowAuthModal, requireLogin, handleAuthClose } =
    useAuthProtection({
      showModal: true,
    });

  // فحص ما إذا كان المستخدم الحالي هو مالك الخدمة - مع معالجة آمنة شاملة
  const isCurrentUserOwner = useMemo(() => {
    // إضافة logging للتشخيص
    // فحوصات أمان شاملة
    if (!currentUser?.id || !service?.user?.id) {
      return false; // لا يمكن تحديد الملكية - عرض الأزرار بأمان
    }

    // مقارنة آمنة مع معالجة أنواع البيانات المختلفة
    const currentId = String(currentUser.id).trim();
    const serviceUserId = String(service.user.id).trim();

    const isOwner = currentId === serviceUserId;

    return isOwner;
  }, [currentUser, service.user]);

  // استخدام hook المفضلة
  const { isFavorite, toggleFavorite, isLoading: isUpdatingFavorite } = useFavorites();
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // إخفاء الإشعار بعد 3 ثوانٍ
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // دالة إظهار الإشعار
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  // معالج النقر على زر المفضلة
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // التحقق من تسجيل الدخول
    if (!requireLogin()) {
      return; // سيتم فتح نافذة تسجيل الدخول تلقائياً
    }

    if (isUpdatingFavorite) return;

    try {
      const wasInFavorites = isFavorite(undefined, undefined, undefined, service.id);
      const success = await toggleFavorite(undefined, undefined, undefined, service.id);

      if (success) {
        const message = !wasInFavorites
          ? 'تم إضافة الخدمة إلى المفضلة'
          : 'تم إزالة الخدمة من المفضلة';
        showNotification(message, 'success');
      } else {
        showNotification('حدث خطأ في تحديث المفضلة', 'error');
      }
    } catch (error) {
      console.error('خطأ في تحديث المفضلة:', error);
      showNotification('حدث خطأ في تحديث المفضلة', 'error');
    }
  };

  // معالج النقر على البطاقة
  const handleCardClick = (e: React.MouseEvent) => {
    // تجنب التنقل إذا تم النقر على الأزرار أو أسهم التنقل
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    router.push(`/transport/service/${service.id}`);
  };

  // معالج النقر على أزرار التواصل
  const handleContactClick = (e: React.MouseEvent, type: 'call' | 'chat') => {
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (type === 'call') {
      // فتح صفحة تفاصيل الخدمة مباشرة بدلاً من صفحة contact
      router.push(`/transport/service/${service.id}`);
    } else {
      router.push(
        `/messages?chat=${service.user.id}&name=${encodeURIComponent(quickDecodeName(service.user.name))}&phone=${encodeURIComponent(service.contactPhone)}&type=transport`,
      );
    }
  };

  // التنقل للصورة التالية
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === serviceImages.length - 1 ? 0 : prev + 1));
  };

  // التنقل للصورة السابقة
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? serviceImages.length - 1 : prev - 1));
  };

  const formatServiceArea = (area: string) => {
    if (!area) return 'غير محدد';
    const areas = area.split(',').map((a) => a.trim());
    if (areas.length <= 2) return areas.join(' - ');
    return `${areas.slice(0, 2).join(' - ')} +${areas.length - 2}`;
  };

  const formatAvailableDays = (days: string) => {
    if (!days) return 'غير محدد';
    const daysList = days.split(',').map((d) => d.trim());
    if (daysList.length === 7) return 'جميع أيام الأسبوع';
    if (daysList.length <= 3) return daysList.join(' - ');
    return `${daysList.slice(0, 2).join(' - ')} +${daysList.length - 2}`;
  };

  // صور الخدمة مع صورة افتراضية
  const serviceImages = (() => {
    if (!service.images) {
      return ['/images/transport/default-truck.jpg'];
    }

    // دالة لتنظيف مسار الصورة من الأخطاء الشائعة
    const cleanImagePath = (img: string): string => {
      if (!img || typeof img !== 'string') return '';

      // إزالة الاقتباسات الزائدة من البداية والنهاية
      let cleaned = img.trim();

      // إزالة الاقتباسات المزدوجة الزائدة في النهاية
      cleaned = cleaned.replace(/""+$/g, '"');

      // إزالة الاقتباسات الأحادية والمزدوجة الزائدة
      cleaned = cleaned.replace(/^["']+|["']+$/g, '');

      // إصلاح المسارات التي تحتوي على أخطاء شائعة
      cleaned = cleaned.replace(/\["|"]|\["|"\]/g, '');

      return cleaned;
    };

    // إذا كانت الصور مصفوفة بالفعل
    if (Array.isArray(service.images) && service.images.length > 0) {
      const cleanedImages = service.images
        .map((img) => {
          if (typeof img === 'string') {
            // التحقق من JSON string
            if (img.includes('[') && img.includes(']')) {
              try {
                // محاولة إصلاح JSON التالف
                let fixedJson = img.trim();
                // إصلاح الاقتباسات المزدوجة الزائدة
                fixedJson = fixedJson.replace(/""}/g, '"}');
                fixedJson = fixedJson.replace(/""+/g, '"');

                const parsed = JSON.parse(fixedJson);
                if (Array.isArray(parsed)) {
                  return parsed.map(cleanImagePath).filter(Boolean);
                }
                return cleanImagePath(parsed);
              } catch {
                // إذا فشل الـ parse، نعامله كنص عادي
                return cleanImagePath(img);
              }
            }
            return cleanImagePath(img);
          }
          return img;
        })
        .flat()
        .filter(Boolean);
      return cleanedImages.length > 0 ? cleanedImages : ['/images/transport/default-truck.jpg'];
    }

    // إذا كانت الصور نص مفصول بفواصل
    if (typeof service.images === 'string') {
      const imagesStr = service.images.trim();

      // التحقق من JSON string
      if (imagesStr.includes('[') && imagesStr.includes(']')) {
        try {
          // محاولة إصلاح JSON التالف
          let fixedJson = imagesStr;
          // إصلاح الاقتباسات المزدوجة الزائدة في النهاية
          fixedJson = fixedJson.replace(/""+\]/g, '"]');
          fixedJson = fixedJson.replace(/\[""+/g, '["');
          fixedJson = fixedJson.replace(/"""/g, '"');

          const parsed = JSON.parse(fixedJson);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.map(cleanImagePath).filter(Boolean);
            return cleaned.length > 0 ? cleaned : ['/images/transport/default-truck.jpg'];
          }
          const cleaned = cleanImagePath(parsed);
          return cleaned ? [cleaned] : ['/images/transport/default-truck.jpg'];
        } catch {
          // إذا فشل الـ parse، نتابع مع معالجة CSV
        }
      }

      // معالجة CSV
      const imageArray = imagesStr
        .split(',')
        .map((img) => cleanImagePath(img))
        .filter((img) => img && img.length > 0);
      return imageArray.length > 0 ? imageArray : ['/images/transport/default-truck.jpg'];
    }

    return ['/images/transport/default-truck.jpg'];
  })();

  // التصميم الجديد المشابه لبطاقات السوق
  if (viewMode === 'grid') {
    return (
      <>
        <div
          className="group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
          onClick={handleCardClick}
        >
          {/* شارة مميزة للخدمات المميزة */}
          {service.user.verified && (
            <div className="absolute right-2 top-2 z-10">
              <CheckBadgeIcon className="h-5 w-5 text-green-500" />
            </div>
          )}

          {/* قسم الصورة مع معرض الصور */}
          <div className="group relative h-48 w-full overflow-hidden">
            <TransportCardImage
              src={serviceImages[currentImageIndex] || '/images/transport/default-truck.jpg'}
              alt={service.title}
              priority={false}
              containerClassName="h-full w-full"
              onError={() => {
                // التعامل مع أخطاء الصورة يتم في المكون نفسه
              }}
            />

            {/* أسهم التنقل بين الصور */}
            <UnifiedNavigationArrows
              onPrevious={prevImage}
              onNext={nextImage}
              show={serviceImages && serviceImages.length > 1}
            />

            {/* مؤشرات الصور */}
            {serviceImages && serviceImages.length > 1 && (
              <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1">
                {serviceImages.map((_: string, index: number) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* عدد الصور */}
            {serviceImages && serviceImages.length > 1 && (
              <div className="absolute bottom-2 right-2 flex items-start gap-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
                <CameraIcon className="h-3 w-3" />
                {serviceImages.length}
              </div>
            )}

            {/* شارات إضافية */}
            <div className="absolute right-2 top-2 flex flex-col gap-1">
              {service.status === 'ACTIVE' && (
                <span className="rounded bg-green-500 px-2 py-1 text-xs text-white">متاح</span>
              )}
            </div>
          </div>

          {/* تفاصيل الخدمة */}
          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              {/* العنوان الرئيسي */}
              <h3 className="mb-3 line-clamp-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                {service.title}
              </h3>

              {/* التاريخ */}
              <div className="mb-2 flex items-center gap-1 text-sm text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <span>
                  {new Date().toLocaleDateString('ar-LY', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {/* مسار النقل - سطر جديد */}
              <div className="mb-3">
                <TransportRouteDisplay
                  serviceAreas={
                    service.serviceArea
                      ?.split(',')
                      .map((a) => a.trim())
                      .filter(Boolean) || []
                  }
                  variant="card"
                  maxDisplay={3}
                />
              </div>

              {/* معلومات الخدمة - 6 خصائص في سطر واحد */}
              <div className="mb-3 text-sm text-gray-600">
                <div className="flex flex-wrap items-start gap-1 text-xs">
                  {/* نوع الشاحنة */}
                  {service.truckType && service.truckType !== 'غير محدد' && (
                    <span className="font-medium text-gray-800">
                      {translateVehicleType(service.truckType)}
                    </span>
                  )}

                  {/* السعة */}
                  {service.capacity && service.capacity > 0 && (
                    <>
                      {service.truckType && service.truckType !== 'غير محدد' && (
                        <span className="text-gray-400">•</span>
                      )}
                      <span className="font-medium text-gray-800">{service.capacity} سيارة</span>
                    </>
                  )}

                  {/* أيام العمل */}
                  {service.availableDays && (
                    <>
                      {((service.truckType && service.truckType !== 'غير محدد') ||
                        (service.capacity && service.capacity > 0)) && (
                        <span className="text-gray-400">•</span>
                      )}
                      <span className="text-gray-600">
                        {formatAvailableDays(service.availableDays)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* التقييم */}
              <div className="rating-container mb-0 flex items-center gap-2">
                <div className="rating-stars flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(service.user.rating || 0)
                          ? 'fill-current text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="rating-text text-sm font-medium text-gray-700">
                  {(service.user.rating || 0).toFixed(1)}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-start justify-between">
              {/* أزرار المالك - تظهر في وضع grid أيضاً */}
              {isCurrentUserOwner && showOwnerActions ? (
                <div className="action-buttons flex flex-wrap items-center gap-2">
                  {/* زر العرض */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/transport/service/${service.id}`);
                    }}
                    className="flex h-8 items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                    title="عرض الخدمة"
                  >
                    <EyeIcon className="h-3.5 w-3.5" />
                    <span>عرض</span>
                  </button>

                  {/* زر التعديل */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEdit) {
                        onEdit(service.id);
                      } else {
                        router.push(`/transport/edit/${service.id}`);
                      }
                    }}
                    className="flex h-8 items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                    title="تعديل الخدمة"
                  >
                    <PencilSquareIcon className="h-3.5 w-3.5" />
                    <span>تعديل</span>
                  </button>

                  {/* زر الإيقاف/التفعيل */}
                  {service.status === 'ACTIVE' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onPause) onPause(service.id);
                      }}
                      className="flex h-8 items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                      title="إيقاف مؤقت"
                    >
                      <PauseIcon className="h-3.5 w-3.5" />
                      <span>إيقاف</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onActivate) onActivate(service.id);
                      }}
                      className="flex h-8 items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                      title="تفعيل الخدمة"
                    >
                      <PlayIcon className="h-3.5 w-3.5" />
                      <span>تفعيل</span>
                    </button>
                  )}

                  {/* زر الحذف */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDelete) onDelete(service.id);
                    }}
                    className="flex h-8 items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                    title="حذف الخدمة"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    <span>حذف</span>
                  </button>
                </div>
              ) : !isCurrentUserOwner ? (
                <div className="action-buttons flex items-start gap-2">
                  {/* زر الاتصال */}
                  <button
                    onClick={(e) => handleContactClick(e, 'call')}
                    className="action-button flex h-10 items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <PhoneIcon className="phone-icon h-4 w-4" />
                    <span className="phone-with-icon phone-text">
                      {(() => {
                        // معالجة آمنة لرقم الهاتف
                        const phoneDisplay = service.contactPhone
                          ? maskLibyanPhoneFirst7Xxx(service.contactPhone)
                          : '092xxxxxxx';
                        return phoneDisplay;
                      })()}
                    </span>
                  </button>

                  {/* زر المراسلة */}
                  <button
                    onClick={(e) => handleContactClick(e, 'chat')}
                    className="action-button flex h-10 items-center gap-1 rounded-md border border-blue-600 bg-white px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    دردش
                  </button>

                  {/* زر المفضلة */}
                  <button
                    onClick={handleFavoriteClick}
                    disabled={isUpdatingFavorite}
                    className={`action-button flex h-10 items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      isFavorite(undefined, undefined, undefined, service.id)
                        ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                        : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                    } ${isUpdatingFavorite ? 'cursor-not-allowed opacity-50' : ''}`}
                    aria-label={
                      isFavorite(undefined, undefined, undefined, service.id)
                        ? 'إزالة من المفضلة'
                        : 'إضافة للمفضلة'
                    }
                  >
                    {isUpdatingFavorite ? (
                      <SimpleSpinner size="sm" color="gray" className="border-current" />
                    ) : isFavorite(undefined, undefined, undefined, service.id) ? (
                      <HeartSolid className="h-4 w-4" />
                    ) : (
                      <HeartIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* نافذة تسجيل الدخول */}
        <LoginModal isOpen={showAuthModal} onClose={handleAuthClose} />
      </>
    );
  }

  // تصميم وضع القائمة (مشابه لبطاقات السوق)
  return (
    <>
      <div
        className="group relative flex cursor-pointer flex-row-reverse rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg xl:min-h-[220px]"
        onClick={handleCardClick}
      >
        {/* شارة مميزة للخدمات المميزة */}
        {service.user.verified && (
          <div className="absolute right-3 top-3 z-10">
            <CheckBadgeIcon className="h-5 w-5 text-green-500" />
          </div>
        )}

        {/* تفاصيل الخدمة */}
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            {/* العنوان الرئيسي */}
            <h3 className="mb-3 line-clamp-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">
              {service.title}
            </h3>

            {/* التاريخ */}
            <div className="mb-2 flex items-center gap-1 text-sm text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <span>
                {new Date().toLocaleDateString('ar-LY', {
                  day: 'numeric',
                  month: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* مسار النقل - سطر جديد */}
            <div className="mb-3">
              <TransportRouteDisplay
                serviceAreas={
                  service.serviceArea
                    ?.split(',')
                    .map((a) => a.trim())
                    .filter(Boolean) || []
                }
                variant="card"
                maxDisplay={3}
              />
            </div>

            {/* معلومات الخدمة - 6 خصائص في سطر واحد */}
            <div className="mb-3 text-sm text-gray-600">
              <div className="flex flex-wrap items-start gap-1 text-xs">
                {/* نوع الشاحنة */}
                {service.truckType && service.truckType !== 'غير محدد' && (
                  <span className="font-medium text-gray-800">
                    {translateVehicleType(service.truckType)}
                  </span>
                )}

                {/* السعة */}
                {service.capacity && service.capacity > 0 && (
                  <>
                    {service.truckType && service.truckType !== 'غير محدد' && (
                      <span className="text-gray-400">•</span>
                    )}
                    <span className="font-medium text-gray-800">{service.capacity} سيارة</span>
                  </>
                )}

                {/* أيام العمل */}
                {service.availableDays && (
                  <>
                    {((service.truckType && service.truckType !== 'غير محدد') ||
                      (service.capacity && service.capacity > 0)) && (
                      <span className="text-gray-400">•</span>
                    )}
                    <span className="text-gray-600">
                      {formatAvailableDays(service.availableDays)}
                    </span>
                  </>
                )}

                {/* مقدم الخدمة */}
                {quickDecodeName(service.user.name) && (
                  <>
                    {((service.truckType && service.truckType !== 'غير محدد') ||
                      (service.capacity && service.capacity > 0) ||
                      service.availableDays) && <span className="text-gray-400">•</span>}
                    <span className="text-gray-600">{quickDecodeName(service.user.name)}</span>
                  </>
                )}
              </div>
            </div>

            {/* التقييم */}
            <div className="rating-container mb-0 flex items-center gap-2">
              {(service.user.rating || 0) > 0 ? (
                <>
                  <div className="rating-stars flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(service.user.rating || 0)
                            ? 'fill-current text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="rating-text text-sm font-medium text-gray-700">
                    {(service.user.rating || 0).toFixed(1)}
                  </span>
                </>
              ) : (
                <>
                  <div className="rating-stars flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      className="h-4 w-4 text-gray-300"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                      ></path>
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      className="h-4 w-4 text-gray-300"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                      ></path>
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      className="h-4 w-4 text-gray-300"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                      ></path>
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      className="h-4 w-4 text-gray-300"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                      ></path>
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      className="h-4 w-4 text-gray-300"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                      ></path>
                    </svg>
                  </div>
                  <span className="rating-text text-sm font-medium text-gray-700">0.0</span>
                </>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-start justify-between">
            {/* أزرار المالك - تظهر فقط إذا كان المستخدم الحالي هو مالك الخدمة وتم تفعيل showOwnerActions */}
            {isCurrentUserOwner && showOwnerActions ? (
              <div className="action-buttons flex flex-wrap items-center gap-2">
                {/* زر العرض */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/transport/service/${service.id}`);
                  }}
                  className="flex h-9 items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  title="عرض الخدمة"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">عرض</span>
                </button>

                {/* زر التعديل */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEdit) {
                      onEdit(service.id);
                    } else {
                      router.push(`/transport/edit/${service.id}`);
                    }
                  }}
                  className="flex h-9 items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  title="تعديل الخدمة"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">تعديل</span>
                </button>

                {/* زر الإيقاف/التفعيل */}
                {service.status === 'ACTIVE' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPause) onPause(service.id);
                    }}
                    className="flex h-9 items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    title="إيقاف مؤقت"
                  >
                    <PauseIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">إيقاف</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onActivate) onActivate(service.id);
                    }}
                    className="flex h-9 items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    title="تفعيل الخدمة"
                  >
                    <PlayIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">تفعيل</span>
                  </button>
                )}

                {/* زر الحذف */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDelete) onDelete(service.id);
                  }}
                  className="flex h-9 items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  title="حذف الخدمة"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">حذف</span>
                </button>
              </div>
            ) : !isCurrentUserOwner ? (
              <div className="action-buttons flex items-start gap-2">
                {/* زر الاتصال */}
                <button
                  onClick={(e) => handleContactClick(e, 'call')}
                  className="action-button flex h-10 items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <PhoneIcon className="phone-icon h-4 w-4" />
                  <span className="phone-with-icon phone-text">
                    {(() => {
                      // معالجة آمنة لرقم الهاتف
                      const phoneDisplay = service.contactPhone
                        ? maskLibyanPhoneFirst7Xxx(service.contactPhone)
                        : '092xxxxxxx';
                      return phoneDisplay;
                    })()}
                  </span>
                </button>

                {/* زر المراسلة */}
                <button
                  onClick={(e) => handleContactClick(e, 'chat')}
                  className="action-button flex h-10 items-center gap-1 rounded-md border border-blue-600 bg-white px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  دردش
                </button>

                {/* زر المفضلة */}
                <button
                  onClick={handleFavoriteClick}
                  disabled={isUpdatingFavorite}
                  className={`action-button flex h-10 items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    isFavorite(undefined, undefined, undefined, service.id)
                      ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                  } ${isUpdatingFavorite ? 'cursor-not-allowed opacity-50' : ''}`}
                  aria-label={
                    isFavorite(undefined, undefined, undefined, service.id)
                      ? 'إزالة من المفضلة'
                      : 'إضافة للمفضلة'
                  }
                >
                  {isUpdatingFavorite ? (
                    <SimpleSpinner size="sm" color="gray" className="border-current" />
                  ) : isFavorite(undefined, undefined, undefined, service.id) ? (
                    <HeartSolid className="h-4 w-4" />
                  ) : (
                    <HeartIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* قسم الصورة مع معرض الصور */}
        <div className="transport-image-container">
          <TransportCardImage
            src={serviceImages[currentImageIndex] || '/images/transport/default-truck.jpg'}
            alt={service.title}
            priority={false}
            containerClassName="h-full w-full"
            onError={() => {
              // التعامل مع أخطاء الصورة يتم في المكون نفسه
            }}
          />

          {/* أسهم التنقل بين الصور */}
          <UnifiedNavigationArrows
            onPrevious={prevImage}
            onNext={nextImage}
            show={serviceImages && serviceImages.length > 1}
          />

          {/* مؤشرات الصور */}
          {serviceImages && serviceImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1">
              {serviceImages.map((_: string, index: number) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* عدد الصور */}
          {serviceImages && serviceImages.length > 1 && (
            <div className="absolute bottom-2 right-2 flex items-start gap-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
              <CameraIcon className="h-3 w-3" />
              {serviceImages.length}
            </div>
          )}

          {/* شارات إضافية */}
          <div className="absolute right-2 top-2 flex flex-col gap-1">
            {service.status === 'ACTIVE' && (
              <span className="rounded bg-green-500 px-2 py-1 text-xs text-white">متاح</span>
            )}
          </div>
        </div>
      </div>

      {/* إشعار المفضلة */}
      {notification && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-lg px-4 py-3 text-white shadow-lg transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <XCircleIcon className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* نافذة تسجيل الدخول */}
      <LoginModal isOpen={showAuthModal} onClose={handleAuthClose} />
    </>
  );
};

export default SimpleTransportCard;
