/**
 * صفحة تعديل مستخدم
 * Edit User Page
 */

import {
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PhoneIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';

interface User {
  id: string;
  name: string;
  phone: string;
  status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
  role: string;
  verified: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function EditUser() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'USER',
    status: 'ACTIVE',
    verified: false,
  });

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          role: data.user.role || 'USER',
          status: data.user.status || 'ACTIVE',
          verified: data.user.verified || false,
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'فشل تحميل بيانات المستخدم' });
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء تحميل البيانات' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'الرجاء إدخال اسم المستخدم' });
      return;
    }

    if (!formData.phone.trim()) {
      setMessage({ type: 'error', text: 'الرجاء إدخال رقم الهاتف' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'تم تحديث المستخدم بنجاح' });
        setTimeout(() => {
          router.push('/admin/users');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message || 'فشل تحديث المستخدم' });
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء التحديث' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="تعديل مستخدم">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-400">جاري التحميل...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout title="تعديل مستخدم">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-400" />
          <p className="mt-4 text-red-400">المستخدم غير موجود</p>
          <Link
            href="/admin/users"
            className="mt-4 inline-block rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
          >
            العودة للقائمة
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="تعديل مستخدم">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/admin/users" className="hover:text-white">
          المستخدمون
        </Link>
        <ArrowRightIcon className="h-4 w-4 rotate-180" />
        <span className="text-white">تعديل: {user.name}</span>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-lg p-4 ${
            message.type === 'success'
              ? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
              : 'border border-red-500/30 bg-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircleIcon className="h-5 w-5" />
          ) : (
            <ExclamationCircleIcon className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
            <UserIcon className="h-6 w-6 text-blue-400" />
            تعديل معلومات المستخدم
          </h2>

          <div className="space-y-5">
            {/* User ID Info */}
            <div className="rounded-lg bg-slate-700/50 p-4">
              <p className="text-sm text-slate-400">
                معرف المستخدم: <span className="font-mono text-white">{user.id}</span>
              </p>
              <p className="mt-1 text-sm text-slate-400">
                تاريخ الإنشاء:{' '}
                <span className="text-white">
                  {new Date(user.createdAt).toLocaleDateString('ar-LY')}
                </span>
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                الاسم الكامل <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                رقم الهاتف <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <PhoneIcon className="absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  dir="ltr"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 pr-10 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">الدور</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="USER">مستخدم عادي</option>
                <option value="SELLER">بائع</option>
                <option value="BUYER">مشتري</option>
                <option value="MODERATOR">مشرف</option>
                <option value="ADMIN">مدير</option>
              </select>
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
                <option value="ACTIVE">نشط</option>
                <option value="BLOCKED">محظور</option>
                <option value="SUSPENDED">موقوف</option>
              </select>
            </div>

            {/* Verified */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="verified"
                id="verified"
                checked={formData.verified}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="verified" className="text-sm text-slate-300">
                حساب موثق
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="mt-8 flex justify-end gap-3">
            <Link
              href="/admin/users"
              className="rounded-lg bg-slate-700 px-6 py-2.5 text-white transition-colors hover:bg-slate-600"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
        </div>
      </form>
    </AdminLayout>
  );
}
