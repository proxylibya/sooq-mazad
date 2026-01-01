/**
 * لوحة تحكم معاملات الترويج المدفوعة
 * Paid Promotion Transactions Dashboard
 */

import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PauseCircleIcon,
  SparklesIcon,
  StarIcon,
  TrashIcon,
  TrophyIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface PromotionStats {
  pending: { count: number; revenue: number };
  active: { count: number; revenue: number };
  expired: { count: number; revenue: number };
  cancelled: { count: number; revenue: number };
  totalRevenue: number;
}

interface Promotion {
  id: string;
  entityType: string;
  entityId: string;
  packageType: string;
  packageName: string;
  entityTypeName: string;
  statusName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  days: number;
  startDate: string | null;
  endDate: string | null;
  status: string;
  daysRemaining: number | null;
  isExpired: boolean;
  createdAt: string;
  users: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
}

export default function PromotionTransactionsPage() {
  const [stats, setStats] = useState<PromotionStats | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<
    'all' | 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
  >('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const status = selectedTab === 'all' ? '' : selectedTab;
      const res = await fetch(
        `/api/admin/promotion-transactions?status=${status}&search=${search}`,
      );

      if (res.ok) {
        const data = await res.json();
        setPromotions(data.data || []);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // تفعيل ترويج معلق
  const handleActivate = async (id: string) => {
    if (!confirm('هل تريد تفعيل هذا الترويج؟ سيتم بدء فترة الترويج من الآن.')) return;
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/promotion-transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'activate' }),
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'فشل في تفعيل الترويج');
      }
    } catch {
      alert('حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  // إلغاء ترويج
  const handleCancel = async (id: string) => {
    if (!confirm('هل تريد إلغاء هذا الترويج؟ سيتم إزالة التمييز من الإعلان.')) return;
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/promotion-transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'cancel' }),
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'فشل في إلغاء الترويج');
      }
    } catch {
      alert('حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  // حذف ترويج
  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا الترويج نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/promotion-transactions?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'فشل في حذف الترويج');
      }
    } catch {
      alert('حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  const getPackageBadge = (packageType: string) => {
    switch (packageType) {
      case 'vip':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white">
            <TrophyIcon className="h-3 w-3" />
            VIP
          </span>
        );
      case 'premium':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 text-xs font-bold text-white">
            <SparklesIcon className="h-3 w-3" />
            مميز
          </span>
        );
      case 'basic':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 text-xs font-bold text-white">
            <StarIcon className="h-3 w-3" />
            أساسي
          </span>
        );
      default:
        return <span className="text-slate-400">{packageType}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
            <PauseCircleIcon className="h-3 w-3" />
            معلق
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
            <CheckCircleIcon className="h-3 w-3" />
            نشط
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/20 px-3 py-1 text-xs font-medium text-slate-400">
            <ClockIcon className="h-3 w-3" />
            منتهي
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
            <XCircleIcon className="h-3 w-3" />
            ملغي
          </span>
        );
      default:
        return <span className="text-slate-400">{status}</span>;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'wallet':
        return 'المحفظة';
      case 'libyana':
        return 'ليبيانا';
      case 'madar':
        return 'مدار';
      default:
        return method;
    }
  };

  return (
    <AdminLayout title="معاملات الترويج المدفوعة">
      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* معلق */}
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20">
              <PauseCircleIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-yellow-400/80">معلق</p>
              <p className="text-xl font-bold text-white">{stats?.pending.count || 0}</p>
            </div>
          </div>
        </div>

        {/* نشط */}
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-green-400/80">نشط</p>
              <p className="text-xl font-bold text-white">{stats?.active.count || 0}</p>
            </div>
          </div>
        </div>

        {/* منتهي */}
        <div className="rounded-xl border border-slate-600 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">
              <ClockIcon className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">منتهي</p>
              <p className="text-xl font-bold text-white">{stats?.expired.count || 0}</p>
            </div>
          </div>
        </div>

        {/* ملغي */}
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
              <XCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-red-400/80">ملغي</p>
              <p className="text-xl font-bold text-white">{stats?.cancelled.count || 0}</p>
            </div>
          </div>
        </div>

        {/* إجمالي الإيرادات */}
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
              <CurrencyDollarIcon className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-amber-400/80">الإيرادات</p>
              <p className="text-xl font-bold text-white">
                {stats?.totalRevenue?.toLocaleString() || 0} د.ل
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بمعرف الإعلان أو اسم المستخدم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 py-2 pl-4 pr-10 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
        >
          <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-slate-700">
        {[
          { key: 'all', label: 'الكل' },
          { key: 'PENDING', label: 'معلق' },
          { key: 'ACTIVE', label: 'نشط' },
          { key: 'EXPIRED', label: 'منتهي' },
          { key: 'CANCELLED', label: 'ملغي' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key as typeof selectedTab)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              selectedTab === tab.key
                ? 'border-b-2 border-amber-500 text-amber-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : promotions.length === 0 ? (
          <div className="py-12 text-center">
            <StarIcon className="mx-auto h-12 w-12 text-slate-600" />
            <p className="mt-2 text-slate-400">لا توجد معاملات ترويج</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                    المستخدم
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                    الإعلان
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                    الباقة
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                    المبلغ
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                    طريقة الدفع
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                    الحالة
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                    المدة
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {promotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-slate-700/50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="font-medium text-white">{promo.users?.name || 'غير معروف'}</p>
                      <p className="text-sm text-slate-500">{promo.users?.phone}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="text-slate-300">{promo.entityTypeName}</p>
                      <p className="font-mono text-xs text-slate-500">
                        {promo.entityId.slice(0, 12)}...
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {getPackageBadge(promo.packageType)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-white">
                      {promo.amount} د.ل
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                      {getPaymentMethodName(promo.paymentMethod)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{getStatusBadge(promo.status)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="text-slate-300">{promo.days} يوم</p>
                      {promo.daysRemaining !== null && promo.status === 'ACTIVE' && (
                        <p
                          className={`text-xs ${promo.daysRemaining <= 3 ? 'text-red-400' : 'text-slate-500'}`}
                        >
                          متبقي: {promo.daysRemaining} يوم
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        {promo.status === 'PENDING' && (
                          <button
                            onClick={() => handleActivate(promo.id)}
                            disabled={actionLoading === promo.id}
                            className="rounded bg-green-500/20 p-1.5 text-green-400 hover:bg-green-500/30 disabled:opacity-50"
                            title="تفعيل"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        {promo.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleCancel(promo.id)}
                            disabled={actionLoading === promo.id}
                            className="rounded bg-yellow-500/20 p-1.5 text-yellow-400 hover:bg-yellow-500/30 disabled:opacity-50"
                            title="إلغاء"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(promo.id)}
                          disabled={actionLoading === promo.id}
                          className="rounded bg-red-500/20 p-1.5 text-red-400 hover:bg-red-500/30 disabled:opacity-50"
                          title="حذف"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 text-blue-400" />
          <div className="text-sm text-blue-300">
            <p className="mb-1 font-medium">معلومات:</p>
            <ul className="list-inside list-disc space-y-1 text-blue-300/80">
              <li>
                <strong>معلق:</strong> طلبات الترويج التي تنتظر تأكيد الدفع (ليبيانا/مدار)
              </li>
              <li>
                <strong>نشط:</strong> الترويجات المفعلة والسارية - الإعلان يظهر كمميز
              </li>
              <li>
                <strong>منتهي:</strong> الترويجات التي انتهت مدتها
              </li>
              <li>
                <strong>ملغي:</strong> الترويجات التي تم إلغاؤها يدوياً
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
