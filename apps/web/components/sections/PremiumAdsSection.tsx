import { DocumentTextIcon, MapPinIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import type { FeaturedAd } from '../../lib/featuredAds';

// استيراد بطاقة الإعلان المميز بشكل ديناميكي للحفاظ على تقسيم الحِزم
const FeaturedAdCard = dynamic(() => import('../FeaturedAdCard'), {
  loading: () => <div className="h-64 w-full animate-pulse rounded-2xl bg-gray-200" />,
});

interface PremiumAdsSectionProps {
  featuredAds: FeaturedAd[];
  adsLoading: boolean;
  adsError: string | null;
  refetchAds: () => void | Promise<void>;
}

export default function PremiumAdsSection({
  featuredAds,
  adsLoading,
  adsError,
  refetchAds,
}: PremiumAdsSectionProps) {
  return (
    <div className="mb-14 mt-12">
      {/* Header Section - Blue & Gold Design */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-800 shadow-2xl">
          <svg className="h-8 w-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <h2 className="mb-3 text-2xl font-bold text-gray-900 md:text-3xl">الإعلانات المميزة</h2>
        <div className="mx-auto mb-3 h-1 w-24 rounded-full bg-gradient-to-r from-blue-600 to-yellow-600"></div>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
          اكتشف أفضل العروض والخدمات المختارة خصيصاً لك
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-5 py-2 text-xs font-bold text-blue-800 shadow-md">
          <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500"></div>
          مساحات إعلانية مدفوعة
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* الإعلانات المميزة الديناميكية */}
        {adsLoading ? (
          <div className="col-span-full py-12 text-center">
            <div className="inline-flex items-center gap-2 text-blue-600">
              <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              جاري تحميل الإعلانات المميزة...
            </div>
          </div>
        ) : adsError ? (
          <div className="col-span-full py-12 text-center">
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
              <p className="mb-4 text-red-700">خطأ في تحميل الإعلانات: {adsError}</p>
              <button
                onClick={refetchAds}
                className="text-sm text-red-600 underline hover:text-red-800"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        ) : featuredAds && featuredAds.length > 0 ? (
          featuredAds.map((ad) => <FeaturedAdCard key={ad.id} ad={ad} />)
        ) : (
          // البطاقة الافتراضية إذا لم توجد إعلانات
          <div className="group relative transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
            <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
              <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              إعلان مميز
            </div>

            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              <div className="flex h-full items-center justify-center text-white">
                <div className="text-center">
                  <svg
                    className="mx-auto mb-3 h-10 w-10 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                  </svg>
                  <h3 className="text-lg font-bold">معرض الأمان للسيارات</h3>
                  <p className="mt-1 text-xs opacity-90">أفضل السيارات بأسعار تنافسية</p>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-yellow-400">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-bold">4.9</span>
                </div>
                <span className="text-xs text-blue-200">منذ 2010</span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                عروض حصرية على السيارات الفاخرة
              </h3>
              <div className="mb-3 rounded-xl border border-yellow-200 bg-gradient-to-r from-blue-50 to-yellow-50 p-3">
                <p className="mb-1 text-xs text-gray-600">خصم يصل إلى</p>
                <p className="text-xl font-bold text-blue-700">
                  25% <span className="text-sm text-yellow-600">على جميع الموديلات</span>
                </p>
              </div>
              <div className="mb-3 flex items-center gap-2 text-gray-600">
                <MapPinIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">طرابلس - شارع الجمهورية</span>
              </div>
              <div className="flex gap-3">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-2.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  اتصل الآن
                </button>
                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 py-2.5 text-sm font-bold text-blue-700 transition-all duration-200 hover:border-blue-300 hover:bg-blue-100">
                  <DocumentTextIcon className="h-4 w-4" />
                  التفاصيل
                </button>
              </div>
            </div>
          </div>
        )}

        {/* البطاقة الثانية - مساحة إعلانية متاحة */}
        <div className="group relative transform overflow-hidden rounded-2xl border-4 border-dashed border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-100 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
          <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-600 to-amber-700 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            مساحة متاحة
          </div>

          <div className="relative h-40 overflow-hidden bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <div className="flex h-full items-center justify-center text-white">
              <div className="text-center">
                <svg
                  className="mx-auto mb-3 h-10 w-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
                <h3 className="text-lg font-bold">مساحة إعلانية مميزة</h3>
                <p className="mt-1 text-xs opacity-90">اعلن هنا واصل لآلاف العملاء</p>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-bold">وصول مضمون</span>
              </div>
              <span className="text-xs text-yellow-100">موقع مميز</span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="mb-2 text-lg font-bold text-gray-900">اعلن معنا الآن</h3>
            <div className="mb-3 rounded-xl border border-amber-200 bg-gradient-to-r from-yellow-50 to-amber-50 p-3">
              <p className="mb-1 text-xs text-gray-600">أسعار تبدأ من</p>
              <p className="text-xl font-bold text-yellow-700">
                150 <span className="text-sm text-amber-600">د.ل/شهر</span>
              </p>
            </div>
            <div className="mb-3 flex items-center gap-2 text-gray-600">
              <svg className="h-4 w-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium">وصول لأكثر من 10,000 زائر شهرياً</span>
            </div>
            <div className="flex gap-3">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-700 py-2.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:from-yellow-700 hover:to-amber-800 hover:shadow-xl">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                احجز الآن
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-yellow-200 bg-yellow-50 py-2.5 text-sm font-bold text-yellow-700 transition-all duration-200 hover:border-yellow-300 hover:bg-yellow-100">
                <DocumentTextIcon className="h-4 w-4" />
                الأسعار
              </button>
            </div>
          </div>
        </div>

        {/* البطاقة الثالثة - مساحة إعلانية أخرى */}
        <div className="group relative transform overflow-hidden rounded-2xl border-4 border-dashed border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
          <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            مساحة VIP
          </div>

          <div className="relative h-40 overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <div className="flex h-full items-center justify-center text-white">
              <div className="text-center">
                <svg
                  className="mx-auto mb-3 h-10 w-10 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <h3 className="text-lg font-bold">مساحة إعلانية VIP</h3>
                <p className="mt-1 text-xs opacity-90">أقصى انتشار وأفضل النتائج</p>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-400">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-bold">أولوية عالية</span>
              </div>
              <span className="text-xs text-blue-200">موقع استراتيجي</span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="mb-2 text-lg font-bold text-gray-900">إعلان مميز VIP</h3>
            <div className="mb-3 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
              <p className="mb-1 text-xs text-gray-600">باقة VIP تبدأ من</p>
              <p className="text-xl font-bold text-blue-700">
                300 <span className="text-sm text-indigo-600">د.ل/شهر</span>
              </p>
            </div>
            <div className="mb-4 flex items-center gap-3 text-gray-600">
              <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
