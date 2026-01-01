import SparklesIcon from '@heroicons/react/24/solid/SparklesIcon';
import StarIcon from '@heroicons/react/24/solid/StarIcon';
import React from 'react';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type BadgeVariant = 'gold' | 'premium' | 'vip' | 'basic';
export type PromotionPackage = 'free' | 'basic' | 'premium' | 'vip';

interface FeaturedBadgeProps {
  size?: BadgeSize;
  variant?: BadgeVariant;
  showText?: boolean;
  text?: string;
  className?: string;
  animate?: boolean;
}

const sizeClasses: Record<BadgeSize, { container: string; icon: string; text: string }> = {
  xs: {
    container: 'px-1.5 py-0.5 gap-0.5',
    icon: 'h-2.5 w-2.5',
    text: 'text-[10px]',
  },
  sm: {
    container: 'px-2 py-1 gap-1',
    icon: 'h-3 w-3',
    text: 'text-xs',
  },
  md: {
    container: 'px-3 py-1.5 gap-1.5',
    icon: 'h-4 w-4',
    text: 'text-sm',
  },
  lg: {
    container: 'px-4 py-2 gap-2',
    icon: 'h-5 w-5',
    text: 'text-base',
  },
  xl: {
    container: 'px-5 py-2.5 gap-2',
    icon: 'h-6 w-6',
    text: 'text-lg',
  },
};

const variantClasses: Record<
  BadgeVariant,
  { bg: string; text: string; shadow: string; border: string }
> = {
  gold: {
    bg: 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400',
    text: 'text-white',
    shadow: 'shadow-xl',
    border: 'border-2 border-yellow-300',
  },
  premium: {
    bg: 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400',
    text: 'text-white',
    shadow: 'shadow-xl',
    border: 'border-2 border-yellow-300',
  },
  vip: {
    bg: 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500',
    text: 'text-white',
    shadow: 'shadow-xl',
    border: 'border-2 border-purple-300',
  },
  basic: {
    bg: 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400',
    text: 'text-white',
    shadow: 'shadow-xl',
    border: 'border-2 border-yellow-300',
  },
};

/**
 * شارة الإعلان المميز - مكون موحد للاستخدام في البطاقات وصفحات التفاصيل
 */
const FeaturedBadge: React.FC<FeaturedBadgeProps> = ({
  size = 'md',
  variant = 'gold',
  showText = true,
  text = 'إعلان مميز',
  className = '',
  animate = false, // الشارة ثابتة بدون حركة
}) => {
  const sizeStyle = sizeClasses[size];
  const variantStyle = variantClasses[variant];

  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg font-bold ${sizeStyle.container} ${variantStyle.bg} ${variantStyle.text} ${variantStyle.shadow} ${variantStyle.border} ${animate ? 'animate-shimmer bg-[length:200%_100%]' : ''} ${className} `}
      style={animate ? { animation: 'shimmer 2s linear infinite' } : {}}
    >
      {variant === 'vip' ? (
        <SparklesIcon className={`${sizeStyle.icon} drop-shadow`} />
      ) : (
        <svg className={`${sizeStyle.icon} drop-shadow`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      )}
      {showText && <span className={`${sizeStyle.text} font-bold drop-shadow`}>{text}</span>}
    </div>
  );
};

/**
 * شارة الإعلان المميز للبطاقات - تظهر في زاوية البطاقة
 */
export const CardFeaturedBadge: React.FC<{
  position?: 'top-left' | 'top-right';
  size?: BadgeSize;
  variant?: BadgeVariant;
}> = ({ position = 'top-left', size = 'sm', variant = 'gold' }) => {
  const positionClasses = position === 'top-left' ? 'left-2 top-2' : 'right-2 top-2';

  return (
    <div className={`absolute ${positionClasses} z-50`} style={{ zIndex: 9999 }}>
      <FeaturedBadge size={size} variant={variant} showText={true} text="إعلان مميز" />
    </div>
  );
};

/**
 * شارة الإعلان المميز لصفحات التفاصيل - أكبر وأوضح
 */
export const DetailFeaturedBadge: React.FC<{
  variant?: BadgeVariant;
  className?: string;
}> = ({ variant = 'gold', className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <FeaturedBadge size="lg" variant={variant} showText={true} text="إعلان مميز" />
    </div>
  );
};

/**
 * شارة صغيرة تظهر بجانب العنوان - للاستخدام في صفحات التفاصيل
 */
export const TitleFeaturedBadge: React.FC<{
  packageType?: PromotionPackage | string | null;
  featured?: boolean;
  className?: string;
}> = ({ packageType, featured, className = '' }) => {
  // لا تعرض أي شيء إذا لم يكن مميز أو لا توجد باقة
  if (!featured && (!packageType || packageType === 'free')) {
    return null;
  }

  const variant = packageType ? getVariantFromPackage(packageType as PromotionPackage) : 'gold';
  const text = packageType ? getTextFromPackage(packageType as PromotionPackage) : 'إعلان مميز';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${variantClasses[variant].bg} ${variantClasses[variant].text} ${variantClasses[variant].border} ${variantClasses[variant].shadow} ${className}`}
    >
      {variant === 'vip' ? (
        <SparklesIcon className="h-3.5 w-3.5 drop-shadow" />
      ) : (
        <svg className="h-3.5 w-3.5 drop-shadow" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      )}
      <span className="drop-shadow">{text}</span>
    </span>
  );
};

