import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import HomeIcon from '@heroicons/react/24/outline/HomeIcon';
import { OpensooqNavbar } from '../components/common';

const ListingSuccessPage: React.FC = () => {
  const router = useRouter();

  // تأثير الاحتفال
  useEffect(() => {
    // يمكن إضافة تأثيرات بصرية هنا
    const timer = setTimeout(() => {
      // أي منطق إضافي
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const nextSteps = [
    {
      title: 'مشاركة الإعلان',
      description: 'شارك إعلانك مع الأصدقاء والعائلة',
      icon: ShareIcon,
      color: 'text-opensooq-blue',
      bgColor: 'bg-blue-50',
      action: 'مشاركة',
    },
    {
      title: 'متابعة الإعلان',
      description: 'تابع المشاهدات والاستفسارات',
      icon: EyeIcon,
      color: 'text-opensooq-blue',
      bgColor: 'bg-blue-50',
      action: 'متابعة',
    },
    {
      title: 'إضافة إعلان آخر',
      description: 'أضف المزيد من السيارات للبيع',
      icon: PlusIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: 'إضافة',
    },
  ];

  return (
    <>
      <Head>
        <title>تم نشر الإعلان بنجاح - سوق مزاد</title>
        <meta name="description" content="تم نشر إعلان سيارتك بنجاح" />
      </Head>

      <OpensooqNavbar />

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Success Animation */}
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex h-24 w-24 animate-bounce items-center justify-center rounded-full bg-blue-100">
              <CheckCircleIcon className="h-12 w-12 text-opensooq-blue" />
            </div>

            <h1 className="mb-4 text-4xl font-bold text-gray-900">[نجح] تم نشر إعلانك بنجاح!</h1>

            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              تهانينا! تم نشر إعلان سيارتك وسيظهر للمشترين المهتمين قريباً
            </p>
          </div>

          {/* Success Details */}
          <div className="mb-8 rounded-2xl bg-white p-8 shadow-lg">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Left Side - Info */}
              <div className="space-y-6">
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">ماذا يحدث الآن؟</h2>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-sm font-semibold text-opensooq-blue">1</span>
                      </div>
                      <div className="mr-3">
                        <h3 className="font-semibold text-gray-900">مراجعة الإعلان</h3>
                        <p className="text-sm text-gray-600">
                          سيتم مراجعة إعلانك من قبل فريقنا خلال 24 ساعة
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-sm font-semibold text-opensooq-blue">2</span>
                      </div>
                      <div className="mr-3">
                        <h3 className="font-semibold text-gray-900">نشر الإعلان</h3>
                        <p className="text-sm text-gray-600">
                          بعد الموافقة، سيظهر إعلانك للمشترين المهتمين
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                        <span className="text-sm font-semibold text-purple-600">3</span>
                      </div>
                      <div className="mr-3">
                        <h3 className="font-semibold text-gray-900">استقبال الاستفسارات</h3>
                        <p className="text-sm text-gray-600">
                          ستبدأ في استقبال اتصالات ورسائل من المشترين
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Tips */}
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                <h3 className="mb-4 text-lg font-bold text-opensooq-blue">
                  💡 نصائح لزيادة فرص البيع
                </h3>

                <ul className="space-y-3 text-sm text-opensooq-blue">
                  <li className="flex items-start">
                    <span className="mr-2 text-opensooq-blue">•</span>
                    رد على الاستفسارات بسرعة
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-opensooq-blue">•</span>
                    كن صادقاً في وصف حالة السيارة
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-opensooq-blue">•</span>
                    اسمح للمشترين بفحص السيارة
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-opensooq-blue">•</span>
                    حافظ على مرونة في التفاوض
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-8">
            <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">الخطوات التالية</h2>

            <div className="grid gap-6 md:grid-cols-3">
              {nextSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div
                      className={`h-12 w-12 ${step.bgColor} mb-4 flex items-center justify-center rounded-xl`}
                    >
                      <IconComponent className={`h-6 w-6 ${step.color}`} />
                    </div>

                    <h3 className="mb-2 font-semibold text-gray-900">{step.title}</h3>

                    <p className="mb-4 text-sm text-gray-600">{step.description}</p>

                    <button
                      className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${step.color.replace('text-', 'border-')} border hover:${step.bgColor}`}
                    >
                      {step.action}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/my-account/listings"
              className="flex items-center justify-center rounded-xl bg-opensooq-blue px-8 py-4 text-center font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <EyeIcon className="ml-2 h-5 w-5" />
              عرض إعلاناتي
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center rounded-xl border border-gray-300 px-8 py-4 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <HomeIcon className="ml-2 h-5 w-5" />
              العودة للرئيسية
            </Link>
          </div>

          {/* Contact Support */}
          <div className="mt-12 rounded-xl bg-gray-50 p-6 text-center">
            <h3 className="mb-2 font-semibold text-gray-900">تحتاج مساعدة؟</h3>
            <p className="mb-4 text-sm text-gray-600">فريق الدعم متاح لمساعدتك في أي وقت</p>
            <Link
              href="/help"
              className="text-sm font-medium text-opensooq-blue hover:text-blue-700"
            >
              تواصل مع الدعم
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListingSuccessPage;
