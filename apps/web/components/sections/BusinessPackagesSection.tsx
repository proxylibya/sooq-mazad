import React, { useState } from 'react';
import Link from 'next/link';
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
  BuildingOfficeIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';

const BusinessPackagesSection: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Business Advertisement Packages Section */}
      <div className="mb-12 mt-16 rounded-2xl bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-bold text-gray-900 md:text-3xl">
              <span className="inline-flex items-center gap-3">
                <BriefcaseIcon className="h-8 w-8 text-blue-600" />
                الحزم الإعلانية للشركات
                <BriefcaseIcon className="h-8 w-8 text-blue-600" />
              </span>
            </h2>
            <p className="text-base text-gray-600 md:text-lg">حلول إعلانية متكاملة لتنمية أعمالك</p>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Bronze Package */}
            <div className="border-3 relative rounded-xl border-blue-400 bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white">
                البرونزية
              </div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">الحزمة البرونزية</h3>
              <div className="mb-4 text-2xl font-bold text-blue-600">
                300-500 د.ل<span className="text-sm text-gray-500">/شهر</span>
              </div>
              <ul className="mb-6 space-y-3 text-right text-sm">
                <li className="flex items-center gap-3">
                  <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>بطاقة مميزة واحدة</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>أولوية في نتائج البحث</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>شارة &quot;موثق&quot;</span>
                </li>
              </ul>
              <Link
                href="/advertising-contact?package=bronze"
                className="block w-full rounded-lg bg-blue-500 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-600"
              >
                اختر البرونزية
              </Link>
            </div>

            {/* Silver Package - Highlighted */}
            <div className="border-3 relative scale-105 transform rounded-xl border-gray-400 bg-white p-6 text-center shadow-lg transition-all hover:shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform rounded-full bg-gray-500 px-3 py-1 text-xs font-bold text-white">
                الأكثر شعبية
              </div>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-7 w-7 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">الحزمة الفضية</h3>
              <div className="mb-4 text-2xl font-bold text-gray-600">
                800-1200 د.ل<span className="text-sm text-gray-500">/شهر</span>
              </div>
              <ul className="mb-6 space-y-3 text-right text-sm">
                <li className="flex items-center gap-3">
                  <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>3 بطاقات مميزة</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>بنرات جانبية</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>صفحة شركة مبسطة</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>إحصائيات مفصلة</span>
                </li>
              </ul>
              <Link
                href="/advertising-contact?package=silver"
                className="block w-full rounded-lg bg-gray-500 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-gray-600"
              >
                اختر الفضية
              </Link>
            </div>

            {/* Gold Package */}
            <div className="border-3 relative rounded-xl border-yellow-400 bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-white">
                الذهبية
              </div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">الحزمة الذهبية</h3>
              <div className="mb-4 text-2xl font-bold text-yellow-600">
                1500-2500 د.ل<span className="text-sm text-gray-500">/شهر</span>
              </div>
              <ul className="mb-6 space-y-3 text-right text-sm">
                <li className="flex items-center gap-3">
                  <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>بنر رئيسي مميز</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>5 بطاقات مميزة</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>صفحة شركة كاملة</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>فيديوهات ترويجية</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>خصم 20% للاشتراك السنوي</span>
                </li>
              </ul>
              <Link
                href="/advertising-contact?package=gold"
                className="block w-full rounded-lg bg-yellow-500 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-yellow-600"
              >
                اختر الذهبية
              </Link>
            </div>
          </div>

          {/* Contact Support Buttons */}
          <div className="flex flex-col justify-center gap-6 sm:flex-row">
            <Link
              href="/advertising-contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              تواصل مع الدعم
            </Link>
            <Link
              href="/advertising-contact?type=team"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-700"
            >
              <EnvelopeIcon className="h-5 w-5" />
              مراسلة فريق الموقع
            </Link>
          </div>
        </div>
      </div>

      {/* Advanced Business Services - Collapsible */}
      <div className="mb-12 mt-16">
        <div className="overflow-hidden rounded-xl border border-emerald-400 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          {/* Header */}
          <div
            className="cursor-pointer p-4 transition-all duration-300 hover:bg-white hover:bg-opacity-10"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white bg-opacity-20 p-2">
                  <BriefcaseIcon className="h-6 w-6 text-yellow-300" />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-lg font-bold md:text-xl">الخدمات التجارية المتقدمة</h3>
                    <span className="rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-emerald-800">
                      للشركات فقط
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 md:text-sm">
                    حلول إعلانية احترافية مخصصة للشركات والمؤسسات التجارية
                  </p>
                  <p className="mt-1 text-xs font-semibold text-yellow-300">
                    <StarIcon className="mr-1 inline h-3 w-3" />
                    خدمات حصرية للشركات المسجلة والمؤسسات التجارية
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-sm font-medium text-yellow-300 md:block">
                  {expanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                </span>
                {expanded ? (
                  <ChevronUpIcon className="h-5 w-5 text-yellow-300 transition-transform duration-300" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-yellow-300 transition-transform duration-300" />
                )}
              </div>
            </div>
          </div>

          {/* Expandable Content */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              expanded ? 'max-h-screen opacity-100' : 'max-h-0 overflow-hidden opacity-0'
            }`}
          >
            <div className="px-4 pb-4">
              <div className="border-t border-emerald-400 border-opacity-30 pt-4">
                <div className="mb-4 rounded-lg bg-emerald-800 bg-opacity-30 p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-yellow-300">
                    <BuildingOfficeIcon className="h-4 w-4" />
                    <span>متطلبات الاشتراك: سجل تجاري ساري المفعول + ترخيص مزاولة النشاط</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {/* Company Pages */}
                  <div className="rounded-lg border border-emerald-400 border-opacity-30 bg-white bg-opacity-15 p-4 transition-all duration-300 hover:bg-opacity-20">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="rounded-lg bg-emerald-500 p-1.5">
                        <BuildingOfficeIcon className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="text-lg font-bold">صفحات الشركات المدفوعة</h4>
                    </div>
                    <ul className="mb-3 space-y-2 text-sm text-emerald-100">
                      <li className="flex items-center gap-3">
                        <CheckCircleIcon className="h-3 w-3 flex-shrink-0 text-yellow-300" />
                        صفحة كاملة مخصصة للشركة
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircleIcon className="h-3 w-3 flex-shrink-0 text-yellow-300" />
                        معرض صور احترافي
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircleIcon className="h-3 w-3 flex-shrink-0 text-yellow-300" />
                        معلومات تفصيلية ومواقع
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircleIcon className="h-3 w-3 flex-shrink-0 text-yellow-300" />
                        تصميم مخصص حسب الطلب
                      </li>
                    </ul>
                    <div className="mb-2 text-lg font-bold text-yellow-300">1000-2000 د.ل/شهر</div>
                    <Link
                      href="/advertising-contact?package=company-page"
                      className="block w-full rounded-lg bg-yellow-400 px-4 py-2 text-center text-sm font-medium text-emerald-800 transition-colors duration-300 hover:bg-yellow-300 hover:shadow-lg"
                    >
                      طلب صفحة شركة
                    </Link>
                  </div>

                  {/* Video Ads */}
                  <div className="rounded-lg border border-emerald-400 border-opacity-30 bg-white bg-opacity-15 p-4 transition-all duration-300 hover:bg-opacity-20">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="rounded-lg bg-emerald-500 p-1.5">
                        <VideoCameraIcon className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="text-lg font-bold">الإعلانات المرئية والصوتية</h4>
                    </div>
                    <ul className="mb-3 space-y-2 text-sm text-emerald-100">
                      <li className="flex items-center gap-3">
                        <CheckCircleIcon className="h-3 w-3 flex-shrink-0 text-yellow-300" />
                        فيديوهات قصيرة (15-30 ثانية)
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircleIcon className="h-3 w-3 flex-shrink-0 text-yellow-300" />
                        عرض بين المحتوى
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircleIcon className="h-3 w-3 flex-shrink-0 text-yellow-300" />
                        تصميم احترافي
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircleIcon className="h-3 w-3 flex-shrink-0 text-yellow-300" />
                        استهداف جغرافي دقيق
                      </li>
                    </ul>
                    <div className="mb-2 text-lg font-bold text-yellow-300">500-1000 د.ل/شهر</div>
                    <Link
                      href="/advertising-contact?package=video-ad"
                      className="block w-full rounded-lg bg-yellow-400 px-4 py-2 text-center text-sm font-medium text-emerald-800 transition-colors duration-300 hover:bg-yellow-300 hover:shadow-lg"
                    >
                      طلب إعلان مرئي
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BusinessPackagesSection;
