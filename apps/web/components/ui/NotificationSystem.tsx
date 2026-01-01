import React, { useState, useEffect, createContext, useContext } from 'react';
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

// أنواع الإشعارات
export type NotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'bid'
  | 'auction'
  | 'price';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

// Context للإشعارات
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook لاستخدام الإشعارات
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// مكون الإشعار الواحد
const NotificationItem: React.FC<{
  notification: Notification;
  onRemove: (id: string) => void;
}> = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // تأثير الظهور
    setTimeout(() => setIsVisible(true), 100);

    // إزالة تلقائية
    if (!notification.persistent && notification.duration !== 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, notification.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  const getIcon = () => {
    const iconClass = 'h-5 w-5 flex-shrink-0';

    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'error':
        return <XCircleIcon className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClass} text-yellow-500`} />;
      case 'info':
        return <InformationCircleIcon className={`${iconClass} text-blue-500`} />;
      case 'bid':
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
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'bid':
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
      className={`transform transition-all duration-300 ease-in-out ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} ${isRemoving ? 'scale-95' : 'scale-100'} `}
    >
      <div
        className={
          'mb-3 w-full max-w-sm rounded-xl border border-white/30 bg-white/70 shadow-lg ring-1 ring-black/5 backdrop-blur-md'
        }
      >
        <div className="flex items-start gap-3">
          {getIcon()}

          <div className="min-w-0 flex-1">
            <h4 className="mb-1 text-sm font-semibold text-gray-900">{notification.title}</h4>
            <p className="text-sm leading-relaxed text-gray-700">{notification.message}</p>

            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="mt-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                {notification.action.label}
              </button>
            )}
          </div>

          <button
            onClick={handleRemove}
            className="flex-shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/50 hover:text-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// مكون عرض الإشعارات
export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-h-screen overflow-y-auto">
      <div className="space-y-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

// Provider للإشعارات
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
    };

    setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]); // الحد الأقصى 5 إشعارات
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAll,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Hook مساعد للإشعارات السريعة
export const useQuickNotifications = () => {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message: string, action?: Notification['action']) => {
      addNotification({ type: 'success', title, message, action });
    },
    error: (title: string, message: string, action?: Notification['action']) => {
      addNotification({
        type: 'error',
        title,
        message,
        persistent: true,
        action,
      });
    },
    warning: (title: string, message: string, action?: Notification['action']) => {
      addNotification({ type: 'warning', title, message, action });
    },
    info: (title: string, message: string, action?: Notification['action']) => {
      addNotification({ type: 'info', title, message, action });
    },
    bid: (title: string, message: string, action?: Notification['action']) => {
      addNotification({ type: 'bid', title, message, duration: 8000, action });
    },
    auction: (title: string, message: string, action?: Notification['action']) => {
      addNotification({
        type: 'auction',
        title,
        message,
        duration: 10000,
        action,
      });
    },
    price: (title: string, message: string, action?: Notification['action']) => {
      addNotification({ type: 'price', title, message, action });
    },
  };
};

// لا حاجة لتصدير افتراضي - جميع المكونات مُصدرة بالاسم
