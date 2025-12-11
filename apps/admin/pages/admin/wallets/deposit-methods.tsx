/**
 * صفحة إدارة وسائل الإيداع الموحدة
 * Unified Deposit Methods Management Dashboard
 */
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  CogIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  LinkIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface MethodStats {
  local: {
    total: number;
    active: number;
    bank: number;
    card: number;
    mobile: number;
  };
  global: {
    total: number;
    active: number;
    connected: number;
  };
  crypto: {
    total: number;
    active: number;
    stablecoins: number;
    crypto: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'deposit' | 'withdrawal' | 'config_change';
  method: string;
  methodType: 'local' | 'global' | 'crypto';
  amount?: number;
  currency?: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description: string;
}

export default function DepositMethodsDashboard() {
  const [stats, setStats] = useState<MethodStats>({
    local: { total: 0, active: 0, bank: 0, card: 0, mobile: 0 },
    global: { total: 0, active: 0, connected: 0 },
    crypto: { total: 0, active: 0, stablecoins: 0, crypto: 0 },
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    try {
      // جلب البيانات من APIs
      const [localRes, globalRes, cryptoRes] = await Promise.all([
        fetch('/api/admin/wallets/local-methods'),
        fetch('/api/admin/wallets/global-methods'),
        fetch('/api/admin/wallets/crypto-methods'),
      ]);

      const localData = await localRes.json();
      const globalData = await globalRes.json();
      const cryptoData = await cryptoRes.json();

      setStats({
        local: localData.stats || { total: 4, active: 4, bank: 1, card: 2, mobile: 1 },
        global: globalData.stats || { total: 4, active: 3, connected: 0 },
        crypto: cryptoData.stats || { total: 3, active: 1, stablecoins: 2, crypto: 1 },
      });
    } catch (err) {
      // استخدام بيانات افتراضية
      setStats({
        local: { total: 6, active: 5, bank: 2, card: 2, mobile: 1 },
        global: { total: 6, active: 4, connected: 0 },
        crypto: { total: 3, active: 1, stablecoins: 2, crypto: 1 },
      });
    }

    // بيانات النشاط الأخير
    setRecentActivity([
      {
        id: '1',
        type: 'deposit',
        method: 'USDT TRC20',
        methodType: 'crypto',
        amount: 500,
        currency: 'USDT',
        status: 'completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        description: 'إيداع USDT عبر شبكة TRC20',
      },
      {
        id: '2',
        type: 'deposit',
        method: 'كروت ليبيانا',
        methodType: 'local',
        amount: 200,
        currency: 'LYD',
        status: 'completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        description: 'إيداع عبر كرت ليبيانا',
      },
      {
        id: '3',
        type: 'config_change',
        method: 'PayPal',
        methodType: 'global',
        status: 'completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        description: 'تحديث إعدادات API',
      },
      {
        id: '4',
        type: 'deposit',
        method: 'مصرف الجمهورية',
        methodType: 'local',
        amount: 5000,
        currency: 'LYD',
        status: 'pending',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        description: 'تحويل بنكي قيد المراجعة',
      },
    ]);

    setLoading(false);
  };

  const totalMethods = stats.local.total + stats.global.total + stats.crypto.total;
  const totalActive = stats.local.active + stats.global.active + stats.crypto.active;

  const sections = [
    {
      id: 'local',
      title: 'وسائل الدفع المحلية',
      subtitle: 'البنوك الليبية، كروت الشحن، المحافظ المحلية',
      icon: BanknotesIcon,
      color: 'emerald',
      href: '/admin/wallets/local-methods',
      stats: stats.local,
      items: [
        { label: 'البنوك', count: stats.local.bank },
        { label: 'الكروت', count: stats.local.card },
        { label: 'الموبايل', count: stats.local.mobile },
      ],
    },
    {
      id: 'global',
      title: 'وسائل الدفع العالمية',
      subtitle: 'PayPal, Wise, Payoneer, Stripe',
      icon: GlobeAltIcon,
      color: 'sky',
      href: '/admin/wallets/global-methods',
      stats: stats.global,
      items: [
        { label: 'متصلة', count: stats.global.connected },
        { label: 'نشطة', count: stats.global.active },
        { label: 'إجمالي', count: stats.global.total },
      ],
    },
    {
      id: 'crypto',
      title: 'العملات الرقمية',
      subtitle: 'USDT, USDC, Bitcoin والشبكات المختلفة',
      icon: CurrencyDollarIcon,
      color: 'purple',
      href: '/admin/wallets/crypto-methods',
      stats: stats.crypto,
      items: [
        { label: 'مستقرة', count: stats.crypto.stablecoins },
        { label: 'رقمية', count: stats.crypto.crypto },
        { label: 'نشطة', count: stats.crypto.active },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'pending':
        return 'قيد الانتظار';
      case 'failed':
        return 'فشل';
      default:
        return status;
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    if (diffMinutes < 1440) return `منذ ${Math.floor(diffMinutes / 60)} ساعة`;
    return date.toLocaleDateString('ar-LY');
  };

  return (
    <AdminLayout title="إدارة وسائل الإيداع">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">إدارة وسائل الإيداع</h2>
          <p className="text-sm text-slate-400">
            لوحة تحكم شاملة لإدارة جميع وسائل الإيداع: المحلية، العالمية، والرقمية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/wallets/integrations"
            className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600"
          >
            <LinkIcon className="h-4 w-4" />
            التكاملات
          </Link>
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            <ArrowPathIcon className="h-4 w-4" />
            تحديث
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <CogIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalMethods}</p>
              <p className="text-xs text-slate-400">إجمالي الوسائل</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-green-500/30 bg-green-900/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{totalActive}</p>
              <p className="text-xs text-slate-400">نشطة</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-900/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/20 p-2">
              <BanknotesIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{stats.local.active}</p>
              <p className="text-xs text-slate-400">محلية نشطة</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-purple-500/30 bg-purple-900/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/20 p-2">
              <CurrencyDollarIcon className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">{stats.crypto.active}</p>
              <p className="text-xs text-slate-400">كريبتو نشطة</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sections */}
          <div className="space-y-4 lg:col-span-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const colorClasses = {
                emerald: 'border-emerald-500/30 bg-emerald-900/10 hover:bg-emerald-900/20',
                sky: 'border-sky-500/30 bg-sky-900/10 hover:bg-sky-900/20',
                purple: 'border-purple-500/30 bg-purple-900/10 hover:bg-purple-900/20',
              };
              const iconColors = {
                emerald: 'text-emerald-400',
                sky: 'text-sky-400',
                purple: 'text-purple-400',
              };

              return (
                <Link
                  key={section.id}
                  href={section.href}
                  className={`block rounded-xl border p-5 transition-all ${colorClasses[section.color as keyof typeof colorClasses]}`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg bg-${section.color}-500/20 p-3`}>
                        <Icon
                          className={`h-6 w-6 ${iconColors[section.color as keyof typeof iconColors]}`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{section.title}</h3>
                        <p className="text-sm text-slate-400">{section.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400">
                        {section.stats.active} نشطة
                      </span>
                      <ChevronRightIcon className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {section.items.map((item) => (
                      <div key={item.label} className="rounded-lg bg-slate-800/50 p-3 text-center">
                        <p className="text-lg font-bold text-white">{item.count}</p>
                        <p className="text-xs text-slate-400">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </Link>
              );
            })}

            {/* Quick Actions */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="mb-4 font-semibold text-white">إجراءات سريعة</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Link
                  href="/admin/wallets/integrations"
                  className="flex flex-col items-center gap-2 rounded-lg bg-slate-700/50 p-4 text-center hover:bg-slate-700"
                >
                  <LinkIcon className="h-6 w-6 text-blue-400" />
                  <span className="text-sm text-white">إعدادات التكامل</span>
                </Link>
                <Link
                  href="/admin/wallets/settings"
                  className="flex flex-col items-center gap-2 rounded-lg bg-slate-700/50 p-4 text-center hover:bg-slate-700"
                >
                  <CogIcon className="h-6 w-6 text-slate-400" />
                  <span className="text-sm text-white">إعدادات المحافظ</span>
                </Link>
                <Link
                  href="/admin/wallets/deposits"
                  className="flex flex-col items-center gap-2 rounded-lg bg-slate-700/50 p-4 text-center hover:bg-slate-700"
                >
                  <BanknotesIcon className="h-6 w-6 text-green-400" />
                  <span className="text-sm text-white">طلبات الإيداع</span>
                </Link>
                <Link
                  href="/admin/wallets/payment-methods"
                  className="flex flex-col items-center gap-2 rounded-lg bg-slate-700/50 p-4 text-center hover:bg-slate-700"
                >
                  <ShieldCheckIcon className="h-6 w-6 text-purple-400" />
                  <span className="text-sm text-white">إدارة الطرق</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-white">النشاط الأخير</h3>
                <Link
                  href="/admin/wallets/transactions"
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  عرض الكل
                </Link>
              </div>

              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 rounded-lg bg-slate-700/30 p-3"
                  >
                    <div className="mt-0.5">{getMethodTypeIcon(activity.methodType)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-white">{activity.method}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(activity.status)}`}
                        >
                          {getStatusLabel(activity.status)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-slate-400">{activity.description}</p>
                      {activity.amount && (
                        <p className="text-sm font-medium text-green-400">
                          +{activity.amount.toLocaleString()} {activity.currency}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        {formatTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notice */}
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-900/10 p-4">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                <div>
                  <h4 className="font-medium text-yellow-400">ملاحظة مهمة</h4>
                  <p className="mt-1 text-xs text-slate-400">
                    تأكد من اختبار جميع بوابات الدفع قبل تفعيلها للمستخدمين. استخدم وضع الاختبار
                    (Sandbox) أولاً.
                  </p>
                </div>
              </div>
            </div>

            {/* Help Links */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <h4 className="mb-3 font-medium text-white">روابط مفيدة</h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  دليل إعداد بوابات الدفع
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  أفضل الممارسات الأمنية
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  استكشاف الأخطاء وإصلاحها
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
