/**
 * 📱 صفحة رسائل SMS
 * إدارة الرسائل النصية والإشعارات
 */

import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface SMSLog {
  id: string;
  phone: string;
  message: string;
  type: 'otp' | 'notification' | 'marketing' | 'reminder';
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  cost: number;
  createdAt: string;
  deliveredAt?: string;
  errorMessage?: string;
}

interface Stats {
  total: number;
  delivered: number;
  sent: number;
  failed: number;
  pending: number;
  totalCost: number;
}

export default function SMSPage() {
  const [messages, setMessages] = useState<SMSLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'otp' | 'notification' | 'marketing'>('all');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'delivered' | 'failed' | 'pending' | 'sent'
  >('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSendModal, setShowSendModal] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    delivered: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    totalCost: 0,
  });

  // حالة نموذج الإرسال
  const [sendPhone, setSendPhone] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [sendType, setSendType] = useState<'notification' | 'marketing'>('notification');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');

  const itemsPerPage = 20;

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/sms/logs?${params}`);
      const result = await response.json();

      if (result.success) {
        setMessages(result.data.logs || []);
        setStats(
          result.data.stats || {
            total: 0,
            delivered: 0,
            sent: 0,
            failed: 0,
            pending: 0,
            totalCost: 0,
          },
        );
        setTotalPages(result.data.pagination?.totalPages || 1);
      } else {
        console.error('Error fetching messages:', result.message);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterType, filterStatus, searchQuery]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // إرسال رسالة جديدة
  const handleSendMessage = async () => {
    if (!sendPhone || !sendMessage) {
      setSendError('رقم الهاتف والرسالة مطلوبان');
      return;
    }

    setSending(true);
    setSendError('');
    setSendSuccess('');

    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: sendPhone,
          message: sendMessage,
          type: sendType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSendSuccess('تم إرسال الرسالة بنجاح!');
        setSendPhone('');
        setSendMessage('');
        // تحديث القائمة
        setTimeout(() => {
          setShowSendModal(false);
          setSendSuccess('');
          fetchMessages();
        }, 1500);
      } else {
        setSendError(result.message || 'فشل إرسال الرسالة');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      setSendError('حدث خطأ أثناء الإرسال');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('ar-LY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      otp: 'bg-purple-900/50 text-purple-400',
      notification: 'bg-blue-900/50 text-blue-400',
      marketing: 'bg-orange-900/50 text-orange-400',
      reminder: 'bg-yellow-900/50 text-yellow-400',
    };
    const labels: Record<string, string> = {
      otp: 'رمز تحقق',
      notification: 'إشعار',
      marketing: 'تسويق',
      reminder: 'تذكير',
    };
    return (
      <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>رسائل SMS | لوحة التحكم</title>
      </Head>

      <div className="space-y-6 p-6">
        {/* العنوان */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/communications"
              className="rounded-lg bg-slate-700 p-2 text-slate-300 transition hover:bg-slate-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">رسائل SMS</h1>
              <p className="text-sm text-slate-400">{stats.total} رسالة</p>
            </div>
          </div>
          <button
            onClick={() => setShowSendModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            إرسال رسالة
          </button>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
            <p className="text-sm text-slate-400">إجمالي الرسائل</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
            <p className="text-sm text-slate-400">مُسلّمة</p>
            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
            <p className="text-sm text-slate-400">فاشلة</p>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
            <p className="text-sm text-slate-400">معلقة</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
            <p className="text-sm text-slate-400">التكلفة</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalCost.toFixed(2)} د.ل</p>
          </div>
        </div>

        {/* أدوات البحث والفلترة */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-[200px] flex-1">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالرقم أو المحتوى..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 py-2 pl-4 pr-10 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">جميع الأنواع</option>
            <option value="otp">رمز تحقق</option>
            <option value="notification">إشعار</option>
            <option value="marketing">تسويق</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="sent">مُرسلة</option>
            <option value="delivered">مُسلّمة</option>
            <option value="failed">فاشلة</option>
            <option value="pending">معلقة</option>
          </select>

          <button className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600">
            <ArrowDownTrayIcon className="h-5 w-5" />
            تصدير
          </button>
        </div>

        {/* جدول الرسائل */}
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-sm">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                  الحالة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                  الرقم
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                  الرسالة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                  النوع
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                  التكلفة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                  التاريخ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-slate-600" />
                    <p className="mt-2 text-slate-400">لا توجد رسائل SMS</p>
                    <button
                      onClick={() => setShowSendModal(true)}
                      className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      إرسال رسالة جديدة
                    </button>
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">{getStatusIcon(msg.status)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white" dir="ltr">
                        {msg.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-xs truncate text-slate-300" title={msg.message}>
                        {msg.message}
                      </p>
                      {msg.errorMessage && (
                        <p className="text-xs text-red-500">{msg.errorMessage}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">{getTypeBadge(msg.type)}</td>
                    <td className="px-4 py-3 text-slate-300">{(msg.cost || 0).toFixed(2)} د.ل</td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {formatDate(msg.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* الصفحات */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600 disabled:opacity-50"
            >
              السابق
            </button>
            <span className="text-sm text-slate-400">
              صفحة {currentPage} من {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600 disabled:opacity-50"
            >
              التالي
            </button>
          </div>
        )}

        {/* Modal إرسال رسالة */}
        {showSendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-bold text-white">إرسال رسالة SMS</h3>

              {/* رسائل النجاح والخطأ */}
              {sendSuccess && (
                <div className="mb-4 rounded-lg bg-green-900/50 p-3 text-sm text-green-400">
                  <CheckCircleIcon className="ml-2 inline h-5 w-5" />
                  {sendSuccess}
                </div>
              )}
              {sendError && (
                <div className="mb-4 rounded-lg bg-red-900/50 p-3 text-sm text-red-400">
                  <XCircleIcon className="ml-2 inline h-5 w-5" />
                  {sendError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    placeholder="+218912345678"
                    value={sendPhone}
                    onChange={(e) => setSendPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    نوع الرسالة
                  </label>
                  <select
                    value={sendType}
                    onChange={(e) => setSendType(e.target.value as 'notification' | 'marketing')}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="notification">إشعار</option>
                    <option value="marketing">تسويق</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">الرسالة</label>
                  <textarea
                    placeholder="اكتب رسالتك هنا..."
                    rows={4}
                    value={sendMessage}
                    onChange={(e) => setSendMessage(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">{sendMessage.length} / 160 حرف</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowSendModal(false);
                    setSendError('');
                    setSendSuccess('');
                  }}
                  disabled={sending}
                  className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600 disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !sendPhone || !sendMessage}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {sending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <PaperAirplaneIcon className="h-4 w-4" />
                  )}
                  {sending ? 'جاري الإرسال...' : 'إرسال'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
