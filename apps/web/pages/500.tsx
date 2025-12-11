import {
  ArrowPathIcon,
  ArrowRightIcon,
  HomeIcon,
  PhoneIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';

export default function Custom500() {
  return (
    <>
      <Head>
        <title>500 - خطأ في الخادم | سوق المزاد</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-12">
        <div className="w-full max-w-4xl">
          {/* رسم توضيحي متحرك */}
          <div className="mb-8 text-center">
            <div className="relative inline-block">
              {/* دوائر متحركة في الخلفية */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-64 w-64 animate-pulse rounded-full bg-blue-100 opacity-20"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-48 w-48 animate-ping rounded-full bg-blue-200 opacity-10"></div>
              </div>

              {/* رقم 500 الكبير */}
              <div className="relative z-10 py-8">
                <h1 className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-9xl font-black leading-none text-transparent md:text-[12rem]">
                  500
                </h1>
              </div>
            </div>
          </div>

          {/* العنوان والوصف */}
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              عذراً، حدث خطأ في الخادم!
            </h2>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-600">
              نحن نعمل على حل هذه المشكلة في أسرع وقت ممكن. يرجى المحاولة مرة أخرى بعد قليل.
            </p>

            {/* أيقونة الإصلاح */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-6 py-3">
              <WrenchScrewdriverIcon className="h-5 w-5 animate-pulse text-blue-600" />
              <p className="font-medium text-blue-700">فريقنا التقني يعمل على حل المشكلة</p>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="mb-12">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* إعادة تحميل */}
              <button
                onClick={() => window.location.reload()}
                className="group relative rounded-xl border-2 border-transparent bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500 transition-colors duration-300 group-hover:bg-blue-600">
                    <ArrowPathIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="mb-1 font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                      إعادة المحاولة
                    </h4>
                    <p className="text-sm text-gray-600">تحديث الصفحة الحالية</p>
                  </div>
                </div>
              </button>

              {/* الصفحة الرئيسية */}
              <Link
                href="/"
                className="group relative rounded-xl border-2 border-transparent bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-500 transition-colors duration-300 group-hover:bg-green-600">
                    <HomeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="mb-1 font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                      الصفحة الرئيسية
                    </h4>
                    <p className="text-sm text-gray-600">العودة للصفحة الرئيسية</p>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-blue-600" />
                </div>
              </Link>

              {/* الصفحة السابقة */}
              <button
                onClick={() => window.history.back()}
                className="group relative rounded-xl border-2 border-transparent bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-purple-500 transition-colors duration-300 group-hover:bg-purple-600">
                    <ArrowRightIcon className="h-6 w-6 rotate-180 text-white" />
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="mb-1 font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                      الصفحة السابقة
                    </h4>
                    <p className="text-sm text-gray-600">العودة للصفحة السابقة</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* زر العودة للصفحة الرئيسية الرئيسي */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex transform items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-blue-600 hover:shadow-xl"
            >
              <HomeIcon className="h-5 w-5" />
              <span>العودة للصفحة الرئيسية</span>
            </Link>
          </div>

          {/* معلومات المساعدة */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-6 py-3">
              <PhoneIcon className="h-5 w-5 text-gray-600" />
              <p className="text-gray-700">
                هل تحتاج مساعدة؟{' '}
                <Link
                  href="/contact"
                  className="font-medium text-blue-600 underline hover:text-blue-700"
                >
                  تواصل معنا
                </Link>
              </p>
            </div>
          </div>

          {/* معلومات الخطأ */}
          <div className="mt-8 text-center">
            <div className="inline-flex flex-col items-center gap-1 rounded-lg bg-gray-100 px-6 py-4 text-sm text-gray-500">
              <p>كود الخطأ: 500 - خطأ داخلي في الخادم</p>
              <p>
                الوقت: {typeof window !== 'undefined' ? new Date().toLocaleString('ar-SA') : '---'}
              </p>
            </div>
          </div>

          {/* شريط الديكور السفلي */}
          <div className="mt-16 flex justify-center gap-2">
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400"></div>
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-blue-600"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
}
