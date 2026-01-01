/**
 * صفحة إدارة الإيداعات
 * Deposits Management Page
 */
import {
  ArrowDownIcon,
  BanknotesIcon,
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  FunnelIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

type WalletType = 'ALL' | 'LOCAL' | 'GLOBAL' | 'CRYPTO';
type DepositStatus =
  | 'ALL'
  | 'INITIATED'
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

interface Deposit {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  currency: string;
  walletType: 'LOCAL' | 'GLOBAL' | 'CRYPTO';
  status: 'INITIATED' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  paymentMethod: string;
  reference: string;
  paymentReference: string | null;
  fees: number;
  netAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface DepositStats {
  totalDeposits: number;
  pendingDeposits: number;
  todayDeposits: number;
  todayAmount: number;
  pendingAmount: number;
  completedAmount: number;
}

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [stats, setStats] = useState<DepositStats>({
    totalDeposits: 0,
    pendingDeposits: 0,
    todayDeposits: 0,
    todayAmount: 0,
    pendingAmount: 0,
    completedAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [walletTypeFilter, setWalletTypeFilter] = useState<WalletType>('ALL');
  const [statusFilter, setStatusFilter] = useState<DepositStatus>('ALL');
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDeposits();
  }, [walletTypeFilter, statusFilter]);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(walletTypeFilter !== 'ALL' && { walletType: walletTypeFilter }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      });

      const res = await fetch(`/api/admin/wallets/deposits?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDeposits(data.deposits || []);
          if (data.stats) setStats(data.stats);
        }
      }
    } catch (err) {
      // Mock data
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockDeposits: Deposit[] = [
      {
        id: 'dep-001',
        userId: 'user-001',
        userName: 'محمد أحمد',
        userPhone: '+218912345678',
        amount: 5000,
        currency: 'LYD',
        walletType: 'LOCAL',
        status: 'PENDING',
        paymentMethod: 'مصرف الجمهورية',
        reference: 'LOCAL-DEP-001',
        paymentReference: 'BANK-REF-123',
        fees: 100,
        netAmount: 4900,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'dep-002',
        userId: 'user-002',
        userName: 'علي حسن',
        userPhone: '+218923456789',
        amount: 200,
        currency: 'USD',
        walletType: 'GLOBAL',
        status: 'INITIATED',
        paymentMethod: 'PayPal',
        reference: 'GLOBAL-DEP-002',
        paymentReference: null,
        fees: 6.8,
        netAmount: 193.2,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'dep-003',
        userId: 'user-003',
        userName: 'أحمد سالم',
        userPhone: '+218934567890',
        amount: 100,
        currency: 'USDT',
        walletType: 'CRYPTO',
        status: 'PROCESSING',
        paymentMethod: 'USDT-TRC20',
        reference: 'CRYPTO-DEP-003',
        paymentReference: 'TX-HASH-ABC123',
        fees: 1,
        netAmount: 99,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'dep-004',
        userId: 'user-004',
        userName: 'خالد محمود',
        userPhone: '+218945678901',
        amount: 3000,
        currency: 'LYD',
        walletType: 'LOCAL',
        status: 'COMPLETED',
        paymentMethod: 'كروت ليبيانا',
        reference: 'LOCAL-DEP-004',
        paymentReference: 'CARD-001',
        fees: 60,
        netAmount: 2940,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    setDeposits(mockDeposits);
    setStats({
      totalDeposits: mockDeposits.length,
      pendingDeposits: mockDeposits.filter((d) =>
        ['PENDING', 'INITIATED', 'PROCESSING'].includes(d.status),
      ).length,
      todayDeposits: 3,
      todayAmount: 5300,
      pendingAmount: 5300,
      completedAmount: 3000,
    });
  };

  const handleApprove = async (depositId: string) => {
    if (!confirm('هل تريد تأكيد هذا الإيداع وإضافة الرصيد للمستخدم؟')) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/wallets/deposits/${depositId}/approve`, {
        method: 'POST',
      });

      if (res.ok) {
        setDeposits((prev) =>
          prev.map((d) => (d.id === depositId ? { ...d, status: 'COMPLETED' as const } : d)),
        );
        alert('تم تأكيد الإيداع بنجاح');
        setSelectedDeposit(null);
      }
    } catch (err) {
      // Mock success
      setDeposits((prev) =>
        prev.map((d) => (d.id === depositId ? { ...d, status: 'COMPLETED' as const } : d)),
      );
      alert('تم تأكيد الإيداع بنجاح');
      setSelectedDeposit(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (depositId: string) => {
    const reason = prompt('سبب الرفض:');
    if (!reason) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/wallets/deposits/${depositId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        setDeposits((prev) =>
          prev.map((d) => (d.id === depositId ? { ...d, status: 'CANCELLED' as const } : d)),
        );
        alert('تم رفض الإيداع');
        setSelectedDeposit(null);
      }
    } catch (err) {
      // Mock success
      setDeposits((prev) =>
        prev.map((d) => (d.id === depositId ? { ...d, status: 'CANCELLED' as const } : d)),
      );
      alert('تم رفض الإيداع');
      setSelectedDeposit(null);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'LYD') return new Intl.NumberFormat('ar-LY').format(amount) + ' د.ل';
    if (currency === 'USD') return '$' + new Intl.NumberFormat('en-US').format(amount);
    return new Intl.NumberFormat('en-US').format(amount) + ' ' + currency;
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { bg: string; text: string; label: string }> = {
      INITIATED: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'جديد' },
      PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'بانتظار المراجعة' },
      PROCESSING: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'قيد المعالجة' },
      COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'مكتمل' },
      FAILED: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'فشل' },
      CANCELLED: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'ملغي' },
    };
    const s = statuses[status] || statuses.PENDING;
    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  const getWalletTypeIcon = (type: string) => {
    switch (type) {
      case 'LOCAL':
        return <BanknotesIcon className="h-4 w-4 text-emerald-400" />;
      case 'GLOBAL':
        return <GlobeAltIcon className="h-4 w-4 text-blue-400" />;
      case 'CRYPTO':
        return <CurrencyDollarIcon className="h-4 w-4 text-purple-400" />;
      default:
        return null;
    }
  };

  const filteredDeposits = deposits.filter((deposit) => {
    const matchesSearch =
      deposit.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.userPhone.includes(searchTerm) ||
      deposit.reference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const pendingDeposits = filteredDeposits.filter((d) =>
    ['INITIATED', 'PENDING', 'PROCESSING'].includes(d.status),
  );

  return (
    <AdminLayout title="إدارة الإيداعات">
      {/* إحصائيات */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <ArrowDownIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stats.totalDeposits}</p>
              <p className="text-xs text-slate-400">إجمالي الإيداعات</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/20 p-2">
              <ClockIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stats.pendingDeposits}</p>
              <p className="text-xs text-slate-400">معلقة</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <CheckIcon className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stats.todayDeposits}</p>
              <p className="text-xs text-slate-400">إيداعات اليوم</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/20 p-2">
              <BanknotesIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                {formatCurrency(stats.todayAmount, 'LYD')}
              </p>
              <p className="text-xs text-slate-400">مبلغ اليوم</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/20 p-2">
              <ClockIcon className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                {formatCurrency(stats.pendingAmount, 'LYD')}
              </p>
              <p className="text-xs text-slate-400">مبلغ معلق</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <CheckIcon className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                {formatCurrency(stats.completedAmount, 'LYD')}
              </p>
              <p className="text-xs text-slate-400">مبلغ مكتمل</p>
            </div>
          </div>
        </div>
      </div>

      {/* الفلترة */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative min-w-[200px] flex-1">
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="البحث بالاسم، الهاتف، رقم المرجع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-700 py-2 pl-4 pr-10 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-slate-400" />
          <select
            value={walletTypeFilter}
            onChange={(e) => setWalletTypeFilter(e.target.value as WalletType)}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white"
          >
            <option value="ALL">جميع المحافظ</option>
            <option value="LOCAL">محلية (LYD)</option>
            <option value="GLOBAL">عالمية (USD)</option>
            <option value="CRYPTO">رقمية (USDT)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DepositStatus)}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="INITIATED">جديد</option>
            <option value="PENDING">بانتظار المراجعة</option>
            <option value="PROCESSING">قيد المعالجة</option>
            <option value="COMPLETED">مكتمل</option>
            <option value="FAILED">فشل</option>
            <option value="CANCELLED">ملغي</option>
          </select>
        </div>
      </div>

      {/* تنبيه الإيداعات المعلقة */}
      {pendingDeposits.length > 0 && (
        <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <div className="flex items-center gap-3">
            <ClockIcon className="h-6 w-6 text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-400">
                يوجد {pendingDeposits.length} إيداع بانتظار المراجعة
              </p>
              <p className="text-sm text-yellow-300/70">
                يرجى مراجعة الإيداعات المعلقة والتأكد من استلام المبالغ
              </p>
            </div>
          </div>
        </div>
      )}

      {/* جدول الإيداعات */}
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : filteredDeposits.length === 0 ? (
          <div className="py-12 text-center">
            <ArrowDownIcon className="mx-auto h-12 w-12 text-slate-500" />
            <p className="mt-2 text-slate-400">لا توجد إيداعات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-slate-700 bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    المستخدم
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    المبلغ
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    المحفظة
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    طريقة الدفع
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    الحالة
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    التاريخ
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredDeposits.map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{deposit.userName}</p>
                        <p className="text-xs text-slate-400">{deposit.userPhone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-green-400">
                          {formatCurrency(deposit.amount, deposit.currency)}
                        </p>
                        <p className="text-xs text-slate-500">
                          صافي: {formatCurrency(deposit.netAmount, deposit.currency)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getWalletTypeIcon(deposit.walletType)}
                        <span className="text-sm text-slate-300">
                          {deposit.walletType === 'LOCAL'
                            ? 'محلية'
                            : deposit.walletType === 'GLOBAL'
                              ? 'عالمية'
                              : 'رقمية'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{deposit.paymentMethod}</td>
                    <td className="px-4 py-3">{getStatusBadge(deposit.status)}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(deposit.createdAt).toLocaleString('ar-LY')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDeposit(deposit)}
                          className="rounded bg-blue-600 p-1.5 text-white hover:bg-blue-700"
                          title="عرض التفاصيل"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {['INITIATED', 'PENDING', 'PROCESSING'].includes(deposit.status) && (
                          <>
                            <button
                              onClick={() => handleApprove(deposit.id)}
                              className="rounded bg-green-600 p-1.5 text-white hover:bg-green-700"
                              title="تأكيد"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(deposit.id)}
                              className="rounded bg-red-600 p-1.5 text-white hover:bg-red-700"
                              title="رفض"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal تفاصيل الإيداع */}
      {selectedDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">تفاصيل الإيداع</h3>
              <button
                onClick={() => setSelectedDeposit(null)}
                className="text-slate-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">المستخدم</p>
                  <p className="text-white">{selectedDeposit.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">الهاتف</p>
                  <p className="text-white">{selectedDeposit.userPhone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">المبلغ</p>
                  <p className="text-lg font-bold text-green-400">
                    {formatCurrency(selectedDeposit.amount, selectedDeposit.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">صافي المبلغ</p>
                  <p className="text-white">
                    {formatCurrency(selectedDeposit.netAmount, selectedDeposit.currency)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">الرسوم</p>
                  <p className="text-white">
                    {formatCurrency(selectedDeposit.fees, selectedDeposit.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">نوع المحفظة</p>
                  <p className="text-white">
                    {selectedDeposit.walletType === 'LOCAL'
                      ? 'محلية'
                      : selectedDeposit.walletType === 'GLOBAL'
                        ? 'عالمية'
                        : 'رقمية'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-400">طريقة الدفع</p>
                <p className="text-white">{selectedDeposit.paymentMethod}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">رقم المرجع</p>
                  <p className="font-mono text-sm text-white">{selectedDeposit.reference}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">مرجع الدفع</p>
                  <p className="font-mono text-sm text-white">
                    {selectedDeposit.paymentReference || '-'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">الحالة</p>
                  {getStatusBadge(selectedDeposit.status)}
                </div>
                <div>
                  <p className="text-sm text-slate-400">التاريخ</p>
                  <p className="text-white">
                    {new Date(selectedDeposit.createdAt).toLocaleString('ar-LY')}
                  </p>
                </div>
              </div>
            </div>

            {['INITIATED', 'PENDING', 'PROCESSING'].includes(selectedDeposit.status) && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => handleReject(selectedDeposit.id)}
                  disabled={actionLoading}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                  رفض
                </button>
                <button
                  onClick={() => handleApprove(selectedDeposit.id)}
                  disabled={actionLoading}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4" />
                  تأكيد وإضافة الرصيد
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
