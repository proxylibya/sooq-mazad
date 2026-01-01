import React from 'react';

/**
 * مكون آمن للأيقونات في البيئة العربية RTL
 * يمنع عكس الأيقونات التي لا يجب عكسها
 */

interface RTLSafeIconProps {
  children: React.ReactNode;
  shouldFlip?: boolean;
  className?: string;
}

/**
 * مكون عام للأيقونات الآمنة في RTL
 */
export const RTLSafeIcon: React.FC<RTLSafeIconProps> = ({
  children,
  shouldFlip = false,
  className = '',
}) => {
  const iconClass = shouldFlip ? `${className} rtl-flip-icon` : `${className} no-flip-icon`;

  return <span className={iconClass}>{children}</span>;
};

/**
 * مكون للأيقونات التي يجب عكسها (الأسهم الاتجاهية)
 */
export const DirectionalIcon: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <RTLSafeIcon shouldFlip={true} className={className}>
      {children}
    </RTLSafeIcon>
  );
};

/**
 * مكون للأيقونات التي لا يجب عكسها (المباني، الجوائز، النجوم، إلخ)
 */
export const StaticIcon: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <RTLSafeIcon shouldFlip={false} className={className}>
      {children}
    </RTLSafeIcon>
  );
};

/**
 * مكونات محددة للاستخدام السريع
 */

// أيقونة الرجوع
export const BackIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <DirectionalIcon className={className}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  </DirectionalIcon>
);

// أيقونة التقدم
export const ForwardIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <DirectionalIcon className={className}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  </DirectionalIcon>
);

// أيقونة النجمة (لا تحتاج عكس)
export const StarIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <StaticIcon className={className}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.563.563 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
      />
    </svg>
  </StaticIcon>
);

// أيقونة الجائزة (لا تحتاج عكس)
export const TrophyIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <StaticIcon className={className}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M15.504 14.25v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-2.827 0c-1.18.037-2.09 1.022-2.09 2.201v.916m8.007 0a26.255 26.255 0 0 1-8.007 0"
      />
    </svg>
  </StaticIcon>
);

// أيقونة المبنى (لا تحتاج عكس)
export const BuildingIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <StaticIcon className={className}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
      />
    </svg>
  </StaticIcon>
);

// أيقونة التحقق (لا تحتاج عكس)
export const CheckIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <StaticIcon className={className}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  </StaticIcon>
);

export default RTLSafeIcon;
