import React, { ReactNode } from 'react';

interface SimpleStatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: 'indigo' | 'green' | 'purple' | 'red' | 'blue' | 'amber' | 'slate' | 'teal' | 'gray';
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
 * مكون بطاقة إحصائية بسيط - تصميم موحد واحترافي
 * يستخدم في: لوحات الإدارة، الإحصائيات، التقارير
 */
const SimpleStatsCard: React.FC<SimpleStatsCardProps> = ({
  title,
  value,
  icon,
  color = 'indigo',
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
                {typeof value === 'number' ? value.toLocaleString('en-US') : value}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleStatsCard;
