/**
 * Connection Status Component
 * مكون حالة الاتصال
 */

import React from 'react';
import {
  WifiIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface ConnectionStatusProps {
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  isConnected: boolean;
  onRetry?: () => void;
  compact?: boolean;
  lastError?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionState,
  isConnected,
  onRetry,
  compact = false,
  lastError,
}) => {
  // Get status info
  const getStatusInfo = () => {
    switch (connectionState) {
      case 'connected':
        return {
          icon: CheckCircleIcon,
          text: 'متصل',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
        };
      case 'connecting':
        return {
          icon: ArrowPathIcon,
          text: 'جاري الاتصال...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          animate: true,
        };
      case 'reconnecting':
        return {
          icon: ArrowPathIcon,
          text: 'جاري إعادة الاتصال...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          animate: true,
        };
      case 'error':
        return {
          icon: XCircleIcon,
          text: 'خطأ في الاتصال',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
        };
      case 'disconnected':
      default:
        return {
          icon: ExclamationTriangleIcon,
          text: 'منقطع',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const IconComponent = statusInfo.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
          {statusInfo.animate ? (
            <>
              <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
              <span className="sr-only">{statusInfo.text}</span>
            </>
          ) : (
            <>
              <IconComponent className={`h-3 w-3`} />
              <span>{statusInfo.text}</span>
            </>
          )}
        </div>

        {(connectionState === 'error' || connectionState === 'disconnected') && onRetry && (
          <button
            onClick={onRetry}
            className="p-1 text-gray-400 transition-colors hover:text-gray-600"
            title="إعادة المحاولة"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {statusInfo.animate ? (
            <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
          ) : (
            <IconComponent className={`h-6 w-6 ${statusInfo.color}`} />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-medium ${statusInfo.color}`}>حالة الاتصال</h3>
            <span
              className={`rounded px-2 py-1 text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
            >
              {statusInfo.text}
            </span>
          </div>

          {lastError && (connectionState === 'error' || connectionState === 'disconnected') && (
            <p className="mt-1 text-sm text-gray-600">{lastError}</p>
          )}

          {connectionState === 'connecting' && (
            <span className="sr-only">{statusInfo.text}</span>
          )}

          {connectionState === 'reconnecting' && (
            <span className="sr-only">{statusInfo.text}</span>
          )}
        </div>

        {(connectionState === 'error' || connectionState === 'disconnected') && onRetry && (
          <button
            onClick={onRetry}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              connectionState === 'error'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            إعادة المحاولة
          </button>
        )}
      </div>

      {/* Connection Quality Indicator */}
      {isConnected && connectionState === 'connected' && (
        <div className="mt-3 flex items-center gap-2">
          <WifiIcon className="h-4 w-4 text-green-500" />
          <div className="flex items-center gap-1">
            <div className="h-3 w-2 rounded-sm bg-green-500"></div>
            <div className="h-4 w-2 rounded-sm bg-green-500"></div>
            <div className="h-5 w-2 rounded-sm bg-green-500"></div>
            <div className="h-6 w-2 rounded-sm bg-green-500"></div>
          </div>
          <span className="text-xs font-medium text-green-600">جودة اتصال ممتازة</span>
        </div>
      )}

      {/* Troubleshooting Tips */}
      {(connectionState === 'error' || connectionState === 'disconnected') && !compact && (
        <div className="mt-3 rounded border bg-white p-3">
          <h4 className="mb-2 text-sm font-medium text-gray-700">نصائح لحل المشكلة:</h4>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• تأكد من استقرار اتصال الإنترنت</li>
            <li>• أعد تحميل الصفحة</li>
            <li>• تأكد من عدم حظر المتصفح للاتصالات</li>
            <li>• جرب متصفح آخر إذا استمرت المشكلة</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
