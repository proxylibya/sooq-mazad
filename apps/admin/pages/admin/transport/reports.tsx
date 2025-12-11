/**
 * صفحة تقارير خدمات النقل
 */
import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  MapPinIcon,
  TruckIcon,
  UserGroupIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface ReportStats {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  suspendedServices: number;
  featuredServices: number;
  totalProviders: number;
  thisMonthServices: number;
  lastMonthServices: number;
  topCities: { city: string; count: number }[];
  topVehicleTypes: { type: string; count: number }[];
}

export default function TransportReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/transport/reports?range=${dateRange}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // بيانات افتراضية في حال عدم وجود API
  const defaultStats: ReportStats = {
    totalServices: 0,
    activeServices: 0,
    inactiveServices: 0,
    suspendedServices: 0,
    featuredServices: 0,
    totalProviders: 0,
    thisMonthServices: 0,
    lastMonthServices: 0,
    topCities: [],
    topVehicleTypes: [],
  };

  const displayStats = stats || defaultStats;

  const growthRate =
    displayStats.lastMonthServices > 0
      ? (
          ((displayStats.thisMonthServices - displayStats.lastMonthServices) /
            displayStats.lastMonthServices) *
          100
        ).toFixed(1)
      : '0';

  return (
    <>
      <Head>
        <title>تقارير خدمات النقل - لوحة التحكم</title>
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                <ChartBarIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">تقارير خدمات النقل</h1>
                <p className="text-sm text-slate-400">إحصائيات وتحليلات شاملة</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="week">هذا الأسبوع</option>
                <option value="month">هذا الشهر</option>
                <option value="quarter">هذا الربع</option>
                <option value="year">هذا العام</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Main Stats */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                      <TruckIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">إجمالي الخدمات</p>
                      <p className="text-2xl font-bold text-white">{displayStats.totalServices}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
                      <CheckCircleIcon className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">الخدمات النشطة</p>
                      <p className="text-2xl font-bold text-white">{displayStats.activeServices}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/20">
                      <UserGroupIcon className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">مقدمي الخدمة</p>
                      <p className="text-2xl font-bold text-white">{displayStats.totalProviders}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                      <ArrowTrendingUpIcon className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">معدل النمو</p>
                      <p
                        className={`text-2xl font-bold ${Number(growthRate) >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {growthRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">توزيع الحالات</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-slate-300">نشط</span>
                      </div>
                      <span className="font-semibold text-white">
                        {displayStats.activeServices}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-slate-400"></div>
                        <span className="text-slate-300">غير نشط</span>
                      </div>
                      <span className="font-semibold text-white">
                        {displayStats.inactiveServices}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <span className="text-slate-300">موقوف</span>
                      </div>
                      <span className="font-semibold text-white">
                        {displayStats.suspendedServices}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                        <span className="text-slate-300">مميز</span>
                      </div>
                      <span className="font-semibold text-white">
                        {displayStats.featuredServices}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">أكثر المدن طلباً</h3>
                  {displayStats.topCities.length > 0 ? (
                    <div className="space-y-3">
                      {displayStats.topCities.slice(0, 5).map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-300">{item.city}</span>
                          </div>
                          <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-sm font-medium text-blue-400">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-400">لا توجد بيانات</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">إجراءات سريعة</h3>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/admin/transport"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    <TruckIcon className="h-4 w-4" />
                    عرض جميع الخدمات
                  </Link>
                  <Link
                    href="/admin/transport/add"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-600"
                  >
                    <TruckIcon className="h-4 w-4" />
                    إضافة خدمة جديدة
                  </Link>
                  <Link
                    href="/admin/transport?status=INACTIVE"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-600"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    الخدمات غير النشطة
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
