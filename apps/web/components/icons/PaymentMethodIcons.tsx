import React from 'react';
import Image from 'next/image';

// أيقونات طرق الدفع الاحترافية
interface IconProps {
  className?: string;
  size?: number;
}

// أيقونة كارت ليبيانا - باستخدام الشعار الحقيقي
export const LibyanaCardIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <div className={className} style={{ width: size, height: size }}>
    <Image
      src="/images/payment-logos/libyana-logo-circular.svg"
      alt="ليبيانا"
      width={size || 24}
      height={size || 24}
      className="rounded-full object-contain"
    />
  </div>
);

// أيقونة كارت مدار - باستخدام الشعار الحقيقي
export const MadarCardIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <div className={className} style={{ width: size, height: size }}>
    <Image
      src="/images/payment-logos/almadar-logo-circular.svg"
      alt="مدار"
      width={size || 24}
      height={size || 24}
      className="rounded-full object-contain"
    />
  </div>
);

// أيقونة فيزا
export const VisaCardIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="2"
      y="6"
      width="20"
      height="12"
      rx="3"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect x="2" y="9" width="20" height="3" fill="currentColor" fillOpacity="0.2" />
    <rect x="4" y="14" width="4" height="1.5" rx="0.75" fill="currentColor" />
    <rect x="10" y="14" width="6" height="1.5" rx="0.75" fill="currentColor" fillOpacity="0.3" />
    <rect x="16" y="7" width="5" height="2" rx="1" fill="#1e40af" />
    <text x="17" y="8.3" fontSize="4" fill="white" fontWeight="bold">
      VISA
    </text>
  </svg>
);

// أيقونة البنك - مبسطة واحترافية
export const BankIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 21h18v-2H3v2zm1-4h16v-6H4v6zm8-14L2 9h20L12 3z" fill="currentColor" />
    <circle cx="12" cy="7" r="1" fill="white" />
  </svg>
);

// أيقونة العملات الرقمية
export const CryptoIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M9 8V7H11V8H13V7H15V8H16V10H15V14H16V16H15V17H13V16H11V17H9V16H8V14H9V10H8V8H9Z"
      fill="currentColor"
    />
    <path d="M11 10V14H13V10H11Z" fill="white" />
    <path d="M10 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// أيقونة PayPal
export const PayPalIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 4H14C17.31 4 20 6.69 20 10C20 13.31 17.31 16 14 16H11L10 20H6L7 4Z"
      fill="currentColor"
      fillOpacity="0.7"
    />
    <path
      d="M5 8H12C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16H9L8 20H4L5 8Z"
      fill="currentColor"
    />
    <text x="8" y="13" fontSize="4" fill="white" fontWeight="bold">
      P
    </text>
  </svg>
);

// أيقونة Wise
export const WiseIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M8 8L12 16L16 8H14L12 12L10 8H8Z" fill="currentColor" />
    <circle cx="12" cy="6" r="1" fill="currentColor" />
  </svg>
);

// أيقونة Payeer
export const PayeerIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="3"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="8" cy="12" r="2" fill="currentColor" />
    <circle cx="16" cy="12" r="2" fill="currentColor" />
    <path d="M10 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// أيقونة الأمان
export const SecurityIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M9 12L11 14L15 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

// أيقونة التحقق
export const VerificationIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M8 12L11 15L16 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeOpacity="0.3"
    />
  </svg>
);

// مكونات الشعارات الكبيرة لصفحات الدفع
export const LibyanaLogo: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-16 h-16',
  size = 64,
}) => (
  <div className={className} style={{ width: size, height: size }}>
    <Image
      src="/images/payment-logos/libyana-logo-circular.svg"
      alt="ليبيانا"
      width={size}
      height={size}
      className="rounded-full object-contain shadow-sm"
    />
  </div>
);

export const MadarLogo: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-16 h-16',
  size = 64,
}) => (
  <div className={className} style={{ width: size, height: size }}>
    <Image
      src="/images/payment-logos/almadar-logo-circular.svg"
      alt="مدار"
      width={size}
      height={size}
      className="rounded-full object-contain shadow-sm"
    />
  </div>
);

// دالة للحصول على الشعار الكبير
export const getPaymentMethodLogo = (
  method: string,
  props?: { className?: string; size?: number },
) => {
  switch (method) {
    case 'LIBYANA_CARD':
      return <LibyanaLogo {...props} />;
    case 'MADAR_CARD':
      return <MadarLogo {...props} />;
    default:
      return null;
  }
};

// أيقونات إضافية احترافية بسيطة

// أيقونة المحفظة
export const WalletSimpleIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="2"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect x="3" y="8" width="18" height="2" fill="currentColor" fillOpacity="0.2" />
    <circle cx="18" cy="13" r="2" fill="currentColor" />
  </svg>
);

// أيقونة المتجر
export const StoreSimpleIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// أيقونة الإعدادات
export const SettingsSimpleIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="3"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

// دالة للحصول على الأيقونة المناسبة لطريقة الدفع
export const getPaymentMethodIcon = (method: string, props?: IconProps) => {
  switch (method) {
    case 'LIBYANA_CARD':
      return <LibyanaCardIcon {...props} />;
    case 'MADAR_CARD':
      return <MadarCardIcon {...props} />;
    case 'VISA_CARD':
      return <VisaCardIcon {...props} />;
    case 'BANK_ACCOUNT':
      return <BankIcon {...props} />;
    case 'CRYPTOCURRENCY':
      return <CryptoIcon {...props} />;
    case 'PAYPAL':
      return <PayPalIcon {...props} />;
    case 'WISE':
      return <WiseIcon {...props} />;
    case 'PAYEER':
      return <PayeerIcon {...props} />;
    case 'WALLET':
      return <WalletSimpleIcon {...props} />;
    case 'STORE':
      return <StoreSimpleIcon {...props} />;
    case 'SETTINGS':
      return <SettingsSimpleIcon {...props} />;
    default:
      return <SecurityIcon {...props} />;
  }
};
