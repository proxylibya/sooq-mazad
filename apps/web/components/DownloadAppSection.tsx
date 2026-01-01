import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import React from 'react';

import QRCodeGenerator from './QRCodeGenerator';

interface DownloadAppSectionProps {
  className?: string;
}

type StoreLink = {
  id: 'appgallery' | 'google-play' | 'app-store';
  href: string;
  ariaLabel: string;
  badge: string;
  title: string;
  accentClassName: string;
  ringClassName: string;
};

const STORE_LINKS: StoreLink[] = [
  {
    id: 'appgallery',
    href: 'https://url.cloud.huawei.com/ivs4lIZ5ny?shareTo=qrcode',
    ariaLabel: 'تحميل التطبيق من App Gallery',
    badge: 'متوفر على',
    title: 'AppGallery',
    accentClassName: 'from-red-600 to-orange-600',
    ringClassName: 'focus-visible:ring-red-400',
  },
  {
    id: 'google-play',
    href: 'https://play.google.com/store/apps/details?id=com.opensooq.OpenSooq&referrer=utm_source%3Dopensooq%26utm_medium%3Ddesktop%26utm_campaign%3DDesktop-Footer',
    ariaLabel: 'تحميل التطبيق من Google Play',
    badge: 'احصل عليه من',
    title: 'Google Play',
    accentClassName: 'from-emerald-600 to-blue-600',
    ringClassName: 'focus-visible:ring-emerald-400',
  },
  {
    id: 'app-store',
    href: 'https://apps.apple.com/app/apple-store/id654456967?pt=28744801&ct=Desktop-Footer&mt=8',
    ariaLabel: 'تحميل التطبيق من App Store',
    badge: 'تحميل من',
    title: 'App Store',
    accentClassName: 'from-blue-600 to-indigo-700',
    ringClassName: 'focus-visible:ring-blue-400',
  },
];

function StoreButton({ link }: { link: StoreLink }) {
  return (
    <a
      href={link.href}
      aria-label={link.ariaLabel}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative inline-flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 ${link.ringClassName} focus-visible:ring-offset-2`}
    >
      <span
        className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${link.accentClassName} opacity-0 transition-opacity duration-200 group-hover:opacity-10`}
        aria-hidden="true"
      />
      <span className="min-w-0 text-right">
        <span className="block text-xs text-gray-600">{link.badge}</span>
        <span className="block truncate text-sm font-semibold text-gray-900">{link.title}</span>
      </span>
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-900/5 text-gray-900 transition-colors duration-200 group-hover:bg-gray-900/10">
        <ArrowDownTrayIcon className="h-5 w-5" />
      </span>
    </a>
  );
}

