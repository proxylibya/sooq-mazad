/**
 * مكون إشعارات الأخطاء
 * Error Notification Component
 */

import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';

import React, { useState, useEffect } from 'react';
import {
  ClientError,
  clientErrorHandler,
  ErrorSeverity,
} from '../../lib/error-handling/client-error-handler';

interface ErrorNotificationProps {
  maxNotifications?: number;
  autoHideDuration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showDetails?: boolean;
}

interface NotificationItem extends ClientError {
  visible: boolean;
  hideTimer?: NodeJS.Timeout;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  maxNotifications = 5,
  autoHideDuration = 5000,
  position = 'top-right',
  showDetails = false,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // إضافة مستمع للأخطاء الجديدة
    const handleNewError = (error: ClientError) => {
      // تجاهل الأخطاء منخفضة الأهمية إذا لم يكن showDetails مفعل
      if (!showDetails && error.severity === ErrorSeverity.INFO) {
        return;
      }

      const newNotification: NotificationItem = {
        ...error,
        visible: true,
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev].slice(0, maxNotifications);

        // إعداد مؤقت الإخفاء التلقائي
        if (autoHideDuration > 0) {
          newNotification.hideTimer = setTimeout(() => {
            hideNotification(error.id);
          }, autoHideDuration);
        }

        return updated;
      });
    };

    clientErrorHandler.addNotificationCallback(handleNewError);

    return () => {
      clientErrorHandler.removeNotificationCallback(handleNewError);
    };
  }, [maxNotifications, autoHideDuration, showDetails]);

  // إخفاء إشعار
  const hideNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, visible: false } : notification,
      ),
    );

    // إزالة الإشعار بعد انتهاء الأنيميشن
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 300);
  };

  // إغلاق جميع الإشعارات
  const clearAllNotifications = () => {
    notifications.forEach((notification) => {
      if (notification.hideTimer) {
        clearTimeout(notification.hideTimer);
      }
    });
    setNotifications([]);
  };

  // الحصول على أيقونة الخطأ
  const getErrorIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return '🚨';
      case ErrorSeverity.HIGH:
        return '<XCircleIcon className="w-5 h-5 text-red-500" />';
      case ErrorSeverity.MEDIUM:
        return '<ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />';
      case ErrorSeverity.LOW:
        return '<InformationCircleIcon className="w-5 h-5 text-blue-500" />';
      case ErrorSeverity.INFO:
        return '<InformationCircleIcon className="w-5 h-5 text-blue-400" />';
      default:
        return '❓';
    }
  };

  // الحصول على ألوان الخطأ
  const getErrorColors = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return {
          bg: 'bg-red-100 border-red-500',
          text: 'text-red-800',
          button: 'text-red-600 hover:text-red-800',
        };
      case ErrorSeverity.HIGH:
        return {
          bg: 'bg-red-50 border-red-400',
          text: 'text-red-700',
          button: 'text-red-500 hover:text-red-700',
        };
      case ErrorSeverity.MEDIUM:
        return {
          bg: 'bg-yellow-50 border-yellow-400',
          text: 'text-yellow-800',
          button: 'text-yellow-600 hover:text-yellow-800',
        };
      case ErrorSeverity.LOW:
        return {
          bg: 'bg-blue-50 border-blue-400',
          text: 'text-blue-800',
          button: 'text-blue-600 hover:text-blue-800',
        };
      case ErrorSeverity.INFO:
        return {
          bg: 'bg-gray-50 border-gray-400',
          text: 'text-gray-800',
          button: 'text-gray-600 hover:text-gray-800',
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-400',
          text: 'text-gray-800',
          button: 'text-gray-600 hover:text-gray-800',
        };
    }
  };

  // الحصول على موقع الإشعارات
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={`fixed z-50 ${getPositionClasses()} space-y-2`} dir="rtl">
      {/* زر مسح جميع الإشعارات */}
      {notifications.length > 1 && (
        <div className="mb-2 flex justify-end">
          <button
            onClick={clearAllNotifications}
            className="rounded bg-white px-2 py-1 text-xs text-gray-500 shadow hover:text-gray-700"
          >
            مسح الكل
          </button>
        </div>
      )}

      {/* الإشعارات */}
      {notifications.map((notification) => {
        const colors = getErrorColors(notification.severity);

        return (
          <div
            key={notification.id}
            className={`w-full max-w-sm transform rounded-lg border-r-4 p-4 shadow-lg transition-all duration-300 ease-in-out ${notification.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} ${colors.bg} `}
          >
            <div className="flex items-start">
              {/* أيقونة الخطأ */}
              <div className="ml-3 flex-shrink-0">
                <span className="text-xl">{getErrorIcon(notification.severity)}</span>
              </div>

              {/* محتوى الإشعار */}
              <div className="min-w-0 flex-1">
                {/* رسالة المستخدم */}
                <p className={`text-sm font-medium ${colors.text}`}>{notification.userMessage}</p>

                {/* تفاصيل إضافية */}
                {showDetails && (
                  <div className="mt-2 text-xs text-gray-600">
                    <p>النوع: {notification.type}</p>
                    <p>الوقت: {new Date(notification.timestamp).toLocaleTimeString('ar-SA')}</p>
                    {notification.statusCode && <p>كود الحالة: {notification.statusCode}</p>}
                  </div>
                )}

                {/* الاقتراحات */}
                {notification.suggestions && notification.suggestions.length > 0 && (
                  <div className="mt-2">
                    <p className="mb-1 text-xs font-medium text-gray-700">الحلول المقترحة:</p>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {notification.suggestions.slice(0, 2).map((suggestion, index) => (
                        <li key={index} className="flex items-center">
                          <span className="ml-2 h-1 w-1 rounded-full bg-gray-400"></span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* أزرار الإجراءات */}
                <div className="mt-3 flex space-x-2 space-x-reverse">
                  {notification.retryable && (
                    <button
                      onClick={() => {
                        // يمكن إضافة منطق إعادة المحاولة هنا
                        hideNotification(notification.id);
                      }}
                      className={`text-xs font-medium ${colors.button} hover:underline`}
                    >
                      إعادة المحاولة
                    </button>
                  )}

                  <button
                    onClick={() => hideNotification(notification.id)}
                    className={`text-xs font-medium ${colors.button} hover:underline`}
                  >
                    إغلاق
                  </button>
                </div>
              </div>

              {/* زر الإغلاق */}
              <div className="mr-3 flex-shrink-0">
                <button
                  onClick={() => hideNotification(notification.id)}
                  className={`${colors.button} rounded-full p-1 hover:bg-gray-100`}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ErrorNotification;
