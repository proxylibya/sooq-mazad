import React from 'react';
import Link from 'next/link';
import BuildingLibraryIcon from '@heroicons/react/24/outline/BuildingLibraryIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';

const BankDepositInfo: React.FC = () => {
  const depositFeatures = [
    {
      icon: <ShieldCheckIcon className="h-6 w-6 text-blue-600" />,
      title: 'أمان عالي',
      description: 'تحويلات آمنة عبر البنوك المرخصة',
    },
    {
      icon: <ClockIcon className="h-6 w-6 text-blue-600" />,
      title: 'معالجة سريعة',
      description: '1-3 أيام عمل لتأكيد الإيداع',
    },
    {
      icon: <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />,
      title: 'رسوم منخفضة',
      description: '2% + 5 دينار ليبي فقط',
    },
    {
      icon: <BuildingLibraryIcon className="h-6 w-6 text-blue-600" />,
      title: 'بنوك معتمدة',
      description: 'جميع البنوك الليبية المرخصة',
    },
  ];

  const depositSteps = [
    'اختر البنك المناسب',
    'حدد مبلغ الإيداع',
    'قم بالتحويل البنكي',
    'انتظر تأكيد العملية',
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200">
          <BuildingLibraryIcon className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">الإيداع عبر البنوك المحلية</h2>
        <p className="text-gray-600">طريقة آمنة وموثوقة لإيداع الأموال في محفظتك</p>
      </div>

      {/* الميزات الرئيسية */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {depositFeatures.map((feature, index) => (
          <div key={index} className="flex items-start gap-4 rounded-xl bg-gray-50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm">
              {feature.icon}
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* خطوات العملية */}
      <div className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <InformationCircleIcon className="h-5 w-5 text-blue-600" />
          كيفية الإيداع
        </h3>
        <div className="space-y-3">
          {depositSteps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                {index + 1}
              </div>
              <span className="text-gray-700">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* معلومات الحدود والرسوم */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 font-semibold text-blue-900">حدود الإيداع</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <div>• الحد الأدنى: 50 دينار ليبي</div>
            <div>• الحد الأقصى: 50,000 دينار ليبي</div>
            <div>• إيداعات متعددة مسموحة</div>
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 font-semibold text-blue-900">الرسوم والأوقات</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <div>• الرسوم: 2% + 5 دينار ليبي</div>
            <div>• وقت المعالجة: 1-3 أيام عمل</div>
            <div>• متاح 24/7 للتحويل</div>
          </div>
        </div>
      </div>

      {/* تحذيرات مهمة */}
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-yellow-700">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span className="font-medium">ملاحظات مهمة</span>
        </div>
        <div className="space-y-1 text-sm text-yellow-600">
          <div>• تأكد من إدخال رقم المرجع الصحيح عند التحويل</div>
          <div>• احتفظ بإيصال التحويل البنكي لحين تأكيد العملية</div>
          <div>• في حالة التأخير، تواصل مع خدمة العملاء</div>
          <div>• التحويلات من حسابات أخرى غير مقبولة</div>
        </div>
      </div>

      {/* البنوك المدعومة */}
      <div className="mb-8 text-center">
        <h4 className="mb-4 font-semibold text-gray-900">البنوك المدعومة</h4>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            'المصرف الإسلامي الليبي',
            'مصرف التضامن',
            'مصرف الأمان',
            'مصرف الأندلس',
            'المصرف التجاري الوطني',
            'مصرف الوحدة',
          ].map((bank, index) => (
            <span key={index} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
              {bank}
            </span>
          ))}
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            +20 بنك آخر
          </span>
        </div>
      </div>

      {/* أزرار الإيداع */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href="/wallet/deposit/bank"
          className="group flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 text-white transition-all duration-200 hover:from-emerald-600 hover:to-green-700 hover:shadow-lg"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="font-semibold">إيداع بنكي</span>
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        </Link>

        <Link
          href="/wallet/topup/libyana"
          className="group flex items-center justify-center gap-3 rounded-xl border-2 border-blue-200 bg-blue-50 px-6 py-4 text-blue-700 transition-all duration-200 hover:border-blue-300 hover:bg-blue-100"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="font-semibold">كارت ليبيانا</span>
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        </Link>

        <Link
          href="/wallet/topup/madar"
          className="group flex items-center justify-center gap-3 rounded-xl border-2 border-orange-200 bg-orange-50 px-6 py-4 text-orange-700 transition-all duration-200 hover:border-orange-300 hover:bg-orange-100"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="font-semibold">كارت المدار</span>
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default BankDepositInfo;
