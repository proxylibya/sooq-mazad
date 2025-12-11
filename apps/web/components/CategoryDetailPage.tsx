import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';
import { handlePhoneClickUnified } from '../utils/phoneActions';
import { maskLibyanPhoneFirst7Xxx } from '../utils/phoneUtils';
import { quickDecodeName } from '../utils/universalNameDecoder';
import OpensooqNavbar from './OpensooqNavbar';
import SafetyTips from './SafetyTips';
import UserAvatar from './UserAvatar';
import LoginModal from './auth/LoginModal';

// أنواع البيانات العامة
interface CategoryItemDetail {
  id: string;
  title: string;
  price?: number;
  location: string;
  images: string[];
  description?: string;
  featured?: boolean;
  urgent?: boolean;
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  user?: {
    id: string;
    name: string;
    phone: string;
    verified: boolean;
    avatar?: string;
  };
  [key: string]: any; // للخصائص الإضافية المختلفة لكل فئة
}

interface CategoryDetailConfig {
  title: string;
  metaTitle: string;
  metaDescription: string;
  itemName: string; // مثل "سيارة" أو "قطعة غيار"
  backLink: string;
  backText: string;
  contactButtonText: string;
  shareText: string;
  specifications?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  features?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
  }>;
}

interface CategoryDetailPageProps {
  item: CategoryItemDetail | null;
  config: CategoryDetailConfig;
  isLoading?: boolean;
  error?: string;
}

