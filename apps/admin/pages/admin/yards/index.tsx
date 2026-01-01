/**
 * صفحة إدارة الساحات
 * Yards Management Page
 */

import {
  ArrowDownIcon,
  ArrowUpIcon,
  BuildingOfficeIcon,
  CheckBadgeIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { DAY_LABELS } from '../../../lib/shared-data';

interface Yard {
  id: string;
  slug: string;
  name: string;
  description?: string;
  city: string;
  area?: string;
  phone?: string;
  auctionDays: string[];
  auctionTimeFrom?: string;
  auctionTimeTo?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  verified: boolean;
  featured: boolean;
  rating?: number;
  reviewsCount: number;
  auctionsCount: number;
  image?: string;
  sortOrder?: number;
}

interface Stats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'نشط', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  INACTIVE: { label: 'غير نشط', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  PENDING: { label: 'في الانتظار', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  SUSPENDED: { label: 'موقوف', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

// استخدام DAY_LABELS من البيانات المشتركة بدلاً من التعريف المحلي
const dayLabels = DAY_LABELS;

export default function YardsPage() {
  const [yards, setYards] = useState<Yard[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, pending: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  const fetchYards = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (cityFilter !== 'all') params.set('city', cityFilter);
      params.set('limit', '50');

      const res = await fetch(`/api/admin/yards?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setYards(data.data || []);
        setStats(data.stats || { total: 0, active: 0, pending: 0, inactive: 0 });
      }
    } catch (error) {
      console.error('Error fetching yards:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, cityFilter]);

  useEffect(() => {
    fetchYards();
  }, [fetchYards]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/yards?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchYards();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف ساحة "${name}"؟`)) return;

    try {
      const res = await fetch(`/api/admin/yards?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchYards();
      } else {
        alert(data.error || 'حدث خطأ أثناء الحذف');
      }
    } catch (error) {
      console.error('Error deleting yard:', error);
    }
  };

  const [reordering, setReordering] = useState<string | null>(null);

  const handleReorder = async (yardId: string, direction: 'up' | 'down') => {
    setReordering(yardId);
    try {
      const res = await fetch('/api/admin/yards/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yardId, direction }),
      });
      const data = await res.json();
      if (data.success) {
        fetchYards();
      } else {
        alert(data.error || 'حدث خطأ أثناء تغيير الترتيب');
      }
    } catch (error) {
      console.error('Error reordering yard:', error);
    } finally {
      setReordering(null);
    }
  };

  const cities = [...new Set(yards.map((y) => y.city))];

  return (
    <AdminLayout title="إدارة الساحات">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <BuildingOfficeIcon className="h-7 w-7 text-blue-400" />
            إدارة الساحات
          </h1>
          <p className="mt-1 text-slate-400">إدارة ساحات المزادات على أرض الواقع</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/yards/auctions/create"
            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
          >
            <PlusIcon className="h-5 w-5" />
            إنشاء مزاد ساحة
          </Link>
          <Link
            href="/admin/yards/add"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5" />
            إضافة ساحة جديدة
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <BuildingOfficeIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">إجمالي الساحات</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <CheckBadgeIcon className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">نشطة</p>
              <p className="text-2xl font-bold text-green-400">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-500/20 p-2">
              <XMarkIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">غير نشطة</p>
              <p className="text-2xl font-bold text-gray-400">{stats.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث عن ساحة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 py-2 pl-4 pr-10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="ACTIVE">نشط</option>
            <option value="INACTIVE">غير نشط</option>
          </select>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع المدن</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Yards Table */}
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
        {loading ? (
          <div className="p-8 text-center text-slate-400">جاري التحميل...</div>
        ) : yards.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <BuildingOfficeIcon className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p>لا توجد ساحات</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="w-20 px-4 py-3 text-center font-medium text-slate-300">الترتيب</th>
                <th className="px-4 py-3 text-right font-medium text-slate-300">الساحة</th>
                <th className="px-4 py-3 text-right font-medium text-slate-300">الموقع</th>
                <th className="px-4 py-3 text-right font-medium text-slate-300">أيام المزاد</th>
                <th className="px-4 py-3 text-right font-medium text-slate-300">المزادات</th>
                <th className="px-4 py-3 text-right font-medium text-slate-300">الحالة</th>
                <th className="px-4 py-3 text-right font-medium text-slate-300">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {yards.map((yard, index) => (
                <tr key={yard.id} className="transition-colors hover:bg-slate-700/30">
                  {/* عمود الترتيب */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => handleReorder(yard.id, 'up')}
                        disabled={index === 0 || reordering === yard.id}
                        className={`rounded p-1 transition-colors ${
                          index === 0
                            ? 'cursor-not-allowed text-slate-600'
                            : 'text-slate-400 hover:bg-slate-700 hover:text-blue-400'
                        } ${reordering === yard.id ? 'animate-pulse' : ''}`}
                        title="رفع للأعلى"
                      >
                        <ArrowUpIcon className="h-4 w-4" />
                      </button>
                      <span className="text-xs font-medium text-slate-500">{index + 1}</span>
                      <button
                        onClick={() => handleReorder(yard.id, 'down')}
                        disabled={index === yards.length - 1 || reordering === yard.id}
                        className={`rounded p-1 transition-colors ${
                          index === yards.length - 1
                            ? 'cursor-not-allowed text-slate-600'
                            : 'text-slate-400 hover:bg-slate-700 hover:text-blue-400'
                        } ${reordering === yard.id ? 'animate-pulse' : ''}`}
                        title="خفض للأسفل"
                      >
                        <ArrowDownIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-700">
                        {yard.image ? (
                          <img
                            src={yard.image}
                            alt={yard.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <BuildingOfficeIcon className="h-6 w-6 text-slate-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{yard.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          {yard.verified && (
                            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
                              موثق
                            </span>
                          )}
                          {yard.featured && (
                            <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
                              مميز
                            </span>
                          )}
                          {yard.rating && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <StarIcon className="h-3 w-3" />
                              {yard.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPinIcon className="h-4 w-4 text-slate-500" />
                      <div>
                        <p>{yard.city}</p>
                        {yard.area && <p className="text-xs text-slate-500">{yard.area}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {yard.auctionDays.slice(0, 3).map((day) => (
                        <span
                          key={day}
                          className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300"
                        >
                          {dayLabels[day] || day}
                        </span>
                      ))}
                      {yard.auctionDays.length > 3 && (
                        <span className="text-xs text-slate-500">
                          +{yard.auctionDays.length - 3}
                        </span>
                      )}
                    </div>
                    {yard.auctionTimeFrom && yard.auctionTimeTo && (
                      <p className="mt-1 text-xs text-slate-500">
                        {yard.auctionTimeFrom} - {yard.auctionTimeTo}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-white">{yard.auctionsCount}</span>
                    <span className="text-sm text-slate-500"> مزاد</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={yard.status}
                      onChange={(e) => handleStatusChange(yard.id, e.target.value)}
                      className={`cursor-pointer rounded border bg-transparent px-2 py-1 text-xs ${statusLabels[yard.status]?.color || 'bg-slate-700 text-slate-300'}`}
                    >
                      <option value="ACTIVE">نشط</option>
                      <option value="INACTIVE">غير نشط</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/yards/${yard.id}`}
                        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-blue-400"
                        title="تعديل"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <a
                        href={`http://localhost:3021/yards/${yard.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-green-400"
                        title="عرض في الموقع"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(yard.id, yard.name)}
                        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-red-400"
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
        )}
      </div>
    </AdminLayout>
  );
}
