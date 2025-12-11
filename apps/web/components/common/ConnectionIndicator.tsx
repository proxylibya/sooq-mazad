/**
 * 🟢 Connection Indicator Component
 * مؤشر حالة الاتصال الفوري
 */

import React from 'react';
import { ConnectionStatus } from '@/hooks/useRealtimeConnection';

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
  className?: string;
  showText?: boolean;
}

const statusConfig = {
  connected: {
    color: 'bg-green-500',
    text: 'متصل',
    icon: '●',
    pulse: false,
  },
  connecting: {
    color: 'bg-yellow-500',
    text: 'جاري الاتصال...',
    icon: '◐',
    pulse: true,
  },
  reconnecting: {
    color: 'bg-orange-500',
    text: 'إعادة الاتصال...',
    icon: '◑',
    pulse: true,
  },
  disconnected: {
    color: 'bg-gray-400',
    text: 'غير متصل',
    icon: '○',
    pulse: false,
  },
  error: {
    color: 'bg-red-500',
    text: 'خطأ في الاتصال',
    icon: '✕',
    pulse: false,
  },
};

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  status,
  className = '',
  showText = false,
}) => {
  const config = statusConfig[status];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div
          className={`h-2.5 w-2.5 rounded-full ${config.color} ${
            config.pulse ? 'animate-pulse' : ''
          }`}
          title={config.text}
        />
        {config.pulse && (
          <div
            className={`absolute inset-0 h-2.5 w-2.5 rounded-full ${config.color} animate-ping opacity-75`}
          />
        )}
      </div>
      
      {showText && (
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {config.text}
        </span>
      )}
    </div>
  );
};

/**
 * مؤشر مصغر للنافبار
 */
export const NavConnectionIndicator: React.FC<{ status: ConnectionStatus }> = ({
  status,
}) => {
  const config = statusConfig[status];
  
  // لا نعرض شيء إذا كان متصل (لتقليل التشويش)
  if (status === 'connected') {
    return null;
  }

  return (
    <div
      className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm dark:bg-gray-800"
      title={config.text}
    >
      <div className="relative">
        <div
          className={`h-2 w-2 rounded-full ${config.color} ${
            config.pulse ? 'animate-pulse' : ''
          }`}
        />
        {config.pulse && (
          <div
            className={`absolute inset-0 h-2 w-2 rounded-full ${config.color} animate-ping opacity-75`}
          />
        )}
      </div>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
        {config.text}
      </span>
    </div>
  );
};

/**
 * مؤشر كبير للصفحات الرئيسية
 */
export const LargeConnectionIndicator: React.FC<{
  status: ConnectionStatus;
  onRetry?: () => void;
}> = ({ status, onRetry }) => {
  const config = statusConfig[status];

  // لا نعرض شيء إذا كان متصل
  if (status === 'connected') {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`h-3 w-3 rounded-full ${config.color} ${
                config.pulse ? 'animate-pulse' : ''
              }`}
            />
            {config.pulse && (
              <div
                className={`absolute inset-0 h-3 w-3 rounded-full ${config.color} animate-ping opacity-75`}
              />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {config.text}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {status === 'connecting' && 'الرجاء الانتظار...'}
              {status === 'reconnecting' && 'محاولة إعادة الاتصال...'}
              {status === 'disconnected' && 'الاتصال غير متوفر'}
              {status === 'error' && 'فشل الاتصال بالخادم'}
            </p>
          </div>
        </div>
        
        {(status === 'error' || status === 'disconnected') && onRetry && (
          <button
            onClick={onRetry}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            إعادة المحاولة
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectionIndicator;
