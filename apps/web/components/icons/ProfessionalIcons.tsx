import React from 'react';

// واجهة الخصائص للأيقونات
interface IconProps {
  className?: string;
  size?: number;
}

// أيقونة المحفظة الاحترافية
export const WalletProfessionalIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
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

// أيقونة المتجر الاحترافية
export const StoreProfessionalIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
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

// أيقونة الإعدادات الاحترافية
export const SettingsProfessionalIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
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
      d="M12 1v6m0 10v6m11-7h-6m-10 0H1m15.5-6.5l-4.24 4.24M7.76 7.76L3.52 3.52m12.96 12.96l-4.24-4.24M7.76 16.24L3.52 20.48"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

// أيقونة الأمان الاحترافية
export const SecurityProfessionalIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M9 12l2 2 4-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// أيقونة المساعدة الاحترافية
export const HelpProfessionalIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
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
      r="10"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="17" r="1" fill="currentColor" />
  </svg>
);

// أيقونة التقارير الاحترافية
export const ReportsProfessionalIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
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
      y="3"
      width="18"
      height="18"
      rx="2"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M8 12h8M8 16h8M8 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// أيقونة الإحصائيات الاحترافية
export const StatsProfessionalIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="11" width="4" height="10" fill="currentColor" fillOpacity="0.7" />
    <rect x="10" y="7" width="4" height="14" fill="currentColor" fillOpacity="0.7" />
    <rect x="17" y="3" width="4" height="18" fill="currentColor" fillOpacity="0.7" />
  </svg>
);

// أيقونة الإشعارات الاحترافية
export const NotificationsProfessionalIcon: React.FC<IconProps> = ({
  className = 'w-6 h-6',
  size,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M13.73 21a2 2 0 01-3.46 0"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// أيقونة المعاملات الاحترافية
export const TransactionsProfessionalIcon: React.FC<IconProps> = ({
  className = 'w-6 h-6',
  size,
}) => (
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
      r="10"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M12 6v6l4 2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// أيقونة الحدود الاحترافية
export const LimitsProfessionalIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="11" width="18" height="2" fill="currentColor" fillOpacity="0.7" />
    <circle cx="6" cy="12" r="2" fill="currentColor" />
    <circle cx="18" cy="12" r="2" fill="currentColor" />
    <path
      d="M6 8V6a2 2 0 012-2h8a2 2 0 012 2v2M6 16v2a2 2 0 002 2h8a2 2 0 002-2v-2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

// أيقونة البنوك الاحترافية
export const BanksProfessionalIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 21h18M5 21V7l8-4 8 4v14M9 9v4M15 9v4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="4" r="1" fill="currentColor" />
  </svg>
);

// أيقونة العملات الرقمية الاحترافية
export const CryptoProfessionalIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
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
      r="10"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M8 12h8M10 8h4a2 2 0 012 2v0a2 2 0 01-2 2h-4M10 16h4a2 2 0 002-2v0a2 2 0 00-2-2h-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path d="M12 6v2M12 16v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// أيقونة الدفع الاحترافية
export const PaymentProfessionalIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
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
      rx="2"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect x="2" y="8" width="20" height="2" fill="currentColor" fillOpacity="0.3" />
    <rect x="4" y="12" width="4" height="2" rx="1" fill="currentColor" fillOpacity="0.7" />
    <rect x="10" y="12" width="6" height="2" rx="1" fill="currentColor" fillOpacity="0.5" />
  </svg>
);

// دالة للحصول على الأيقونة الاحترافية المناسبة
export const getProfessionalIcon = (iconName: string, props?: IconProps) => {
  switch (iconName) {
    case 'wallet':
      return <WalletProfessionalIcon {...props} />;
    case 'store':
      return <StoreProfessionalIcon {...props} />;
    case 'settings':
      return <SettingsProfessionalIcon {...props} />;
    case 'security':
      return <SecurityProfessionalIcon {...props} />;
    case 'help':
      return <HelpProfessionalIcon {...props} />;
    case 'reports':
      return <ReportsProfessionalIcon {...props} />;
    case 'stats':
      return <StatsProfessionalIcon {...props} />;
    case 'notifications':
      return <NotificationsProfessionalIcon {...props} />;
    case 'transactions':
      return <TransactionsProfessionalIcon {...props} />;
    case 'limits':
      return <LimitsProfessionalIcon {...props} />;
    case 'banks':
      return <BanksProfessionalIcon {...props} />;
    case 'crypto':
      return <CryptoProfessionalIcon {...props} />;
    case 'payment':
      return <PaymentProfessionalIcon {...props} />;
    default:
      return <SecurityProfessionalIcon {...props} />;
  }
};

export default {
  WalletProfessionalIcon,
  StoreProfessionalIcon,
  SettingsProfessionalIcon,
  SecurityProfessionalIcon,
  HelpProfessionalIcon,
  ReportsProfessionalIcon,
  StatsProfessionalIcon,
  NotificationsProfessionalIcon,
  TransactionsProfessionalIcon,
  LimitsProfessionalIcon,
  BanksProfessionalIcon,
  CryptoProfessionalIcon,
  PaymentProfessionalIcon,
  getProfessionalIcon,
};
