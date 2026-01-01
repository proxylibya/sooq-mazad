import React, { useState, useEffect } from 'react';
import BellIcon from '@heroicons/react/24/outline/BellIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import HandRaisedIcon from '@heroicons/react/24/outline/HandRaisedIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import {
  BellIcon as BellSolid,
  CheckCircleIcon as CheckCircleSolid,
} from '@heroicons/react/24/solid';

interface Notification {
  id: string;
  type: 'new_bid' | 'high_bid' | 'auction_ending' | 'auction_won' | 'auction_ended' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  data?: any;
}

interface AuctionNotificationsProps {
  auctionId: string;
  isOwner: boolean;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const AuctionNotifications: React.FC<AuctionNotificationsProps> = ({
  auctionId,
  isOwner,
  isEnabled,
  onToggle,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // جلب الإشعارات الحقيقية للمالك
  useEffect(() => {
    if (isOwner && isEnabled) {
      // TODO: جلب الإشعارات الحقيقية من قاعدة البيانات
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isOwner, isEnabled]);

  // استقبال الإشعارات الحقيقية
  useEffect(() => {
    if (!isOwner || !isEnabled) return;

    // TODO: تنفيذ استقبال الإشعارات الحقيقية من الخادم
    // يمكن استخدام WebSocket أو Server-Sent Events

    // const interval = setInterval(() => {
    //   // جلب الإشعارات الجديدة من API
    //   fetchAuctionNotifications();
    // }, 30000); // كل 30 ثانية

    // return () => clearInterval(interval);
  }, [isOwner, isEnabled]);

  // دالة طلب إذن الإشعارات (يجب استدعاؤها من user event)
  const requestNotificationPermission = async () => {
    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
      } catch (error) {
        console.warn('خطأ في طلب إذن الإشعارات:', error);
      }
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_bid':
        return <HandRaisedIcon className="h-5 w-5 text-blue-600" />;
      case 'high_bid':
        return <CurrencyDollarIcon className="h-5 w-5 text-green-600" />;
      case 'auction_ending':
        return <ClockIcon className="h-5 w-5 text-orange-600" />;
      case 'auction_won':
        return <CheckCircleSolid className="h-5 w-5 text-green-600" />;
      case 'auction_ended':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  if (!isOwner) return null;

  return (
    <div className="relative">
      {/* زر الإشعارات */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className={`relative rounded-lg p-2 transition-colors ${
          isEnabled
            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title="الإشعارات"
      >
        {isEnabled ? <BellSolid className="h-5 w-5" /> : <BellIcon className="h-5 w-5" />}

        {/* عداد الإشعارات غير المقروءة */}
        {unreadCount > 0 && (
          <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* قائمة الإشعارات */}
      {showNotifications && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-lg border bg-white shadow-xl">
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">الإشعارات</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggle(!isEnabled)}
                  className={`text-xs font-medium ${isEnabled ? 'text-blue-600' : 'text-gray-500'}`}
                >
                  {isEnabled ? 'إيقاف' : 'تفعيل'}
                </button>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  تحديد الكل كمقروء
                </button>
              )}

              {/* زر طلب إذن الإشعارات */}
              {Notification.permission === 'default' && (
                <button
                  onClick={requestNotificationPermission}
                  className="text-xs text-green-600 hover:text-green-800"
                >
                  تفعيل إشعارات المتصفح
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <BellIcon className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm">لا توجد إشعارات</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors hover:bg-gray-50 ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-gray-200 p-3">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800">
                عرض جميع الإشعارات
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuctionNotifications;
