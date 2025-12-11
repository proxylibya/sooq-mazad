import {
  ComputerDesktopIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';

interface AdZone {
  id: string;
  name: string;
  code: string; // Note: 'code' is not in the schema, maybe use 'location' or just remove it if not needed. The schema has 'location'.
  location: string;
  dimensions: string | null;
  width: string | null;
  height: string | null;
  type: string;
  status: string; // Schema has 'status' as AdPlacementStatus enum (ACTIVE, INACTIVE, SCHEDULED)
  isActive: boolean;
  _count: {
    ads: number;
  };
}

export default function ZonesPage() {
  const [zones, setZones] = useState<AdZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ads/zones');
      if (!res.ok) throw new Error('Failed to fetch zones');
      const data = await res.json();
      setZones(data.zones);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المساحة؟')) return;

    try {
      const res = await fetch(`/api/admin/ads/zones/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete zone');
      }

      // Refresh list
      fetchZones();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getDimensions = (zone: AdZone) => {
    if (zone.width && zone.height) {
      return `${zone.width}x${zone.height}`;
    }
    return 'Responsive';
  };

  return (
    <AdminLayout title="مساحات الإعلانات">
      <Head>
        <title>مساحات الإعلانات | سوق مزاد</title>
      </Head>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">مساحات الإعلانات (Zones)</h1>
          <p className="text-slate-400">تعريف وإدارة أماكن ظهور الإعلانات في الموقع</p>
        </div>
        <Link
          href="/admin/ads/zones/create"
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-white transition-colors hover:bg-amber-600"
        >
          <PlusIcon className="h-5 w-5" />
          مساحة جديدة
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
        {loading ? (
          <div className="p-8 text-center text-slate-400">جاري التحميل...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : zones.length === 0 ? (
          <div className="p-8 text-center text-slate-400">لا توجد مساحات إعلانية حالياً</div>
        ) : (
          <table className="w-full text-right">
            <thead className="bg-slate-700/50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">اسم المساحة</th>
                <th className="px-6 py-4">الموقع (Location)</th>
                <th className="px-6 py-4">الأبعاد</th>
                <th className="px-6 py-4">النوع</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">الإعلانات</th>
                <th className="px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-sm">
              {zones.map((zone) => (
                <tr key={zone.id} className="transition-colors hover:bg-slate-700/30">
                  <td className="px-6 py-4 font-medium text-white">{zone.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-amber-500">{zone.location}</td>
                  <td className="px-6 py-4 text-slate-300">{getDimensions(zone)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <ComputerDesktopIcon className="h-4 w-4" />
                      <span>{zone.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        zone.isActive
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-slate-500/10 text-slate-500'
                      }`}
                    >
                      {zone.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white">{zone._count?.ads || 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/ads/zones/${zone.id}/edit`}
                        className="text-slate-400 hover:text-white"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(zone.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <TrashIcon className="h-5 w-5" />
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
