import React from 'react';

interface BankLogoProps {
  bankName: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

// ألوان مميزة لكل بنك
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

export default function BankLogo({ bankName, size = 'medium', className = '' }: BankLogoProps) {
  const colors = bankColors[bankName] || {
    primary: '#6b7280',
    secondary: '#f9fafb',
    accent: '#4b5563',
  };

  const sizeConfig = {
    small: { width: 40, height: 40, strokeWidth: 1.5 },
    medium: { width: 56, height: 56, strokeWidth: 2 },
    large: { width: 80, height: 80, strokeWidth: 2.5 },
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
        <g transform="translate(50, 50)">
          <path
            d="M-15,-10 L0,-20 L15,-10 L15,-5 L-15,-5 Z M-12,-2 L12,-2 M-12,2 L12,2 M-12,6 L12,6 M-15,10 L15,10"
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
