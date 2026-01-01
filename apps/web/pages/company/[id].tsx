import RevealPhoneButton from '@/components/common/ui/buttons/RevealPhoneButton';
import {
  BuildingOfficeIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  HeartIcon,
  MapPinIcon,
  PhoneIcon,
  ShareIcon,
  StarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Layout } from '../../components/common';
import ReviewsAndRatings from '../../components/common/ReviewsAndRatings';

interface CompanyData {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  phone: string;
  email?: string;
  website?: string;
  logo?: string;
  images: string[];
  services: string[];
  workingHours: string;
  established: string;
  employees: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  ownerId: string;
  createdAt: string;
}

const CompanyDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // جلب بيانات الشركة
  useEffect(() => {
    if (!id) return;

    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/companies/${id}`);

        if (!response.ok) {
          throw new Error('فشل في جلب بيانات الشركة');
        }

        const data = await response.json();

        if (data.success && data.data) {
          setCompany(data.data);
        } else {
          setError(data.error || 'الشركة غير موجودة');
        }
      } catch (err) {
        console.error('خطأ في جلب بيانات الشركة:', err);
        setError('حدث خطأ في تحميل بيانات الشركة');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [id]);

  // تم إزالة spinner التحميل - UnifiedPageTransition يتولى ذلك
  if (loading) return null;

  // عرض حالة الخطأ
  if (error || !company) {
    return (
      <Layout title="خطأ">
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mb-4 text-6xl text-red-500">⚠️</div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">الشركة غير موجودة</h1>
            <p className="mb-6 text-gray-600">{error}</p>
            <Link
              href="/companies"
              className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              العودة للشركات
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

  return (
    <Layout title={company.name}>
      <Head>
        <title>{company.name} - دليل الشركات</title>
        <meta name="description" content={`${company.name} - ${company.description}`} />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          {/* شريط التنقل */}
          <nav className="mb-6 flex text-sm">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              الرئيسية
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link href="/companies" className="text-blue-600 hover:text-blue-800">
              الشركات
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">{company.name}</span>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* المحتوى الرئيسي */}
            <div className="lg:col-span-2">
              {/* معرض الصور */}
              {company.images && company.images.length > 0 && (
                <div className="mb-6 overflow-hidden rounded-xl bg-white shadow-sm">
                  <div className="relative">
                    <img
                      src={
                        company.images[activeImageIndex] || '/images/companies/default-company.jpg'
                      }
                      alt={company.name}
                      className="h-64 w-full object-cover"
                    />

                    {company.images.length > 1 && (
                      <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 text-sm text-white">
                        {activeImageIndex + 1} / {company.images.length}
                      </div>
                    )}
                  </div>

                  {company.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto p-4">
                      {company.images.map((image, index) => (
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

              {/* معلومات الشركة */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100">
                        <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{company.category}</span>
                        {company.verified && (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" title="شركة موثقة" />
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

                {/* التقييم */}
                {company.rating > 0 && (
                  <div className="mb-4 flex items-center gap-2">
                    {renderStars(company.rating)}
                    <span className="text-sm text-gray-600">
                      {company.rating.toFixed(1)} ({company.reviewsCount} تقييم)
                    </span>
                  </div>
                )}

                {/* الوصف */}
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">نبذة عن الشركة</h3>
                  <p className="leading-relaxed text-gray-700">{company.description}</p>
                </div>

                {/* الخدمات */}
                {company.services && company.services.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">الخدمات المقدمة</h3>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {company.services.map((service, index) => (
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

                {/* معلومات إضافية */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {company.established && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4" />
                      <span>تأسست في: {company.established}</span>
                    </div>
                  )}
                  {company.employees && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserIcon className="h-4 w-4" />
                      <span>عدد الموظفين: {company.employees}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* الشريط الجانبي */}
            <div className="lg:col-span-1">
              {/* معلومات الاتصال */}
              <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">معلومات الاتصال</h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{company.location}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <RevealPhoneButton phone={company.phone} fullWidth={false} size="md" />
                  </div>

                  {company.email && (
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      <a
                        href={`mailto:${company.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {company.email}
                      </a>
                    </div>
                  )}

                  {company.website && (
                    <div className="flex items-center gap-3">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                      <a
                        href={company.website}
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
                {company.workingHours && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <ClockIcon className="h-4 w-4" />
                      <span>ساعات العمل</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{company.workingHours}</p>
                  </div>
                )}

                {/* أزرار الإجراء */}
                <div className="mt-6 space-y-3">
                  <RevealPhoneButton
                    phone={company.phone}
                    size="lg"
                    fullWidth
                    ariaLabel="إظهار رقم الهاتف"
                  />

                  <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50">
                    <ChatBubbleLeftIcon className="h-5 w-5" />
                    إرسال رسالة
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* قسم التقييمات والمراجعات */}
          <div className="mt-8">
            <ReviewsAndRatings
              itemId={id as string}
              itemType="company"
              itemTitle={company.name || 'شركة'}
              targetUserId={company.ownerId || ''}
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

export default CompanyDetailsPage;