const DownloadAppSection: React.FC<DownloadAppSectionProps> = ({ className = '' }) => {
  return (
    <section
      className={`relative overflow-hidden border-t border-gray-200 bg-gradient-to-b from-orange-50 via-white to-blue-50 ${className}`}
    >
      {/* Background Decorations */}
      <div className="pointer-events-none absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute left-10 top-10 h-20 w-20 rounded-full bg-orange-300 blur-xl"></div>
        <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-blue-300 blur-xl"></div>
        <div className="absolute left-1/3 top-1/2 h-16 w-16 rounded-full bg-green-300 blur-lg"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* النص الرئيسي وأزرار التحميل */}
          <div className="text-center lg:order-1 lg:col-span-6 lg:text-right">
            <div className="mb-8">
              <h2 className="mb-3 text-2xl font-bold text-gray-900 lg:text-4xl">
                حمل تطبيق <span className="text-orange-600">مزاد السيارات</span>
              </h2>
              <p className="mb-5 text-sm text-gray-600 lg:text-base">
                مزايدات وإعلانات أسرع، تنبيهات فورية، وتجربة شراء وبيع أسهل من هاتفك.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-start gap-2 rounded-2xl border border-white/60 bg-white/70 p-3 shadow-sm backdrop-blur">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                  <div className="min-w-0 text-right">
                    <div className="text-sm font-semibold text-gray-900">تنبيهات فورية</div>
                    <div className="text-xs text-gray-600">تابع المزايدات لحظة بلحظة</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-2xl border border-white/60 bg-white/70 p-3 shadow-sm backdrop-blur">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                  <div className="min-w-0 text-right">
                    <div className="text-sm font-semibold text-gray-900">تصفح أسرع</div>
                    <div className="text-xs text-gray-600">واجهة خفيفة وتجربة مريحة</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-2xl border border-white/60 bg-white/70 p-3 shadow-sm backdrop-blur">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                  <div className="min-w-0 text-right">
                    <div className="text-sm font-semibold text-gray-900">مجانا بالكامل</div>
                    <div className="text-xs text-gray-600">حمّل التطبيق وابدأ مباشرة</div>
                  </div>
                </div>
              </div>
            </div>

            {/* أزرار التحميل */}
            <div className="mx-auto grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:justify-items-start">
              {STORE_LINKS.map((link) => (
                <StoreButton key={link.id} link={link} />
              ))}
            </div>
          </div>

          {/* قسم كود QR */}
          <div className="order-2 flex flex-col items-center gap-4 sm:order-2 lg:order-2 lg:col-span-3">
            <p className="inline-flex items-center gap-2 text-base font-medium text-gray-700">
              <QrCodeIcon className="h-5 w-5 text-gray-700" />
              امسح الكود
            </p>
            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center justify-center rounded-xl bg-white p-2 shadow-inner">
                <QRCodeGenerator
                  value={
                    STORE_LINKS[0]?.href ?? 'https://url.cloud.huawei.com/ivs4lIZ5ny?shareTo=qrcode'
                  }
                  size={176}
                  className="rounded-xl"
                  errorCorrectionLevel="M"
                  margin={2}
                  lazy
                />
              </div>
            </div>
            <p className="text-center text-xs text-gray-600">
              افتح كاميرا هاتفك وامسح الكود للتحميل
            </p>
          </div>

          {/* صورة الهاتف للشاشات الكبيرة */}
          <div className="hidden lg:order-3 lg:col-span-3 lg:block">
            <div className="relative">
              {/* Background Shape */}
              <div className="absolute inset-0 rotate-12 transform rounded-3xl bg-gradient-to-br from-orange-200 via-blue-200 to-indigo-300 opacity-50"></div>

              {/* Phone Container */}
              <div className="relative flex h-56 w-80 items-center justify-center">
                {/* Phone Mockup */}
                <div className="h-72 w-40 -rotate-12 transform rounded-3xl bg-gray-900 p-2 shadow-2xl">
                  <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white">
                    {/* Phone Notch */}
                    <div className="flex h-6 items-center justify-center rounded-t-2xl bg-gray-900">
                      <div className="h-1 w-16 rounded-full bg-gray-700"></div>
                    </div>

                    {/* Phone Screen */}
                    <div className="flex-1 bg-gradient-to-b from-orange-500 via-blue-500 to-indigo-600 p-4">
                      <div className="mt-8 text-center text-white">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white">
                          <DevicePhoneMobileIcon className="h-6 w-6 text-orange-500" />
                        </div>
                        <div className="text-sm font-bold">مزاد السيارات</div>
                        <div className="mt-1 text-xs opacity-90">مزاد السيارات</div>

                        {/* App Interface Elements */}
                        <div className="mt-6 space-y-2">
                          <div className="mx-4 h-2 rounded bg-white bg-opacity-30"></div>
                          <div className="mx-6 h-2 rounded bg-white bg-opacity-20"></div>
                          <div className="mx-2 h-2 rounded bg-white bg-opacity-25"></div>
                        </div>
                      </div>
                    </div>

                    {/* Phone Bottom */}
                    <div className="flex h-8 items-center justify-center rounded-b-2xl bg-gray-100">
                      <div className="h-1 w-12 rounded-full bg-gray-400"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* صورة هاتف مبسطة للشاشات الصغيرة */}
          <div className="order-3 sm:order-3 lg:hidden">
            <div className="flex items-center justify-center py-8">
              <div className="h-40 w-24 rounded-2xl bg-gray-800 p-1 shadow-xl">
                <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-gradient-to-b from-orange-400 to-blue-500">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white">
                    <DevicePhoneMobileIcon className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="text-center text-xs font-bold text-white">
                    <div>مزاد السيارات</div>
                    <div className="text-xs opacity-80">مزاد السيارات</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadAppSection;
