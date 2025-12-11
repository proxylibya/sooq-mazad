import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Layout } from '../../components/common';
import ReviewsAndRatings from '../../components/common/ReviewsAndRatings';
import {
  BuildingStorefrontIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
  UserIcon,
  CheckCircleIcon,
  ShareIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ShieldCheckIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  CreditCardIcon,
  GlobeAltIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import RevealPhoneButton from '@/components/common/ui/buttons/RevealPhoneButton';

interface ShowroomData {
  id: string;
  name: string;
  description: string;
  specialization: string[]; // ['سيارات جديدة', 'سيارات مستعملة', 'قطع غيار', 'صيانة']
  location: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  logo?: string;
  images: string[];
  services: string[];
  brands: string[]; // الماركات المتوفرة
  workingHours: string;
  established: string;
  employees: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  ownerId: string;
  createdAt: string;
  features: string[]; // ['تمويل', 'ضمان', 'صيانة', 'توصيل']
  paymentMethods: string[];
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  stats: {
    totalSales: number;
    activeCars: number;
    yearsInBusiness: number;
  };
}

const ShowroomDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [showroom, setShowroom] = useState<ShowroomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // جلب بيانات المعرض
  useEffect(() => {
    if (!id) return;

    const fetchShowroomData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/showrooms/${id}`);

        if (!response.ok) {
          throw new Error('فشل في جلب بي��نات المعرض');
        }

        const data = await response.json();

        if (data.success && data.data) {
          setShowroom(data.data);
        } else {
          setError(data.error || 'المعرض غير موجود');
        }
      } catch (err) {
        console.error('خطأ في جلب بيانات المعرض:', err);
        setError('حدث خطأ في تحميل بيانات المعرض');
      } finally {
        setLoading(false);
      }
    };

    fetchShowroomData();
  }, [id]);

  // عرض حالة التحميل
  // تم إزالة spinner - UnifiedPageTransition يتولى ذلك
  if (loading) return null;

  // عرض حالة الخطأ
  if (error || !showroom) {
    return (
      <Layout title="خطأ">
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mb-4 text-6xl text-red-500">🏪</div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">المعرض غير موجود</h1>
            <p className="mb-6 text-gray-600">{error}</p>
            <Link
              href="/showrooms"
              className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              العودة للمعارض
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= rating ? (
              <StarSolid className="h-4 w-4 text-yellow-400" />
            ) : (
              <StarIcon className="h-4 w-4 text-gray-300" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const getSpecializationIcon = (spec: string) => {
    switch (spec) {
      case 'سيارات جديدة':
        return <TruckIcon className="h-5 w-5" />;
      case 'سيارات مستعملة':
        return <TruckIcon className="h-5 w-5" />;
      case 'قطع غيار':
        return <WrenchScrewdriverIcon className="h-5 w-5" />;
      case 'صيانة':
        return <WrenchScrewdriverIcon className="h-5 w-5" />;
      default:
        return <BuildingStorefrontIcon className="h-5 w-5" />;
    }
  };

  return (
    <Layout title={showroom.name}>
      <Head>
        <title>{showroom.name} - معارض السيارات</title>
        <meta name="description" content={`${showroom.name} - ${showroom.description}`} />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          {/* شريط التنقل */}
          <nav className="mb-6 flex text-sm">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              الرئيسية
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link href="/showrooms" className="text-blue-600 hover:text-blue-800">
              المعارض
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">{showroom.name}</span>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* المحتوى الرئيسي */}
            <div className="lg:col-span-2">
              {/* معرض الصور */}
              {showroom.images && showroom.images.length > 0 && (
                <div className="mb-6 overflow-hidden rounded-xl bg-white shadow-sm">
                  <div className="relative">
                    <img
                      src={
                        showroom.images[activeImageIndex] ||
                        '/images/showrooms/default-showroom.jpg'
                      }
                      alt={showroom.name}
                      className="h-64 w-full object-cover"
                    />

                    {showroom.images.length > 1 && (
                      <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 text-sm text-white">
                        {activeImageIndex + 1} / {showroom.images.length}
                      </div>
                    )}
                  </div>

                  {showroom.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto p-4">
                      {showroom.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                            activeImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`صورة ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* معلومات المعرض */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {showroom.logo ? (
                      <img
                        src={showroom.logo}
                        alt={showroom.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100">
                        <BuildingStorefrontIcon className="h-8 w-8 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{showroom.name}</h1>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {showroom.specialization.map((spec, index) => (
                            <span key={index} className="text-lg" title={spec}>
                              {getSpecializationIcon(spec)}
                            </span>
                          ))}
                        </div>
                        {showroom.verified && (
                          <div className="flex items-center gap-1 text-green-600">
                            <ShieldCheckIcon className="h-4 w-4" />
                            <span className="text-sm">معرض موثق</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200">
                      <HeartIcon className="h-5 w-5" />
                    </button>
                    <button className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200">
                      <ShareIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* التقييم والإحصائيات */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                  {showroom.rating > 0 && (
                    <div className="text-center">
                      <div className="mb-1 flex justify-center">{renderStars(showroom.rating)}</div>
                      <div className="text-sm text-gray-600">
                        {showroom.rating.toFixed(1)} ({showroom.reviewsCount} تقييم)
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {showroom.stats.totalSales}
                    </div>
                    <div className="text-sm text-gray-600">سيارة مباعة</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {showroom.stats.activeCars}
                    </div>
                    <div className="text-sm text-gray-600">سيارة متاحة</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {showroom.stats.yearsInBusiness}
                    </div>
                    <div className="text-sm text-gray-600">سنة خبرة</div>
                  </div>
                </div>

                {/* التخصصات */}
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">التخصصات</h3>
                  <div className="flex flex-wrap gap-2">
                    {showroom.specialization.map((spec, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                      >
                        <span>{getSpecializationIcon(spec)}</span>
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* الوصف */}
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">نبذة عن المعرض</h3>
                  <p className="leading-relaxed text-gray-700">{showroom.description}</p>
                </div>

                {/* الماركات المتوفرة */}
                {showroom.brands && showroom.brands.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">الماركات المتوفرة</h3>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      {showroom.brands.map((brand, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center text-sm font-medium text-gray-700"
                        >
                          {brand}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* الخدمات */}
                {showroom.services && showroom.services.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">الخدمات المقدمة</h3>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {showroom.services.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 rounded-lg bg-gray-50 p-3"
                        >
                          <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-green-500" />
                          <span className="text-sm text-gray-700">{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* المميزات */}
                {showroom.features && showroom.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">المميزات</h3>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {showroom.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-center"
                        >
                          {feature === 'تمويل' && (
                            <CreditCardIcon className="h-5 w-5 text-green-600" />
                          )}
                          {feature === 'ضمان' && (
                            <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                          )}
                          {feature === 'صيانة' && (
                            <WrenchScrewdriverIcon className="h-5 w-5 text-green-600" />
                          )}
                          {feature === 'توصيل' && <TruckIcon className="h-5 w-5 text-green-600" />}
                          <span className="text-sm font-medium text-green-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* طرق الدفع */}
                {showroom.paymentMethods && showroom.paymentMethods.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">طرق الدفع المقبولة</h3>
                    <div className="flex flex-wrap gap-2">
                      {showroom.paymentMethods.map((method, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* الشريط الجانبي */}
            <div className="lg:col-span-1">
              {/* معلومات الاتصال */}
              <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">معلومات الاتصال</h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                    <div>
                      <div className="text-gray-700">{showroom.location}</div>
                      {showroom.address && (
                        <div className="text-sm text-gray-500">{showroom.address}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <RevealPhoneButton phone={showroom.phone} fullWidth={false} size="md" />
                  </div>

                  {showroom.email && (
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      <a
                        href={`mailto:${showroom.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {showroom.email}
                      </a>
                    </div>
                  )}

                  {showroom.website && (
                    <div className="flex items-center gap-3">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                      <a
                        href={showroom.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        زيارة الموقع
                      </a>
                    </div>
                  )}
                </div>

                {/* ساعات العمل */}
                {showroom.workingHours && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <ClockIcon className="h-4 w-4" />
                      <span>ساعات العمل</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{showroom.workingHours}</p>
                  </div>
                )}

                {/* معلومات إضافية */}
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  {showroom.established && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>تأسس في: {showroom.established}</span>
                    </div>
                  )}
                  {showroom.employees && (
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span>عدد الموظفين: {showroom.employees}</span>
                    </div>
                  )}
                </div>

                {/* أزرار الإجراء */}
                <div className="mt-6 space-y-3">
                  <RevealPhoneButton
                    phone={showroom.phone}
                    size="lg"
                    fullWidth
                    ariaLabel="إظهار رقم الهاتف"
                  />

                  <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50">
                    <ChatBubbleLeftIcon className="h-5 w-5" />
                    إرسال رسالة
                  </button>

                  <Link
                    href={`/showroom/${id}/cars`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white transition-colors hover:bg-green-700"
                  >
                    <BuildingStorefrontIcon className="h-5 w-5" />
                    عرض السيارات المتاحة
                  </Link>
                </div>
              </div>

              {/* وسائل التواصل الاج��ماعي */}
              {showroom.socialMedia && (
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">تابعنا على</h3>
                  <div className="flex gap-3">
                    {showroom.socialMedia.facebook && (
                      <a
                        href={showroom.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                      >
                        f
                      </a>
                    )}
                    {showroom.socialMedia.instagram && (
                      <a
                        href={showroom.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-600 text-white hover:bg-pink-700"
                      >
                        📷
                      </a>
                    )}
                    {showroom.socialMedia.twitter && (
                      <a
                        href={showroom.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600"
                      >
                        🐦
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* قسم التقييمات والمراجعات */}
          <div className="mt-8">
            <ReviewsAndRatings
              itemId={id as string}
              itemType="showroom"
              itemTitle={showroom.name || 'معرض سيارات'}
              targetUserId={showroom.ownerId || ''}
              className="mb-6"
              showQuickRating={true}
              showRatingStats={true}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShowroomDetailsPage;
