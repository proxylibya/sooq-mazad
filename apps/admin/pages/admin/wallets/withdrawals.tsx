/**
 * صفحة طلبات السحب
 */
import { BanknotesIcon, CheckIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: 'BANK_TRANSFER' | 'CASH' | 'MOBILE_WALLET';
  bankName?: string;
  accountNumber?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
  notes?: string;
}

export default function WithdrawalsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('PENDING');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/wallets/withdrawals');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.withdrawals || []);
      }
    } catch (err) {
      // Mock data
      setRequests([
        {
          id: '1',
          userId: 'u1',
          userName: 'محمد أحمد',
          amount: 5000,
          method: 'BANK_TRANSFER',
          bankName: 'مصرف الجمهورية',
          accountNumber: '1234567890',
          status: 'PENDING',
          createdAt: '2024-01-25T10:30:00',
        },
        {
          id: '2',
          userId: 'u2',
          userName: 'أحمد علي',
          amount: 3000,
          method: 'CASH',
          status: 'PENDING',
          createdAt: '2024-01-25T09:15:00',
        },
        {
          id: '3',
          userId: 'u3',
          userName: 'سالم محمود',
          amount: 10000,
          method: 'BANK_TRANSFER',
          bankName: 'مصرف التجارة والتنمية',
          accountNumber: '0987654321',
          status: 'APPROVED',
          createdAt: '2024-01-24T14:20:00',
        },
        {
          id: '4',
          userId: 'u4',
          userName: 'خالد إبراهيم',
          amount: 2000,
          method: 'MOBILE_WALLET',
          status: 'COMPLETED',
          createdAt: '2024-01-23T11:00:00',
        },
        {
          id: '5',
          userId: 'u5',
          userName: 'علي محمد',
          amount: 1500,
          method: 'BANK_TRANSFER',
          bankName: 'المصرف الأهلي',
          accountNumber: '1122334455',
          status: 'REJECTED',
          createdAt: '2024-01-22T16:45:00',
          notes: 'رصيد غير كافي',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('هل أنت متأكد من الموافقة على هذا الطلب؟')) return;

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' as const } : r)),
    );
    alert('تمت الموافقة على الطلب');
  };

  const handleReject = async (id: string) => {
    const reason = prompt('سبب الرفض:');
    if (!reason) return;

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' as const, notes: reason } : r)),
    );
    alert('تم رفض الطلب');
  };

  const handleComplete = async (id: string) => {
    if (!confirm('هل تم تنفيذ التحويل؟')) return;

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'COMPLETED' as const } : r)),
    );
    alert('تم تحديث الطلب كمكتمل');
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'معلق' },
      APPROVED: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'موافق عليه' },
      REJECTED: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'مرفوض' },
      COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'مكتمل' },
    };
    const s = statuses[status] || statuses.PENDING;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${s.bg} ${s.text}`}
      >
        {s.label}
      </span>
    );
  };

  const getMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      BANK_TRANSFER: 'تحويل بنكي',
      CASH: 'نقدي',
      MOBILE_WALLET: 'محفظة إلكترونية',
    };
    return methods[method] || method;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-LY', { style: 'decimal' }).format(amount) + ' د.ل';
  };

  const filteredRequests = requests.filter(
    (r) => filterStatus === 'all' || r.status === filterStatus,
  );

  const stats = {
    pending: requests.filter((r) => r.status === 'PENDING').length,
    approved: requests.filter((r) => r.status === 'APPROVED').length,
    pendingAmount: requests
      .filter((r) => r.status === 'PENDING')
      .reduce((sum, r) => sum + r.amount, 0),
  };

  return (
    <AdminLayout title="طلبات السحب">
      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/20 p-2">
              <ClockIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-sm text-slate-400">طلبات معلقة</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <CheckIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.approved}</p>
              <p className="text-sm text-slate-400">بانتظار التنفيذ</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <BanknotesIcon className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.pendingAmount)}</p>
              <p className="text-sm text-slate-400">إجمالي المعلقة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="all">جميع الطلبات</option>
          <option value="PENDING">معلقة</option>
          <option value="APPROVED">موافق عليها</option>
          <option value="COMPLETED">مكتملة</option>
          <option value="REJECTED">مرفوضة</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-400">لا توجد طلبات</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-slate-700 bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                  المستخدم
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">المبلغ</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">الطريقة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                  تفاصيل الحساب
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">الحالة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">التاريخ</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="transition-colors hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-white">{req.userName}</td>
                  <td className="px-4 py-3 font-medium text-green-400">
                    {formatCurrency(req.amount)}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{getMethodLabel(req.method)}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {req.bankName && <div>{req.bankName}</div>}
                    {req.accountNumber && <div className="font-mono">{req.accountNumber}</div>}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(req.status)}
                    {req.notes && <div className="mt-1 text-xs text-red-400">{req.notes}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {new Date(req.createdAt).toLocaleString('ar-LY')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {req.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="rounded bg-green-600 p-1 text-white transition-colors hover:bg-green-700"
                            title="موافقة"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="rounded bg-red-600 p-1 text-white transition-colors hover:bg-red-700"
                            title="رفض"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {req.status === 'APPROVED' && (
                        <button
                          onClick={() => handleComplete(req.id)}
                          className="rounded bg-blue-600 px-2 py-1 text-xs text-white transition-colors hover:bg-blue-700"
                        >
                          تم التنفيذ
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
