/**
 * صفحة مراقبة وإحصائيات المدفوعات
 * Payment Monitoring & Analytics Dashboard
 */
import {
  ArrowDownIcon,
  ArrowPathIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ArrowUpIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface PaymentStats {
  totalDeposits: number;
  totalWithdrawals: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  todayDeposits: number;
  todayWithdrawals: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  successRate: number;
  averageProcessingTime: number;
}

interface MethodStats {
  id: string;
  name: string;
  nameAr: string;
  type: 'local' | 'global' | 'crypto';
  totalTransactions: number;
  totalVolume: number;
  successRate: number;
  status: 'active' | 'warning' | 'error';
  lastTransaction?: string;
}

interface RecentTransaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  method: string;
  methodType: 'local' | 'global' | 'crypto';
  status: 'completed' | 'pending' | 'failed';
  userId: string;
  userName: string;
  createdAt: string;
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  method?: string;
  createdAt: string;
  isRead: boolean;
}

export default function PaymentMonitoringPage() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [methodStats, setMethodStats] = useState<MethodStats[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  // التحديث التلقائي كل 30 ثانية
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // في الإنتاج، يتم جلب البيانات من APIs
      // const res = await fetch('/api/admin/wallets/monitoring');

      // بيانات تجريبية
      setStats({
        totalDeposits: 1250000,
        totalWithdrawals: 850000,
        pendingDeposits: 15,
        pendingWithdrawals: 8,
        todayDeposits: 45000,
        todayWithdrawals: 32000,
        weeklyGrowth: 12.5,
        monthlyGrowth: 28.3,
        successRate: 97.5,
        averageProcessingTime: 4.2,
      });

      setMethodStats([
        {
          id: 'usdt',
          name: 'USDT TRC20',
          nameAr: 'تيثر TRC20',
          type: 'crypto',
          totalTransactions: 1250,
          totalVolume: 520000,
          successRate: 99.2,
          status: 'active',
          lastTransaction: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
        {
          id: 'libyana',
          name: 'Libyana Cards',
          nameAr: 'كروت ليبيانا',
          type: 'local',
          totalTransactions: 3500,
          totalVolume: 180000,
          successRate: 98.5,
          status: 'active',
          lastTransaction: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        },
        {
          id: 'bank-jumhuriya',
          name: 'Jumhuriya Bank',
          nameAr: 'مصرف الجمهورية',
          type: 'local',
          totalTransactions: 850,
          totalVolume: 450000,
          successRate: 95.8,
          status: 'active',
          lastTransaction: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: 'paypal',
          name: 'PayPal',
          nameAr: 'باي بال',
          type: 'global',
          totalTransactions: 0,
          totalVolume: 0,
          successRate: 0,
          status: 'warning',
          lastTransaction: undefined,
        },
      ]);

      setRecentTransactions([
        {
          id: 'tx-001',
          type: 'deposit',
          amount: 500,
          currency: 'USDT',
          method: 'USDT TRC20',
          methodType: 'crypto',
          status: 'completed',
          userId: 'user-001',
          userName: 'محمد أحمد',
          createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
        {
          id: 'tx-002',
          type: 'deposit',
          amount: 200,
          currency: 'LYD',
          method: 'كروت ليبيانا',
          methodType: 'local',
          status: 'completed',
          userId: 'user-002',
          userName: 'علي حسن',
          createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        },
        {
          id: 'tx-003',
          type: 'withdrawal',
          amount: 1000,
          currency: 'LYD',
          method: 'مصرف الجمهورية',
          methodType: 'local',
          status: 'pending',
          userId: 'user-003',
          userName: 'سالم محمد',
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: 'tx-004',
          type: 'deposit',
          amount: 50,
          currency: 'LYD',
          method: 'كروت مدار',
          methodType: 'local',
          status: 'failed',
          userId: 'user-004',
          userName: 'أحمد سالم',
          createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        },
      ]);

      setAlerts([
        {
          id: 'alert-001',
          type: 'warning',
          title: 'PayPal غير متصل',
          message: 'لم يتم تكوين بيانات اعتماد PayPal. قم بإعداد التكامل لتفعيل المدفوعات.',
          method: 'PayPal',
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          isRead: false,
        },
        {
          id: 'alert-002',
          type: 'info',
          title: '15 إيداع قيد الانتظار',
          message: 'يوجد 15 طلب إيداع بحاجة للمراجعة والموافقة.',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          isRead: false,
        },
      ]);

      setLastUpdate(new Date());
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency = 'LYD') => {
    return new Intl.NumberFormat('ar-LY', {
      style: 'currency',
      currency: currency === 'LYD' ? 'LYD' : 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'الآن';
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    if (diffMinutes < 1440) return `منذ ${Math.floor(diffMinutes / 60)} ساعة`;
    return date.toLocaleDateString('ar-LY');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
      case 'error':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getMethodTypeIcon = (type: string) => {
    switch (type) {
      case 'local':
        return <BanknotesIcon className="h-4 w-4 text-emerald-400" />;
      case 'global':
        return <GlobeAltIcon className="h-4 w-4 text-sky-400" />;
      case 'crypto':
        return <CurrencyDollarIcon className="h-4 w-4 text-purple-400" />;
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="مراقبة المدفوعات">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">مراقبة وإحصائيات المدفوعات</h2>
          <p className="text-sm text-slate-400">
            آخر تحديث: {lastUpdate.toLocaleTimeString('ar-LY')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-slate-600 bg-slate-700"
            />
            <span className="text-sm text-slate-300">تحديث تلقائي</span>
          </label>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.filter((a) => !a.isRead).length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts
            .filter((a) => !a.isRead)
            .map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 rounded-xl border p-4 ${
                  alert.type === 'error'
                    ? 'border-red-500/30 bg-red-900/20'
                    : alert.type === 'warning'
                      ? 'border-yellow-500/30 bg-yellow-900/20'
                      : 'border-blue-500/30 bg-blue-900/20'
                }`}
              >
                {alert.type === 'error' ? (
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                ) : alert.type === 'warning' ? (
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                ) : (
                  <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
                )}
                <div className="flex-1">
                  <h4
                    className={`font-medium ${
                      alert.type === 'error'
                        ? 'text-red-400'
                        : alert.type === 'warning'
                          ? 'text-yellow-400'
                          : 'text-blue-400'
                    }`}
                  >
                    {alert.title}
                  </h4>
                  <p className="text-sm text-slate-400">{alert.message}</p>
                </div>
                <button
                  onClick={() =>
                    setAlerts((prev) =>
                      prev.map((a) => (a.id === alert.id ? { ...a, isRead: true } : a)),
                    )
                  }
                  className="text-slate-400 hover:text-white"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
        </div>
      )}

      {loading && !stats ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Main Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-green-500/30 bg-green-900/10 p-4">
              <div className="flex items-center justify-between">
                <ArrowDownIcon className="h-8 w-8 text-green-400" />
                {stats && stats.weeklyGrowth > 0 && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <ArrowTrendingUpIcon className="h-3 w-3" />
                    {stats.weeklyGrowth}%
                  </span>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-white">
                {stats ? formatCurrency(stats.totalDeposits) : '-'}
              </p>
              <p className="text-sm text-slate-400">إجمالي الإيداعات</p>
            </div>

            <div className="rounded-xl border border-red-500/30 bg-red-900/10 p-4">
              <div className="flex items-center justify-between">
                <ArrowUpIcon className="h-8 w-8 text-red-400" />
                <span className="flex items-center gap-1 text-xs text-red-400">
                  <ArrowTrendingDownIcon className="h-3 w-3" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-white">
                {stats ? formatCurrency(stats.totalWithdrawals) : '-'}
              </p>
              <p className="text-sm text-slate-400">إجمالي السحوبات</p>
            </div>

            <div className="rounded-xl border border-yellow-500/30 bg-yellow-900/10 p-4">
              <div className="flex items-center justify-between">
                <ClockIcon className="h-8 w-8 text-yellow-400" />
                <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
                  {stats?.pendingDeposits || 0} + {stats?.pendingWithdrawals || 0}
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-white">
                {stats ? stats.pendingDeposits + stats.pendingWithdrawals : 0}
              </p>
              <p className="text-sm text-slate-400">قيد الانتظار</p>
            </div>

            <div className="rounded-xl border border-blue-500/30 bg-blue-900/10 p-4">
              <div className="flex items-center justify-between">
                <CheckCircleIcon className="h-8 w-8 text-blue-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{stats?.successRate || 0}%</p>
              <p className="text-sm text-slate-400">نسبة النجاح</p>
            </div>
          </div>

          {/* Today Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-sm text-slate-400">إيداعات اليوم</p>
              <p className="text-xl font-bold text-green-400">
                {stats ? formatCurrency(stats.todayDeposits) : '-'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-sm text-slate-400">سحوبات اليوم</p>
              <p className="text-xl font-bold text-red-400">
                {stats ? formatCurrency(stats.todayWithdrawals) : '-'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-sm text-slate-400">النمو الأسبوعي</p>
              <p className="text-xl font-bold text-blue-400">{stats?.weeklyGrowth || 0}%</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-sm text-slate-400">متوسط وقت المعالجة</p>
              <p className="text-xl font-bold text-purple-400">
                {stats?.averageProcessingTime || 0} دقيقة
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Methods Performance */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="mb-4 font-semibold text-white">أداء وسائل الدفع</h3>
              <div className="space-y-3">
                {methodStats.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between rounded-lg bg-slate-700/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      {getMethodTypeIcon(method.type)}
                      <div>
                        <p className="font-medium text-white">{method.nameAr}</p>
                        <p className="text-xs text-slate-400">{method.totalTransactions} معاملة</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">{formatCurrency(method.totalVolume)}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(method.status)}`}
                        >
                          {method.successRate}%
                        </span>
                        {method.lastTransaction && (
                          <span className="text-xs text-slate-500">
                            {formatTime(method.lastTransaction)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="mb-4 font-semibold text-white">آخر المعاملات</h3>
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg bg-slate-700/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      {tx.type === 'deposit' ? (
                        <ArrowDownIcon className="h-5 w-5 text-green-400" />
                      ) : (
                        <ArrowUpIcon className="h-5 w-5 text-red-400" />
                      )}
                      <div>
                        <p className="font-medium text-white">{tx.userName}</p>
                        <p className="text-xs text-slate-400">{tx.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {tx.type === 'deposit' ? '+' : '-'}
                        {tx.amount} {tx.currency}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(tx.status)}`}
                        >
                          {tx.status === 'completed'
                            ? 'مكتمل'
                            : tx.status === 'pending'
                              ? 'انتظار'
                              : 'فشل'}
                        </span>
                        <span className="text-xs text-slate-500">{formatTime(tx.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
