import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  TruckIcon,
  UsersIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import ActivityFeed from '../../components/stats/ActivityFeed';
import AuctionDistributionChart from '../../components/stats/Charts/AuctionDistributionChart';
import RevenuePerformanceChart from '../../components/stats/Charts/RevenuePerformanceChart';
import UserGrowthChart from '../../components/stats/Charts/UserGrowthChart';
import RealTimeIndicator from '../../components/stats/RealTimeIndicator';
import StatCard from '../../components/stats/StatCard';

type FilterState = {
  range: '7d' | '30d' | '90d' | '1y';
  channel: 'all' | 'paid' | 'organic' | 'direct';
  segment: 'all' | 'vip' | 'new' | 'returning';
  status: 'all' | 'flagged' | 'healthy';
};

type ChartPoint = {
  date: string;
  amount?: number;
  profit?: number;
  orders?: number;
  users?: number;
  active?: number;
  retention?: number;
  created?: number;
  completed?: number;
  cancelled?: number;
  avgBid?: number;
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [overview, setOverview] = useState<any>(null);
  const [charts, setCharts] = useState<{
    revenue: ChartPoint[];
    users: ChartPoint[];
    auctions: ChartPoint[];
  }>({
    revenue: [],
    users: [],
    auctions: [],
  });
  const [activity, setActivity] = useState<any[]>([]);
  const [system, setSystem] = useState<any>(null);
  const [filters, setFilters] = useState<FilterState>({
    range: '30d',
    channel: 'all',
    segment: 'all',
    status: 'all',
  });

  const buildFilterParams = () => {
    const params = new URLSearchParams({ range: filters.range });
    if (filters.channel !== 'all') params.append('channel', filters.channel);
    if (filters.segment !== 'all') params.append('segment', filters.segment);
    if (filters.status !== 'all') params.append('status', filters.status);
    return params.toString();
  };

  const buildParams = (type: 'revenue' | 'users' | 'auctions') => {
    const params = new URLSearchParams(buildFilterParams());
    params.set('type', type);
    return params.toString();
  };

  const fetchData = useCallback(
    async (showLoader = false) => {
      if (showLoader) setLoading(true);
      setRefreshing(true);

      try {
        const [overviewRes, revenueRes, usersRes, auctionsRes, activityRes, systemRes] =
          await Promise.all([
            fetch(`/api/admin/stats/overview?${buildFilterParams()}`),
            fetch(`/api/admin/stats/charts?${buildParams('revenue')}`),
            fetch(`/api/admin/stats/charts?${buildParams('users')}`),
            fetch(`/api/admin/stats/charts?${buildParams('auctions')}`),
            fetch('/api/admin/stats/activity'),
            fetch('/api/admin/stats/system'),
          ]);

        if (overviewRes.ok) setOverview((await overviewRes.json()).data);
        if (revenueRes.ok && usersRes.ok && auctionsRes.ok) {
          const [revenueData, usersData, auctionsData] = await Promise.all([
            revenueRes.json(),
            usersRes.json(),
            auctionsRes.json(),
          ]);
          setCharts({
            revenue: revenueData.data,
            users: usersData.data,
            auctions: auctionsData.data,
          });
        }
        if (activityRes.ok) setActivity((await activityRes.json()).data);
        if (systemRes.ok) setSystem((await systemRes.json()).data);

        setLastUpdated(new Date().toLocaleTimeString('ar-EG'));
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(), 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  const revenueSnapshot = useMemo(
    () => charts.revenue[charts.revenue.length - 1],
    [charts.revenue],
  );
  const usersSnapshot = useMemo(() => charts.users[charts.users.length - 1], [charts.users]);
  const auctionsSnapshot = useMemo(
    () => charts.auctions[charts.auctions.length - 1],
    [charts.auctions],
  );

  const avgOrder = revenueSnapshot?.orders
    ? Math.round((revenueSnapshot.amount || 0) / revenueSnapshot.orders)
    : 0;
  const completionRate =
    auctionsSnapshot?.created && auctionsSnapshot?.completed
      ? Math.round((auctionsSnapshot.completed / auctionsSnapshot.created) * 100)
      : 0;

  const filterButtonClass = (active: boolean) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
    }`;

  if (loading && !overview) {
    return (
      <AdminLayout title="لوحة التحكم">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="لوحة التحكم">
      {/* Header Actions */}
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">الاحصائيات المتقدمة</h1>
          <p className="text-slate-400">متابعة دقيقة لكل مؤشرات الأداء مع فلاتر ومرئيات متقدمة</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <RealTimeIndicator
            status={system?.status === 'healthy' ? 'connected' : 'disconnected'}
            lastUpdated={lastUpdated}
          />
          <button
            onClick={() => fetchData()}
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            <DocumentArrowDownIcon className="h-4 w-4" />
            تصدير تقرير
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-slate-700 bg-slate-800/60 p-4 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-slate-300">
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <span className="text-sm font-medium">المدى الزمني</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: '7d', label: 'آخر 7 أيام' },
              { value: '30d', label: 'آخر 30 يوم' },
              { value: '90d', label: 'آخر 90 يوم' },
              { value: '1y', label: 'آخر 12 شهر' },
            ].map((option) => (
              <button
                key={option.value}
                className={filterButtonClass(filters.range === option.value)}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, range: option.value as FilterState['range'] }))
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <FunnelIcon className="h-5 w-5" />
            قناة الاكتساب
          </label>
          <select
            value={filters.channel}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, channel: e.target.value as FilterState['channel'] }))
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="all">الكل</option>
            <option value="paid">مدفوع</option>
            <option value="organic">عضوي</option>
            <option value="direct">مباشر</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">شريحة المستخدم</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'all', label: 'الكل' },
              { value: 'vip', label: 'عملاء VIP' },
              { value: 'new', label: 'جدد' },
              { value: 'returning', label: 'عوده' },
            ].map((option) => (
              <button
                key={option.value}
                className={filterButtonClass(filters.segment === option.value)}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    segment: option.value as FilterState['segment'],
                  }))
                }
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="text-sm font-medium text-slate-300">حالة الحساب</label>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value as FilterState['status'] }))
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="all">الكل</option>
            <option value="healthy">سليم</option>
            <option value="flagged">قيد المراجعة</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="إجمالي المستخدمين"
          value={overview?.users?.total?.toLocaleString() || '0'}
          icon={UsersIcon}
          trend={overview?.users?.trend}
          isUp={overview?.users?.isUp}
          color="blue"
        />
        <StatCard
          title="المزادات النشطة"
          value={overview?.auctions?.active?.toLocaleString() || '0'}
          icon={CurrencyDollarIcon}
          trend={overview?.auctions?.trend}
          isUp={overview?.auctions?.isUp}
          description={`${overview?.auctions?.pending || 0} في الانتظار`}
          color="emerald"
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={`$${overview?.revenue?.total?.toLocaleString() || '0'}`}
          icon={WalletIcon}
          trend={overview?.revenue?.trend}
          isUp={overview?.revenue?.isUp}
          color="amber"
        />
        <StatCard
          title="خدمات النقل"
          value={overview?.services?.transport?.toLocaleString() || '0'}
          icon={TruckIcon}
          color="purple"
        />
      </div>

      {/* Performance and Distribution */}
      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Revenue Performance - 2 columns */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">أداء الإيرادات المتقدم</h3>
              <p className="text-sm text-slate-400">إيراد + ربح + عدد الطلبات بنفس المخطط</p>
            </div>
            <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-200">
              {filters.range === '1y' ? 'بيانات شهرية' : 'بيانات يومية'} | {charts.revenue.length}{' '}
              نقطة
            </span>
          </div>
          <RevenuePerformanceChart data={charts.revenue as any} />
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-slate-700/40 p-4">
              <p className="text-xs text-slate-400">متوسط الطلب</p>
              <p className="text-lg font-bold text-white">${avgOrder.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-slate-700/40 p-4">
              <p className="text-xs text-slate-400">عدد الطلبات</p>
              <p className="text-lg font-bold text-white">{revenueSnapshot?.orders || 0}</p>
            </div>
            <div className="rounded-xl bg-slate-700/40 p-4">
              <p className="text-xs text-slate-400">الربح التقديري</p>
              <p className="text-lg font-bold text-emerald-400">
                ${(revenueSnapshot?.profit || 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-slate-700/40 p-4">
              <p className="text-xs text-slate-400">الإيراد الحالي</p>
              <p className="text-lg font-bold text-amber-400">
                ${(revenueSnapshot?.amount || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Auction Distribution */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="mb-2 text-lg font-bold text-white">توزيع المزادات</h3>
          <p className="mb-4 text-sm text-slate-400">نسب الحالات مع أحدث حالة من المرشح الحالي</p>
          <AuctionDistributionChart />
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg bg-slate-700/50 p-3">
              <p className="text-xs text-slate-400">مكتمل</p>
              <p className="text-lg font-bold text-emerald-400">
                {auctionsSnapshot?.completed || 0}
              </p>
            </div>
            <div className="rounded-lg bg-slate-700/50 p-3">
              <p className="text-xs text-slate-400">قيد المراجعة</p>
              <p className="text-lg font-bold text-amber-400">
                {overview?.auctions?.pending || auctionsSnapshot?.cancelled || 0}
              </p>
            </div>
            <div className="rounded-lg bg-slate-700/50 p-3">
              <p className="text-xs text-slate-400">نسبة الإكمال</p>
              <p className="text-lg font-bold text-blue-400">{completionRate}%</p>
            </div>
            <div className="rounded-lg bg-slate-700/50 p-3">
              <p className="text-xs text-slate-400">متوسط المزايدة</p>
              <p className="text-lg font-bold text-white">
                ${(auctionsSnapshot?.avgBid || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users + Activity */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">نمو المستخدمين و الاحتفاظ</h3>
              <p className="text-sm text-slate-400">مقارنة المستخدمين النشطين والاحتفاظ</p>
            </div>
            <span className="rounded-full bg-blue-900/50 px-3 py-1 text-xs text-blue-200">
              الاحتفاظ {usersSnapshot?.retention ? `${usersSnapshot.retention.toFixed(0)}%` : '—'}
            </span>
          </div>
          <UserGrowthChart data={charts.users as any} />
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-slate-700/40 p-3">
              <p className="text-xs text-slate-400">مستخدمين جدد</p>
              <p className="text-lg font-bold text-white">{usersSnapshot?.users || 0}</p>
            </div>
            <div className="rounded-lg bg-slate-700/40 p-3">
              <p className="text-xs text-slate-400">مستخدمين نشطين</p>
              <p className="text-lg font-bold text-emerald-400">{usersSnapshot?.active || 0}</p>
            </div>
            <div className="rounded-lg bg-slate-700/40 p-3">
              <p className="text-xs text-slate-400">قناة</p>
              <p className="text-lg font-bold text-blue-400">
                {filters.channel === 'all' ? 'الكل' : filters.channel.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">النشاط الأخير</h3>
              <p className="text-sm text-slate-400">
                متابعة أحدث الإجراءات من المستخدمين والمزادات
              </p>
            </div>
            <button
              onClick={() => fetchData()}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              تحديث سريع
            </button>
          </div>
          <ActivityFeed items={activity} />
        </div>
      </div>
    </AdminLayout>
  );
}
