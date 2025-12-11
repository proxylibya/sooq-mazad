/**
 * مكون الصورة المؤقتة للساحات
 * Yard Placeholder Component
 * يظهر تصميم احترافي عندما لا توجد صورة للساحة
 * مع مساحة جاهزة للشعار مستقبلاً
 */

import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface YardPlaceholderProps {
  /** اسم الساحة (اختياري) */
  yardName?: string;
  /** الحجم */
  size?: 'sm' | 'md' | 'lg';
  /** إظهار مؤشر LIVE */
  showLive?: boolean;
  /** نمط التصميم */
  variant?: 'gradient' | 'solid' | 'pattern';
  /** CSS classes إضافية */
  className?: string;
}

export default function YardPlaceholder({
  yardName,
  size = 'md',
  showLive = false,
  variant = 'gradient',
  className = '',
}: YardPlaceholderProps) {
  // أحجام الأيقونة والنص
  const sizes = {
    sm: {
      icon: 'h-6 w-6',
      text: 'text-[8px]',
      container: 'h-14 w-20',
    },
    md: {
      icon: 'h-10 w-10',
      text: 'text-xs',
      container: 'h-24 w-32',
    },
    lg: {
      icon: 'h-16 w-16',
      text: 'text-sm',
      container: 'h-40 w-56',
    },
  };

  // أنماط الخلفية
  const variants = {
    gradient: 'bg-gradient-to-br from-blue-600 via-blue-700 to-slate-800',
    solid: 'bg-slate-700',
    pattern:
      'bg-slate-800 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.15)_0%,_transparent_70%)]',
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-lg ${currentVariant} ${className}`}
      style={{ minHeight: '100%', minWidth: '100%' }}
    >
      {/* نمط الشبكة الخلفية */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-1">
        {/* مساحة الشعار - يمكن استبدالها بصورة الشعار لاحقاً */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
          {/* 
            TODO: استبدال الأيقونة بشعار الموقع
            <Image src="/images/logo-icon.svg" alt="سوق مزاد" width={24} height={24} />
          */}
          <BuildingOfficeIcon className="h-5 w-5 text-white/80" />
        </div>

        {/* اسم الموقع أو الساحة */}
        <span className="text-[9px] font-medium text-white/60">
          {yardName ? yardName.slice(0, 10) : 'سوق مزاد'}
        </span>
      </div>

      {/* مؤشر LIVE */}
      {showLive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="flex items-center gap-1 text-[10px] font-bold text-white">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500"></span>
            </span>
            LIVE
          </span>
        </div>
      )}

      {/* تأثير اللمعان */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10" />
    </div>
  );
}

/**
 * نسخة مبسطة للاستخدام السريع
 */
export function YardPlaceholderSimple({ showLive = false }: { showLive?: boolean }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 via-blue-700 to-slate-800">
      {/* الشبكة */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '12px 12px',
          }}
        />
      </div>

      {/* المحتوى */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15 backdrop-blur-sm">
          <BuildingOfficeIcon className="h-4 w-4 text-white/90" />
        </div>
        <span className="text-[8px] font-semibold text-white/70">سوق مزاد</span>
      </div>

      {/* LIVE */}
      {showLive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="flex items-center gap-1 text-[10px] font-bold text-white">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500"></span>
            </span>
            LIVE
          </span>
        </div>
      )}
    </div>
  );
}
