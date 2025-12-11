import React from 'react';
import Image from 'next/image';

interface DownloadAppSectionProps {
  className?: string;
}

const DownloadAppSection: React.FC<DownloadAppSectionProps> = ({ className = '' }) => {
  return (
    <section
      className={`relative overflow-hidden border-t border-gray-200 bg-gradient-to-r from-orange-50 via-white to-blue-50 ${className}`}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-10 top-10 h-20 w-20 rounded-full bg-orange-300 blur-xl"></div>
        <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-blue-300 blur-xl"></div>
        <div className="absolute left-1/3 top-1/2 h-16 w-16 rounded-full bg-green-300 blur-lg"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
          {/* النص الرئيسي وأزرار التحميل */}
          <div className="flex-1 text-center lg:order-1 lg:text-right">
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-800 lg:text-4xl">
                <span className="text-orange-600">أسرع</span> -{' '}
                <span className="text-blue-600">أسهل</span> -{' '}
                <span className="text-green-600">مجانا</span>
              </h2>
              <p className="mb-2 text-xl font-bold text-gray-800 lg:text-2xl">
                حمل تطبيق مزاد السيارات مجانا
              </p>
              <p className="text-sm text-gray-600 lg:text-base">
                اكتشف أفضل العروض واشتري وبع بسهولة من هاتفك
              </p>
            </div>

            {/* أزرار التحميل */}
            <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
              {/* App Gallery */}
              <a
                href="https://url.cloud.huawei.com/ivs4lIZ5ny?shareTo=qrcode"
                aria-label="تحميل التطبيق من App Gallery"
                className="inline-block shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex h-[51px] w-[177px] items-center gap-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2">
                  <div className="flex-1 text-right text-white">
                    <div className="text-xs opacity-90">متوفر على</div>
                    <div className="text-sm font-bold">AppGallery</div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                    <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                </div>
              </a>

              {/* Google Play */}
              <a
                href="https://play.google.com/store/apps/details?id=com.opensooq.OpenSooq&referrer=utm_source%3Dopensooq%26utm_medium%3Ddesktop%26utm_campaign%3DDesktop-Footer"
                aria-label="تحميل التطبيق من Google Play"
                className="inline-block shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex h-[51px] w-[177px] items-center gap-3 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 px-4 py-2">
                  <div className="flex-1 text-right text-white">
                    <div className="text-xs opacity-90">احصل عليه من</div>
                    <div className="text-sm font-bold">Google Play</div>
                  </div>
                  <div className="h-8 w-8">
                    <svg viewBox="0 0 24 24" className="h-full w-full text-white">
                      <path
                        fill="currentColor"
                        d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.92 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"
                      />
                    </svg>
                  </div>
                </div>
              </a>

              {/* App Store */}
              <a
                href="https://apps.apple.com/app/apple-store/id654456967?pt=28744801&ct=Desktop-Footer&mt=8"
                aria-label="تحميل التطبيق من App Store"
                className="inline-block shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex h-[51px] w-[177px] items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2">
                  <div className="flex-1 text-right text-white">
                    <div className="text-xs opacity-90">تحميل من</div>
                    <div className="text-sm font-bold">App Store</div>
                  </div>
                  <div className="h-8 w-8">
                    <svg viewBox="0 0 24 24" className="h-full w-full text-white">
                      <path
                        fill="currentColor"
                        d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"
                      />
                    </svg>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* قسم كود QR */}
          <div className="order-3 flex flex-col items-center gap-4 sm:order-2 lg:order-2">
            <p className="text-lg font-medium text-gray-700">امسح الكود</p>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
                {/* QR Code Pattern */}
                <div className="grid h-20 w-20 grid-cols-8 gap-px">
                  {[
                    1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1,
                    0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1,
                    1, 1, 0, 1, 0, 1, 0, 1, 0, 1,
                  ].map((cell, i) => (
                    <div key={i} className={`h-full w-full ${cell ? 'bg-gray-800' : 'bg-white'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* صورة الهاتف للشاشات الكبيرة */}
          <div className="hidden lg:order-3 lg:block">
            <div className="relative">
              {/* Background Shape */}
              <div className="absolute inset-0 rotate-12 transform rounded-3xl bg-gradient-to-br from-orange-200 via-blue-200 to-indigo-300 opacity-60"></div>

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
                          <svg
                            className="h-6 w-6 text-orange-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                          </svg>
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
          <div className="order-2 sm:order-3 lg:hidden">
            <div className="flex items-center justify-center py-8">
              <div className="h-40 w-24 rounded-2xl bg-gray-800 p-1 shadow-xl">
                <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-gradient-to-b from-orange-400 to-blue-500">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white">
                    <svg
                      className="h-4 w-4 text-orange-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                    </svg>
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
