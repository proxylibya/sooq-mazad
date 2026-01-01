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
  FireIcon,
  SparklesIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';

// نوع الترويج
export type PromotionType = 'auction' | 'marketplace';

// تعريف الباقات - للسوق الفوري (بالأيام)
export const MARKETPLACE_PACKAGES = {
  NONE: {
    name: 'بدون ترويج',
    nameEn: 'NONE',
    days: 0,
    price: 0,
    features: [],
    color: 'slate',
    priority: 0,
    icon: null,
  },
  BASIC: {
    name: 'الباقة الأساسية',
    nameEn: 'BASIC',
    days: 7,
    price: 50,
    features: ['شارة مميز', 'أولوية في البحث'],
    color: 'blue',
    priority: 1,
    icon: StarIcon,
  },
  PREMIUM: {
    name: 'الباقة المتقدمة',
    nameEn: 'PREMIUM',
    days: 14,
    price: 100,
    features: ['شارة مميز', 'أولوية في البحث', 'ظهور في الصفحة الرئيسية', 'إشعارات للمتابعين'],
    color: 'purple',
    priority: 2,
    icon: SparklesIcon,
  },
  VIP: {
    name: 'باقة VIP',
    nameEn: 'VIP',
    days: 30,
    price: 200,
    features: [
      'شارة VIP ذهبية',
      'أعلى أولوية في البحث',
      'ظهور دائم في الصفحة الرئيسية',
      'إشعارات لجميع المستخدمين',
      'تقرير إحصائيات مفصل',
    ],
    color: 'amber',
    priority: 3,
    icon: FireIcon,
  },
};

// تعريف الباقات - للمزادات (ينتهي مع المزاد)
export const AUCTION_PACKAGES = {
  NONE: {
    name: 'بدون ترويج',
    nameEn: 'NONE',
    price: 0,
    features: [],
    color: 'slate',
    priority: 0,
    icon: null,
  },
  BASIC: {
    name: 'الباقة الأساسية',
    nameEn: 'BASIC',
    price: 30, // سعر ثابت للمزاد
    features: ['شارة مميز', 'أولوية في البحث'],
    color: 'blue',
    priority: 1,
    icon: StarIcon,
  },
  PREMIUM: {
    name: 'الباقة المتقدمة',
    nameEn: 'PREMIUM',
    price: 60,
    features: ['شارة مميز', 'أولوية في البحث', 'ظهور في الصفحة الرئيسية', 'إشعارات للمتابعين'],
    color: 'purple',
    priority: 2,
    icon: SparklesIcon,
  },
  VIP: {
    name: 'باقة VIP',
    nameEn: 'VIP',
    price: 100,
    features: [
      'شارة VIP ذهبية',
      'أعلى أولوية في البحث',
      'ظهور دائم في الصفحة الرئيسية',
      'إشعارات لجميع المستخدمين',
      'تقرير إحصائيات مفصل',
    ],
    color: 'amber',
    priority: 3,
    icon: FireIcon,
  },
};

// للتوافق مع الكود القديم
export const PROMOTION_PACKAGES = MARKETPLACE_PACKAGES;

export type PackageType = keyof typeof PROMOTION_PACKAGES;

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

  // اختيار الباقات حسب النوع
  const packages = promotionType === 'auction' ? AUCTION_PACKAGES : MARKETPLACE_PACKAGES;
  const isAuction = promotionType === 'auction';

  const getPackageColors = (pkg: PackageType, isSelected: boolean) => {
    const colors: Record<string, { border: string; bg: string; text: string; badge: string }> = {
      NONE: {
        border: isSelected ? 'border-slate-500' : 'border-slate-700',
        bg: isSelected ? 'bg-slate-500/10' : 'bg-slate-800',
        text: 'text-slate-400',
        badge: 'bg-slate-600 text-slate-300',
      },
      BASIC: {
        border: isSelected ? 'border-blue-500' : 'border-slate-700',
        bg: isSelected ? 'bg-blue-500/10' : 'bg-slate-800',
        text: 'text-blue-400',
        badge: 'bg-blue-500/20 text-blue-400',
      },
      PREMIUM: {
        border: isSelected ? 'border-purple-500' : 'border-slate-700',
        bg: isSelected ? 'bg-purple-500/10' : 'bg-slate-800',
        text: 'text-purple-400',
        badge: 'bg-purple-500/20 text-purple-400',
      },
      VIP: {
        border: isSelected ? 'border-amber-500' : 'border-slate-700',
        bg: isSelected ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/5' : 'bg-slate-800',
        text: 'text-amber-400',
        badge: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black',
      },
    };
    return colors[pkg] || colors.NONE;
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
        {(Object.keys(packages) as PackageType[]).map((pkgKey) => {
          const pkg = packages[pkgKey];
          const isSelected = selectedPackage === pkgKey;
          const colors = getPackageColors(pkgKey, isSelected);
          const IconComponent = pkg.icon;

          return (
            <button
              key={pkgKey}
              type="button"
              onClick={() => onPackageChange(pkgKey)}
              className={`relative flex flex-col rounded-xl border-2 p-4 text-right transition-all ${colors.border} ${colors.bg} hover:border-opacity-80`}
            >
              {/* شارة الاختيار */}
              {isSelected && (
                <div className="absolute left-2 top-2 rounded-full bg-emerald-500 p-1">
                  <CheckIcon className="h-4 w-4 text-white" />
                </div>
              )}

              {/* VIP Badge */}
              {pkgKey === 'VIP' && (
                <div className="absolute -top-2 right-4">
                  <span className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-3 py-1 text-xs font-bold text-black">
                    الأفضل
                  </span>
                </div>
              )}

              {/* أيقونة الباقة */}
              <div className="mb-3 flex items-center justify-between">
                <div className={`rounded-lg p-2 ${colors.badge}`}>
                  {IconComponent ? (
                    <IconComponent className="h-6 w-6" />
                  ) : (
                    <span className="text-lg">-</span>
                  )}
                </div>
                {pkgKey !== 'NONE' && (
                  <div className="flex items-center gap-1">
                    {[...Array(pkg.priority)].map((_, i) => (
                      <StarSolid key={i} className={`h-4 w-4 ${colors.text}`} />
                    ))}
                  </div>
                )}
              </div>

              {/* اسم الباقة */}
              <h4 className={`text-lg font-bold ${colors.text}`}>{pkg.name}</h4>

              {/* المدة والسعر */}
              {pkgKey !== 'NONE' && (
                <div className="mt-2 flex items-center justify-between">
                  {isAuction ? (
                    <span className="text-sm text-amber-400">حتى انتهاء المزاد</span>
                  ) : (
                    <span className="text-sm text-slate-400">{(pkg as any).days} يوم</span>
                  )}
                  <span className={`text-xl font-bold ${colors.text}`}>{pkg.price} د.ل</span>
                </div>
              )}

              {/* الميزات */}
              {pkg.features.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-slate-700 pt-3">
                  {pkg.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckIcon className={`h-3 w-3 ${colors.text}`} />
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
                  value={customDays || (packages[selectedPackage] as any).days || 7}
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
              <p className="font-bold text-white">{packages[selectedPackage].name}</p>
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
                    : (packages[selectedPackage] as any).days}{' '}
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
