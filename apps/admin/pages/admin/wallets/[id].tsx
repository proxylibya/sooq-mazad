/**
 * صفحة تفاصيل المحفظة
 * Wallet Details Page
 */
import {
  ArrowLeftIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  LockClosedIcon,
  LockOpenIcon,
  PlusIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface WalletDetails {
  id: string;
  publicId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    phone: string;
    email: string;
    profileImage: string | null;
  };
  localWallet: {
    balance: number;
    currency: string;
  } | null;
  globalWallet: {
    balance: number;
    currency: string;
  } | null;
  cryptoWallet: {
    balance: number;
    currency: string;
    address: string | null;
    network: string;
  } | null;
}

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'FEE' | 'REFUND';
  amount: number;
  currency: string;
  walletType: 'LOCAL' | 'GLOBAL' | 'CRYPTO';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description: string;
  reference: string;
  createdAt: string;
}

export default function WalletDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [wallet, setWallet] = useState<WalletDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [addBalanceForm, setAddBalanceForm] = useState({
    amount: '',
    walletType: 'LOCAL' as 'LOCAL' | 'GLOBAL' | 'CRYPTO',
    note: '',
  });

  useEffect(() => {
    if (id) {
      fetchWalletDetails();
      fetchTransactions();
    }
  }, [id]);

  const fetchWalletDetails = async () => {
    try {
      const res = await fetch(`/api/admin/wallets/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setWallet(data.wallet);
        }
      }
    } catch (err) {
      // Mock data
      setWallet({
        id: id as string,
        publicId: 1001,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: new Date().toISOString(),
        user: {
          id: 'user-001',
          name: 'محمد أحمد الليبي',
          phone: '+218912345678',
          email: 'mohammed@example.com',
          profileImage: null,
        },
        localWallet: {
          balance: 15000,
          currency: 'LYD',
        },
        globalWallet: {
          balance: 250,
          currency: 'USD',
        },
        cryptoWallet: {
          balance: 100,
          currency: 'USDT',
          address: 'TJYeasdfgh123456789ABCDEF',
          network: 'TRC20',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`/api/admin/wallets/${id}/transactions`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTransactions(data.transactions);
        }
      }
    } catch (err) {
      // Mock data
      setTransactions([
        {
          id: 'tx-001',
          type: 'DEPOSIT',
          amount: 5000,
          currency: 'LYD',
          walletType: 'LOCAL',
          status: 'COMPLETED',
          description: 'إيداع عبر البنك',
          reference: 'DEP-001',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'tx-002',
          type: 'WITHDRAWAL',
          amount: 1000,
          currency: 'LYD',
          walletType: 'LOCAL',
          status: 'COMPLETED',
          description: 'سحب نقدي',
          reference: 'WTH-001',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'tx-003',
          type: 'DEPOSIT',
          amount: 100,
          currency: 'USD',
          walletType: 'GLOBAL',
          status: 'PENDING',
          description: 'إيداع PayPal',
          reference: 'DEP-002',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
    }
  };

  const toggleWalletStatus = async () => {
    if (!wallet) return;
    if (!confirm(wallet.isActive ? 'هل تريد تجميد هذه المحفظة؟' : 'هل تريد تفعيل هذه المحفظة؟'))
      return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/wallets?id=${wallet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !wallet.isActive }),
      });

      if (res.ok) {
        setWallet({ ...wallet, isActive: !wallet.isActive });
        alert(wallet.isActive ? 'تم تجميد المحفظة' : 'تم تفعيل المحفظة');
      }
    } catch (err) {
      alert('حدث خطأ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddBalance = async () => {
    if (!addBalanceForm.amount || parseFloat(addBalanceForm.amount) <= 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/wallets/${id}/add-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(addBalanceForm.amount),
          walletType: addBalanceForm.walletType,
          note: addBalanceForm.note,
        }),
      });

      if (res.ok) {
        alert('تم إضافة الرصيد بنجاح');
        setShowAddBalanceModal(false);
        setAddBalanceForm({ amount: '', walletType: 'LOCAL', note: '' });
        fetchWalletDetails();
        fetchTransactions();
      }
    } catch (err) {
      alert('حدث خطأ');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'LYD') return new Intl.NumberFormat('ar-LY').format(amount) + ' د.ل';
    if (currency === 'USD') return '$' + new Intl.NumberFormat('en-US').format(amount);
    return new Intl.NumberFormat('en-US').format(amount) + ' ' + currency;
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, { bg: string; text: string; label: string }> = {
      DEPOSIT: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'إيداع' },
      WITHDRAWAL: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'سحب' },
      TRANSFER: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'تحويل' },
      REFUND: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'استرداد' },
      FEE: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'رسوم' },
    };
    const t = types[type] || types.DEPOSIT;
    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${t.bg} ${t.text}`}>
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
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="تفاصيل المحفظة">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!wallet) {
    return (
      <AdminLayout title="تفاصيل المحفظة">
        <div className="py-12 text-center">
          <p className="text-slate-400">المحفظة غير موجودة</p>
          <Link href="/admin/wallets" className="mt-4 inline-block text-blue-400 hover:underline">
            العودة للمحافظ
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`محفظة ${wallet.user.name}`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/wallets"
          className="flex items-center gap-2 text-slate-400 hover:text-white"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          العودة للمحافظ
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddBalanceModal(true)}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <PlusIcon className="h-4 w-4" />
            إضافة رصيد
          </button>
          <button
            onClick={toggleWalletStatus}
            disabled={actionLoading}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white ${
              wallet.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {wallet.isActive ? (
              <>
                <LockClosedIcon className="h-4 w-4" />
                تجميد المحفظة
              </>
            ) : (
              <>
                <LockOpenIcon className="h-4 w-4" />
                تفعيل المحفظة
              </>
            )}
          </button>
        </div>
      </div>

      {/* معلومات المستخدم */}
      <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-700">
            <UserIcon className="h-8 w-8 text-slate-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">{wallet.user.name}</h2>
              {wallet.isActive ? (
                <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                  نشطة
                </span>
              ) : (
                <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400">
                  مجمدة
                </span>
              )}
            </div>
            <p className="text-slate-400">{wallet.user.phone}</p>
            <p className="text-slate-400">{wallet.user.email}</p>
            <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
              <span>رقم المحفظة: #{wallet.publicId}</span>
              <span>تاريخ الإنشاء: {new Date(wallet.createdAt).toLocaleDateString('ar-LY')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* الأرصدة */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* المحفظة المحلية */}
        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/20 p-2">
              <BanknotesIcon className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-emerald-300">المحفظة المحلية</p>
              <p className="text-2xl font-bold text-white">
                {wallet.localWallet ? formatCurrency(wallet.localWallet.balance, 'LYD') : '0 د.ل'}
              </p>
            </div>
          </div>
        </div>

        {/* المحفظة العالمية */}
        <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <GlobeAltIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-blue-300">المحفظة العالمية</p>
              <p className="text-2xl font-bold text-white">
                {wallet.globalWallet ? formatCurrency(wallet.globalWallet.balance, 'USD') : '$0'}
              </p>
            </div>
          </div>
        </div>

        {/* المحفظة الرقمية */}
        <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/20 p-2">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-purple-300">المحفظة الرقمية</p>
              <p className="text-2xl font-bold text-white">
                {wallet.cryptoWallet
                  ? formatCurrency(wallet.cryptoWallet.balance, 'USDT')
                  : '0 USDT'}
              </p>
            </div>
          </div>
          {wallet.cryptoWallet?.address && (
            <div className="mt-3 rounded-lg bg-purple-900/30 p-2">
              <p className="text-xs text-purple-400">عنوان TRC20:</p>
              <p className="break-all font-mono text-xs text-white">
                {wallet.cryptoWallet.address}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* سجل المعاملات */}
      <div className="rounded-xl border border-slate-700 bg-slate-800">
        <div className="border-b border-slate-700 p-4">
          <h3 className="text-lg font-semibold text-white">سجل المعاملات</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-700 bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">النوع</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">المبلغ</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">المحفظة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">الوصف</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">الحالة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    لا توجد معاملات
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3">{getTypeBadge(tx.type)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          tx.type === 'DEPOSIT' || tx.type === 'REFUND'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }
                      >
                        {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '+' : '-'}
                        {formatCurrency(tx.amount, tx.currency)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400">
                        {tx.walletType === 'LOCAL'
                          ? 'محلية'
                          : tx.walletType === 'GLOBAL'
                            ? 'عالمية'
                            : 'رقمية'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{tx.description}</td>
                    <td className="px-4 py-3">{getStatusBadge(tx.status)}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(tx.createdAt).toLocaleString('ar-LY')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal إضافة رصيد */}
      {showAddBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">إضافة رصيد للمحفظة</h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate-400">نوع المحفظة</label>
                <select
                  value={addBalanceForm.walletType}
                  onChange={(e) =>
                    setAddBalanceForm({ ...addBalanceForm, walletType: e.target.value as any })
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                >
                  <option value="LOCAL">المحفظة المحلية (LYD)</option>
                  <option value="GLOBAL">المحفظة العالمية (USD)</option>
                  <option value="CRYPTO">المحفظة الرقمية (USDT)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">المبلغ</label>
                <input
                  type="number"
                  value={addBalanceForm.amount}
                  onChange={(e) => setAddBalanceForm({ ...addBalanceForm, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">ملاحظة (اختياري)</label>
                <textarea
                  value={addBalanceForm.note}
                  onChange={(e) => setAddBalanceForm({ ...addBalanceForm, note: e.target.value })}
                  placeholder="سبب الإضافة..."
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  rows={2}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddBalanceModal(false)}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-700"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddBalance}
                disabled={actionLoading}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'جاري الإضافة...' : 'إضافة الرصيد'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
