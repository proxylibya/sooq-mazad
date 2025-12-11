import RevealPhoneButton from '@/components/common/ui/buttons/RevealPhoneButton';
import TransportRouteDisplay from '@/components/transport/TransportRouteDisplay';
import { TitleFeaturedBadge } from '@/components/ui/FeaturedBadge';
import { truncateText } from '@/utils/transportTitleUtils';
import { translateVehicleType } from '@/utils/transportTranslations';
import {
  CameraIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  HeartIcon,
  MapPinIcon,
  PhoneIcon,
  ShareIcon,
  ShieldCheckIcon,
  StarIcon,
  TruckIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Layout } from '../../../components/common';
import ReviewsAndRatings from '../../../components/common/ReviewsAndRatings';

interface TransportServiceData {
  id: string;
  title: string;
  description: string;
  serviceType: string; // 'نقل أشخاص' | 'نقل بضائع' | 'نقل سيارات' | 'نقل أثاث'
  vehicleType: string;
  capacity: string;
  pricePerKm?: number;
  pricePerHour?: number;
  fixedPrice?: number;
  location: string;
  coverageAreas: string[];
  phone: string;
  images: string[];
  features: string[];
  workingHours: string;
  availability: boolean;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  providerId: string;
  providerName: string;
  providerImage?: string;
  createdAt: string;
  completedTrips: number;
  responseTime: string; // 'فوري' | 'خلال ساعة' | 'خلال يوم'
  // بيانات الترويج
  featured: boolean;
  promotionPackage: string | null;
}

const TransportServiceDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [service, setService] = useState<TransportServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // جلب بيانات خدمة النقل
  useEffect(() => {
    if (!id) return;

    const fetchServiceData = async () => {
      try {
        setLoading(true);
        console.log('🔍 [Service Details] جلب بيانات الخدمة:', id);

        const response = await fetch(`/api/transport/services/${id}`, {
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          throw new Error('فشل في جلب بيانات خدمة النقل');
        }

        const data = await response.json();
        console.log('✅ [Service Details] البيانات المستلمة:', data);

        if (data.success && data.data) {
          // معالجة الصور بشكل آمن
          const parseImages = (images: string | string[] | null | undefined): string[] => {
            if (!images) return [];

            // إذا كانت مصفوفة بالفعل
            if (Array.isArray(images)) {
              return images.filter((img: string) => img && img.trim().length > 0);
            }

            // إذا كانت نص
            if (typeof images === 'string') {
              const trimmed = images.trim();
              if (!trimmed) return [];

              // محاولة parse كـ JSON
              if (trimmed.startsWith('[')) {
                try {
                  const parsed = JSON.parse(trimmed.replace(/""+/g, '"'));
                  if (Array.isArray(parsed)) {
                    return parsed.filter((img: string) => img && img.trim().length > 0);
                  }
                } catch {
                  // فشل الـ parse، نتابع مع CSV
                }
              }

              // معالجة كـ CSV
              return trimmed
                .split(',')
                .map((img: string) => img.trim().replace(/^["']+|["']+$/g, ''))
                .filter((img: string) => img.length > 0);
            }

            return [];
          };

          const parsedImages = parseImages(data.data.images);
          console.log('📸 [Service Details] الصور المعالجة:', parsedImages);

          // تحويل البيانات للشكل المطلوب
          const formattedData: TransportServiceData = {
            id: data.data.id,
            title: data.data.title,
            description: data.data.description,
            serviceType: data.data.truckType || 'خدمة نقل',
            vehicleType: data.data.truckType || 'ساحبة',
            capacity: String(data.data.capacity || 1),
            pricePerKm: data.data.pricePerKm,
            pricePerHour: undefined,
            fixedPrice: undefined,
            location: Array.isArray(data.data.serviceArea)
              ? data.data.serviceArea[0]
              : typeof data.data.serviceArea === 'string'
                ? data.data.serviceArea.split(',')[0]
                : 'غير محدد',
            coverageAreas: Array.isArray(data.data.serviceArea)
              ? data.data.serviceArea
              : typeof data.data.serviceArea === 'string'
                ? data.data.serviceArea.split(',').map((a: string) => a.trim())
                : [],
            phone: data.data.contactPhone || data.data.user?.phone || '',
            images:
              parsedImages.length > 0 ? parsedImages : ['/images/transport/default-truck.jpg'],
            features: data.data.features || [],
            workingHours: Array.isArray(data.data.availableDays)
              ? `أيام العمل: ${data.data.availableDays.join('، ')}`
              : typeof data.data.availableDays === 'string'
                ? `أيام العمل: ${data.data.availableDays}`
                : 'أيام العمل: طوال الأسبوع',
            availability: data.data.status === 'ACTIVE',
            rating: 0,
            reviewsCount: 0,
            verified: data.data.user?.verified || false,
            providerId: data.data.user?.id || '',
            providerName: data.data.user?.name || '',
            providerImage: data.data.user?.profileImage,
            createdAt: data.data.createdAt,
            completedTrips: data.data.completedTrips || 0,
            responseTime: data.data.status === 'ACTIVE' ? 'متاح للحجز' : 'غير متاح حالياً',
            // بيانات الترويج
            featured: data.data.featured || false,
            promotionPackage: data.data.promotionPackage || null,
          };

          setService(formattedData);
        } else {
          setError(data.error || 'خدمة النقل غير موجودة');
        }
      } catch (err) {
        console.error('❌ [Service Details] خطأ في جلب بيانات خدمة النقل:', err);
        setError('حدث خطأ في تحميل بيانات خدمة النقل');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [id]);

  // تم إزالة spinner التحميل - UnifiedPageTransition يتولى ذلك
  if (loading) return null;

  // عرض حالة الخطأ
  if (error || !service) {
    return (
      <Layout title="خطأ">
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <TruckIcon className="h-24 w-24 text-red-500" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">خدمة النقل غير موجودة</h1>
            <p className="mb-6 text-gray-600">{error}</p>
            <Link
              href="/transport"
              className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              العودة لخدمات النقل
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

  const getServiceTypeIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'نقل سيارات':
        return <TruckIcon className="h-6 w-6 text-blue-600" />;
      case 'نقل أثاث':
        return <TruckIcon className="h-6 w-6 text-orange-600" />;
      case 'نقل بضائع':
        return <TruckIcon className="h-6 w-6 text-green-600" />;
      case 'نقل أشخاص':
        return <UserIcon className="h-6 w-6 text-purple-600" />;
      default:
        return <TruckIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getAvailabilityStatus = () => {
    if (!service.availability) {
      return { text: 'غير متاح حالياً', color: 'text-red-600 bg-red-50' };
    }
    return { text: 'متاح للحجز الآن', color: 'text-green-600 bg-green-50' };
  };

  // مراسلة موحدة مع ربط بخدمة النقل
  const handleChatClick = async () => {
    try {
      // انشاء محادثة مربوطة بالخدمة
      const response = await fetch('/api/transport/start-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
        }),
      });

      const data = await response.json();

      // ✅ إصلاح: conversationId موجود في data.data.conversationId
      const conversationId = data?.data?.conversationId || data?.conversationId;

      if (data.success && conversationId) {
        // التوجه للمحادثة
        router.push(`/messages?convId=${conversationId}`);
      } else if (response.status === 401) {
        // غير مسجل دخول
        router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      } else {
        // fallback للطريقة القديمة
        router.push(
          `/messages?chat=${encodeURIComponent(service.providerId)}&name=${encodeURIComponent(service.providerName)}&phone=${encodeURIComponent(service.phone)}&type=transport&serviceId=${service.id}`,
        );
      }
    } catch (error) {
      console.error('خطأ في بدء المحادثة:', error);
      // fallback للطريقة القديمة
      router.push(
        `/messages?chat=${encodeURIComponent(service.providerId)}&name=${encodeURIComponent(service.providerName)}&phone=${encodeURIComponent(service.phone)}&type=transport`,
      );
    }
  };

  const availabilityStatus = getAvailabilityStatus();

  return (
    <Layout title={service.title}>
      <Head>
        <title>{service.title} - خدمات النقل</title>
        <meta name="description" content={`${service.title} - ${service.description}`} />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          {/* شريط التنقل */}
          <nav className="mb-6 flex text-sm">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              الرئيسية
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link href="/transport" className="text-blue-600 hover:text-blue-800">
              خدمات النقل
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">{truncateText(service.title, 50)}</span>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* المحتوى الرئيسي */}
            <div className="lg:col-span-2">
              {/* معرض الصور - يظهر دائماً */}
              <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-lg">
                <div className="relative h-80 w-full md:h-96">
                  <Image
                    src={service.images[activeImageIndex] || '/images/transport/default-truck.jpg'}
                    alt={service.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/transport/default-truck.jpg';
                    }}
                  />

                  {/* شارة الإعلان المميز - فوق الصورة */}
                  {(service.featured ||
                    (service.promotionPackage && service.promotionPackage !== 'free')) && (
                    <div className="absolute left-4 top-4 z-10">
                      <TitleFeaturedBadge
                        featured={service.featured}
                        packageType={service.promotionPackage}
                      />
                    </div>
                  )}

                  {/* شارة الحالة */}
                  <div className="absolute right-4 top-4">
                    <span
                      className={`rounded-full px-4 py-2 text-sm font-bold shadow-lg ${
                        service.availability ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {service.availability ? 'متاح' : 'غير متاح'}
                    </span>
                  </div>

                  {/* أسهم التنقل */}
                  {service.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImageIndex((prev) =>
                            prev === 0 ? service.images.length - 1 : prev - 1,
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          setActiveImageIndex((prev) =>
                            prev === service.images.length - 1 ? 0 : prev + 1,
                          )
                        }
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* عداد الصور */}
                  {service.images.length > 1 && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                      <CameraIcon className="h-4 w-4" />
                      {activeImageIndex + 1} / {service.images.length}
                    </div>
                  )}
                </div>

                {/* الصور المصغرة */}
                {service.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto bg-gray-50 p-4">
                    {service.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`border-3 relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl transition-all ${
                          activeImageIndex === index
                            ? 'border-blue-500 ring-2 ring-blue-300 ring-offset-2'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`صورة ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="96px"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/transport/default-truck.jpg';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* معلومات الخدمة */}
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
                        <TruckIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900" title={service.title}>
                          {truncateText(service.title, 90)}
                        </h1>
                        <p className="text-sm text-gray-500">
                          {translateVehicleType(service.vehicleType)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm">
                        {service.serviceType}
                      </span>
                      {/* شارة الإعلان المميز */}
                      <TitleFeaturedBadge
                        featured={service.featured}
                        packageType={service.promotionPackage}
                      />
                      {service.verified && (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">
                          <ShieldCheckIcon className="h-4 w-4" />
                          موثق
                        </span>
                      )}
                      {service.pricePerKm && (
                        <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-700">
                          {service.pricePerKm} د.ل/كم
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="rounded-xl bg-gray-100 p-3 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-500">
                      <HeartIcon className="h-5 w-5" />
                    </button>
                    <button className="rounded-xl bg-gray-100 p-3 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-500">
                      <ShareIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* الإحصائيات */}
                <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {service.completedTrips}
                    </div>
                    <div className="text-xs font-medium text-green-700">رحلة مكتملة</div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{service.capacity}</div>
                    <div className="text-xs font-medium text-blue-700">السعة</div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {renderStars(service.rating)}
                    </div>
                    <div className="text-xs font-medium text-amber-700">
                      {service.reviewsCount} تقييم
                    </div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-gray-50 to-slate-100 p-4 text-center">
                    <div className="text-lg font-bold text-gray-700">{service.responseTime}</div>
                    <div className="text-xs font-medium text-gray-600">الاستجابة</div>
                  </div>
                </div>

                {/* الوصف */}
                <div className="mb-6">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                      <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    </span>
                    وصف الخدمة
                  </h3>
                  <p className="rounded-xl bg-gray-50 p-4 leading-relaxed text-gray-700">
                    {service.description || 'لا يوجد وصف متاح لهذه الخدمة.'}
                  </p>
                </div>

                {/* تفاصيل المركبة */}
                <div className="mb-6">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                      <TruckIcon className="h-5 w-5 text-blue-600" />
                    </span>
                    تفاصيل المركبة
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="text-xs font-medium text-gray-500">نوع المركبة</div>
                      <div className="mt-1 text-lg font-bold text-gray-900">
                        {translateVehicleType(service.vehicleType)}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="text-xs font-medium text-gray-500">السعة</div>
                      <div className="mt-1 text-lg font-bold text-gray-900">
                        {service.capacity} {parseInt(service.capacity) > 1 ? 'سيارات' : 'سيارة'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* الميزات */}
                {service.features && service.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      </span>
                      مميزات الخدمة
                    </h3>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {service.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-3"
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                            <CheckCircleIcon className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* مناطق التغطية - تصميم خريطة احترافي */}
                {service.coverageAreas && service.coverageAreas.length > 0 && (
                  <div className="mb-6">
                    <TransportRouteDisplay serviceAreas={service.coverageAreas} variant="full" />
                  </div>
                )}
              </div>

              {/* التقييمات والمراجعات */}
              <div className="mt-6 rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                    <StarIcon className="h-5 w-5 text-amber-600" />
                  </span>
                  التقييمات والمراجعات
                </h3>
                <ReviewsAndRatings
                  itemId={id as string}
                  itemType="transport"
                  itemTitle={service.title || 'خدمة نقل'}
                  targetUserId={service.providerId || ''}
                  showQuickRating={true}
                  showRatingStats={true}
                />
              </div>
            </div>

            {/* الشريط الجانبي */}
            <div className="lg:col-span-1">
              {/* إجراءات التواصل - أعلى الشريط الجانبي */}
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <PhoneIcon className="h-5 w-5 text-green-600" />
                  </span>
                  التواصل والحجز
                </h3>
                <div className="flex flex-col gap-3">
                  {/* زر طلب نقل */}
                  <Link
                    href={`/transport/request?providerId=${service.id}`}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 font-semibold text-white shadow-md transition-all duration-200 hover:bg-green-700 active:scale-95"
                  >
                    <TruckIcon className="h-5 w-5" />
                    طلب نقل
                  </Link>

                  {/* إظهار رقم الهاتف */}
                  <RevealPhoneButton
                    phone={service.phone}
                    size="lg"
                    fullWidth
                    ariaLabel="إظهار رقم الهاتف"
                  />

                  {/* مراسلة */}
                  <button
                    onClick={handleChatClick}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-600 bg-white px-4 font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    aria-label="مراسلة"
                    title="مراسلة"
                    type="button"
                  >
                    <ChatBubbleLeftIcon className="h-5 w-5" />
                    مراسلة
                  </button>
                </div>
              </div>
              {/* معلومات مقدم الخدمة */}
              <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                  </span>
                  مقدم الخدمة
                </h3>

                <div className="mb-4 flex items-center gap-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 p-4">
                  {service.providerImage ? (
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl ring-2 ring-blue-200">
                      <Image
                        src={service.providerImage}
                        alt={service.providerName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-600 shadow-lg">
                      <UserIcon className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-gray-900">{service.providerName}</h4>
                      {service.verified && (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          <ShieldCheckIcon className="h-3 w-3" />
                          موثق
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">مقدم خدمة نقل</p>
                    {service.completedTrips > 0 && (
                      <p className="mt-1 flex items-center gap-1 text-sm font-bold text-green-600">
                        <CheckCircleIcon className="h-4 w-4" />
                        {service.completedTrips} رحلة مكتملة
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <MapPinIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">الموقع</div>
                      <span className="font-semibold text-gray-800">{service.location}</span>
                    </div>
                  </div>
                </div>

                {/* ساعات العمل */}
                {service.workingHours && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                        <ClockIcon className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="font-bold text-amber-800">ساعات العمل</span>
                    </div>
                    <p className="mr-10 text-sm font-medium text-amber-700">
                      {service.workingHours}
                    </p>
                  </div>
                )}
              </div>

              {/* تمت ترقية إجراءات التواصل ونقلها للأعلى */}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TransportServiceDetailsPage;
