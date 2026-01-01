import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';

import React from 'react';
import { useBrandLogoManager } from '../hooks/useBrandLogoManager';
import { brandStats } from '../data/car-brands-logos';

interface UniversalBrandStatsProps {
  /** إظهار التفاصيل */
  showDetails?: boolean;
  /** كلاس CSS إضافي */
  className?: string;
  /** نمط العرض */
  variant?: 'default' | 'opensooq' | 'minimal' | 'card';
  /** حجم المكون */
  size?: 'sm' | 'md' | 'lg';
  /** إظهار الرسوم البيانية */
  showCharts?: boolean;
}

const UniversalBrandStats: React.FC<UniversalBrandStatsProps> = ({
  showDetails = false,
  className = '',
  variant = 'default',
  size = 'md',
  showCharts = false,
}) => {
  const { stats, logoStates } = useBrandLogoManager();

  // حساب الإحصائيات المحسنة
  const enhancedStats = {
    totalBrands: stats.total,
    withLogos: stats.withLogos,
    popularBrands: stats.popular,
    loadedLogos: Object.values(logoStates).filter((state) => state.loaded).length,
    failedLogos: Object.values(logoStates).filter((state) => state.error).length,
    loadingLogos: Object.values(logoStates).filter((state) => state.loading).length,
    coverage: stats.total > 0 ? Math.round((stats.withLogos / stats.total) * 100) : 0,
    categories: stats.byCategory,
  };

  // أنماط العرض
  const variantClasses = {
    default: 'bg-white border border-gray-200 rounded-lg p-4',
    opensooq:
      'bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-4',
    minimal: 'bg-gray-50 rounded-md p-3',
    card: 'bg-white shadow-lg rounded-xl p-6 border border-gray-100',
  };

  // أحجام النصوص
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // ألوان الإحصائيات - ألوان رسمية للشركات
  const getStatColor = (type: string) => {
    const colors = {
      total: variant === 'opensooq' ? 'text-orange-600 bg-orange-50' : 'text-blue-600 bg-blue-50',
      logos:
        variant === 'opensooq' ? 'text-green-600 bg-green-50' : 'text-emerald-600 bg-emerald-50',
      popular:
        variant === 'opensooq' ? 'text-yellow-600 bg-yellow-50' : 'text-amber-600 bg-amber-50',
      loading: 'text-slate-600 bg-slate-50',
      failed: 'text-slate-600 bg-slate-50',
    };
    return colors[type as keyof typeof colors] || colors.total;
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {/* العنوان */}
      <div className="mb-4 flex items-center gap-2">
        <div className="text-2xl">
          <ChartBarIcon className="h-5 w-5" />
        </div>
        <h3 className={`font-semibold text-gray-800 ${sizeClasses[size]}`}>
          إحصائيات شعارات الماركات
        </h3>
      </div>

      {/* الإحصائيات الأساسية */}
      <div className={`grid gap-3 ${size === 'sm' ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
        {/* إجمالي الماركات */}
        <div className={`rounded-lg p-3 text-center ${getStatColor('total')}`}>
          <div className={`font-bold ${size === 'sm' ? 'text-lg' : 'text-2xl'}`}>
            {enhancedStats.totalBrands}
          </div>
          <div className={`text-xs ${size === 'lg' ? 'text-sm' : ''}`}>إجمالي الماركات</div>
        </div>

        {/* الماركات مع الشعارات */}
        <div className={`rounded-lg p-3 text-center ${getStatColor('logos')}`}>
          <div className={`font-bold ${size === 'sm' ? 'text-lg' : 'text-2xl'}`}>
            {enhancedStats.withLogos}
          </div>
          <div className={`text-xs ${size === 'lg' ? 'text-sm' : ''}`}>مع شعارات</div>
        </div>

        {/* الماركات الشائعة */}
        <div className={`rounded-lg p-3 text-center ${getStatColor('popular')}`}>
          <div className={`font-bold ${size === 'sm' ? 'text-lg' : 'text-2xl'}`}>
            {enhancedStats.popularBrands}
          </div>
          <div className={`text-xs ${size === 'lg' ? 'text-sm' : ''}`}>شائعة</div>
        </div>

        {/* نسبة التغطية */}
        <div className={`rounded-lg p-3 text-center ${getStatColor('logos')}`}>
          <div className={`font-bold ${size === 'sm' ? 'text-lg' : 'text-2xl'}`}>
            {enhancedStats.coverage}%
          </div>
          <div className={`text-xs ${size === 'lg' ? 'text-sm' : ''}`}>التغطية</div>
        </div>
      </div>

      {/* التفاصيل الإضافية */}
      {showDetails && (
        <div className="mt-4 space-y-3">
          {/* حالة التحميل */}
          {(enhancedStats.loadingLogos > 0 || enhancedStats.failedLogos > 0) && (
            <div className="grid grid-cols-2 gap-3">
              {enhancedStats.loadingLogos > 0 && (
                <div className={`rounded-lg p-2 text-center ${getStatColor('loading')}`}>
                  <div className="font-semibold">{enhancedStats.loadingLogos}</div>
                  <div className="text-xs">قيد التحميل</div>
                </div>
              )}
              {enhancedStats.failedLogos > 0 && (
                <div className={`rounded-lg p-2 text-center ${getStatColor('failed')}`}>
                  <div className="font-semibold">{enhancedStats.failedLogos}</div>
                  <div className="text-xs">فشل التحميل</div>
                </div>
              )}
            </div>
          )}

          {/* إحصائيات الفئات */}
          <div className="rounded-lg bg-gray-50 p-3">
            <h4 className="mb-2 text-sm font-medium text-gray-700">الفئات</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>اقتصادية:</span>
                <span className="font-medium">{enhancedStats.categories.economy}</span>
              </div>
              <div className="flex justify-between">
                <span>فاخرة:</span>
                <span className="font-medium">{enhancedStats.categories.luxury}</span>
              </div>
              <div className="flex justify-between">
                <span>رياضية:</span>
                <span className="font-medium">{enhancedStats.categories.sport}</span>
              </div>
              <div className="flex justify-between">
                <span>تجارية:</span>
                <span className="font-medium">{enhancedStats.categories.commercial}</span>
              </div>
              <div className="flex justify-between">
                <span>كهربائية:</span>
                <span className="font-medium">{enhancedStats.categories.electric}</span>
              </div>
            </div>
          </div>

          {/* شريط التقدم */}
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="mb-1 flex justify-between text-xs">
              <span>تقدم الشعارات</span>
              <span>{enhancedStats.coverage}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  variant === 'opensooq' ? 'bg-orange-400' : 'bg-blue-400'
                }`}
                style={{ width: `${enhancedStats.coverage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* الرسوم البيانية البسيطة */}
      {showCharts && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-medium text-gray-700">توزيع الماركات</h4>
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="bg-green-400 transition-all duration-500"
              style={{
                width: `${(enhancedStats.withLogos / enhancedStats.totalBrands) * 100}%`,
              }}
              title={`${enhancedStats.withLogos} ماركة مع شعارات`}
            ></div>
            <div
              className="bg-gray-300 transition-all duration-500"
              style={{
                width: `${((enhancedStats.totalBrands - enhancedStats.withLogos) / enhancedStats.totalBrands) * 100}%`,
              }}
              title={`${enhancedStats.totalBrands - enhancedStats.withLogos} ماركة بدون شعارات`}
            ></div>
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-600">
            <span>مع شعارات ({enhancedStats.withLogos})</span>
            <span>بدون شعارات ({enhancedStats.totalBrands - enhancedStats.withLogos})</span>
          </div>
        </div>
      )}

      {/* معلومات إضافية */}
      {showDetails && (
        <div className="mt-3 rounded-lg bg-gray-50 p-2">
          <div className="text-xs text-gray-600">
            آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalBrandStats;
