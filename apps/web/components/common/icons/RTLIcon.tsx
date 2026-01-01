import React from 'react';
import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import ChevronLeftIcon from '@heroicons/react/24/outline/ChevronLeftIcon';
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon';
import ArrowUturnLeftIcon from '@heroicons/react/24/outline/ArrowUturnLeftIcon';
import ArrowUturnRightIcon from '@heroicons/react/24/outline/ArrowUturnRightIcon';

// خريطة الأيقونات التي تحتاج إلى عكس في البيئة العربية
const RTL_ICON_MAP = {
  // أسهم الاتجاه
  'arrow-left': { ltr: ArrowLeftIcon, rtl: ArrowRightIcon },
  'arrow-right': { ltr: ArrowRightIcon, rtl: ArrowLeftIcon },
  'chevron-left': { ltr: ChevronLeftIcon, rtl: ChevronRightIcon },
  'chevron-right': { ltr: ChevronRightIcon, rtl: ChevronLeftIcon },
  'arrow-uturn-left': { ltr: ArrowUturnLeftIcon, rtl: ArrowUturnRightIcon },
  'arrow-uturn-right': { ltr: ArrowUturnRightIcon, rtl: ArrowUturnLeftIcon },

  // أيقونات الرجوع (الأكثر استخداماً)
  back: { ltr: ArrowLeftIcon, rtl: ArrowRightIcon },
  forward: { ltr: ArrowRightIcon, rtl: ArrowLeftIcon },
  // تم إزالة previous و next لتجنب التضارب مع NavigationArrows
};

interface RTLIconProps {
  /** اسم الأيقونة من خريطة الأيقونات */
  name: keyof typeof RTL_ICON_MAP;
  /** فئة CSS للأيقونة */
  className?: string;
  /** إجبار اتجاه معين (تجاهل الكشف التلقائي) */
  forceDirection?: 'ltr' | 'rtl';
  /** خصائص إضافية للأيقونة */
  [key: string]: any;
}

/**
 * مكون أيقونة ذكي يتكيف مع اتجاه النص العربي (RTL)
 * يعكس الأيقونات تلقائياً حسب اتجاه النص
 */
const RTLIcon: React.FC<RTLIconProps> = ({ name, className = '', forceDirection, ...props }) => {
  // كشف اتجاه النص من DOM أو استخدام الاتجاه المفروض
  const getDirection = (): 'ltr' | 'rtl' => {
    if (forceDirection) return forceDirection;

    // كشف من خاصية dir في HTML
    if (typeof document !== 'undefined') {
      const htmlDir = document.documentElement.dir;
      if (htmlDir === 'rtl' || htmlDir === 'ltr') {
        return htmlDir;
      }

      // كشف من اللغة
      const lang = document.documentElement.lang;
      if (lang === 'ar' || lang.startsWith('ar-')) {
        return 'rtl';
      }

      // كشف من body class أو أي مؤشر آخر
      const bodyClasses = document.body.className;
      if (bodyClasses.includes('rtl') || bodyClasses.includes('arabic')) {
        return 'rtl';
      }
    }

    // افتراضي للعربية
    return 'rtl';
  };

  const direction = getDirection();
  const iconConfig = RTL_ICON_MAP[name];

  if (!iconConfig) {
    console.warn(`RTLIcon: Unknown icon name "${name}"`);
    return null;
  }

  const IconComponent = iconConfig[direction];

  return (
    <IconComponent
      className={`rtl-icon rtl-icon-${name} ${className}`}
      data-rtl-direction={direction}
      data-rtl-icon={name}
      {...props}
    />
  );
};

export default RTLIcon;

// مكونات مساعدة للاستخدام السريع
export const BackIcon: React.FC<Omit<RTLIconProps, 'name'>> = (props) => (
  <RTLIcon name="back" {...props} />
);

export const ForwardIcon: React.FC<Omit<RTLIconProps, 'name'>> = (props) => (
  <RTLIcon name="forward" {...props} />
);

// تم إزالة PreviousIcon و NextIcon لتجنب التضارب مع NavigationArrows
// استخدم CompactNavigationArrows أو DefaultNavigationArrows بدلاً من ذلك

// تصدير أنواع البيانات للاستخدام في مكونات أخرى
export type RTLIconName = keyof typeof RTL_ICON_MAP;
export type { RTLIconProps };
