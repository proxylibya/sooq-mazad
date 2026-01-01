import React from 'react';
import ArrowUpIcon from '@heroicons/react/24/outline/ArrowUpIcon';
import ArrowDownIcon from '@heroicons/react/24/outline/ArrowDownIcon';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'indigo';
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, change, subtitle }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      icon: 'text-blue-600',
      text: 'text-blue-900',
      border: 'border-blue-200',
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      icon: 'text-green-600',
      text: 'text-green-900',
      border: 'border-green-200',
    },
    yellow: {
      bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      icon: 'text-yellow-600',
      text: 'text-yellow-900',
      border: 'border-yellow-200',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      icon: 'text-purple-600',
      text: 'text-purple-900',
      border: 'border-purple-200',
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 to-red-100',
      icon: 'text-red-600',
      text: 'text-red-900',
      border: 'border-red-200',
    },
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      icon: 'text-indigo-600',
      text: 'text-indigo-900',
      border: 'border-indigo-200',
    },
  };

  const classes = colorClasses[color];

  return (
    <div
      className={`rounded-xl border p-6 ${classes.bg} ${classes.border} transition-all duration-200 hover:shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <div className={`rounded-lg bg-white/50 p-2 ${classes.icon}`}>{icon}</div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>

          <div className="mb-2">
            <p className={`text-3xl font-bold ${classes.text}`}>
              {typeof value === 'number' ? value.toLocaleString('en-US') : value}
            </p>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>

          {change && (
            <div className="flex items-center gap-1">
              {change.type === 'increase' ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change.value}%
              </span>
              <span className="text-sm text-gray-500">{change.period}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
