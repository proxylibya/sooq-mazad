/**
 * صفحة تفاصيل المستخدم
 * User Details Page
 */

import {
  ArrowRightIcon,
  CalendarIcon,
  CheckBadgeIcon,
  ClockIcon,
  ExclamationCircleIcon,
  NoSymbolIcon,
  PencilIcon,
  PhoneIcon,
  StarIcon,
  TrashIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';

interface User {
  id: string;
  publicId?: number;
  name: string;
  phone: string;
  status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
  role: string;
  verified: boolean;
  createdAt: string;
  lastLogin?: string;
  rating?: number;
  totalReviews?: number;
  accountType?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  profileImage?: string;
}

export default function UserDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!user) return;
    const newStatus = user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({
          type: 'success',
          text: newStatus === 'BLOCKED' ? 'تم حظر المستخدم' : 'تم إلغاء حظر المستخدم',
        });
        fetchUser();
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'تم حذف المستخدم بنجاح' });
        setTimeout(() => {
          router.push('/admin/users');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message || 'فشل حذف المستخدم' });
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحذف' });
    }
    setShowDeleteModal(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    BLOCKED: 'bg-red-500/20 text-red-400 border-red-500/30',
    SUSPENDED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  // Fallback للحالات غير المعرفة
  const defaultStatusColor = 'bg-slate-500/20 text-slate-400 border-slate-500/30';

  const statusLabels: Record<string, string> = {
    ACTIVE: 'نشط',
    BLOCKED: 'محظور',
    SUSPENDED: 'موقوف',
  };

  // Fallback للحالات غير المعرفة
  const defaultStatusLabel = 'غير محدد';

  const roleLabels: Record<string, string> = {
    USER: 'مستخدم عادي',
    ADMIN: 'مدير',
    MODERATOR: 'مشرف',
    SUPER_ADMIN: 'مدير عام',
    SELLER: 'بائع',
    BUYER: 'مشتري',
  };

  if (loading) {
    return (
      <AdminLayout title="تفاصيل المستخدم">
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
      <AdminLayout title="تفاصيل المستخدم">
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
    <AdminLayout title="تفاصيل المستخدم">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm">
        <Link
          href="/admin/users"
          className="flex items-center gap-1 rounded-lg bg-slate-800/50 px-3 py-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
        >
          المستخدمون
        </Link>
        <ArrowRightIcon className="h-4 w-4 rotate-180 text-slate-600" />
        <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 font-medium text-blue-400">
          {user.name}
        </span>
      </nav>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-xl p-4 ${
            message.type === 'success'
              ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border border-red-500/30 bg-red-500/10 text-red-400'
          }`}
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              message.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'
            }`}
          >
            {message.type === 'success' ? '✓' : '✕'}
          </span>
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info Card */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-800/50 shadow-xl">
            {/* Header with gradient background */}
            <div className="relative bg-gradient-to-l from-blue-600/20 via-purple-600/10 to-transparent p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar with ring effect */}
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 p-1 shadow-lg shadow-blue-500/25">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-800">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl font-bold text-white">
                            {user.name?.charAt(0) || '?'}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Online indicator */}
                    {user.status === 'ACTIVE' && (
                      <span className="absolute bottom-1 left-1 h-4 w-4 rounded-full border-2 border-slate-800 bg-emerald-500"></span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                      {user.name || 'بدون اسم'}
                      {user.verified && (
                        <CheckBadgeIcon className="h-6 w-6 text-blue-400" title="حساب موثق" />
                      )}
                    </h2>
                    <p className="flex items-center gap-2 text-slate-400">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-700/50 px-2 py-0.5 text-xs">
                        {roleLabels[user.role] || user.role}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 self-start rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-sm ${statusColors[user.status] || defaultStatusColor}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      user.status === 'ACTIVE'
                        ? 'animate-pulse bg-emerald-400'
                        : user.status === 'BLOCKED'
                          ? 'bg-red-400'
                          : 'bg-amber-400'
                    }`}
                  ></span>
                  {statusLabels[user.status] || defaultStatusLabel}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* رقم الهاتف */}
              <div className="group rounded-xl border border-slate-700/50 bg-slate-700/30 p-4 transition-all hover:border-blue-500/30 hover:bg-slate-700/50">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <PhoneIcon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">رقم الهاتف</span>
                  </div>
                </div>
                <p
                  className="text-left font-mono text-lg font-semibold tracking-wide text-white"
                  dir="ltr"
                >
                  {user.phone || '-'}
                </p>
              </div>

              {/* معرف المستخدم */}
              <div className="group rounded-xl border border-slate-700/50 bg-slate-700/30 p-4 transition-all hover:border-purple-500/30 hover:bg-slate-700/50">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                      <UserCircleIcon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">معرف المستخدم</span>
                  </div>
                </div>
                <p className="text-left font-mono text-lg font-semibold text-white" dir="ltr">
                  #{user.publicId || user.id.slice(0, 8)}
                </p>
              </div>

              {/* التقييم */}
              <div className="group rounded-xl border border-slate-700/50 bg-slate-700/30 p-4 transition-all hover:border-amber-500/30 hover:bg-slate-700/50">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                      <StarIcon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">التقييم</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-left font-mono text-2xl font-bold text-white" dir="ltr">
                    {user.rating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-sm text-slate-400">
                    (<span dir="ltr">{user.totalReviews || 0}</span> تقييم)
                  </span>
                </div>
              </div>

              {/* تاريخ التسجيل */}
              <div className="group rounded-xl border border-slate-700/50 bg-slate-700/30 p-4 transition-all hover:border-emerald-500/30 hover:bg-slate-700/50">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                      <CalendarIcon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">تاريخ التسجيل</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-white">{formatDate(user.createdAt)}</p>
              </div>

              {/* آخر دخول */}
              <div className="group rounded-xl border border-slate-700/50 bg-slate-700/30 p-4 transition-all hover:border-cyan-500/30 hover:bg-slate-700/50 sm:col-span-2 lg:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                      <ClockIcon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">آخر دخول</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-white">{formatDate(user.lastLogin)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-800/50 shadow-xl">
            <div className="border-b border-slate-700/50 bg-slate-700/20 px-6 py-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-600/50">
                  ⚡
                </span>
                الإجراءات السريعة
              </h3>
            </div>
            <div className="space-y-3 p-4">
              <Link
                href={`/admin/users/${user.id}/edit`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-600 to-blue-500 px-4 py-3.5 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-600 hover:shadow-blue-500/40"
              >
                <PencilIcon className="h-5 w-5" />
                تعديل البيانات
              </Link>

              <button
                onClick={handleBlockUser}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-medium transition-all ${
                  user.status === 'BLOCKED'
                    ? 'bg-gradient-to-l from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-emerald-600'
                    : 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-500/25 hover:from-amber-700 hover:to-amber-600'
                }`}
              >
                <NoSymbolIcon className="h-5 w-5" />
                {user.status === 'BLOCKED' ? 'إلغاء الحظر' : 'حظر المستخدم'}
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3.5 font-medium text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/20"
              >
                <TrashIcon className="h-5 w-5" />
                حذف المستخدم
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-700/50 bg-red-500/10 px-6 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                <TrashIcon className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">تأكيد الحذف</h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-slate-300">
                هل أنت متأكد من حذف المستخدم <strong className="text-white">{user.name}</strong>؟
              </p>
              <p className="mt-2 text-sm text-slate-500">هذا الإجراء لا يمكن التراجع عنه.</p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-slate-700/50 bg-slate-800/50 px-6 py-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl bg-slate-700 px-5 py-2.5 font-medium text-white transition-colors hover:bg-slate-600"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-gradient-to-l from-red-600 to-red-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-red-500/25 transition-all hover:from-red-700 hover:to-red-600"
              >
                نعم، احذف
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
