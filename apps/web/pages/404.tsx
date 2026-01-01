import {
  ArrowRightIcon,
  BuildingStorefrontIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Custom404() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [shouldRedirect, setShouldRedirect] = useState(true);

  useEffect(() => {
    if (!shouldRedirect) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, shouldRedirect]);

  const quickLinks = [
    {
      icon: HomeIcon,
      title: 'الصفحة الرئيسية',
      description: 'العودة إلى الصفحة الرئيسية',
      href: '/',
      color: 'blue' as const,
    },
    {
      icon: MagnifyingGlassIcon,
      title: 'البحث',
      description: 'ابحث عن ما تريد',
      href: '/search',
      color: 'green' as const,
    },
    {
      icon: TruckIcon,
      title: 'المزادات',
      description: 'تصفح المزادات الحالية',
      href: '/auctions',
      color: 'purple' as const,
    },
    {
      icon: BuildingStorefrontIcon,
      title: 'المعارض',
      description: 'استعرض معارض السيارات',
      href: '/showrooms',
      color: 'orange' as const,
    },
  ];

  return (
    <>
      <Head>
        <title>404 - الصفحة غير موجودة | سوق المزاد</title>
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

              {/* رقم 404 الكبير */}
              <div className="relative z-10 py-8">
                <h1 className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-9xl font-black leading-none text-transparent md:text-[12rem]">
                  404
                </h1>
              </div>
            </div>
          </div>

          {/* العنوان والوصف */}
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              عذراً، الصفحة غير موجودة!
            </h2>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-600">
              يبدو أن الصفحة التي تبحث عنها قد تم نقلها أو حذفها، أو ربما لم تكن موجودة من الأساس.
            </p>

            {/* عداد إعادة التوجيه */}
            {shouldRedirect && countdown > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-6 py-3">
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600"></div>
                <p className="font-medium text-blue-700">
                  سيتم توجيهك للصفحة الرئيسية خلال {countdown} ثانية
                </p>
              </div>
            )}

            {/* زر إلغاء التوجيه */}
            {shouldRedirect && (
              <button
                onClick={() => setShouldRedirect(false)}
                className="mt-4 text-sm text-gray-500 underline hover:text-gray-700"
              >
                إلغاء التوجيه التلقائي
              </button>
            )}
          </div>

          {/* روابط سريعة */}
          <div className="mb-12">
            <h3 className="mb-6 text-center text-xl font-semibold text-gray-800">
              جرّب زيارة إحدى هذه الصفحات
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                const colorClasses = {
                  blue: 'bg-blue-500 group-hover:bg-blue-600',
                  green: 'bg-green-500 group-hover:bg-green-600',
                  purple: 'bg-purple-500 group-hover:bg-purple-600',
                  orange: 'bg-orange-500 group-hover:bg-orange-600',
                };

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group relative rounded-xl border-2 border-transparent bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`h-12 w-12 flex-shrink-0 ${colorClasses[link.color]} flex items-center justify-center rounded-lg transition-colors duration-300`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-1 font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                          {link.title}
                        </h4>
                        <p className="text-sm text-gray-600">{link.description}</p>
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-blue-600" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* زر العودة للصفحة الرئيسية */}
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

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </>
  );
}
