/**
 * مكون اختيار باقة الترويج الموحد
 * Universal Promotion Package Selector
 *
 * يدعم نوعين:
 * 1. المزادات (auction): الترويج ينتهي مع انتهاء المزاد
 * 2. السوق الفوري (car/showroom/transport): الترويج بعدد أيام محدد
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

// ═══════════════════════════════════════════════════════════════
// الأنواع والثوابت
// ═══════════════════════════════════════════════════════════════

export type PromotionSourceType = 'auction' | 'car' | 'showroom' | 'transport';
export type PackageLevel = 'NONE' | 'BASIC' | 'PREMIUM' | 'VIP';

interface Package {
  id: PackageLevel;
  name: string;
  price: number;
  days?: number;
  features: string[];
  priority: number;
  color: 'slate' | 'blue' | 'purple' | 'amber';
  badge?: string;
}

// باقات المزادات - سعر ثابت
const AUCTION_PACKAGES: Record<PackageLevel, Package> = {
  NONE: { id: 'NONE', name: 'بدون ترويج', price: 0, features: [], priority: 0, color: 'slate' },
  BASIC: {
    id: 'BASIC',
    name: 'الباقة الأساسية',
    price: 30,
    features: ['شارة مميز', 'أولوية في البحث'],
    priority: 1,
    color: 'blue',
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'الباقة المتقدمة',
    price: 60,
    features: ['شارة مميز', 'أولوية في البحث', 'ظهور في الصفحة الرئيسية', 'إشعارات للمتابعين'],
    priority: 2,
    color: 'purple',
  },
  VIP: {
    id: 'VIP',
    name: 'باقة VIP',
    price: 100,
    features: ['شارة VIP ذهبية', 'أعلى أولوية', 'ظهور دائم', 'إشعارات للجميع', 'تقرير إحصائيات'],
    priority: 3,
    color: 'amber',
    badge: 'الأفضل',
  },
};

// باقات السوق الفوري - بالأيام
const MARKETPLACE_PACKAGES: Record<PackageLevel, Package> = {
  NONE: {
    id: 'NONE',
    name: 'بدون ترويج',
    price: 0,
    days: 0,
    features: [],
    priority: 0,
    color: 'slate',
  },
  BASIC: {
    id: 'BASIC',
    name: 'الباقة الأساسية',
    price: 50,
    days: 7,
    features: ['شارة مميز', 'أولوية في البحث'],
    priority: 1,
    color: 'blue',
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'الباقة المتقدمة',
    price: 100,
    days: 14,
    features: ['شارة مميز', 'أولوية في البحث', 'ظهور في الصفحة الرئيسية', 'إشعارات للمتابعين'],
    priority: 2,
    color: 'purple',
  },
  VIP: {
    id: 'VIP',
    name: 'باقة VIP',
    price: 200,
    days: 30,
    features: ['شارة VIP ذهبية', 'أعلى أولوية', 'ظهور دائم', 'إشعارات للجميع', 'تقرير إحصائيات'],
    priority: 3,
    color: 'amber',
    badge: 'الأفضل',
  },
};

// أيقونات الباقات
const PACKAGE_ICONS: Record<PackageLevel, React.ElementType | null> = {
  NONE: null,
  BASIC: StarIcon,
  PREMIUM: SparklesIcon,
  VIP: FireIcon,
};

// ═══════════════════════════════════════════════════════════════
// الخصائص
// ═══════════════════════════════════════════════════════════════

interface UniversalPackageSelectorProps {
  /** نوع المنتج المُروَّج */
  sourceType: PromotionSourceType;
  /** الباقة المختارة */
  selectedPackage: PackageLevel;
  /** عند تغيير الباقة */
  onPackageChange: (pkg: PackageLevel) => void;
  /** تاريخ انتهاء المزاد (للمزادات فقط) */
  auctionEndDate?: Date;
  /** عدد أيام مخصص (للسوق الفوري) */
  customDays?: number;
  /** عند تغيير عدد الأيام */
  onCustomDaysChange?: (days: number) => void;
  /** إظهار خيار تخصيص الأيام */
  showCustomDays?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// المكون
// ═══════════════════════════════════════════════════════════════

