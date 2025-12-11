import React from 'react';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import ArrowTrendingUpIcon from '@heroicons/react/24/outline/ArrowTrendingUpIcon';
import ArrowTrendingDownIcon from '@heroicons/react/24/outline/ArrowTrendingDownIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';

interface ReportMetric {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
}

interface ReportsCardProps {
  title: string;
  description?: string;
  metrics: ReportMetric[];
  onViewDetails?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

const ReportsCard: React.FC<ReportsCardProps> = ({
  title,
  description,
  metrics,
  onViewDetails,
  className = '',
  variant = 'default',
}) => {
  const formatNumber = (num: string | number) => {
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue)) return '0';
    return new Intl.NumberFormat('ar-LY').format(numValue);
  };

  const getColorClasses = (color: string = 'blue') => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        icon: 'text-blue-600',
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        icon: 'text-green-600',
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        icon: 'text-purple-600',
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
        icon: 'text-orange-600',
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        icon: 'text-red-600',
      },
      gray: {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        icon: 'text-gray-600',
      },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getChangeIcon = (changeType?: string) => {
    if (changeType === 'increase') {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    }
    if (changeType === 'decrease') {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getChangeColor = (changeType?: string) => {
    if (changeType === 'increase') return 'text-green-600';
    if (changeType === 'decrease') return 'text-red-600';
    return 'text-gray-600';
  };

  if (variant === 'compact') {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {onViewDetails && (
            <button onClick={onViewDetails} className="text-xs text-blue-600 hover:text-blue-700">
              التفاصيل
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {metrics.slice(0, 4).map((metric, index) => {
            const colors = getColorClasses(metric.color);
            return (
              <div key={index} className="text-center">
                <div className={`text-lg font-bold ${colors.text}`}>
                  {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
                </div>
                <div className="text-xs text-gray-600">{metric.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
          </div>
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
            >
              عرض التفاصيل
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric, index) => {
            const colors = getColorClasses(metric.color);
            return (
              <div key={index} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className={`rounded-lg p-2 ${colors.bg}`}>
                    {metric.icon || <ChartBarIcon className={`h-5 w-5 ${colors.icon}`} />}
                  </div>
                  {metric.change !== undefined && (
                    <div
                      className={`flex items-center gap-1 text-sm ${getChangeColor(metric.changeType)}`}
                    >
                      {getChangeIcon(metric.changeType)}
                      {metric.change > 0 ? '+' : ''}
                      {metric.change}%
                    </div>
                  )}
                </div>
                <div className={`text-2xl font-bold ${colors.text} mb-1`}>
                  {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
                </div>
                <div className="text-sm text-gray-600">{metric.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            عرض التفاصيل
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metrics.map((metric, index) => {
          const colors = getColorClasses(metric.color);
          return (
            <div key={index} className="text-center">
              <div className="mb-2 flex items-center justify-center">
                <div className={`rounded-lg p-2 ${colors.bg}`}>
                  {metric.icon || <ChartBarIcon className={`h-5 w-5 ${colors.icon}`} />}
                </div>
              </div>
              <div className={`text-xl font-bold ${colors.text} mb-1`}>
                {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
              </div>
              <div className="mb-1 text-sm text-gray-600">{metric.label}</div>
              {metric.change !== undefined && (
                <div
                  className={`flex items-center justify-center gap-1 text-xs ${getChangeColor(metric.changeType)}`}
                >
                  {getChangeIcon(metric.changeType)}
                  {metric.change > 0 ? '+' : ''}
                  {metric.change}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// مكونات مخصصة للاستخدامات الشائعة
export const AuctionReportsCard: React.FC<{
  totalViews: number;
  totalBidders: number;
  totalBids: number;
  highestBid: number;
  onViewDetails?: () => void;
  className?: string;
}> = ({ totalViews, totalBidders, totalBids, highestBid, onViewDetails, className }) => {
  const metrics: ReportMetric[] = [
    {
      label: 'إجمالي المشاهدات',
      value: totalViews,
      icon: <EyeIcon className="h-5 w-5" />,
      color: 'blue',
    },
    {
      label: 'إجمالي المزايدين',
      value: totalBidders,
      icon: <UserGroupIcon className="h-5 w-5" />,
      color: 'green',
    },
    {
      label: 'إجمالي المزايدات',
      value: totalBids,
      icon: <ChartBarIcon className="h-5 w-5" />,
      color: 'purple',
    },
    {
      label: 'أعلى مزايدة',
      value: `${new Intl.NumberFormat('ar-LY').format(highestBid)} د.ل`,
      icon: <CurrencyDollarIcon className="h-5 w-5" />,
      color: 'orange',
    },
  ];

  return (
    <ReportsCard
      title="تقرير المزاد"
      description="إحصائيات شاملة عن أداء المزاد"
      metrics={metrics}
      onViewDetails={onViewDetails}
      className={className}
    />
  );
};

export default ReportsCard;
