import React from 'react';
import { BaseCard, BaseCardProps } from './BaseCard';

export interface StatsCardProps extends Omit<BaseCardProps, 'children'> {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}

/**
 * مكون موحد لبطاقات الإحصائيات
 * يستبدل: AuctionStatsCard, AdvancedStatsCard, UnifiedStatsCard
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
  color = 'blue',
  ...baseProps
}) => {
  // ألوان الأيقونات
  const iconColors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <BaseCard {...baseProps} hover>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>

          {trend && (
            <div className="mt-2 flex items-center">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            </div>
          )}

          {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
        </div>

        {Icon && (
          <div className={`rounded-lg p-3 ${iconColors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </BaseCard>
  );
};

export default StatsCard;
