// @ts-nocheck
import {
  BellIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  CheckIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MegaphoneIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/solid';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { OpensooqNavbar } from '../../components/common';
import useAuth from '../../hooks/useAuth';

interface Notification {
  id: string;
  title: string;
  message: string;
  type:
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'announcement'
    | 'auction'
    | 'message'
    | 'system';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    const checkAuthTimeout = setTimeout(() => {
      if (!authLoading && !user) {
        router.push('/login?callbackUrl=' + encodeURIComponent('/notifications'));
      }
    }, 200);
    return () => clearTimeout(checkAuthTimeout);
  }, [user, authLoading, router]);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/notifications?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        } else {
          setNotifications(getMockNotifications());
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications(getMockNotifications());
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  // Mock data
  const getMockNotifications = (): Notification[] => [
    {
      id: '1',
      title: 'مرحباً بك في سوق مزاد!',
      message: 'نحن سعداء بانضمامك إلينا. استكشف المزادات والسيارات المتاحة الآن.',
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString(),
      link: '/auctions',
    },
    {
      id: '2',
      title: 'مزايدة جديدة على سيارتك',
      message: 'تلقيت مزايدة جديدة بقيمة 45,000 دينار على مرسيدس E-Class 2021',
      type: 'auction',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      link: '/auction/1',
    },
    {
      id: '3',
      title: 'تم تأكيد حسابك',
      message: 'تم التحقق من رقم هاتفك بنجاح. يمكنك الآن المشاركة في المزادات.',
      type: 'success',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '4',
      title: 'تحديث النظام',
      message: 'تم تحديث نظام المزادات بميزات جديدة. تعرف عليها الآن!',
      type: 'announcement',
      isRead: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      link: '/help',
    },
    {
      id: '5',
      title: 'رسالة جديدة',
      message: 'لديك رسالة جديدة من البائع بخصوص السيارة BMW X5',
      type: 'message',
      isRead: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      link: '/messages',
    },
    {
      id: '6',
      title: 'انتهى المزاد',
      message: 'انتهى المزاد على تويوتا كامري 2020. تحقق من النتيجة.',
      type: 'auction',
      isRead: true,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      link: '/auction/2',
    },
  ];

  // Helper functions
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return InformationCircleIcon;
      case 'success':
        return CheckCircleIcon;
      case 'warning':
        return ExclamationTriangleIcon;
      case 'error':
        return XCircleIcon;
      case 'announcement':
        return MegaphoneIcon;
      case 'auction':
        return CurrencyDollarIcon;
      case 'message':
        return ChatBubbleLeftIcon;
      default:
        return BellIcon;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'info':
        return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500' };
      case 'success':
        return { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-500' };
      case 'warning':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-500' };
      case 'error':
        return { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500' };
      case 'announcement':
        return { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-500' };
      case 'auction':
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-500' };
      case 'message':
        return { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-500' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'text-gray-500' };
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = Date.now();
      const diff = now - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'الآن';
      if (minutes < 60) return `منذ ${minutes} دقيقة`;
      if (hours < 24) return `منذ ${hours} ساعة`;
      if (days < 7) return `منذ ${days} يوم`;
      return date.toLocaleDateString('ar-LY');
    } catch {
      return '';
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'read') return n.isRead;
    return true;
  });

  // Stats
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Loading state
  // تم إزالة spinner - UnifiedPageTransition يتولى ذلك
  if (authLoading) return null;

  if (!user) return null;

  return (
    <>
      <Head>
        <title>الإشعارات - سوق مزاد</title>
        <meta name="description" content="عرض جميع الإشعارات الخاصة بك" />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        <div className="mx-auto max-w-4xl px-4 py-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-3">
                <BellAlertIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">الإشعارات</h1>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0
                    ? `لديك ${unreadCount} إشعار غير مقروء`
                    : 'جميع الإشعارات مقروءة'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <CheckIcon className="h-4 w-4" />
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-gray-200 pb-4">
            {[
              { key: 'all', label: 'الكل', count: notifications.length },
              { key: 'unread', label: 'غير مقروء', count: unreadCount },
              { key: 'read', label: 'مقروء', count: notifications.length - unreadCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    activeTab === tab.key ? 'bg-blue-200' : 'bg-gray-200'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Notifications List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
              <BellIcon className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">لا توجد إشعارات</h3>
              <p className="mt-2 text-gray-500">ستظهر إشعاراتك هنا عند وصولها</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const TypeIcon = getTypeIcon(notification.type);
                const styles = getTypeStyles(notification.type);

                return (
                  <div
                    key={notification.id}
                    className={`group relative rounded-xl border p-4 transition-all hover:shadow-md ${
                      notification.isRead
                        ? 'border-gray-200 bg-white'
                        : `${styles.bg} ${styles.border}`
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 rounded-full p-2 ${notification.isRead ? 'bg-gray-100' : styles.bg}`}
                      >
                        <TypeIcon
                          className={`h-5 w-5 ${notification.isRead ? 'text-gray-400' : styles.icon}`}
                        />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <h3
                            className={`font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}
                          >
                            {notification.title}
                            {!notification.isRead && (
                              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                            )}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p
                          className={`mt-1 text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-600'}`}
                        >
                          {notification.message}
                        </p>

                        {/* Actions */}
                        <div className="mt-3 flex items-center gap-3">
                          {notification.link && (
                            <Link
                              href={notification.link}
                              onClick={() => markAsRead(notification.id)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                              عرض التفاصيل
                            </Link>
                          )}
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                            >
                              <CheckIcon className="h-4 w-4" />
                              تحديد كمقروء
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="flex-shrink-0 rounded-lg p-2 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                        title="حذف"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
