import {
  CheckCircleIcon,
  PauseCircleIcon,
  PencilIcon,
  PlayCircleIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';

interface PromotionPackage {
  id: string;
  nameAr: string;
  nameEn: string;
  description: string;
  price: number;
  duration: number;
  targetType: 'AUCTION' | 'LISTING' | 'SERVICE' | 'ALL';
  features: string[];
  badgeColor: string;
  priority: number;
  isActive: boolean;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<PromotionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PromotionPackage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    description: '',
    price: '',
    duration: '',
    targetType: 'ALL',
    features: '',
    badgeColor: '#F59E0B',
    priority: '0',
    isActive: true,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/promotion-packages');
      if (res.ok) {
        const data = await res.json();
        setPackages(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (pkg?: PromotionPackage) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        nameAr: pkg.nameAr,
        nameEn: pkg.nameEn,
        description: pkg.description || '',
        price: pkg.price.toString(),
        duration: pkg.duration.toString(),
        targetType: pkg.targetType,
        features: Array.isArray(pkg.features) ? pkg.features.join('\n') : '',
        badgeColor: pkg.badgeColor || '#F59E0B',
        priority: pkg.priority.toString(),
        isActive: pkg.isActive,
      });
    } else {
      setEditingPackage(null);
      setFormData({
        nameAr: '',
        nameEn: '',
        description: '',
        price: '',
        duration: '',
        targetType: 'ALL',
        features: '',
        badgeColor: '#F59E0B',
        priority: '0',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...formData,
      features: formData.features.split('\n').filter((f) => f.trim() !== ''),
    };

    try {
      const url = editingPackage
        ? `/api/admin/promotion-packages/${editingPackage.id}`
        : '/api/admin/promotion-packages';
      const method = editingPackage ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchPackages();
      } else {
        alert('حدث خطأ أثناء الحفظ');
      }
    } catch (error) {
      console.error('Error saving package:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الباقة؟')) return;
    try {
      const res = await fetch(`/api/admin/promotion-packages/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchPackages();
      } else {
        alert('حدث خطأ أثناء الحذف');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  const handleToggleActive = async (pkg: PromotionPackage) => {
    try {
      const res = await fetch(`/api/admin/promotion-packages/${pkg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !pkg.isActive }),
      });
      if (res.ok) {
        fetchPackages();
      }
    } catch (error) {
      console.error('Error toggling package status:', error);
    }
  };

  const getTargetTypeLabel = (type: string) => {
    switch (type) {
      case 'AUCTION':
        return 'مزادات';
      case 'LISTING':
        return 'سوق فوري';
      case 'SERVICE':
        return 'خدمات';
      case 'ALL':
        return 'الكل';
      default:
        return type;
    }
  };

  return (
    <AdminLayout title="باقات الترويج">
      <Head>
        <title>باقات الترويج | سوق مزاد</title>
      </Head>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">باقات الترويج</h1>
          <p className="text-slate-400">إدارة الباقات والأسعار المتاحة للمعلنين</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-white transition-colors hover:bg-amber-600"
        >
          <PlusIcon className="h-5 w-5" />
          باقة جديدة
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-slate-700 bg-slate-800 p-6"
            >
              <div className="mb-4 h-6 w-3/4 rounded bg-slate-700"></div>
              <div className="mb-2 h-4 w-1/2 rounded bg-slate-700"></div>
              <div className="mb-4 h-8 w-1/3 rounded bg-slate-700"></div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-slate-700"></div>
                <div className="h-3 w-2/3 rounded bg-slate-700"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && packages.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-800/50 py-16">
          <SparklesIcon className="mb-4 h-16 w-16 text-slate-600" />
          <h3 className="mb-2 text-xl font-bold text-white">لا توجد باقات</h3>
          <p className="mb-6 text-slate-400">قم بإضافة باقات ترويج جديدة للمستخدمين</p>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-bold text-white hover:bg-amber-600"
          >
            <PlusIcon className="h-5 w-5" />
            إضافة باقة جديدة
          </button>
        </div>
      )}

      {/* Packages Grid */}
      {!isLoading && packages.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`group relative overflow-hidden rounded-2xl border p-6 transition-all hover:shadow-lg ${
                pkg.isActive
                  ? 'border-slate-700 bg-slate-800 hover:border-amber-500/50'
                  : 'border-slate-800 bg-slate-900 opacity-60'
              }`}
            >
              {/* Status Badge */}
              {!pkg.isActive && (
                <div className="absolute left-4 top-4 rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
                  معطل
                </div>
              )}

              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: (pkg.badgeColor || '#F59E0B') + '20',
                      color: pkg.badgeColor || '#F59E0B',
                    }}
                  >
                    <SparklesIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{pkg.nameAr}</h3>
                    <p className="text-xs text-slate-500">{pkg.nameEn}</p>
                  </div>
                </div>
                <div className="text-xl font-bold" style={{ color: pkg.badgeColor || '#F59E0B' }}>
                  {pkg.price} د.ل
                </div>
              </div>

              {/* Info */}
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300">
                  {pkg.duration} يوم
                </span>
                <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300">
                  {getTargetTypeLabel(pkg.targetType)}
                </span>
                <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300">
                  أولوية: {pkg.priority}
                </span>
              </div>

              {/* Features */}
              {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                <div className="mb-4 space-y-2 border-t border-slate-700 pt-4">
                  {pkg.features.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-green-500" />
                      <span className="truncate">{feature}</span>
                    </div>
                  ))}
                  {pkg.features.length > 4 && (
                    <p className="text-xs text-slate-500">+{pkg.features.length - 4} مميزات أخرى</p>
                  )}
                </div>
              )}

              {/* Description */}
              {pkg.description && (
                <p className="mb-4 line-clamp-2 text-sm text-slate-400">{pkg.description}</p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 border-t border-slate-700 pt-4">
                <button
                  onClick={() => handleOpenModal(pkg)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-700 py-2 text-sm font-medium text-white hover:bg-slate-600"
                >
                  <PencilIcon className="h-4 w-4" />
                  تعديل
                </button>
                <button
                  onClick={() => handleToggleActive(pkg)}
                  className={`flex items-center justify-center rounded-lg p-2 ${
                    pkg.isActive
                      ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                      : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                  }`}
                  title={pkg.isActive ? 'إيقاف' : 'تفعيل'}
                >
                  {pkg.isActive ? (
                    <PauseCircleIcon className="h-5 w-5" />
                  ) : (
                    <PlayCircleIcon className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="flex items-center justify-center rounded-lg bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20"
                  title="حذف"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-slate-800 p-6 shadow-2xl">
            <h2 className="mb-6 text-xl font-bold text-white">
              {editingPackage ? 'تعديل الباقة' : 'إضافة باقة جديدة'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">الاسم بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="w-full rounded bg-slate-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="مثال: الباقة الذهبية"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">الاسم بالإنجليزية *</label>
                  <input
                    type="text"
                    required
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full rounded bg-slate-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Gold Package"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded bg-slate-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500"
                  rows={2}
                  placeholder="وصف مختصر للباقة..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">السعر (د.ل) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded bg-slate-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">المدة (أيام) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full rounded bg-slate-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="7"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">النوع المستهدف</label>
                  <select
                    value={formData.targetType}
                    onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                    className="w-full rounded bg-slate-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="ALL">الكل</option>
                    <option value="AUCTION">مزادات</option>
                    <option value="LISTING">سوق فوري</option>
                    <option value="SERVICE">خدمات</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">
                  المميزات (كل ميزة في سطر)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full rounded bg-slate-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500"
                  rows={4}
                  placeholder="ظهور في الصفحة الرئيسية&#10;شارة مميزة&#10;أولوية في نتائج البحث"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">لون الشارة</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.badgeColor}
                      onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                      className="h-10 w-16 cursor-pointer rounded border-0 bg-transparent"
                    />
                    <span className="font-mono text-sm text-slate-400">{formData.badgeColor}</span>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">الأولوية</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full rounded bg-slate-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0"
                  />
                  <p className="mt-1 text-xs text-slate-500">الأعلى = يظهر أولاً</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="isActive" className="text-white">
                  الباقة نشطة
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-700 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-6 py-2 text-slate-300 hover:bg-slate-700"
                  disabled={isSubmitting}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-2 font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      جاري الحفظ...
                    </>
                  ) : (
                    'حفظ'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
