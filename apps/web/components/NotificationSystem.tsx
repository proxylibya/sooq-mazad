import React, { useState, useEffect } from 'react';
import BellIcon from '@heroicons/react/24/outline/BellIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';

interface Notification {
  id: string;
  type: 'message' | 'call' | 'system' | 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
  actions?: NotificationAction[];
}

interface NotificationAction {
  label: string;
  action: () => void;
  type?: 'primary' | 'secondary';
}

interface NotificationSystemProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onRemove: (notificationId: string) => void;
  onClear: () => void;
  maxVisible?: number;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemove,
  onClear,
  maxVisible = 5,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

  // تحديث الإشعارات المرئية
  useEffect(() => {
    const unreadNotifications = notifications.filter((n) => !n.read);
    setVisibleNotifications(unreadNotifications.slice(0, maxVisible));
  }, [notifications, maxVisible]);

  // إغلاق الإشعار تلقائياً بعد فترة
  useEffect(() => {
    visibleNotifications.forEach((notification) => {
      if (notification.type === 'success' || notification.type === 'info') {
        const timer = setTimeout(() => {
          onMarkAsRead(notification.id);
        }, 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [visibleNotifications, onMarkAsRead]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
      case 'call':
        return <PhoneIcon className="h-5 w-5" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5" />;
      default:
        return <BellIcon className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-500 text-white';
      case 'call':
        return 'bg-green-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'info':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* زر الإشعارات */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <BellIcon className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* قائمة الإشعارات */}
        {isOpen && (
          <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">الإشعارات</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      تعليم الكل كمقروء
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`rounded-lg p-3 ${
                        notification.read ? 'bg-gray-50' : 'bg-blue-50'
                      } border border-gray-200`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`rounded-full p-1 ${getNotificationColor(notification.type)}`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="truncate text-sm font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{notification.message}</p>

                          {/* أزرار الإجراءات */}
                          {notification.actions && notification.actions.length > 0 && (
                            <div className="mt-2 flex gap-2">
                              {notification.actions.map((action, index) => (
                                <button
                                  key={index}
                                  onClick={action.action}
                                  className={`rounded-md px-3 py-1 text-xs ${
                                    action.type === 'primary'
                                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => onRemove(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {notifications.length > 0 && (
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <button
                    onClick={onClear}
                    className="w-full text-center text-sm text-red-600 hover:text-red-800"
                  >
                    مسح جميع الإشعارات
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* الإشعارات العائمة */}
      <div className="fixed left-4 top-20 z-50 space-y-2">
        {visibleNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`max-w-sm rounded-lg p-4 shadow-lg ${getNotificationColor(notification.type)} animate-slide-in`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium">{notification.title}</h4>
                <p className="mt-1 text-sm opacity-90">{notification.message}</p>
              </div>
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="flex-shrink-0 opacity-70 hover:opacity-100"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default NotificationSystem;