/**
 * الحصول على رسالة البانر حسب نوع الباقة
 */
export const getBannerMessage = (packageType?: PromotionPackage | string | null): string => {
  switch (packageType) {
    case 'vip':
      return 'إعلان VIP - أعلى أولوية في الظهور والتميز';
    case 'premium':
      return 'إعلان مميز متقدم - أولوية عالية في الظهور';
    case 'basic':
      return 'إعلان مميز - يحظى بأولوية في الظهور';
    default:
      return 'هذا إعلان مميز - يحظى بأولوية في الظهور';
  }
};

/**
 * بانر الإعلان المميز - يظهر في أعلى صفحة التفاصيل
 */
export const FeaturedBanner: React.FC<{
  variant?: BadgeVariant;
  message?: string;
  packageType?: PromotionPackage | string | null;
}> = ({ variant = 'gold', message, packageType }) => {
  // تحديد النوع تلقائياً من الباقة إذا لم يُحدد
  const actualVariant = packageType
    ? getVariantFromPackage(packageType as PromotionPackage)
    : variant;
  const variantStyle = variantClasses[actualVariant];
  const displayMessage = message || getBannerMessage(packageType);
  const displayTitle =
    packageType === 'vip'
      ? 'إعلان VIP'
      : packageType === 'premium'
        ? 'إعلان مميز متقدم'
        : 'إعلان مميز';

  return (
    <div
      className={`flex items-center justify-center gap-3 rounded-xl px-6 py-4 ${variantStyle.bg} ${variantStyle.text} ${variantStyle.shadow} `}
    >
      <div className="flex items-center gap-2">
        {actualVariant === 'vip' ? (
          <SparklesIcon className="h-6 w-6" />
        ) : (
          <StarIcon className="h-6 w-6" />
        )}
        <span className="text-lg font-bold">{displayTitle}</span>
      </div>
      <span className="text-sm opacity-90">•</span>
      <span className="text-sm font-medium">{displayMessage}</span>
    </div>
  );
};

// إضافة CSS للتأثير المتحرك
if (typeof document !== 'undefined') {
  const styleId = 'featured-badge-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .animate-shimmer {
        animation: shimmer 3s linear infinite;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * دالة مساعدة للحصول على نوع الشارة حسب باقة الترويج
 */
export const getVariantFromPackage = (packageType: PromotionPackage): BadgeVariant => {
  switch (packageType) {
    case 'vip':
      return 'vip';
    case 'premium':
      return 'premium';
    case 'basic':
      return 'basic';
    default:
      return 'gold';
  }
};

/**
 * دالة مساعدة للحصول على نص الشارة حسب باقة الترويج
 */
export const getTextFromPackage = (packageType: PromotionPackage): string => {
  switch (packageType) {
    case 'vip':
      return 'إعلان VIP';
    case 'premium':
      return 'إعلان مميز';
    case 'basic':
      return 'إعلان مميز';
    default:
      return 'إعلان مميز';
  }
};

/**
 * شارة مميزة ذكية - تحدد النوع تلقائياً حسب الباقة
 */
export const SmartFeaturedBadge: React.FC<{
  packageType?: PromotionPackage | string | null;
  featured?: boolean;
  size?: BadgeSize;
  className?: string;
  showText?: boolean;
}> = ({ packageType, featured, size = 'sm', className = '', showText = true }) => {
  // لا تعرض أي شيء إذا لم يكن مميز أو لا توجد باقة
  if (!featured && (!packageType || packageType === 'free')) {
    return null;
  }

  const variant = packageType ? getVariantFromPackage(packageType as PromotionPackage) : 'gold';
  const text = packageType ? getTextFromPackage(packageType as PromotionPackage) : 'إعلان مميز';

  return (
    <FeaturedBadge
      size={size}
      variant={variant}
      showText={showText}
      text={text}
      className={className}
    />
  );
};

export default FeaturedBadge;
