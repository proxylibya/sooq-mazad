import React from 'react';
import Link from 'next/link';
import WalletIcon from '@heroicons/react/24/outline/WalletIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';
import BanknotesIcon from '@heroicons/react/24/outline/BanknotesIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import GlobeAltIcon from '@heroicons/react/24/outline/GlobeAltIcon';
import UserPlusIcon from '@heroicons/react/24/outline/UserPlusIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';

const WalletLoginPrompt: React.FC = () => {
  return (
    <div className="wallet-page-content min-h-screen bg-gray-50 pb-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* رأس الصفحة */}
        <div className="mb-12 text-center">
          <div
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: '#3b82f6' }}
          >
            <WalletIcon className="h-12 w-12 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">المحفظة الإلكترونية</h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            إدارة أموالك بسهولة وأمان. شحن رصيدك، ادفع مقابل الخدمات، وتابع معاملاتك المالية في مكان
            واحد.
          </p>
        </div>

        {/* بطاقة دعوة التسجيل الرئيسية */}
        <div className="mb-8 rounded-2xl border bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">سجل دخولك للوصول إلى محفظتك</h2>
            <p className="text-gray-600">
              تحتاج إلى تسجيل الدخول أو إنشاء حساب جديد للاستفادة من جميع خدمات المحفظة الإلكترونية
            </p>
          </div>

          {/* أزرار التسجيل */}
          <div className="mx-auto mb-8 flex max-w-md flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="flex transform items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              style={{ backgroundColor: '#3b82f6' }}
            >
              <ArrowRightIcon className="h-5 w-5" />
              <span>تسجيل الدخول</span>
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl border bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              <UserPlusIcon className="h-5 w-5" />
              <span>إنشاء حساب جديد</span>
            </Link>
          </div>

          {/* رسالة أمان */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
            <ShieldCheckIcon className="mx-auto mb-2 h-6 w-6 text-blue-600" />
            <p className="font-medium text-blue-800">
              جميع معاملاتك محمية بأعلى معايير الأمان والتشفير
            </p>
          </div>
        </div>

        {/* مميزات المحفظة */}
        <div className="mb-8 grid grid-cols-1 gap-6">
          {/* شحن محلي */}
          <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: '#dbeafe' }}
            >
              <PhoneIcon className="h-6 w-6" style={{ color: '#3b82f6' }} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">شحن محلي سريع</h3>
            <p className="mb-4 text-gray-600">شحن فوري عبر كروت ليبيانا ومدار بدون رسوم إضافية</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: '#3b82f6' }}
                ></div>
                معالجة فورية
              </li>
              <li className="flex items-center gap-2">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: '#3b82f6' }}
                ></div>
                متاح 24/7
              </li>
              <li className="flex items-center gap-2">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: '#3b82f6' }}
                ></div>
                بدون رسوم
              </li>
            </ul>
          </div>

          {/* دفع دولي */}
          <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <CreditCardIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">وسائل دفع دولية</h3>
            <p className="mb-4 text-gray-600">ادعم محفظتك عبر فيزا، ماستركارد، وباي بال</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                فيزا وماستركارد
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                باي بال
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                تحويل بنكي
              </li>
            </ul>
          </div>

          {/* محافظ رقمية */}
          <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <GlobeAltIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">محافظ رقمية</h3>
            <p className="mb-4 text-gray-600">ادعم محفظتك بالعملات الرقمية مثل USDT</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                USDT (TRC-20)
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                تحويل سريع
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                رسوم منخفضة
              </li>
            </ul>
          </div>
        </div>

        {/* إحصائيات وأرقام */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center text-white">
          <h3 className="mb-6 text-2xl font-bold">انضم إلى آلاف المستخدمين الراضين</h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <div className="mb-2 text-3xl font-bold">15,000+</div>
              <div className="text-blue-100">مستخدم نشط</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold">50,000+</div>
              <div className="text-blue-100">معاملة ناجحة</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold">99.9%</div>
              <div className="text-blue-100">معدل الأمان</div>
            </div>
          </div>
        </div>

        {/* دعوة نهائية */}
        <div className="mt-8 text-center">
          <p className="mb-4 text-gray-600">هل لديك حساب بالفعل؟</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700"
          >
            <span>سجل دخولك الآن</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WalletLoginPrompt;
