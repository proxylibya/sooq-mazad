import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';

import React from 'react';
import { useCarBrandLogos } from '../hooks/useCarBrandLogos';

interface CarLogosStatsProps {
  /** إظهار التفاصيل */
  showDetails?: boolean;
  /** كلاس CSS إضافي */
  className?: string;
}

const CarLogosStats: React.FC<CarLogosStatsProps> = ({ showDetails = false, className = '' }) => {
  const { brands, popularBrands, loadingStats, cacheSize, isCacheEnabled } = useCarBrandLogos();

  // حساب الإحصائيات
  const stats = {
    totalBrands: brands.length,
    popularBrands: popularBrands.length,
    optimizedLogos: brands.filter((brand) => brand.logo && brand.logo.includes('real-logos'))
      .length,
    countries: 0, // عدد البلدان غير متوفر في البيانات الحالية
    coverage:
      brands.length > 0
        ? (
            (brands.filter((brand) => brand.logo && brand.logo.includes('real-logos')).length /
              brands.length) *
            100
          ).toFixed(1)
        : 0,
  };

  return (
    <div className={`rounded-lg border bg-white p-6 shadow-sm ${className}`}>
      <h3 className="mb-4 text-lg font-semibold text-gray-800">
        <ChartBarIcon className="h-5 w-5" /> إحصائيات شعارات السيارات
      </h3>

      {/* الإحصائيات الأساسية */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalBrands}</div>
          <div className="text-sm text-blue-800">إجمالي العلامات</div>
        </div>

        <div className="rounded-lg bg-green-50 p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.optimizedLogos}</div>
          <div className="text-sm text-green-800">شعارات محسنة</div>
        </div>

        <div className="rounded-lg bg-orange-50 p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.popularBrands}</div>
          <div className="text-sm text-orange-800">علامات شائعة</div>
        </div>

        <div className="rounded-lg bg-purple-50 p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.countries}</div>
          <div className="text-sm text-purple-800">دول</div>
        </div>
      </div>

      {/* نسبة التغطية */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">نسبة التغطية</span>
          <span className="text-sm font-bold text-gray-900">{stats.coverage}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            style={{ width: `${stats.coverage}%` }}
          ></div>
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          {Number(stats.coverage) >= 80 ? (
            <>
              <SparklesIcon className="h-4 w-4 text-yellow-500" />
              <span>تغطية ممتازة!</span>
            </>
          ) : Number(stats.coverage) >= 50 ? (
            <span>تغطية جيدة</span>
          ) : (
            <>
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
              <span>تحتاج تحسين</span>
            </>
          )}
        </div>
      </div>

      {/* إحصائيات التحميل */}
      {loadingStats.total > 0 && (
        <div className="mb-6">
          <h4 className="text-md mb-3 font-medium text-gray-700">حالة التحميل</h4>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="rounded bg-gray-50 p-2">
              <div className="text-lg font-semibold text-gray-600">{loadingStats.total}</div>
              <div className="text-xs text-gray-500">المجموع</div>
            </div>
            <div className="rounded bg-green-50 p-2">
              <div className="text-lg font-semibold text-green-600">{loadingStats.loaded}</div>
              <div className="text-xs text-green-700">محمل</div>
            </div>
            <div className="rounded bg-yellow-50 p-2">
              <div className="text-lg font-semibold text-yellow-600">{loadingStats.loading}</div>
              <div className="text-xs text-yellow-700">يحمل</div>
            </div>
            <div className="rounded bg-red-50 p-2">
              <div className="text-lg font-semibold text-red-600">{loadingStats.errors}</div>
              <div className="text-xs text-red-700">أخطاء</div>
            </div>
          </div>
        </div>
      )}

      {/* معلومات التخزين المؤقت */}
      {isCacheEnabled && (
        <div className="mb-6">
          <h4 className="text-md mb-2 font-medium text-gray-700">التخزين المؤقت</h4>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <span className="text-sm text-gray-600">الشعارات المخزنة</span>
            <span className="text-sm font-semibold text-gray-900">{cacheSize}</span>
          </div>
        </div>
      )}

      {/* التفاصيل الإضافية */}
      {showDetails && (
        <div className="border-t pt-4">
          <h4 className="text-md mb-3 font-medium text-gray-700">تفاصيل إضافية</h4>

          {/* توزيع العلامات حسب البلد */}
          <div className="mb-4">
            <h5 className="mb-2 text-sm font-medium text-gray-600">توزيع العلامات حسب النوع</h5>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">علامات شائعة</span>
                <span className="text-gray-900">{stats.popularBrands}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">علامات أخرى</span>
                <span className="text-gray-900">{stats.totalBrands - stats.popularBrands}</span>
              </div>
            </div>
          </div>

          {/* العلامات الشائعة */}
          <div>
            <h5 className="mb-2 text-sm font-medium text-gray-600">العلامات الشائعة</h5>
            <div className="flex flex-wrap gap-2">
              {popularBrands.map((brand) => (
                <span
                  key={brand.name}
                  className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                >
                  {brand.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarLogosStats;
