import React, { useState, useEffect } from 'react';
import BellIcon from '@heroicons/react/24/outline/BellIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import HandRaisedIcon from '@heroicons/react/24/outline/HandRaisedIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import EnvelopeIcon from '@heroicons/react/24/outline/EnvelopeIcon';
import {
  CheckCircleIcon as CheckCircleSolid,
  BellIcon as BellSolid,
} from '@heroicons/react/24/solid';

interface AuctionNotification {
  id: string;
  type:
    | 'sale_confirmed'
    | 'payment_reminder'
    | 'payment_overdue'
    | 'new_bid'
    | 'auction_ended'
    | 'buyer_contact';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: any;
  actions?: NotificationAction[];
}

interface NotificationAction {
  label: string;
  action: () => void;
  type?: 'primary' | 'secondary' | 'danger';
}

interface AuctionNotificationSystemProps {
  auctionId: string;
  isOwner: boolean;
  onNotificationAction?: (action: string, data: any) => void;
}

const AuctionNotificationSystem: React.FC<AuctionNotificationSystemProps> = ({
  auctionId,
  isOwner,
  onNotificationAction,
}) => {
  const [notifications, setNotifications] = useState<AuctionNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // إضافة إشعار جديد
  const addNotification = (
    notification: Omit<AuctionNotification, 'id' | 'timestamp' | 'read'>,
  ) => {
    const newNotification: AuctionNotification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]); // الاحتفاظ بآخر 10 إشعارات
    setUnreadCount((prev) => prev + 1);

    // إشعار المتصفح إذا كان مسموحاً
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: newNotification.id,
      });
    }

    return newNotification.id;
  };

  // وضع علامة مقروء على إشعار
  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // وضع علامة مقروء على جميع الإشعارات
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    setUnreadCount(0);
  };

  // حذف إشعار
  const removeNotification = (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  // دوال إنشاء إشعارات محددة
  const createSaleConfirmedNotification = (buyerName: string, amount: string) => {
    return addNotification({
      type: 'sale_confirmed',
      title: '<SparklesIcon className="w-5 h-5 text-yellow-500" /> تم تأكيد البيع!',
      message: `تم بيع المركبة للمشتري ${buyerName} بمبلغ ${amount} د.ل`,
      priority: 'high',
      actions: [
        {
          label: 'عرض التفاصيل',
          action: () => onNotificationAction?.('view_sale_details', { buyerName, amount }),
          type: 'primary',
        },
        {
          label: 'التواصل مع المشتري',
          action: () => onNotificationAction?.('contact_buyer', { buyerName }),
          type: 'secondary',
        },
      ],
    });
  };

  const createPaymentReminderNotification = (hoursLeft: number) => {
    return addNotification({
      type: 'payment_reminder',
      title: '⏰ تذكير بموعد الدفع',
      message: `يتبقى ${hoursLeft} ساعة لتأكيد الدفع من المشتري`,
      priority: hoursLeft <= 2 ? 'urgent' : 'medium',
      actions: [
        {
          label: 'التواصل مع المشتري',
          action: () => onNotificationAction?.('contact_buyer', {}),
          type: 'primary',
        },
      ],
    });
  };

  const createPaymentOverdueNotification = () => {
    return addNotification({
      type: 'payment_overdue',
      title: '🚨 انتهت مهلة الدفع',
      message: 'انتهت المهلة المحددة لتأكيد الدفع. يرجى التواصل مع المشتري.',
      priority: 'urgent',
      actions: [
        {
          label: 'التواصل مع المشتري',
          action: () => onNotificationAction?.('contact_buyer', {}),
          type: 'primary',
        },
        {
          label: 'إعادة طرح المزاد',
          action: () => onNotificationAction?.('relist_auction', {}),
          type: 'secondary',
        },
      ],
    });
  };

  const createNewBidNotification = (bidderName: string, amount: string) => {
    return addNotification({
      type: 'new_bid',
      title: '<CurrencyDollarIcon className="w-5 h-5 text-green-500" /> مزايدة جديدة',
      message: `مزايدة جديدة من ${bidderName} بمبلغ ${amount} د.ل`,
      priority: 'medium',
      actions: [
        {
          label: 'عرض المزايدات',
          action: () => onNotificationAction?.('view_bids', {}),
          type: 'primary',
        },
      ],
    });
  };

  // تصدير الدوال للاستخدام الخارجي
  useEffect(() => {
    // يمكن ربط هذه الدوال بالمكون الأب
    if (onNotificationAction) {
      (window as any).auctionNotifications = {
        saleConfirmed: createSaleConfirmedNotification,
        paymentReminder: createPaymentReminderNotification,
        paymentOverdue: createPaymentOverdueNotification,
        newBid: createNewBidNotification,
      };
    }
  }, [onNotificationAction]);

  // تحديد لون الأولوية
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // تحديد أيقونة النوع
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sale_confirmed':
        return <CheckCircleSolid className="h-5 w-5 text-green-600" />;
      case 'payment_reminder':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'payment_overdue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'new_bid':
        return <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />;
      case 'buyer_contact':
        return <UserIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="relative">
      {/* زر الإشعارات */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {unreadCount > 0 ? (
          <BellSolid className="h-6 w-6 text-blue-600" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* قائمة الإشعارات */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 max-h-96 w-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* رأس القائمة */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800">الإشعارات</h3>
            <div className="flex items-center space-x-2 space-x-reverse">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  وضع علامة مقروء على الكل
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

          {/* قائمة الإشعارات */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">لا توجد إشعارات</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-gray-100 p-4 hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="flex-shrink-0">{getTypeIcon(notification.type)}</div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          )}
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="mt-1 text-sm text-gray-600">{notification.message}</p>

                      <p className="mt-1 text-xs text-gray-400">
                        {notification.timestamp.toLocaleString('en-US')}
                      </p>

                      {/* أزرار الإجراءات */}
                      {notification.actions && notification.actions.length > 0 && (
                        <div className="mt-2 flex space-x-2 space-x-reverse">
                          {notification.actions.map((action, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                action.action();
                                markAsRead(notification.id);
                              }}
                              className={`rounded-lg px-3 py-1 text-xs font-medium ${
                                action.type === 'primary'
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : action.type === 'danger'
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionNotificationSystem;
