import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CursorArrowRaysIcon,
  EyeIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

export default function AdStatsPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/placement-ads/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="إحصائيات الإعلانات">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout title="إحصائيات الإعلانات">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 py-12 text-center">
          <p className="text-slate-400">فشل في تحميل الإحصائيات</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="إحصائيات الإعلانات">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">إحصائيات الإعلانات</h1>
        <p className="text-slate-400">نظرة عامة على أداء الإعلانات والمواضع</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">إجمالي المواضع</p>
              <p className="mt-1 text-3xl font-bold text-white">
                {stats.overview.totalPlacements}
              </p>
            </div>
            <div className="rounded-lg bg-blue-500/20 p-3">
              <ChartBarIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-green-500/10 to-green-600/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">الإعلانات النشطة</p>
              <p className="mt-1 text-3xl font-bold text-white">
                {stats.overview.activeAds}
                <span className="text-lg text-slate-400">/{stats.overview.totalAds}</span>
              </p>
            </div>
            <div className="rounded-lg bg-green-500/20 p-3">
              <SparklesIcon className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">إجمالي النقرات</p>
              <p className="mt-1 text-3xl font-bold text-white">
                {stats.overview.totalClicks.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-amber-500/20 p-3">
              <CursorArrowRaysIcon className="h-8 w-8 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">إجمالي المشاهدات</p>
              <p className="mt-1 text-3xl font-bold text-white">
                {stats.overview.totalImpressions.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-purple-500/20 p-3">
              <EyeIcon className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-3">
            <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-slate-400">متوسط معدل النقر (CTR)</p>
            <p className="text-2xl font-bold text-white">{stats.overview.avgCTR}%</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-white">أفضل 10 إعلانات</h2>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-700/50">
                  <th className="px-4 py-3 text-right text-sm font-bold text-slate-300">#</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-slate-300">النوع</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-slate-300">
                    المعرّف
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-slate-300">
                    الموضع
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-slate-300">
                    النقرات
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-slate-300">
                    المشاهدات
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-slate-300">CTR</th>
                </tr>
              </thead>
              <tbody>
                {stats.topAds.map((ad, index) => (
                  <tr key={ad.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                    <td className="px-4 py-3 text-sm text-white">{index + 1}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs font-bold text-amber-400">
                        {ad.entityType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{ad.entityId}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{ad.placement.name}</td>
                    <td className="px-4 py-3 text-sm font-bold text-amber-400">
                      {ad.clicks.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {ad.impressions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-400">{ad.ctr}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-white">أداء المواضع</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.placements.map((placement) => (
            <div
              key={placement.id}
              className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 hover:border-amber-500/50"
            >
              <h3 className="font-bold text-white">{placement.name}</h3>
              <p className="mb-3 text-sm text-slate-400">{placement.location}</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">عدد الإعلانات:</span>
                  <span className="font-bold text-white">{placement.adsCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">النقرات:</span>
                  <span className="font-bold text-amber-400">
                    {placement.clicks.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">المشاهدات:</span>
                  <span className="font-bold text-purple-400">
                    {placement.impressions.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-700 pt-2 text-sm">
                  <span className="text-slate-400">CTR:</span>
                  <span className="font-bold text-green-400">{placement.ctr}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