export default function UniversalPackageSelector({
  sourceType,
  selectedPackage,
  onPackageChange,
  auctionEndDate,
  customDays,
  onCustomDaysChange,
  showCustomDays = false,
}: UniversalPackageSelectorProps) {
  const [useCustomDays, setUseCustomDays] = useState(false);

  // تحديد الباقات والنوع
  const isAuction = sourceType === 'auction';
  const packages = isAuction ? AUCTION_PACKAGES : MARKETPLACE_PACKAGES;

  // ألوان الباقات
  const getColors = (level: PackageLevel, isSelected: boolean) => {
    const colorMap = {
      slate: {
        border: isSelected ? 'border-slate-500' : 'border-slate-700',
        bg: isSelected ? 'bg-slate-500/10' : 'bg-slate-800',
        text: 'text-slate-400',
        badge: 'bg-slate-600 text-slate-300',
      },
      blue: {
        border: isSelected ? 'border-blue-500' : 'border-slate-700',
        bg: isSelected ? 'bg-blue-500/10' : 'bg-slate-800',
        text: 'text-blue-400',
        badge: 'bg-blue-500/20 text-blue-400',
      },
      purple: {
        border: isSelected ? 'border-purple-500' : 'border-slate-700',
        bg: isSelected ? 'bg-purple-500/10' : 'bg-slate-800',
        text: 'text-purple-400',
        badge: 'bg-purple-500/20 text-purple-400',
      },
      amber: {
        border: isSelected ? 'border-amber-500' : 'border-slate-700',
        bg: isSelected ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/5' : 'bg-slate-800',
        text: 'text-amber-400',
        badge: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black',
      },
    };
    return colorMap[packages[level].color];
  };

  // حساب السعر والمدة
  const getCostInfo = (level: PackageLevel) => {
    const pkg = packages[level];
    if (level === 'NONE') return { price: 0, duration: '-' };

    if (isAuction) {
      return { price: pkg.price, duration: 'حتى انتهاء المزاد' };
    } else {
      const days = useCustomDays && customDays ? customDays : pkg.days || 7;
      const price =
        useCustomDays && customDays
          ? Math.round((pkg.price / (pkg.days || 7)) * customDays)
          : pkg.price;
      return { price, duration: `${days} يوم` };
    }
  };

  const selectedCost = getCostInfo(selectedPackage);

  return (
    <div className="space-y-4">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">باقات الترويج</h3>
        </div>
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs ${
            isAuction ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
          }`}
        >
          <ClockIcon className="h-4 w-4" />
          {isAuction ? 'ينتهي مع المزاد' : 'بالأيام'}
        </div>
      </div>

      {/* تنبيه المزادات */}
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
        {(Object.keys(packages) as PackageLevel[]).map((level) => {
          const pkg = packages[level];
          const isSelected = selectedPackage === level;
          const colors = getColors(level, isSelected);
          const Icon = PACKAGE_ICONS[level];
          const cost = getCostInfo(level);

          return (
            <button
              key={level}
              type="button"
              onClick={() => onPackageChange(level)}
              className={`relative flex flex-col rounded-xl border-2 p-4 text-right transition-all ${colors.border} ${colors.bg} hover:opacity-90`}
            >
              {/* شارة الاختيار */}
              {isSelected && (
                <div className="absolute left-2 top-2 rounded-full bg-emerald-500 p-1">
                  <CheckIcon className="h-4 w-4 text-white" />
                </div>
              )}

              {/* شارة الأفضل */}
              {pkg.badge && (
                <div className="absolute -top-2 right-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${colors.badge}`}>
                    {pkg.badge}
                  </span>
                </div>
              )}

              {/* الأيقونة والنجوم */}
              <div className="mb-3 flex items-center justify-between">
                <div className={`rounded-lg p-2 ${colors.badge}`}>
                  {Icon ? <Icon className="h-6 w-6" /> : <span className="text-lg">-</span>}
                </div>
                {level !== 'NONE' && (
                  <div className="flex items-center gap-1">
                    {[...Array(pkg.priority)].map((_, i) => (
                      <StarSolid key={i} className={`h-4 w-4 ${colors.text}`} />
                    ))}
                  </div>
                )}
              </div>

              {/* الاسم */}
              <h4 className={`text-lg font-bold ${colors.text}`}>{pkg.name}</h4>

              {/* السعر والمدة */}
              {level !== 'NONE' && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-amber-400">{cost.duration}</span>
                  <span className={`text-xl font-bold ${colors.text}`}>{cost.price} د.ل</span>
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
                    <li className="text-xs text-slate-500">+{pkg.features.length - 3} ميزات</li>
                  )}
                </ul>
              )}
            </button>
          );
        })}
      </div>

      {/* تخصيص الأيام - فقط للسوق الفوري */}
      {showCustomDays && !isAuction && selectedPackage !== 'NONE' && (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
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
                  value={customDays || packages[selectedPackage].days || 7}
                  onChange={(e) => onCustomDaysChange?.(parseInt(e.target.value) || 7)}
                  className="w-20 rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-center text-white focus:border-amber-500 focus:outline-none"
                />
                <span className="text-sm text-slate-400">يوم</span>
              </div>
            )}
          </div>

          {useCustomDays && (
            <p className="mt-2 text-xs text-slate-500">
              السعر: {getCostInfo(selectedPackage).price.toLocaleString('ar-LY')} د.ل
            </p>
          )}
        </div>
      )}

      {/* ملخص الباقة المختارة */}
      {selectedPackage !== 'NONE' && (
        <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/5 p-4">
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
            <p className="text-sm text-slate-400">التكلفة</p>
            <p className="text-lg font-bold text-amber-400">{selectedCost.price} د.ل</p>
            <p className="text-xs text-slate-500">{selectedCost.duration}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// تصدير الثوابت للاستخدام الخارجي
// ═══════════════════════════════════════════════════════════════

export { AUCTION_PACKAGES, MARKETPLACE_PACKAGES };
