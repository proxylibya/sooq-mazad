/**
 * صفحة إدارة الإشعارات
 */
import {
  BellIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { NotificationItem } from '../../lib/notifications/notification-system';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    // إضافة بعض الإشعارات الوهمية للعرض
    const mockNotifications: NotificationItem[] = [
      {
        id: '1',
        type: 'info',
        title: 'مستخدم جديد',
        message: 'تم تسجيل مستخدم جديد: محمد أحمد',
        timestamp: new Date(Date.now() - 3600000),
        read: false,
        category: 'users',
        actionUrl: '/admin/users',
        actionLabel: 'عرض المستخدمين',
      },
      {
        id: '2',
        type: 'warning',
        title: 'طلب سحب جديد',
        message: 'يوجد طلب سحب بقيمة 5,000 د.ل بانتظار الموافقة',
        timestamp: new Date(Date.now() - 7200000),
        read: false,
        category: 'wallets',
        actionUrl: '/admin/wallets/withdrawals',
        actionLabel: 'عرض الطلبات',
      },
      {
        id: '3',
        type: 'success',
        title: 'مزاد مكتمل',
        message: 'تم إكمال مزاد BMW X5 2022 بنجاح',
        timestamp: new Date(Date.now() - 86400000),
        read: true,
        category: 'auctions',
        actionUrl: '/admin/auctions',
      },
      {
        id: '4',
        type: 'error',
        title: 'محاولة دخول مشبوهة',
        message: 'تم رصد محاولات دخول فاشلة متعددة من IP: 192.168.1.100',
        timestamp: new Date(Date.now() - 172800000),
        read: true,
        category: 'security',
        actionUrl: '/admin/security/login-logs',
        actionLabel: 'عرض السجل',
      },
      {
        id: '5',
        type: 'info',
        title: 'معرض جديد قيد المراجعة',
        message: 'معرض "الريادة للسيارات" بانتظار الموافقة',
        timestamp: new Date(Date.now() - 259200000),
        read: false,
        category: 'showrooms',
        actionUrl: '/admin/showrooms/pending',
      },
    ];

    setNotifications(mockNotifications);
  }, []);

  const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckIcon className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <XMarkIcon className="h-5 w-5 text-red-400" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-400" />;
    }
  };

  const getTypeColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      default:
        return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'users', label: 'المستخدمين' },
    { id: 'auctions', label: 'المزادات' },
    { id: 'wallets', label: 'المحافظ' },
    { id: 'showrooms', label: 'المعارض' },
    { id: 'security', label: 'الأمان' },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread' && n.read) return false;
    if (filter === 'read' && !n.read) return false;
    if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <AdminLayout title="الإشعارات">
      {/* الإحصائيات */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <BellIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{notifications.length}</p>
              <p className="text-sm text-slate-400">إجمالي الإشعارات</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/20 p-2">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{unreadCount}</p>
              <p className="text-sm text-yellow-400/70">غير مقروءة</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <CheckIcon className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {notifications.length - unreadCount}
              </p>
              <p className="text-sm text-green-400/70">مقروءة</p>
            </div>
          </div>
        </div>
      </div>

      {/* الفلاتر */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-800 p-4">
        <div className="flex gap-2">
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {f === 'all' ? 'الكل' : f === 'unread' ? 'غير مقروءة' : 'مقروءة'}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-600"
            >
              <CheckIcon className="h-4 w-4" />
              تحديد الكل كمقروء
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 rounded-lg bg-red-600/20 px-4 py-2 text-sm text-red-400 hover:bg-red-600/30"
            >
              <TrashIcon className="h-4 w-4" />
              مسح الكل
            </button>
          )}
        </div>
      </div>

      {/* قائمة الإشعارات */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-12 text-center">
            <BellIcon className="mx-auto mb-4 h-16 w-16 text-slate-600" />
            <p className="text-lg text-slate-400">لا توجد إشعارات</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border p-4 transition-colors ${
                notification.read
                  ? 'border-slate-700 bg-slate-800'
                  : getTypeColor(notification.type)
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-lg p-2 ${getTypeColor(notification.type)}`}>
                  {getTypeIcon(notification.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3
                        className={`font-medium ${notification.read ? 'text-slate-300' : 'text-white'}`}
                      >
                        {notification.title}
                      </h3>
                      <p
                        className={`mt-1 text-sm ${notification.read ? 'text-slate-500' : 'text-slate-400'}`}
                      >
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
                          title="تحديد كمقروء"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="rounded p-1 text-slate-400 hover:bg-red-500/20 hover:text-red-400"
                        title="حذف"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {formatTime(notification.timestamp)}
                    </span>
                    {notification.actionUrl && (
                      <a
                        href={notification.actionUrl}
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        {notification.actionLabel || 'عرض التفاصيل'} ←
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