const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({
  item,
  config,
  isLoading = false,
  error = null,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: '',
  });
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [showContactModal, setShowContactModal] = useState(false);

  // معالجة أخطاء الصور
  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  // التعامل مع المفضلة
  const handleToggleFavorite = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (item) {
      toggleFavorite(item.id, 'category-item');
      setNotification({
        show: true,
        type: 'success',
        message: isFavorite(item.id, 'category-item')
          ? `تم إزالة ${config.itemName} من المفضلة`
          : `تم إضافة ${config.itemName} للمفضلة`,
      });

      setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 3000);
    }
  };

  // التعامل مع المشاركة
  const handleShare = () => {
    if (navigator.share && item) {
      navigator.share({
        title: item.title,
        text: config.shareText,
        url: window.location.href,
      });
    } else {
      // نسخ الرابط
      navigator.clipboard.writeText(window.location.href);
      setNotification({
        show: true,
        type: 'success',
        message: 'تم نسخ الرابط بنجاح',
      });

      setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 3000);
    }
  };

  // التعامل مع الاتصال
  const handleContact = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowContactModal(true);
  };

  // تنسيق السعر بالأرقام الغربية فقط
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  // تنسيق التاريخ بالأرقام الغربية فقط
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>جاري التحميل... | {config.title}</title>
        </Head>
        <div className="min-h-screen bg-gray-50" dir="rtl">
          <OpensooqNavbar />
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div
                className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                style={{ width: 24, height: 24 }}
                role="status"
                aria-label="جاري التحميل"
              />
              <p className="mt-4 text-gray-600">جاري تحميل تفاصيل {config.itemName}...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !item) {
    return (
      <>
        <Head>
          <title>خطأ | {config.title}</title>
        </Head>
        <div className="min-h-screen bg-gray-50" dir="rtl">
          <OpensooqNavbar />
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-red-500">
                <XMarkIcon className="mx-auto h-16 w-16" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900">
                {error || `لم يتم العثور على ${config.itemName}`}
              </h2>
              <p className="mb-4 text-gray-600">تحقق من الرابط أو جرب مرة أخرى</p>
              <Link
                href={config.backLink}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                العودة إلى {config.backText}
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>
          {item.title} | {config.title}
        </title>
        <meta name="description" content={item.description || config.metaDescription} />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* Notification */}
        {notification.show && (
          <div
            className={`fixed right-4 top-20 z-50 max-w-sm rounded-lg p-4 shadow-lg ${
              notification.type === 'success'
                ? 'border border-green-400 bg-green-100 text-green-700'
                : notification.type === 'error'
                  ? 'border border-red-400 bg-red-100 text-red-700'
                  : 'border border-yellow-400 bg-yellow-100 text-yellow-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="flex-1 text-sm font-medium">{notification.message}</span>
              <button
                onClick={() => setNotification({ show: false, type: '', message: '' })}
                className="mr-2 rounded-lg p-1 text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 active:scale-95"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-6">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href={config.backLink}
              className="inline-flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              العودة إلى {config.backText}
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Images Section */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                {/* Main Image */}
                <div className="mb-4">
                  <div
                    className="relative overflow-hidden rounded-xl bg-gray-100"
                    style={{ height: '400px' }}
                  >
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={
                          imageErrors[activeImageIndex]
                            ? 'https://via.placeholder.com/800x600?text=صورة+غير+متوفرة'
                            : item.images[activeImageIndex]
                        }
                        alt={item.title}
                        className="h-full w-full object-cover"
                        onError={() => handleImageError(activeImageIndex)}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <div className="text-center">
                          <svg
                            className="mx-auto h-16 w-16"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="mt-2 text-sm">لا توجد صور</p>
                        </div>
                      </div>
                    )}

                    {/* Image Counter */}
                    {item.images && item.images.length > 1 && (
                      <div className="absolute bottom-4 left-4 rounded-lg bg-black/70 px-3 py-1 text-sm text-white">
                        {activeImageIndex + 1} / {item.images.length}
                      </div>
                    )}

                    {/* Navigation Arrows */}
                    {item.images && item.images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setActiveImageIndex(
                              activeImageIndex === 0
                                ? item.images.length - 1
                                : activeImageIndex - 1,
                            )
                          }
                          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-all hover:bg-black/70"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            setActiveImageIndex(
                              activeImageIndex === item.images.length - 1
                                ? 0
                                : activeImageIndex + 1,
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-all hover:bg-black/70"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Thumbnail Images */}
                {item.images && item.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {item.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          activeImageIndex === index
                            ? 'border-blue-500 ring-2 ring-blue-500/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={
                            imageErrors[index]
                              ? 'https://via.placeholder.com/100x75?text=خطأ'
                              : image
                          }
                          alt={`${item.title} - صورة ${index + 1}`}
                          className="h-16 w-20 object-cover"
                          onError={() => handleImageError(index)}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Description */}
                {item.description && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="mb-3 text-lg font-bold text-gray-900">الوصف</h3>
                    <p className="leading-relaxed text-gray-700">{item.description}</p>
                  </div>
                )}

                {/* Specifications */}
                {config.specifications && config.specifications.length > 0 && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">المواصفات</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {config.specifications.map((spec) => (
                        <div key={spec.key} className="flex items-center gap-3">
                          {spec.icon && <div className="text-blue-600">{spec.icon}</div>}
                          <div>
                            <span className="text-sm font-medium text-gray-600">{spec.label}:</span>
                            <span className="mr-2 text-gray-900">
                              {item[spec.key] || 'غير محدد'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features */}
                {config.features && config.features.length > 0 && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">المميزات</h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {config.features.map((feature) => (
                        <div key={feature.key} className="flex items-center gap-3">
                          {feature.icon && <div className="text-green-600">{feature.icon}</div>}
                          <span className="text-gray-700">{feature.label}</span>
                          {item[feature.key] && (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price and Actions */}
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="mb-4">
                  <h1 className="mb-2 text-2xl font-bold text-gray-900">{item.title}</h1>
                  {item.price && (
                    <div className="text-3xl font-bold text-green-600">
                      {formatPrice(item.price)} دينار
                    </div>
                  )}
                </div>

                {/* Location and Date */}
                <div className="mb-6 space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPinIcon className="h-5 w-5" />
                    <span>{item.location}</span>
                  </div>
                  {item.createdAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="h-5 w-5" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  )}
                  {item.views && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <EyeIcon className="h-5 w-5" />
                      <span>{item.views} مشاهدة</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleContact}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    {config.contactButtonText}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleToggleFavorite}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2 font-medium transition-colors ${
                        isFavorite(item.id, 'category-item')
                          ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isFavorite(item.id, 'category-item') ? (
                        <HeartSolid className="h-5 w-5" />
                      ) : (
                        <HeartIcon className="h-5 w-5" />
                      )}
                      <span>المفضلة</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <ShareIcon className="h-5 w-5" />
                      <span>مشاركة</span>
                    </button>
                  </div>
                </div>

                {/* Badges */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.featured && (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                      مميز
                    </span>
                  )}
                  {item.urgent && (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                      عاجل
                    </span>
                  )}
                </div>
              </div>

              {/* Seller Info */}
              {item.user && (
                <div className="rounded-2xl bg-white p-6 shadow-lg">
                  <h3 className="mb-4 text-lg font-bold text-gray-900">معلومات البائع</h3>
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      src={item.user.avatar}
                      alt={item.user.name}
                      size="lg"
                      showVerificationBadge={true}
                      isVerified={item.user.verified}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">
                          {quickDecodeName(item.user.name)}
                        </h4>
                        {item.user.verified && (
                          <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">عضو في الموقع</p>
                    </div>
                  </div>

                  {showContactInfo && item.user.phone && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">
                          {maskLibyanPhoneFirst7Xxx(item.user.phone)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Safety Tips */}
              <div className="rounded-2xl bg-yellow-50 p-6 shadow-lg">
                <div className="mb-3 flex items-center gap-2">
                  <InformationCircleIcon className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-bold text-yellow-800">نصائح الأمان</h3>
                </div>
                <ul className="space-y-2 text-sm text-yellow-700">
                  <li>• تأكد من فحص {config.itemName} قبل الشراء</li>
                  <li>• التقي بالبائع في مكان عام وآمن</li>
                  <li>• لا تدفع أي مبلغ قبل رؤية {config.itemName}</li>
                  <li>• تأكد من صحة الأوراق والوثائق</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showAuthModal && (
          <LoginModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onLoginSuccess={() => {
              setShowAuthModal(false);
              // يمكن إضافة منطق إضافي هنا
            }}
          />
        )}

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">معلومات الاتصال</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {item.user && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar src={item.user.avatar} alt={item.user.name} size="md" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {quickDecodeName(item.user.name)}
                      </h4>
                      {item.user.verified && (
                        <span className="text-sm text-blue-600">حساب موثق</span>
                      )}
                    </div>
                  </div>

                  {item.user.phone && (
                    <div className="rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="h-5 w-5 text-gray-600" />
                          <span className="font-medium">
                            {maskLibyanPhoneFirst7Xxx(item.user.phone)}
                          </span>
                        </div>
                        <a
                          href={`tel:${item.user.phone}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePhoneClickUnified({ phone: item.user.phone });
                          }}
                          className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                        >
                          اتصال
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg bg-yellow-50 p-3">
                    <p className="text-sm text-yellow-700">
                      تذكر: لا تشارك معلوماتك الشخصية أو المالية مع أشخاص لا تعرفهم
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* نصائح الأمان */}
      <div className="container mx-auto px-4 py-8">
        <SafetyTips />
      </div>
    </>
  );
};

export default CategoryDetailPage;
