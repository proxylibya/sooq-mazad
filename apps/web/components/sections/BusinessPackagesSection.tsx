import {
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';

const BusinessPackagesSection: React.FC = () => {
  return (
    <>
      {/* Business Advertisement Packages Section */}
      <div className="mb-10 mt-12 rounded-2xl bg-gray-50 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-bold text-gray-900 md:text-3xl">
              <span className="inline-flex items-center gap-3">
                <BriefcaseIcon className="h-7 w-7 text-blue-600" />
                الحزم الإعلانية للشركات
                <BriefcaseIcon className="h-7 w-7 text-blue-600" />
              </span>
            </h2>
            <p className="text-base text-gray-600 md:text-lg">حلول إعلانية متكاملة لتنمية أعمالك</p>
          </div>

          <div className="mb-10">
            <div className="rounded-xl border border-blue-200 bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                <BriefcaseIcon className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">اعلن عن نشاطك معنا</h3>
              <p className="mx-auto mb-6 max-w-3xl text-sm text-gray-600 md:text-base">
                إذا عندك متجر، موقع، شركة، أو خدمة وتبي توصل لعملاء أكثر، تقدر تتواصل معنا ونجهز لك
                إعلان مناسب داخل المنصة حسب هدفك وميزانيتك.
              </p>

              <div className="mx-auto max-w-3xl">
                <ul className="mb-6 space-y-3 text-right text-sm md:text-base">
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    <span>إعلانات لمتجرك أو شركتك داخل صفحات السوق والمزادات</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    <span>بنرات لرفع الظهور واستهداف الزوار المهتمين</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    <span>فيديوهات ترويجية قصيرة لزيادة التفاعل</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    <span>خطة شهرية أو موسمية حسب طبيعة نشاطك</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    <span>متابعة وتوصيات لتحسين النتائج</span>
                  </li>
                </ul>
              </div>
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
    </>
  );
};

export default BusinessPackagesSection;
