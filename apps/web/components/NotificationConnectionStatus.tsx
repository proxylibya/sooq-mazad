import React, { useState, useEffect } from 'react';
import WifiIcon from '@heroicons/react/24/outline/WifiIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';

interface NotificationConnectionStatusProps {
  isConnected: boolean;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onReconnect?: () => void;
}

const NotificationConnectionStatus: React.FC<NotificationConnectionStatusProps> = ({
  isConnected,
  className = '',
  showLabel = false,
  size = 'md',
  onReconnect,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [lastConnectionTime, setLastConnectionTime] = useState<Date | null>(null);

  // تحديث وقت آخر اتصال
  useEffect(() => {
    if (isConnected) {
      setLastConnectionTime(new Date());
    }
  }, [isConnected]);

  // تحديد الأحجام
  const sizeClasses = {
    sm: {
      indicator: 'w-2 h-2',
      icon: 'w-3 h-3',
      text: 'text-xs',
    },
    md: {
      indicator: 'w-3 h-3',
      icon: 'w-4 h-4',
      text: 'text-sm',
    },
    lg: {
      indicator: 'w-4 h-4',
      icon: 'w-5 h-5',
      text: 'text-base',
    },
  };

  const currentSize = sizeClasses[size];

  // تحديد الألوان والأيقونات حسب حالة الاتصال
  const getStatusConfig = () => {
    if (isConnected) {
      return {
        color: 'bg-green-500',
        textColor: 'text-green-600',
        icon: CheckCircleIcon,
        label: 'متصل',
        tooltip: 'متصل بخدمة الإشعارات الفورية',
      };
    } else {
      return {
        color: 'bg-red-500',
        textColor: 'text-red-600',
        icon: ExclamationTriangleIcon,
        label: 'غير متصل',
        tooltip: 'غير متصل بخدمة الإشعارات',
      };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const handleReconnect = () => {
    if (onReconnect) {
      onReconnect();
    }
  };

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      {/* مؤشر حالة الاتصال */}
      <div
        className="relative cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={!isConnected ? handleReconnect : undefined}
      >
        {/* النقطة الملونة */}
        <div
          className={`${currentSize.indicator} rounded-full ${statusConfig.color} ${
            isConnected ? 'animate-pulse' : ''
          }`}
        />

        {/* أيقونة صغيرة */}
        <StatusIcon
          className={`${currentSize.icon} ${statusConfig.textColor} absolute -right-1 -top-1`}
        />

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform">
            <div className="whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white">
              <div className="font-medium">{statusConfig.tooltip}</div>
              {lastConnectionTime && isConnected && (
                <div className="mt-1 text-gray-300">
                  آخر اتصال: {lastConnectionTime.toLocaleTimeString('ar-SA')}
                </div>
              )}
              {!isConnected && onReconnect && (
                <div className="mt-1 text-gray-300">انقر للمحاولة مرة أخرى</div>
              )}

              {/* سهم التوضيح */}
              <div className="absolute left-1/2 top-full -translate-x-1/2 transform">
                <div className="border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* التسمية النصية */}
      {showLabel && (
        <span className={`${currentSize.text} ${statusConfig.textColor} font-medium`}>
          {statusConfig.label}
        </span>
      )}

      {/* زر إعادة الاتصال */}
      {!isConnected && onReconnect && (
        <button
          onClick={handleReconnect}
          className="rounded-full p-1 transition-colors hover:bg-gray-100"
          title="إعادة المحاولة"
        >
          <ArrowPathIcon className={`${currentSize.icon} text-gray-500 hover:text-gray-700`} />
        </button>
      )}
    </div>
  );
};

export default NotificationConnectionStatus;
