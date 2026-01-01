import React, { ReactNode } from 'react';

interface AdvancedStatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: 'indigo' | 'green' | 'purple' | 'red' | 'blue' | 'amber' | 'slate' | 'teal' | 'gray';
  variant?: 'gradient' | 'neutral';
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  subtitle?: string;
  format?: 'number' | 'currency' | 'percentage';
  currency?: string;
  className?: string;
  onClick?: () => void;
}

const iconColorClasses = {
  indigo: 'text-indigo-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  red: 'text-red-600',
  blue: 'text-blue-600',
  amber: 'text-amber-600',
  slate: 'text-slate-600',
  teal: 'text-teal-600',
  gray: 'text-gray-600',
};

/**
 * مكون بطاقة إحصائية موحد - تصميم بسيط واحترافي
 * يستخدم في: لوحات الإدارة، الإحصائيات، التقارير
 */
const AdvancedStatsCard: React.FC<AdvancedStatsCardProps> = ({
  title,
  value,
  icon,
  color = 'indigo',
  format = 'number',
  currency = 'د.ل',
  className = '',
  onClick,
}) => {
  const iconColorClass = iconColorClasses[color] || iconColorClasses.indigo;

  return (
    <div
      className={`overflow-hidden rounded-lg bg-white shadow ${onClick ? 'cursor-pointer transition-shadow duration-200 hover:shadow-md' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`h-8 w-8 ${iconColorClass}`}>{icon}</div>
          </div>
          <div className="mr-5 w-0 flex-1">
            <dl>
              <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">
                {format === 'currency' ? `${currency} ${value}` : value}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdvancedStatsCard;

// مكونات مخصصة للاستخدامات المختلفة
export const UserStatsCard: React.FC<Omit<AdvancedStatsCardProps, 'color'>> = (props) => (
  <AdvancedStatsCard {...props} color="blue" />
);

export const RevenueStatsCard: React.FC<Omit<AdvancedStatsCardProps, 'color' | 'format'>> = (
  props,
) => <AdvancedStatsCard {...props} color="green" format="currency" />;

export const ActivityStatsCard: React.FC<Omit<AdvancedStatsCardProps, 'color'>> = (props) => (
  <AdvancedStatsCard {...props} color="slate" />
);

export const WarningStatsCard: React.FC<Omit<AdvancedStatsCardProps, 'color'>> = (props) => (
  <AdvancedStatsCard {...props} color="amber" />
);

export const ErrorStatsCard: React.FC<Omit<AdvancedStatsCardProps, 'color'>> = (props) => (
  <AdvancedStatsCard {...props} color="slate" />
);
