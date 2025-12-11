/**
 * مكون اختيار باقة الترويج
 * يدعم نوعين من الترويج:
 * 1. المزادات (auction): الترويج ينتهي مع انتهاء المزاد
 * 2. السوق الفوري (marketplace): الترويج بعدد أيام محدد
 */

import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';

// نوع الترويج
export type PromotionType = 'auction' | 'marketplace';

import { useEffect } from 'react';

export type PackageType = string;

interface PromotionPackageSelectorProps {
  selectedPackage: PackageType;
  onPackageChange: (pkg: PackageType) => void;
  customDays?: number;
  onCustomDaysChange?: (days: number) => void;
  showCustomDays?: boolean;
  /** نوع الترويج: auction (ينتهي مع المزاد) أو marketplace (بالأيام) */
  promotionType?: PromotionType;
  /** تاريخ انتهاء المزاد (للعرض فقط) */
  auctionEndDate?: Date;
}

export default function PromotionPackageSelector({
  selectedPackage,
  onPackageChange,
  customDays,
  onCustomDaysChange,
  showCustomDays = false,
  promotionType = 'auction',
  auctionEndDate,
}: PromotionPackageSelectorProps) {
  const [useCustomDays, setUseCustomDays] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const isAuction = promotionType === 'auction';

  useEffect(() => {
    const fetchPackages = async () => {
      const type = promotionType === 'auction' ? 'AUCTION' : 'LISTING';
      try {
        const res = await fetch(`/api/promotion-packages?type=${type}`);
        if (res.ok) {
          const data = await res.json();
          setPackages(data.data);
        }
      } catch (error) {
        console.error('Error fetching promotion packages:', error);
      }
    };
    fetchPackages();
  }, [promotionType]);

  const getPackageColors = (pkg: any, isSelected: boolean) => {
    const badgeColor = pkg.badgeColor || '#64748b';
    return {
      border: isSelected ? `border-[${badgeColor}]` : 'border-slate-700',
      bg: isSelected ? `bg-[${badgeColor}]/10` : 'bg-slate-800',
      text: `text-[${badgeColor}]`,
      badge: `bg-[${badgeColor}]/20 text-[${badgeColor}]`,
      rawColor: badgeColor,
    };
  };

  return (
    <div className="space-y-4">
      {/* عنوان القسم */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">باقات الترويج</h3>
        </div>
        {/* توضيح نوع الترويج */}
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs ${
            isAuction ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
          }`}
        >
          <ClockIcon className="h-4 w-4" />
          {isAuction ? 'ينتهي مع المزاد' : 'بالأيام'}
        </div>
      </div>

      {/* تنبيه للمزادات */}
      {isAuction && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <p className="text-sm text-amber-300">
            <strong>ملاحظة:</strong> ترويج المزاد ينتهي تلقائياً عند انتهاء المزاد
            {auctionEndDate && (
              <span className="mr-1">({new Date(auctionEndDate).toLocaleDateString('ar-LY')})</span>
            )}
          </p>
        </div>
      )}

      {/* شبكة الباقات */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => {
          const isSelected = selectedPackage === pkg.id;
          const colors = getPackageColors(pkg, isSelected);

          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => onPackageChange(pkg.id)}
              className={`relative flex flex-col rounded-xl border-2 p-4 text-right transition-all hover:border-opacity-80`}
              style={{
                borderColor: isSelected ? colors.rawColor : undefined,
                backgroundColor: isSelected ? `${colors.rawColor}10` : undefined,
              }}
            >
              {/* شارة الاختيار */}
              {isSelected && (
                <div
                  className="absolute left-2 top-2 rounded-full p-1"
                  style={{ backgroundColor: colors.rawColor }}
                >
                  <CheckIcon className="h-4 w-4 text-white" />
                </div>
              )}

              {/* Popular Badge */}
              {pkg.price > 20 && pkg.price < 60 && (
                <div className="absolute -top-2 right-4">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ backgroundColor: colors.rawColor }}
                  >
                    الأفضل
                  </span>
                </div>
              )}

              {/* أيقونة الباقة */}
              <div className="mb-3 flex items-center justify-between">
                <div
                  className="rounded-lg p-2"
                  style={{ backgroundColor: `${colors.rawColor}20`, color: colors.rawColor }}
                >
                  <StarIcon className="h-6 w-6" />
                </div>
                {pkg.priority > 0 && (
                  <div className="flex items-center gap-1">
                    {[...Array(pkg.priority)].map((_, i) => (
                      <StarSolid key={i} className="h-4 w-4" style={{ color: colors.rawColor }} />
                    ))}
                  </div>
                )}
              </div>

              {/* اسم الباقة */}
              <h4 className="text-lg font-bold" style={{ color: colors.rawColor }}>
                {pkg.nameAr}
              </h4>

              {/* المدة والسعر */}
              <div className="mt-2 flex items-center justify-between">
                {isAuction ? (
                  <span className="text-sm text-amber-400">حتى انتهاء المزاد</span>
                ) : (
                  <span className="text-sm text-slate-400">{pkg.duration} يوم</span>
                )}
                <span className="text-xl font-bold" style={{ color: colors.rawColor }}>
                  {pkg.price} د.ل
                </span>
              </div>

              {/* الميزات */}
              {pkg.features && pkg.features.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-slate-700 pt-3">
                  {pkg.features.slice(0, 3).map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckIcon className="h-3 w-3" style={{ color: colors.rawColor }} />
                      {feature}
                    </li>
                  ))}
                  {pkg.features.length > 3 && (
                    <li className="text-xs text-slate-500">
                      +{pkg.features.length - 3} ميزات أخرى
                    </li>
                  )}
                </ul>
              )}
            </button>
          );
        })}
      </div>

      {/* خيار المدة المخصصة - فقط للسوق الفوري */}
      {showCustomDays && !isAuction && selectedPackage !== 'NONE' && (
        <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useCustomDays}
                onChange={(e) => setUseCustomDays(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-slate-300">تخصيص عدد الأيام</span>
            </label>

            {useCustomDays && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={
                    customDays || packages.find((p) => p.id === selectedPackage)?.duration || 7
                  }
                  onChange={(e) => onCustomDaysChange?.(parseInt(e.target.value) || 1)}
                  className="w-20 rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-center text-white focus:border-amber-500 focus:outline-none"
                />
                <span className="text-sm text-slate-400">يوم</span>
              </div>
            )}
          </div>

          {useCustomDays && (
            <p className="mt-2 text-xs text-slate-500">
              السعر المخصص: {((customDays || 1) * 5).toLocaleString('ar-LY')} د.ل (5 د.ل/يوم)
            </p>
          )}
        </div>
      )}

      {/* ملخص الباقة المختارة */}
      {selectedPackage !== 'NONE' && (
        <div className="mt-4 flex items-center justify-between rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-500/20 p-2">
              <CurrencyDollarIcon className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-300">الباقة المختارة</p>
              <p className="font-bold text-white">
                {packages.find((p) => p.id === selectedPackage)?.nameAr}
              </p>
            </div>
          </div>
          <div className="text-left">
            <p className="text-sm text-slate-400">المدة</p>
            <p className="text-lg font-bold text-amber-400">
              {isAuction ? (
                'حتى انتهاء المزاد'
              ) : (
                <>
                  {useCustomDays && customDays
                    ? customDays
                    : packages.find((p) => p.id === selectedPackage)?.duration}{' '}
                  يوم
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
