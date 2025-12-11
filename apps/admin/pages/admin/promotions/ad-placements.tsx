import {
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

const LOCATION_LABELS = {
  HOME_TOP: 'الصفحة الرئيسية - أعلى',
  HOME_MIDDLE: 'الصفحة الرئيسية - وسط',
  HOME_BOTTOM: 'الصفحة الرئيسية - أسفل',
  MARKETPLACE_TOP: 'السوق الفوري - أعلى',
  MARKETPLACE_BOTTOM: 'السوق الفوري - أسفل',
  AUCTIONS_TOP: 'المزادات - أعلى',
  AUCTIONS_BOTTOM: 'المزادات - أسفل',
  TRANSPORT_TOP: 'خدمات النقل - أعلى',
  TRANSPORT_BOTTOM: 'خدمات النقل - أسفل',
  YARDS_TOP: 'الساحات - أعلى',
  YARDS_BOTTOM: 'الساحات - أسفل',
  SIDEBAR: 'الشريط الجانبي',
  HEADER: 'الرأس',
  FOOTER: 'التذييل',
};

const TYPE_LABELS = {
  STATIC: 'ثابت',
  SLIDER: 'سلايدر',
  ROTATING: 'متحرك',
  GRID: 'شبكة',
  CAROUSEL: 'دائري',
};

export default function AdPlacementsPage() {
  const router = useRouter();
  const [placements, setPlacements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/ad-placements?search=${search}`);
      if (res.ok) {
        const data = await res.json();
        setPlacements(data.placements || []);
      }
    } catch (error) {
      console.error('Error fetching placements:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const handleDelete = async (id) => {
    if (!confirm('هل تريد حذف هذا الموقع الإعلاني؟')) return;
    try {
      const res = await fetch(`/api/admin/ad-placements/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchPlacements();
      }
    } catch (error) {
      console.error('Error deleting placement:', error);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/ad-placements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        fetchPlacements();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };



  return (
    <AdminLayout title="إدارة أماكن الإعلانات">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPlacements()}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 py-2 pl-4 pr-10 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={() => router.push('/admin/promotions/ad-placements/create')}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 font-bold text-white hover:from-amber-600 hover:to-orange-600"
        >
          <PlusIcon className="h-5 w-5" />
          إضافة مكان إعلاني
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </div>
      ) : placements.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 py-12 text-center">
          <SparklesIcon className="mx-auto h-12 w-12 text-slate-600" />
          <p className="mt-2 text-slate-400">لا توجد أماكن إعلانية</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {placements.map((placement) => (
            <div
              key={placement.id}
              className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 hover:border-amber-500/50"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-white">{placement.name}</h3>
                  <p className="text-sm text-slate-400">{LOCATION_LABELS[placement.location]}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(placement.id, placement.isActive)}
                    className={`rounded-lg p-1.5 ${
                      placement.isActive
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {placement.isActive ? (
                      <EyeIcon className="h-4 w-4" />
                    ) : (
                      <EyeSlashIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">النوع:</span>
                  <span className="rounded-full bg-slate-700 px-2 py-1 text-xs text-white">
                    {TYPE_LABELS[placement.type]}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">عدد الإعلانات:</span>
                  <span className="text-white">{placement.maxAds}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">الإعلانات الحالية:</span>
                  <span className="text-amber-400">{placement._count?.ads || 0}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => router.push(`/admin/promotions/placement-ads/${placement.id}`)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-sm font-bold text-white hover:from-amber-600 hover:to-orange-600"
                >
                  <RectangleStackIcon className="h-4 w-4" />
                  إدارة الإعلانات ({placement._count?.ads || 0})
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/admin/promotions/ad-placements/${placement.id}`)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500/20 px-3 py-2 text-sm text-blue-400 hover:bg-blue-500/30"
                  >
                    <PencilIcon className="h-4 w-4" />
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(placement.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-400 hover:bg-red-500/30"
                  >
                    <TrashIcon className="h-4 w-4" />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
