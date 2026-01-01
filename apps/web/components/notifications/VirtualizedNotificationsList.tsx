import React, { useCallback } from 'react';
import { InfiniteScrollList } from '@/components/virtualized/VirtualizedList';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: any;
}

interface VirtualizedNotificationsListProps {
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  unreadOnly?: boolean;
  className?: string;
}

export function VirtualizedNotificationsList({
  onNotificationClick,
  onMarkAsRead,
  unreadOnly = false,
  className = '',
}: VirtualizedNotificationsListProps) {
  // دالة جلب الإشعارات
  const fetchNotifications = useCallback(
    async (page: number, pageSize: number) => {
      const params = new URLSearchParams({
        pageSize: pageSize.toString(),
      });

      if (unreadOnly) {
        params.append('unreadOnly', 'true');
      }

      const response = await fetch(`/api/notifications/paginated?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const result = await response.json();

      return {
        data: result.data,
        hasMore: result.hasMore,
      };
    },
    [unreadOnly],
  );

  const {
    data: notifications,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteScroll<Notification>({
    fetchData: fetchNotifications,
    pageSize: 30,
  });

  // أيقونة حسب نوع الإشعار
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BID':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
          </div>
        );
      case 'MESSAGE':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
        );
      case 'AUCTION_WON':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      case 'PAYMENT':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
        );
      case 'SYSTEM':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
        );
    }
  };

  // عرض الإشعار
  const renderNotification = useCallback(
    (notification: Notification, index: number, style: React.CSSProperties) => {
      const handleClick = () => {
        if (!notification.read && onMarkAsRead) {
          onMarkAsRead(notification.id);
        }
        if (onNotificationClick) {
          onNotificationClick(notification);
        }
      };

      return (
        <div
          key={notification.id}
          className={`cursor-pointer border-b border-gray-200 p-4 transition-colors hover:bg-gray-50 ${
            !notification.read ? 'bg-blue-50' : 'bg-white'
          }`}
          onClick={handleClick}
        >
          <div className="flex gap-3">
            {/* أيقونة الإشعار */}
            {getNotificationIcon(notification.type)}

            {/* محتوى الإشعار */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-gray-900">{notification.title}</h4>

                {!notification.read && (
                  <div className="flex-shrink-0">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                  </div>
                )}
              </div>

              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{notification.message}</p>

              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                <span>{new Date(notification.createdAt).toLocaleDateString('ar-LY')}</span>
                <span>
                  {new Date(notification.createdAt).toLocaleTimeString('ar-LY', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    },
    [onNotificationClick, onMarkAsRead],
  );

  return (
    <div className={`flex flex-col ${className}`}>
      {/* عداد الإشعارات */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">الإشعارات</h3>

          <button onClick={refresh} className="text-sm text-blue-600 hover:text-blue-700">
            تحديث
          </button>
        </div>

        {notifications.length > 0 && (
          <p className="mt-1 text-sm text-gray-600">
            {notifications.filter((n) => !n.read).length} إشعار غير مقروء
          </p>
        )}
      </div>

      {/* قائمة الإشعارات المحسنة */}
      <InfiniteScrollList
        items={notifications}
        height={600}
        itemHeight={120}
        renderItem={renderNotification}
        loading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        emptyMessage="لا توجد إشعارات"
        className="bg-white"
      />
    </div>
  );
}

export default VirtualizedNotificationsList;
