import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';

const ENTITY_TYPE_LABELS = {
  AUCTION: 'مزاد',
  CAR: 'سيارة',
  SHOWROOM: 'معرض',
  TRANSPORT: 'خدمة نقل',
  YARD: 'ساحة',
  CUSTOM: 'مخصص',
};

export default function PlacementAdsPage() {
  const router = useRouter();
  const { placementId } = router.query;
  const [placement, setPlacement] = useState(null);
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    entityType: 'AUCTION',
    entityId: '',
    title: '',
    description: '',
    imageUrl: '',
    priority: 0,
    isActive: true,
  });

  useEffect(() => {
    if (placementId) {
      fetchPlacement();
      fetchAds();
    }
  }, [placementId]);

  const fetchPlacement = async () => {
    try {
      const res = await fetch(`/api/admin/ad-placements/${placementId}`);
      if (res.ok) {
        const data = await res.json();
        setPlacement(data.placement);
      }
    } catch (error) {
      console.error('Error fetching placement:', error);
    }
  };

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/placement-ads?placementId=${placementId}`);
      if (res.ok) {
        const data = await res.json();
        setAds(data.ads || []);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/placement-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placementId,
          ...formData,
        }),
      });

      if (res.ok) {
        setShowAddForm(false);
        setFormData({
          entityType: 'AUCTION',
          entityId: '',
          title: '',
          description: '',
          imageUrl: '',
          priority: 0,
          isActive: true,
        });
        fetchAds();
        fetchPlacement();
      } else {
        const err = await res.json();
        alert(err.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error adding ad:', error);
      alert('حدث خطأ');
    }
  };

  const handleDeleteAd = async (id) => {
    if (!confirm('هل تريد حذف هذا الإعلان؟')) return;
    try {
      const res = await fetch(`/api/admin/placement-ads/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchAds();
        fetchPlacement();
      }
    } catch (error) {
      console.error('Error deleting ad:', error);
    }
  };

  const toggleAdActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/placement-ads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        fetchAds();
      }
    } catch (error) {
      console.error('Error toggling ad status:', error);
    }
  };

  if (!placement) {
    return (
      <AdminLayout title="إدارة الإعلانات">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  const canAddMore = ads.length < placement.maxAds;

  return (
    <AdminLayout title={`إعلانات: ${placement.name}`}>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push('/admin/promotions/ad-placements')}
          className="flex items-center gap-2 text-slate-400 hover:text-white"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          رجوع
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{placement.name}</h1>
          <p className="text-sm text-slate-400">
            {ads.length} / {placement.maxAds} إعلان
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-slate-400">الموقع</p>
            <p className="font-bold text-white">{placement.location}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">النوع</p>
            <p className="font-bold text-white">{placement.type}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">الحالة</p>
            <p className={`font-bold ${placement.isActive ? 'text-green-400' : 'text-red-400'}`}>
              {placement.isActive ? 'مفعّل' : 'معطّل'}
            </p>
          </div>
        </div>
      </div>

      {canAddMore && (
        <div className="mb-6">
          {!showAddForm ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => router.push(`/admin/promotions/placement-ads/create?placementId=${placementId}`)}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-600 bg-gradient-to-r from-amber-500/20 to-orange-500/20 py-4 text-amber-400 hover:border-amber-500 hover:from-amber-500/30 hover:to-orange-500/30"
              >
                <SparklesIcon className="h-6 w-6" />
                إنشاء إعلان متقدم
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/30 py-4 text-slate-400 hover:border-slate-600 hover:text-slate-300"
              >
                <PlusIcon className="h-6 w-6" />
                إضافة إعلان سريع
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <form onSubmit={handleAddAd} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      نوع المحتوى
                    </label>
                    <select
                      value={formData.entityType}
                      onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                    >
                      {Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      معرّف المحتوى (ID)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.entityId}
                      onChange={(e) => setFormData({ ...formData, entityId: e.target.value })}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                      placeholder="أدخل معرّف المزاد أو السيارة..."
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    العنوان (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="عنوان الإعلان..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    الوصف (اختياري)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="وصف الإعلان..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    رابط الصورة (اختياري)
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.imageUrl}
                        alt="معاينة"
                        className="h-32 w-full rounded-lg object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    الأولوية (الأعلى يظهر أولاً)
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium text-slate-300">مفعّل</span>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-bold text-white hover:from-amber-600 hover:to-orange-600"
                  >
                    <PlusIcon className="h-5 w-5" />
                    إضافة
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex flex-1 items-center justify-center rounded-lg bg-slate-700 py-3 font-bold text-white hover:bg-slate-600"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </div>
      ) : ads.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 py-12 text-center">
          <p className="text-slate-400">لا توجد إعلانات في هذا الموضع</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 p-4 hover:border-amber-500/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-amber-500/20 px-3 py-1 text-sm font-bold text-amber-400">
                    #{ad.priority}
                  </span>
                  <div>
                    <p className="font-bold text-white">
                      {ENTITY_TYPE_LABELS[ad.entityType]} - {ad.entityId}
                    </p>
                    <p className="text-xs text-slate-400">
                      تم الإنشاء: {new Date(ad.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/admin/promotions/placement-ads/edit/${ad.id}`)}
                  className="rounded-lg bg-amber-500/20 p-2 text-amber-400 hover:bg-amber-500/30"
                  title="تعديل"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleAdActive(ad.id, ad.isActive)}
                  className={`rounded-lg p-2 ${
                    ad.isActive
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                  title={ad.isActive ? 'مفعّل' : 'معطّل'}
                >
                  {ad.isActive ? (
                    <EyeIcon className="h-4 w-4" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDeleteAd(ad.id)}
                  className="rounded-lg bg-red-500/20 p-2 text-red-400 hover:bg-red-500/30"
                  title="حذف"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
