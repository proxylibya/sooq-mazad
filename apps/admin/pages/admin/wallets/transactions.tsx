/**
 * صفحة سجل المعاملات المالية
 */
import { ArrowDownIcon, ArrowUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'REFUND' | 'FEE';
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED';
  method: string;
  reference: string;
  createdAt: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/admin/wallets/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      // Mock data
      setTransactions([
        {
          id: '1',
          userId: 'u1',
          userName: 'محمد أحمد',
          type: 'DEPOSIT',
          amount: 5000,
          status: 'COMPLETED',
          method: 'بطاقة ائتمان',
          reference: 'TXN001',
          createdAt: '2024-01-25T10:30:00',
        },
        {
          id: '2',
          userId: 'u2',
          userName: 'أحمد علي',
          type: 'WITHDRAWAL',
          amount: 3000,
          status: 'PENDING',
          method: 'تحويل بنكي',
          reference: 'TXN002',
          createdAt: '2024-01-25T09:15:00',
        },
        {
          id: '3',
          userId: 'u1',
          userName: 'محمد أحمد',
          type: 'FEE',
          amount: 50,
          status: 'COMPLETED',
          method: 'نظام',
          reference: 'TXN003',
          createdAt: '2024-01-24T14:20:00',
        },
        {
          id: '4',
          userId: 'u3',
          userName: 'سالم محمود',
          type: 'DEPOSIT',
          amount: 10000,
          status: 'COMPLETED',
          method: 'تحويل بنكي',
          reference: 'TXN004',
          createdAt: '2024-01-24T11:00:00',
        },
        {
          id: '5',
          userId: 'u2',
          userName: 'أحمد علي',
          type: 'REFUND',
          amount: 500,
          status: 'COMPLETED',
          method: 'نظام',
          reference: 'TXN005',
          createdAt: '2024-01-23T16:45:00',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const types: Record<
      string,
      { bg: string; text: string; label: string; icon: React.ReactNode }
    > = {
      DEPOSIT: {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        label: 'إيداع',
        icon: <ArrowDownIcon className="h-4 w-4" />,
      },
      WITHDRAWAL: {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        label: 'سحب',
        icon: <ArrowUpIcon className="h-4 w-4" />,
      },
      TRANSFER: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'تحويل', icon: null },
      REFUND: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'استرداد', icon: null },
      FEE: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'رسوم', icon: null },
    };
    const t = types[type] || types.DEPOSIT;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${t.bg} ${t.text}`}
      >
        {t.icon}
        {t.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { bg: string; text: string; label: string }> = {
      COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'مكتمل' },
      PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'معلق' },
      FAILED: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'فشل' },
      CANCELLED: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'ملغي' },
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-LY', { style: 'decimal' }).format(amount) + ' د.ل';
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <AdminLayout title="سجل المعاملات">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="البحث برقم المرجع أو اسم المستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-700 py-2 pl-4 pr-10 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="all">جميع الأنواع</option>
          <option value="DEPOSIT">إيداع</option>
          <option value="WITHDRAWAL">سحب</option>
          <option value="TRANSFER">تحويل</option>
          <option value="REFUND">استرداد</option>
          <option value="FEE">رسوم</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="all">جميع الحالات</option>
          <option value="COMPLETED">مكتمل</option>
          <option value="PENDING">معلق</option>
          <option value="FAILED">فشل</option>
          <option value="CANCELLED">ملغي</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-slate-700 bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">المرجع</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                  المستخدم
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">النوع</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">المبلغ</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">الطريقة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">الحالة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="transition-colors hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-slate-300">{tx.reference}</span>
                  </td>
                  <td className="px-4 py-3 text-white">{tx.userName}</td>
                  <td className="px-4 py-3">{getTypeBadge(tx.type)}</td>
                  <td
                    className={`px-4 py-3 font-medium ${tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{tx.method}</td>
                  <td className="px-4 py-3">{getStatusBadge(tx.status)}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {new Date(tx.createdAt).toLocaleString('ar-LY')}
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
