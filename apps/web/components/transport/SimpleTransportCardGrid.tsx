import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { quickDecodeName } from '../../utils/universalNameDecoder';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import CheckBadgeIcon from '@heroicons/react/24/outline/CheckBadgeIcon';
import CameraIcon from '@heroicons/react/24/outline/CameraIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

import { UnifiedNavigationArrows } from '../ui/NavigationArrows';
import useAuthProtection from '../../hooks/useAuthProtection';
import LoginModal from '../auth/LoginModal';
import useAuth from '../../hooks/useAuth';
import { useFavorites } from '../../hooks/useFavorites';
import { maskLibyanPhoneFirst7Xxx } from '../../utils/phoneUtils';

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

interface SimpleTransportCardGridProps {
  service: TransportService;
}

const SimpleTransportCardGrid: React.FC<SimpleTransportCardGridProps> = ({ service }) => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // استخدام نظام الحماية
  const {
    isAuthenticated,
    showAuthModal,
    setShowAuthModal,
    handleAuthClose,
  } = useAuthProtection({
    showModal: true,
  });

  // فحص ما إذا كان المستخدم الحالي هو مالك الخدمة - مع معالجة آمنة شاملة
  const isCurrentUserOwner = useMemo(() => {
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

  // معالج النقر على زر المفضلة
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (isUpdatingFavorite) return;

    try {
      await toggleFavorite(undefined, undefined, undefined, service.id);
    } catch (error) {
      console.error('خطأ في تحديث المفضلة:', error);
    }
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
        .map(img => {
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
        .map(img => cleanImagePath(img))
        .filter(img => img && img.length > 0);
      return imageArray.length > 0 ? imageArray : ['/images/transport/default-truck.jpg'];
    }

    return ['/images/transport/default-truck.jpg'];
  })();

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
          <img
            src={serviceImages[currentImageIndex] || '/images/transport/default-truck.jpg'}
            alt={service.title}
            className="h-full w-full object-cover object-center"
            style={{ objectPosition: 'center center', display: 'block', minHeight: '100%', minWidth: '100%' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== '/images/transport/default-truck.jpg') {
                target.src = '/images/transport/default-truck.jpg';
              }
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
              {serviceImages.map((_, index) => (
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
        </div>

        {/* تفاصيل الخدمة */}
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            {/* العنوان الرئيسي */}
            <h3 className="mb-3 line-clamp-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">
              {service.title}
            </h3>

            {/* التاريخ والموقع */}
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
                <span>{formatServiceArea(service.serviceArea)}</span>
              </div>
            </div>

            {/* معلومات الخدمة - 6 خصائص في سطر واحد */}
            <div className="mb-3 text-sm text-gray-600">
              <div className="flex flex-wrap items-start gap-1 text-xs">
                {/* نوع الشاحنة */}
                {service.truckType && service.truckType !== 'غير محدد' && (
                  <span className="font-medium text-gray-800">{service.truckType}</span>
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

          <div className="flex items-start justify-between">
            {/* الأزرار على اليمين - تظهر فقط إذا لم يكن المستخدم الحالي هو مالك الخدمة */}
            {!isCurrentUserOwner && (
              <div className="action-buttons flex items-start gap-2">
                {/* زر الاتصال */}
                <button
                  onClick={(e) => handleContactClick(e, 'call')}
                  className="action-button flex h-10 items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <PhoneIcon className="h-4 w-4" />
                  <span>
                    {(() => {
                      // معالجة آمنة لرقم الهاتف مع logging للتشخيص وعرض 7 أرقام ثم xxx
                      const phoneDisplay = service.contactPhone ? maskLibyanPhoneFirst7Xxx(service.contactPhone) : '092xxxxxxx';
                      console.log('📞 [Transport Grid] عرض رقم الهاتف:', {
                        original: service.contactPhone,
                        formatted: phoneDisplay,
                        serviceTitle: service.title
                      });
                      return phoneDisplay;
                    })()
                  }</span>
                </button>

                {/* زر المراسلة */}
                <button
                  onClick={(e) => handleContactClick(e, 'chat')}
                  className="action-button flex h-10 items-center gap-1 rounded-md border border-blue-600 bg-white px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  مراسلة
                </button>

                {/* زر المفضلة */}
                <button
                  onClick={handleFavoriteClick}
                  className={`action-button flex h-10 items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    isFavorite(undefined, undefined, undefined, service.id)
                      ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  aria-label={
                    isFavorite(undefined, undefined, undefined, service.id)
                      ? 'إزالة من المفضلة'
                      : 'إضافة للمفضلة'
                  }
                >
                  {isFavorite(undefined, undefined, undefined, service.id) ? (
                    <HeartSolid className="h-4 w-4" />
                  ) : (
                    <HeartIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* نافذة تسجيل الدخول */}
      <LoginModal isOpen={showAuthModal} onClose={handleAuthClose} />
    </>
  );
};

export default SimpleTransportCardGrid;
