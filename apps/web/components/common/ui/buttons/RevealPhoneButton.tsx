import { processPhoneNumber } from '@/utils/phoneUtils';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import React, { useMemo, useState } from 'react';

interface RevealPhoneButtonProps {
  phone?: string | null;
  className?: string;
  ariaLabel?: string;
  fullWidth?: boolean;
  size?: 'md' | 'lg';
}

/**
 * زر موحّد لإظهار رقم الهاتف في صفحات التفاصيل
 * - الحالة الأولى: يعرض نص "إظهار رقم الهاتف"
 * - عند النقر: يكشف الرقم بصيغة محلية (0 + الرقم الوطني) ويربطه بـ tel:
 * - يعرض الرقم حتى لو لم يتطابق مع الأنماط الصارمة (أكثر مرونة)
 */
const RevealPhoneButton: React.FC<RevealPhoneButtonProps> = ({
  phone,
  className = '',
  ariaLabel,
  fullWidth = true,
  size = 'md',
}) => {
  const [revealed, setRevealed] = useState(false);

  // معالجة الرقم بمرونة - نعرضه حتى لو لم يكن متوافقاً مع الأنماط الصارمة
  const { hasPhone, displayNumber, telHref } = useMemo(() => {
    const raw = String(phone || '').trim();
    const info = processPhoneNumber(raw);

    // تنظيف الرقم الخام للعرض
    const cleanRaw = raw.replace(/[^\d+]/g, '');

    // إذا كان الرقم صالحاً، نستخدم التنسيق المحسن
    if (info?.isValid) {
      return {
        hasPhone: true,
        displayNumber: info.displayNumber,
        telHref: `tel:${info.fullNumber || info.displayNumber}`,
      };
    }

    // إذا كان هناك رقم لكن لم يتطابق مع الأنماط، نعرضه على أي حال
    if (cleanRaw && cleanRaw.length >= 9) {
      // تنسيق بسيط للعرض
      let formatted = cleanRaw;
      // إضافة صفر إذا بدأ برمز البلد
      if (formatted.startsWith('+218')) {
        formatted = '0' + formatted.slice(4);
      } else if (formatted.startsWith('218')) {
        formatted = '0' + formatted.slice(3);
      } else if (!formatted.startsWith('0') && !formatted.startsWith('+')) {
        formatted = '0' + formatted;
      }

      return {
        hasPhone: true,
        displayNumber: formatted,
        telHref: `tel:${cleanRaw.startsWith('+') ? cleanRaw : '+218' + cleanRaw.replace(/^0+/, '')}`,
      };
    }

    return {
      hasPhone: false,
      displayNumber: '',
      telHref: '',
    };
  }, [phone]);

  const baseSize = size === 'lg' ? 'h-12 text-base px-6 py-3.5' : 'h-10 text-sm px-4 py-2.5';
  const widthClass = fullWidth ? 'w-full' : '';

  // إذا لا يوجد رقم على الإطلاق، لا نعرض الزر أصلاً أو نعرض حالة معطلة
  if (!hasPhone) {
    // إذا تم الكشف، نعرض رسالة عدم التوفر
    if (revealed) {
      return (
        <button
          type="button"
          disabled
          className={[
            'flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200',
            'cursor-not-allowed bg-gray-300 text-gray-600',
            baseSize,
            widthClass,
            className,
          ]
            .join(' ')
            .trim()}
          aria-label="رقم الهاتف غير متوفر"
        >
          <PhoneIcon className={size === 'lg' ? 'h-5 w-5' : 'h-5 w-5'} />
          رقم الهاتف غير متوفر
        </button>
      );
    }

    // الحالة الأولى - زر معطل إذا لا يوجد رقم
    return (
      <button
        type="button"
        disabled
        className={[
          'flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200',
          'cursor-not-allowed bg-gray-300 text-gray-600',
          baseSize,
          widthClass,
          className,
        ]
          .join(' ')
          .trim()}
        aria-label="رقم الهاتف غير متوفر"
      >
        <PhoneIcon className={size === 'lg' ? 'h-5 w-5' : 'h-5 w-5'} />
        رقم الهاتف غير متوفر
      </button>
    );
  }

  // يوجد رقم - عرض زر الكشف أو الرقم
  if (!revealed) {
    return (
      <button
        type="button"
        onClick={() => setRevealed(true)}
        className={[
          'flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200',
          'bg-green-600 text-white shadow-md hover:bg-green-700 active:scale-95',
          baseSize,
          widthClass,
          className,
        ]
          .join(' ')
          .trim()}
        aria-label={ariaLabel || 'إظهار رقم الهاتف'}
      >
        <PhoneIcon className={size === 'lg' ? 'h-5 w-5' : 'h-5 w-5'} />
        إظهار رقم الهاتف
      </button>
    );
  }

  // عرض الرقم المكشوف
  return (
    <a
      href={telHref}
      className={[
        'flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200',
        'bg-green-600 text-white shadow-md hover:bg-green-700 active:scale-95',
        baseSize,
        widthClass,
        className,
      ]
        .join(' ')
        .trim()}
      aria-label={ariaLabel || `الاتصال على ${displayNumber}`}
    >
      <PhoneIcon className={size === 'lg' ? 'h-5 w-5' : 'h-5 w-5'} />
      <span dir="ltr">{displayNumber}</span>
    </a>
  );
};

export default RevealPhoneButton;
