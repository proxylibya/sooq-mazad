import React from 'react';

interface BankLogoProps {
  bankName: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

// ألوان مميزة لكل بنك - ألوان أكثر إشراقاً للخلفيات الغامقة
const bankColors: Record<string, { primary: string; secondary: string; accent: string }> = {
  'مصرف الجمهورية': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'مصرف الأمان': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'مصرف الوحدة': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'المصرف الإسلامي الليبي': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'مصرف التجاري الوطني': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'المصرف التضامن': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'مصرف الخليج الأول': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'مصرف الواحة': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'مصرف الأندلس': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'مصرف الإستثمار العربي الإسلامي': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'مصرف الاتحاد الوطني': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'مصرف التجارة والتنمية': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'مصرف السراي': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'مصرف الصحارى': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'مصرف المتحد': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'مصرف المتوسط': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'مصرف النوران': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'مصرف الوفاء': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'مصرف اليقين': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'مصرف شمال أفريقيا': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
  'مصرف التنمية': {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#e2e8f0',
  },
};

// الحصول على الأحرف الأولى من اسم البنك
const getBankInitials = (bankName: string): string => {
  const words = bankName
    .split(' ')
    .filter((word) => !['مصرف', 'المصرف', 'بنك', 'البنك'].includes(word));

  if (words.length >= 2) {
    return words[0].charAt(0) + words[1].charAt(0);
  } else if (words.length === 1) {
    return words[0].charAt(0) + words[0].charAt(1);
  } else {
    return bankName.charAt(0) + bankName.charAt(1);
  }
};

export default function BankLogo({ bankName, size = 'medium', className = '' }: BankLogoProps) {
  const colors = bankColors[bankName] || {
    primary: '#6b7280',
    secondary: '#f9fafb',
    accent: '#4b5563',
  };
  const initials = getBankInitials(bankName);

  const sizeConfig = {
    small: { width: 40, height: 40, fontSize: '12px', strokeWidth: 1.5 },
    medium: { width: 56, height: 56, fontSize: '16px', strokeWidth: 2 },
    large: { width: 80, height: 80, fontSize: '24px', strokeWidth: 2.5 },
  };

  const config = sizeConfig[size];

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={config.width}
        height={config.height}
        viewBox="0 0 100 100"
        className="drop-shadow-sm"
      >
        {/* الخلفية المتدرجة */}
        <defs>
          <linearGradient
            id={`gradient-${bankName.replace(/\s+/g, '-')}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.accent} />
          </linearGradient>
          <filter id={`shadow-${bankName.replace(/\s+/g, '-')}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* الدائرة الخارجية - خلفية بيضاء صلبة */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="white"
          stroke="#e2e8f0"
          strokeWidth="2"
          filter={`url(#shadow-${bankName.replace(/\s+/g, '-')})`}
        />

        {/* الدائرة الداخلية */}
        <circle cx="50" cy="50" r="38" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

        {/* أيقونة البنك */}
        <g transform="translate(50, 35)">
          <path
            d="M-15,-5 L0,-15 L15,-5 L15,0 L-15,0 Z M-12,3 L12,3 M-12,6 L12,6 M-12,9 L12,9 M-15,12 L15,12"
            fill="#374151"
            stroke="#374151"
            strokeWidth={config.strokeWidth * 0.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}

// مكون مبسط للاستخدام السريع
export function SimpleBankLogo({
  bankName,
  size = 'medium',
}: {
  bankName: string;
  size?: 'small' | 'medium' | 'large';
}) {
  return <BankLogo bankName={bankName} size={size} />;
}
