import {
  CheckCircleIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
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

export default function PromotionPackagesPage() {
  const [packages, setPackages] = useState<PromotionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PromotionPackage | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    description: '',
    price: '',
    duration: '',
    targetType: 'ALL',
    features: '', // Newline separated
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
        setPackages(data.data);
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
      }
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  return (
    <AdminLayout title="إدارة باقات الترويج">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">باقات الترويج</h1>
          <p className="text-slate-400">إدارة الباقات والأسعار والمميزات</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          <span>إضافة باقة جديدة</span>
        </button>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/50">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-800 text-slate-400">
              <tr>
                <th className="px-6 py-3 font-medium">اسم الباقة</th>
                <th className="px-6 py-3 font-medium">السعر</th>
                <th className="px-6 py-3 font-medium">المدة</th>
                <th className="px-6 py-3 font-medium">النوع المستهدف</th>
                <th className="px-6 py-3 font-medium">الحالة</th>
                <th className="px-6 py-3 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-slate-300">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-700/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: pkg.badgeColor + '20', color: pkg.badgeColor }}
                      >
                        <SparklesIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{pkg.nameAr}</p>
                        <p className="text-xs text-slate-500">{pkg.nameEn}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">{pkg.price} د.ل</td>
                  <td className="px-6 py-4">{pkg.duration} يوم</td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-slate-700 px-2 py-1 text-xs">
                      {pkg.targetType === 'ALL'
                        ? 'الكل'
                        : pkg.targetType === 'AUCTION'
                          ? 'مزاد'
                          : pkg.targetType === 'LISTING'
                            ? 'بيع مباشر'
                            : 'خدمات'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {pkg.isActive ? (
                      <span className="inline-flex items-center gap-1 text-green-400">
                        <CheckCircleIcon className="h-4 w-4" /> نشط
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <XCircleIcon className="h-4 w-4" /> غير نشط
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(pkg)}
                        className="rounded p-1 text-blue-400 hover:bg-blue-500/10"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="rounded p-1 text-red-400 hover:bg-red-500/10"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl bg-slate-800 p-6 shadow-2xl">
            <h2 className="mb-6 text-xl font-bold text-white">
              {editingPackage ? 'تعديل الباقة' : 'إضافة باقة جديدة'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">الاسم بالعربية</label>
                  <input
                    type="text"
                    required
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="w-full rounded bg-slate-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    required
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full rounded bg-slate-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded bg-slate-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">السعر (د.ل)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded bg-slate-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">المدة (أيام)</label>
                  <input
                    type="number"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full rounded bg-slate-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">النوع المستهدف</label>
                  <select
                    value={formData.targetType}
                    onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                    className="w-full rounded bg-slate-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">الكل</option>
                    <option value="AUCTION">مزاد</option>
                    <option value="LISTING">بيع مباشر</option>
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
                  className="w-full rounded bg-slate-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="- ظهور في الصفحة الرئيسية&#10;- شارة مميزة"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">لون الشارة</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.badgeColor}
                      onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                      className="h-10 w-20 cursor-pointer rounded bg-transparent"
                    />
                    <span className="text-slate-400">{formData.badgeColor}</span>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">الأولوية</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full rounded bg-slate-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-white">
                  نشط
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-700 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-slate-300 hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
