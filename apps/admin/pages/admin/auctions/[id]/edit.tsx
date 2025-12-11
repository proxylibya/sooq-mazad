/**
 * صفحة تعديل المزاد - Edit Auction
 * تعديل بيانات المزاد
 */

import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';

interface AuctionData {
  id: string;
  title: string;
  description: string;
  startPrice: number;
  currentPrice: number;
  minimumBid: number;
  status: string;
  type: string;
  startDate: string;
  endDate: string;
  featured: boolean;
}

export default function EditAuctionPage() {
  const router = useRouter();
  const { id } = router.query;

  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startPrice: 0,
    minimumBid: 0,
    status: '',
    endDate: '',
    featured: false,
  });

  useEffect(() => {
    if (id) {
      fetchAuction();
    }
  }, [id]);

  const fetchAuction = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/auctions/${id}`);
      const data = await res.json();

      if (data.success) {
        setAuction(data.auction);
        setFormData({
          title: data.auction.title || '',
          description: data.auction.description || '',
          startPrice: data.auction.startPrice || 0,
          minimumBid: data.auction.minimumBid || 0,
          status: data.auction.status || 'PENDING',
          endDate: data.auction.endDate
            ? new Date(data.auction.endDate).toISOString().slice(0, 16)
            : '',
          featured: data.auction.featured || false,
        });
      } else {
        setError(data.message || 'فشل في جلب بيانات المزاد');
      }
    } catch (err) {
      console.error('Failed to fetch auction:', err);
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/auctions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('تم تحديث المزاد بنجاح');
        setTimeout(() => {
          router.push(`/admin/auctions/${id}`);
        }, 1500);
      } else {
        setError(data.message || 'فشل في تحديث المزاد');
      }
    } catch (err) {
      console.error('Failed to update auction:', err);
      setError('حدث خطأ في الخادم');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? parseFloat(value) || 0
            : value,
    }));
  };

  if (loading) {
    return (
      <AdminLayout title="تحميل...">
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !auction) {
    return (
      <AdminLayout title="خطأ">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
          <p className="mt-4 text-lg text-red-400">{error}</p>
          <Link
            href="/admin/auctions"
            className="mt-4 inline-block rounded-lg bg-slate-700 px-4 py-2 text-white transition-colors hover:bg-slate-600"
          >
            العودة للمزادات
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`تعديل المزاد: ${auction?.title || ''}`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/auctions/${id}`}
            className="rounded-lg bg-slate-700 px-3 py-2 text-slate-300 transition-colors hover:bg-slate-600"
          >
            ← العودة
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">تعديل المزاد</h1>
            <p className="text-sm text-slate-400">ID: {id}</p>
          </div>
        </div>

        <button
          onClick={fetchAuction}
          className="rounded-lg bg-slate-700 p-2 text-slate-300 transition-colors hover:bg-slate-600"
          title="إعادة تحميل"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          <ExclamationTriangleIcon className="h-5 w-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
          <CheckCircleIcon className="h-5 w-5" />
          {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-4 text-lg font-bold text-white">المعلومات الأساسية</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-300">عنوان المزاد</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="أدخل عنوان المزاد"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-300">الوصف</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="أدخل وصف المزاد"
              />
            </div>

            {/* Start Price */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                سعر البداية (د.ل)
              </label>
              <input
                type="number"
                name="startPrice"
                value={formData.startPrice}
                onChange={handleChange}
                min="0"
                step="100"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* Minimum Bid */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                الحد الأدنى للمزايدة (د.ل)
              </label>
              <input
                type="number"
                name="minimumBid"
                value={formData.minimumBid}
                onChange={handleChange}
                min="0"
                step="50"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">الحالة</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="PENDING">قيد المراجعة</option>
                <option value="ACTIVE">نشط</option>
                <option value="UPCOMING">قادم</option>
                <option value="ENDED">منتهي</option>
                <option value="SOLD">مباع</option>
                <option value="CANCELLED">ملغي</option>
              </select>
            </div>

            {/* End Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                تاريخ الانتهاء
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* Featured */}
            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />
                <span className="text-slate-300">مزاد مميز</span>
              </label>
              <p className="mt-1 text-sm text-slate-400">
                المزادات المميزة تظهر في الصفحة الرئيسية وأعلى القوائم
              </p>
            </div>
          </div>
        </div>

        {/* Current Price Info */}
        {auction && (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h2 className="mb-4 text-lg font-bold text-white">معلومات للقراءة فقط</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-slate-700/50 p-4">
                <p className="text-sm text-slate-400">السعر الحالي</p>
                <p className="text-xl font-bold text-emerald-400">
                  {auction.currentPrice?.toLocaleString('ar-LY')} د.ل
                </p>
              </div>

              <div className="rounded-lg bg-slate-700/50 p-4">
                <p className="text-sm text-slate-400">نوع المزاد</p>
                <p className="text-xl font-medium text-white">{auction.type}</p>
              </div>

              <div className="rounded-lg bg-slate-700/50 p-4">
                <p className="text-sm text-slate-400">تاريخ البداية</p>
                <p className="text-lg font-medium text-white">
                  {auction.startDate
                    ? new Date(auction.startDate).toLocaleDateString('ar-LY')
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            href={`/admin/auctions/${id}`}
            className="rounded-lg bg-slate-700 px-6 py-3 text-slate-300 transition-colors hover:bg-slate-600"
          >
            إلغاء
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                حفظ التغييرات
              </>
            )}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
