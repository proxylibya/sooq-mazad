/**
 * 📞 صفحة سجل المكالمات
 * عرض جميع المكالمات الصوتية والفيديو
 */

import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface CallLog {
  id: string;
  callerId: string;
  callerName: string;
  callerPhone: string;
  callerAvatar?: string;
  calleeId: string;
  calleeName: string;
  calleePhone: string;
  calleeAvatar?: string;
  type: 'voice' | 'video';
  status: 'completed' | 'missed' | 'rejected' | 'failed' | 'busy';
  duration: number;
  startTime: string;
  endTime?: string;
  conversationId?: string;
}

export default function CallsPage() {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'voice' | 'video'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'missed' | 'rejected'>(
    'all',
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
        });

        if (filterType !== 'all') params.append('type', filterType);
        if (filterStatus !== 'all') params.append('status', filterStatus);
        if (searchQuery) params.append('search', searchQuery);

        const response = await fetch(`/api/calls/logs?${params}`);
        const result = await response.json();

        if (result.success && result.data.logs.length > 0) {
          setCalls(result.data.logs);
        } else {
          // بيانات تجريبية كـ fallback
          const mockCalls: CallLog[] = [];
          setCalls(mockCalls);
        }
      } catch (error) {
        console.error('Error fetching calls:', error);
        setCalls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, [currentPage, filterType, filterStatus, searchQuery]);

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      missed: 'bg-red-100 text-red-700',
      rejected: 'bg-orange-100 text-orange-700',
      failed: 'bg-gray-100 text-gray-700',
      busy: 'bg-yellow-100 text-yellow-700',
    };
    const labels: Record<string, string> = {
      completed: 'مكتملة',
      missed: 'فائتة',
      rejected: 'مرفوضة',
      failed: 'فاشلة',
      busy: 'مشغول',
    };
    return (
      <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // فلترة المكالمات
  const filteredCalls = calls.filter((call) => {
    const matchesSearch =
      call.callerName.includes(searchQuery) ||
      call.calleeName.includes(searchQuery) ||
      call.callerPhone.includes(searchQuery) ||
      call.calleePhone.includes(searchQuery);

    const matchesType = filterType === 'all' || call.type === filterType;
    const matchesStatus = filterStatus === 'all' || call.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // الصفحات
  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage);
  const paginatedCalls = filteredCalls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>سجل المكالمات | لوحة التحكم</title>
      </Head>

      <div className="space-y-6 p-6">
        {/* العنوان */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/communications"
            className="rounded-lg bg-slate-700 p-2 text-slate-300 transition hover:bg-slate-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">سجل المكالمات</h1>
            <p className="text-sm text-slate-400">{filteredCalls.length} مكالمة</p>
          </div>
        </div>

        {/* أدوات البحث والفلترة */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-[200px] flex-1">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الرقم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 py-2 pl-4 pr-10 text-white placeholder-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'voice' | 'video')}
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="all">جميع الأنواع</option>
            <option value="voice">صوتية</option>
            <option value="video">فيديو</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as 'all' | 'completed' | 'missed' | 'rejected')
            }
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="completed">مكتملة</option>
            <option value="missed">فائتة</option>
            <option value="rejected">مرفوضة</option>
          </select>

          <button className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600">
            <ArrowDownTrayIcon className="h-5 w-5" />
            تصدير
          </button>
        </div>

        {/* جدول المكالمات */}
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-sm">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                  النوع
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                  المتصل
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                  المتلقي
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                  الحالة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                  المدة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                  التاريخ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {paginatedCalls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <PhoneIcon className="mx-auto h-12 w-12 text-slate-600" />
                    <p className="mt-2 text-slate-400">لا توجد مكالمات مسجلة</p>
                    <p className="text-sm text-slate-500">ستظهر المكالمات هنا عند إجراء مكالمات</p>
                  </td>
                </tr>
              ) : (
                paginatedCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3">
                      <div
                        className={`inline-flex rounded-full p-2 ${
                          call.type === 'video'
                            ? 'bg-blue-900/50 text-blue-400'
                            : 'bg-green-900/50 text-green-400'
                        }`}
                      >
                        {call.type === 'video' ? (
                          <VideoCameraIcon className="h-4 w-4" />
                        ) : (
                          <PhoneIcon className="h-4 w-4" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{call.callerName}</p>
                      <p className="text-sm text-slate-400" dir="ltr">
                        {call.callerPhone}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{call.calleeName}</p>
                      <p className="text-sm text-slate-400" dir="ltr">
                        {call.calleePhone}
                      </p>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(call.status)}</td>
                    <td className="px-4 py-3 text-slate-300">{formatDuration(call.duration)}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {formatDate(call.startTime)}
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
      </div>
    </AdminLayout>
  );
}
