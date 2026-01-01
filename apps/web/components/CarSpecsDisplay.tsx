import React from 'react';

interface CarSpec {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  show?: boolean;
}

interface CarSpecsDisplayProps {
  specs: CarSpec[];
  layout?: 'horizontal' | 'grid';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CarSpecsDisplay: React.FC<CarSpecsDisplayProps> = ({
  specs,
  layout = 'horizontal',
  size = 'sm',
  className = '',
}) => {
  // فلترة المواصفات المعروضة فقط
  const visibleSpecs = specs.filter(
    (spec) =>
      spec.show !== false &&
      spec.value &&
      spec.value !== 'غير محدد' &&
      spec.value !== 'غير متوفر' &&
      spec.value !== 0,
  );

  if (visibleSpecs.length === 0) return null;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (layout === 'grid') {
    return (
      <div className={`grid grid-cols-2 gap-2 ${sizeClasses[size]} ${className}`}>
        {visibleSpecs.map((spec, index) => (
          <div key={index} className="flex items-center gap-1 text-gray-600">
            {spec.icon && <span className={`${iconSizes[size]} text-gray-500`}>{spec.icon}</span>}
            <span className="font-medium text-gray-700">{spec.label}:</span>
            <span>{spec.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-1 ${sizeClasses[size]} ${className}`}>
      {visibleSpecs.map((spec, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-400">•</span>}
          <span className="inline-flex items-center gap-1 text-gray-600">
            {spec.icon && <span className={`${iconSizes[size]} text-gray-500`}>{spec.icon}</span>}
            {typeof spec.value === 'number' && spec.label === 'المسافة'
              ? `${spec.value.toLocaleString()} كم`
              : spec.value}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

// أيقونات مخصصة للمواصفات
export const CarSpecIcons = {
  mileage: (
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
        clipRule="evenodd"
      />
    </svg>
  ),
  fuel: (
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.856.048L9.932 13.9 6.134 11.732a1 1 0 010-1.732L9.932 8.1l1.179-4.456A1 1 0 0112 2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  transmission: (
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  year: (
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  bodyType: (
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

export default CarSpecsDisplay;
