import React from 'react';

interface TransportRouteDisplayProps {
  serviceAreas: string[];
  variant?: 'card' | 'full';
  maxDisplay?: number;
}

/**
 * مكون عرض مسار النقل بتصميم احترافي يشبه خريطة المسارات
 * يعرض نقطة الانطلاق والوجهات بشكل بصري جذاب
 */
const TransportRouteDisplay: React.FC<TransportRouteDisplayProps> = ({
  serviceAreas,
  variant = 'card',
  maxDisplay = 4,
}) => {
  if (!serviceAreas || serviceAreas.length === 0) {
    return <div className="text-sm text-gray-500">لم يتم تحديد مناطق الخدمة</div>;
  }

  // تحديد المدينة الرئيسية (الأولى) والوجهات الأخرى
  const mainCity = serviceAreas[0];
  const destinations = serviceAreas.slice(1);
  const displayDestinations =
    variant === 'card' ? destinations.slice(0, maxDisplay - 1) : destinations;
  const remainingCount = destinations.length - displayDestinations.length;

  // تصميم مصغر للبطاقات
  if (variant === 'card') {
    return (
      <div className="route-display-card">
        {/* العنوان */}
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600">
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <span className="text-xs font-semibold text-gray-700">مناطق التغطية</span>
        </div>

        {/* المسار */}
        <div className="flex items-center gap-2">
          {/* نقطة الانطلاق */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <div className="h-3 w-3 rounded-full bg-green-500 ring-2 ring-green-200" />
              <div className="absolute -bottom-0.5 left-1/2 h-1.5 w-0.5 -translate-x-1/2 bg-gray-300" />
            </div>
            <span className="text-sm font-medium text-gray-800">{mainCity}</span>
          </div>

          {/* خط الاتصال */}
          {displayDestinations.length > 0 && (
            <>
              <div className="flex flex-1 items-center">
                <svg
                  className="-ml-1 h-4 w-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="h-0.5 flex-1 bg-gradient-to-r from-green-400 to-blue-400" />
              </div>

              {/* الوجهات */}
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-blue-500 ring-2 ring-blue-200" />
                <span className="text-sm font-medium text-gray-800">
                  {displayDestinations.length === 1
                    ? displayDestinations[0]
                    : `${displayDestinations.length} مدن`}
                  {remainingCount > 0 && (
                    <span className="mr-1 text-xs text-gray-500">+{remainingCount}</span>
                  )}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // التصميم الكامل للصفحة التفصيلية
  return (
    <div className="route-display-full">
      {/* العنوان الرئيسي */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">خريطة مناطق الخدمة</h3>
          <p className="text-sm text-gray-500">{serviceAreas.length} منطقة تغطية</p>
        </div>
      </div>

      {/* خريطة المسار الاحترافية */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        {/* نقطة الانطلاق الرئيسية */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg ring-4 ring-green-100">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              {/* خط عمودي متصل */}
              <div className="absolute left-1/2 top-full h-6 w-0.5 -translate-x-1/2 bg-gradient-to-b from-green-400 to-gray-300" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-green-600">
                المنطقة الرئيسية
              </span>
              <h4 className="text-xl font-bold text-gray-900">{mainCity}</h4>
            </div>
          </div>
        </div>

        {/* الوجهات */}
        {destinations.length > 0 && (
          <div className="mr-6 border-r-2 border-dashed border-gray-300 pr-6">
            {/* عنوان الوجهات */}
            <div className="mb-4 flex items-center gap-2">
              <svg
                className="h-4 w-4 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-700">النقل إلى المناطق التالية</span>
            </div>

            {/* شبكة الوجهات */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {destinations.map((city, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md"
                >
                  {/* رقم المسار */}
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white shadow-sm">
                    {index + 1}
                  </div>
                  {/* اسم المدينة */}
                  <span className="text-sm font-medium text-gray-800 transition-colors group-hover:text-blue-600">
                    {city}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ملخص المسار */}
        <div className="mt-6 flex items-center justify-between rounded-xl bg-white/80 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <div>
              <span className="text-xs text-gray-500">إجمالي التغطية</span>
              <p className="font-bold text-gray-900">{serviceAreas.length} منطقة</p>
            </div>
          </div>

          {/* مؤشر بصري للمسار */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="mr-2 text-sm font-medium text-gray-600">
              {mainCity}
              <span className="mx-1 text-gray-400">-</span>
              {destinations.length > 0 ? destinations[destinations.length - 1] : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportRouteDisplay;
