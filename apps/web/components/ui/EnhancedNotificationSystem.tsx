import React, { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
  BellIcon,
  TrophyIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

// أنواع الإشعارات المحسنة
export type NotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'bid'
  | 'auction'
  | 'price'
  | 'sale_confirmed'
  | 'payment_reminder'
  | 'payment_overdue'
  | 'new_bid'
  | 'auction_ended'
  | 'buyer_contact';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  priority?: NotificationPriority;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  actions?: Array<{
    label: string;
    onClick: () => void;
    type?: 'primary' | 'secondary' | 'danger';
  }>;
  data?: any;
  timestamp: Date;
  read?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: number;
}

// Context للإشعارات
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook لاستخدام الإشعارات مع حماية من التكرار
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// مكون الإشعار الواحد مع انيميشن محسن
const NotificationItem: React.FC<{
  notification: Notification;
  onRemove: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}> = ({ notification, onRemove, onMarkAsRead }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = useCallback(() => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  }, [onRemove, notification.id]);

  useEffect(() => {
    // تأثير الظهور
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    // إزالة تلقائية
    if (!notification.persistent && notification.duration !== 0) {
      const removeTimer = setTimeout(() => {
        handleRemove();
      }, notification.duration || 5000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(removeTimer);
      };
    }

    return () => clearTimeout(showTimer);
  }, [notification.duration, notification.persistent, handleRemove]);

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const getIcon = () => {
    const iconClass = 'h-5 w-5 flex-shrink-0';

    switch (notification.type) {
      case 'success':
      case 'sale_confirmed':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'error':
      case 'payment_overdue':
        return <XCircleIcon className={`${iconClass} text-red-500`} />;
      case 'warning':
      case 'payment_reminder':
        return <ExclamationTriangleIcon className={`${iconClass} text-yellow-500`} />;
      case 'info':
      case 'auction_ended':
      case 'buyer_contact':
        return <InformationCircleIcon className={`${iconClass} text-blue-500`} />;
      case 'bid':
      case 'new_bid':
        return <TrophyIcon className={`${iconClass} text-purple-500`} />;
      case 'auction':
        return <BellIcon className={`${iconClass} text-indigo-500`} />;
      case 'price':
        return <CurrencyDollarIcon className={`${iconClass} text-green-500`} />;
      default:
        return <InformationCircleIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  const getBackgroundColor = () => {
    if (!notification.read) {
      switch (notification.priority) {
        case 'urgent':
          return 'bg-red-50 border-red-200';
        case 'high':
          return 'bg-orange-50 border-orange-200';
        case 'medium':
          return 'bg-blue-50 border-blue-200';
        default:
          return 'bg-gray-50 border-gray-200';
      }
    }

    switch (notification.type) {
      case 'success':
      case 'sale_confirmed':
        return 'bg-green-50 border-green-200';
      case 'error':
      case 'payment_overdue':
        return 'bg-red-50 border-red-200';
      case 'warning':
      case 'payment_reminder':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      case 'auction_ended':
      case 'buyer_contact':
        return 'bg-blue-50 border-blue-200';
      case 'bid':
      case 'new_bid':
        return 'bg-purple-50 border-purple-200';
      case 'auction':
        return 'bg-indigo-50 border-indigo-200';
      case 'price':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${isRemoving ? 'scale-95' : 'scale-100'}`}
    >
      <div
        className={`mb-3 w-full max-w-sm rounded-xl border ${getBackgroundColor()} cursor-pointer bg-white/90 p-4 shadow-lg ring-1 ring-black/5 backdrop-blur-md transition-shadow hover:shadow-xl`}
        onClick={handleClick}
      >
        <div className="flex items-start gap-3">
          {getIcon()}

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
              {!notification.read && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">{notification.message}</p>

            {/* زر الإجراء المفرد */}
            {notification.action && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  notification.action!.onClick();
                }}
                className="mt-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                {notification.action.label}
              </button>
            )}

            {/* أزرار الإجراءات المتعددة */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
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

            <p className="mt-2 text-xs text-gray-500">
              {notification.timestamp.toLocaleTimeString('ar-SA')}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="flex-shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/50 hover:text-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// مكون عرض الإشعارات المحسن
export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification, markAsRead } = useNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // عرض أحدث 3 إشعارات غير مقروءة فقط
    const unread = notifications.filter((n) => !n.read).slice(0, 3);
    setVisibleNotifications(unread);
  }, [notifications]);

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-h-screen overflow-y-auto">
      <div className="space-y-2">
        {visibleNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
            onMarkAsRead={markAsRead}
          />
        ))}
      </div>
    </div>
  );
};

// Provider للإشعارات مع منع التكرار
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationIds = useRef(new Set<string>());

  // منع الإشعارات المكررة
  const isDuplicate = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const key = `${notification.type}-${notification.title}-${notification.message}`;
    return notificationIds.current.has(key);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    // تجنب الإشعارات المكررة
    const duplicateKey = `${notification.type}-${notification.title}-${notification.message}`;
    if (notificationIds.current.has(duplicateKey)) {
      return;
    }

    // تنظيف العنوان والنص من أي إيموجي لضمان الالتزام بالقواعد
    const stripEmoji = (s: string) =>
      s.replace(
        /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}]/gu,
        '',
      );

    const safeTitle = stripEmoji(notification.title || '');
    const safeMessage = stripEmoji(notification.message || '');

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      title: safeTitle,
      message: safeMessage,
      id,
      timestamp: new Date(),
      read: false,
      duration:
        notification.duration ??
        (notification.type === 'error' || notification.type === 'payment_overdue' ? 0 : 5000),
      priority: notification.priority ?? 'medium',
    };

    // إضافة إلى مجموعة المعرفات
    notificationIds.current.add(duplicateKey);

    setNotifications((prev) => {
      const updated = [newNotification, ...prev.slice(0, 9)]; // أقصى 10 إشعارات
      return updated;
    });

    // تنظيف المعرف بعد 30 ثانية لتجنب منع الإشعارات المستقبلية
    setTimeout(() => {
      notificationIds.current.delete(duplicateKey);
    }, 30000);

    // إشعار المتصفح إذا كان مسموحاً
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new window.Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: id,
        });
      } catch (error) {
        console.warn('Failed to show browser notification:', error);
      }
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === id);
      if (notification) {
        const key = `${notification.type}-${notification.title}-${notification.message}`;
        notificationIds.current.delete(key);
      }
      return prev.filter((n) => n.id !== id);
    });
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
    notificationIds.current.clear();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        unreadCount,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Hooks مساعدة للإشعارات السريعة
export const useQuickNotifications = () => {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message: string, action?: Notification['action']) => {
      const cleanTitle = title.replace(
        /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}]/gu,
        '',
      );
      addNotification({
        type: 'success',
        title: cleanTitle,
        message,
        action,
        priority: 'medium',
      });
    },
    error: (title: string, message: string, action?: Notification['action']) => {
      const cleanTitle = title.replace(
        /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}]/gu,
        '',
      );
      addNotification({
        type: 'error',
        title: cleanTitle,
        message,
        persistent: true,
        action,
        priority: 'high',
      });
    },
    warning: (title: string, message: string, action?: Notification['action']) => {
      addNotification({
        type: 'warning',
        title,
        message,
        action,
        priority: 'medium',
      });
    },
    info: (title: string, message: string, action?: Notification['action']) => {
      addNotification({
        type: 'info',
        title,
        message,
        action,
        priority: 'low',
      });
    },
    bid: (title: string, message: string, action?: Notification['action']) => {
      addNotification({
        type: 'bid',
        title,
        message,
        duration: 8000,
        action,
        priority: 'high',
      });
    },
    auction: (title: string, message: string, action?: Notification['action']) => {
      addNotification({
        type: 'auction',
        title,
        message,
        duration: 10000,
        action,
        priority: 'medium',
      });
    },
    price: (title: string, message: string, action?: Notification['action']) => {
      addNotification({
        type: 'price',
        title,
        message,
        action,
        priority: 'medium',
      });
    },
    // إشعارات المزادات المخصصة
    saleConfirmed: (buyerName: string, amount: string, actions?: Notification['actions']) => {
      addNotification({
        type: 'sale_confirmed',
        title: 'تم تأكيد البيع',
        message: `تم بيع المركبة للمشتري ${buyerName} بمبلغ ${amount} د.ل`,
        actions,
        priority: 'high',
        duration: 0, // دائم
      });
    },
    paymentReminder: (hoursLeft: number, actions?: Notification['actions']) => {
      addNotification({
        type: 'payment_reminder',
        title: 'تذكير بموعد الدفع',
        message: `يتبقى ${hoursLeft} ساعة لتأكيد الدفع من المشتري`,
        actions,
        priority: hoursLeft <= 2 ? 'urgent' : 'medium',
        duration: 0,
      });
    },
    paymentOverdue: (actions?: Notification['actions']) => {
      addNotification({
        type: 'payment_overdue',
        title: 'انتهت مهلة الدفع',
        message: 'انتهت المهلة المحددة لتأكيد الدفع. يرجى التواصل مع المشتري.',
        actions,
        priority: 'urgent',
        duration: 0,
      });
    },
    newBid: (bidderName: string, amount: string, actions?: Notification['actions']) => {
      addNotification({
        type: 'new_bid',
        title: 'مزايدة جديدة',
        message: `مزايدة جديدة من ${bidderName} بمبلغ ${amount} د.ل`,
        actions,
        priority: 'medium',
        duration: 8000,
      });
    },
  };
};
