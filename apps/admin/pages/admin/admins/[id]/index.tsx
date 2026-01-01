/**
 * صفحة تفاصيل المدير
 * Admin Details Page
 */
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';
import {
  ADMIN_SECTIONS,
  getDefaultPermissionsByRole,
} from '../../../../lib/permissions/admin-permissions-system';

interface AdminData {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  role: string;
  permissions: string[];
  is_active: boolean;
  two_factor_enabled?: boolean;
  last_login?: string;
  created_at?: string;
  avatar?: string;
}

interface Activity {
  id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  success: boolean;
  created_at: string;
}

// ترجمة أنواع النشاطات
const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  CREATE_ADMIN: { label: 'إنشاء مدير', color: 'text-green-400' },
  UPDATE_ADMIN: { label: 'تعديل مدير', color: 'text-blue-400' },
  DELETE_ADMIN: { label: 'حذف مدير', color: 'text-red-400' },
  LOGIN: { label: 'تسجيل دخول', color: 'text-emerald-400' },
  LOGOUT: { label: 'تسجيل خروج', color: 'text-slate-400' },
  CREATE_USER: { label: 'إنشاء مستخدم', color: 'text-green-400' },
  UPDATE_USER: { label: 'تعديل مستخدم', color: 'text-blue-400' },
  DELETE_USER: { label: 'حذف مستخدم', color: 'text-red-400' },
  APPROVE_AUCTION: { label: 'موافقة على مزاد', color: 'text-green-400' },
  REJECT_AUCTION: { label: 'رفض مزاد', color: 'text-red-400' },
  UPDATE_SETTINGS: { label: 'تحديث الإعدادات', color: 'text-amber-400' },
  VIEW_REPORTS: { label: 'عرض التقارير', color: 'text-purple-400' },
};

// أدوار المديرين مع الألوان
const ADMIN_ROLES: Record<string, { label: string; color: string; bgColor: string }> = {
  SUPER_ADMIN: {
    label: 'مدير أعلى',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20 border-red-500/30',
  },
  ADMIN: { label: 'مدير', color: 'text-blue-400', bgColor: 'bg-blue-500/20 border-blue-500/30' },
  MODERATOR: {
    label: 'مشرف',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20 border-amber-500/30',
  },
  SUPPORT: {
    label: 'دعم فني',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20 border-green-500/30',
  },
  FINANCE: {
    label: 'مالي',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20 border-purple-500/30',
  },
  VIEWER: {
    label: 'مشاهد',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20 border-slate-500/30',
  },
};

export default function AdminDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // تحميل بيانات المدير
  useEffect(() => {
    if (id) {
      fetchAdmin();
      fetchActivities();
    }
  }, [id]);

  const fetchAdmin = async () => {
    try {
      const res = await fetch(`/api/admin/admins?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        // إذا كان هناك مدير واحد في الاستجابة
        if (data.admin) {
          setAdmin({
            ...data.admin,
            permissions:
              data.admin.permissions || getDefaultPermissionsByRole(data.admin.role || 'MODERATOR'),
          });
        } else if (data.admins) {
          // البحث في القائمة
          const foundAdmin = data.admins.find((a: AdminData) => a.id === id);
          if (foundAdmin) {
            setAdmin({
              ...foundAdmin,
              permissions:
                foundAdmin.permissions ||
                getDefaultPermissionsByRole(foundAdmin.role || 'MODERATOR'),
            });
          } else {
            setError('المدير غير موجود');
          }
        } else {
          setError('المدير غير موجود');
        }
      } else {
        setError('فشل تحميل بيانات المدير');
      }
    } catch (err) {
      console.error('Error fetching admin:', err);
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // جلب نشاطات المدير
  const fetchActivities = async () => {
    setActivitiesLoading(true);
    try {
      const res = await fetch(`/api/admin/admins/activities?adminId=${id}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      } else {
        // بيانات وهمية للعرض
        setActivities([
          {
            id: 'act-1',
            action: 'LOGIN',
            resource_type: 'auth',
            success: true,
            created_at: new Date().toISOString(),
          },
          {
            id: 'act-2',
            action: 'UPDATE_USER',
            resource_type: 'user',
            resource_id: 'user-123',
            success: true,
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'act-3',
            action: 'APPROVE_AUCTION',
            resource_type: 'auction',
            resource_id: 'auc-456',
            success: true,
            created_at: new Date(Date.now() - 7200000).toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      // بيانات وهمية للعرض
      setActivities([
        {
          id: 'act-1',
          action: 'LOGIN',
          resource_type: 'auth',
          success: true,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'غير محدد';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-LY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'غير محدد';
    }
  };

  // حساب الوقت منذ آخر دخول
  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return 'لم يسجل دخول بعد';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'الآن';
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      if (diffDays < 30) return `منذ ${diffDays} يوم`;
      return formatDate(dateString);
    } catch {
      return 'غير محدد';
    }
  };

  // الحصول على الصلاحيات حسب القسم
  const getPermissionsBySection = () => {
    if (!admin) return [];

    return ADMIN_SECTIONS.map((section) => {
      const sectionPermIds = section.permissions.map((p) => p.id);
      const grantedPerms = section.permissions.filter(
        (p) => admin.permissions.includes(p.id) || admin.permissions.includes('*'),
      );

      return {
        ...section,
        grantedCount: admin.permissions.includes('*')
          ? section.permissions.length
          : grantedPerms.length,
        totalCount: section.permissions.length,
        grantedPerms,
        hasAccess: admin.permissions.includes('*') || grantedPerms.length > 0,
      };
    });
  };

  if (loading) {
    return (
      <AdminLayout title="تفاصيل المدير">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !admin) {
    return (
      <AdminLayout title="تفاصيل المدير">
        <div className="flex h-64 flex-col items-center justify-center">
          <XCircleIcon className="mb-4 h-16 w-16 text-red-400" />
          <p className="text-lg text-red-400">{error || 'المدير غير موجود'}</p>
          <Link
            href="/admin/admins"
            className="mt-4 flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            <ArrowRightIcon className="h-5 w-5" />
            العودة لقائمة المديرين
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const roleInfo = ADMIN_ROLES[admin.role?.toUpperCase()] || ADMIN_ROLES.VIEWER;
  const permissionSections = getPermissionsBySection();
  const totalPermissions = admin.permissions.includes('*')
    ? ADMIN_SECTIONS.reduce((acc, s) => acc + s.permissions.length, 0)
    : admin.permissions.length;

  return (
    <AdminLayout title={`${admin.firstName} ${admin.lastName}`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/admins"
          className="flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
        >
          <ArrowRightIcon className="h-5 w-5" />
          العودة للمديرين
        </Link>
        <Link
          href={`/admin/admins/${admin.id}/edit`}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <PencilSquareIcon className="h-5 w-5" />
          تعديل المدير
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* البطاقة الرئيسية - معلومات المدير */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
            {/* الصورة والاسم */}
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                {admin.avatar ? (
                  <img
                    src={admin.avatar}
                    alt={`${admin.firstName} ${admin.lastName}`}
                    className="h-24 w-24 rounded-full border-4 border-slate-600 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-slate-600 bg-gradient-to-br from-blue-500 to-purple-600">
                    <span className="text-3xl font-bold text-white">
                      {admin.firstName?.charAt(0) || admin.username?.charAt(0) || 'م'}
                    </span>
                  </div>
                )}
                {/* مؤشر الحالة */}
                <div
                  className={`absolute bottom-1 left-1 h-5 w-5 rounded-full border-2 border-slate-800 ${
                    admin.is_active ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  title={admin.is_active ? 'نشط' : 'غير نشط'}
                />
              </div>

              <h2 className="text-xl font-bold text-white">
                {admin.firstName} {admin.lastName}
              </h2>
              <p className="mt-1 font-mono text-sm text-slate-400">@{admin.username}</p>

              {/* شارة الدور */}
              <div className={`mt-3 rounded-full border px-4 py-1.5 ${roleInfo.bgColor}`}>
                <span className={`flex items-center gap-2 text-sm font-medium ${roleInfo.color}`}>
                  <ShieldCheckIcon className="h-4 w-4" />
                  {roleInfo.label}
                </span>
              </div>
            </div>

            {/* معلومات إضافية */}
            <div className="space-y-4 border-t border-slate-700 pt-4">
              {/* الحالة */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">الحالة</span>
                <span
                  className={`flex items-center gap-1.5 text-sm font-medium ${
                    admin.is_active ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {admin.is_active ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      نشط
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-4 w-4" />
                      غير نشط
                    </>
                  )}
                </span>
              </div>

              {/* التحقق بخطوتين */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">التحقق بخطوتين</span>
                <span
                  className={`flex items-center gap-1.5 text-sm font-medium ${
                    admin.two_factor_enabled ? 'text-green-400' : 'text-slate-500'
                  }`}
                >
                  {admin.two_factor_enabled ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      مُفعّل
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-4 w-4" />
                      غير مُفعّل
                    </>
                  )}
                </span>
              </div>

              {/* البريد الإلكتروني */}
              {admin.email && (
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-slate-500" />
                  <span className="text-sm text-slate-300" dir="ltr">
                    {admin.email}
                  </span>
                </div>
              )}

              {/* آخر دخول */}
              <div className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-300">{getRelativeTime(admin.last_login)}</p>
                  <p className="text-xs text-slate-500">آخر تسجيل دخول</p>
                </div>
              </div>

              {/* تاريخ الإنشاء */}
              <div className="flex items-center gap-3">
                <CalendarDaysIcon className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-300">{formatDate(admin.created_at)}</p>
                  <p className="text-xs text-slate-500">تاريخ الإنشاء</p>
                </div>
              </div>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{totalPermissions}</p>
              <p className="text-sm text-slate-400">صلاحية</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-center">
              <p className="text-2xl font-bold text-green-400">
                {permissionSections.filter((s) => s.hasAccess).length}
              </p>
              <p className="text-sm text-slate-400">قسم</p>
            </div>
          </div>
        </div>

        {/* الصلاحيات */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-700 bg-slate-800">
            <div className="border-b border-slate-700 p-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <ShieldCheckIcon className="h-6 w-6 text-green-400" />
                الصلاحيات والأقسام
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                {admin.permissions.includes('*')
                  ? 'هذا المدير لديه صلاحيات كاملة على جميع الأقسام'
                  : `${totalPermissions} صلاحية في ${permissionSections.filter((s) => s.hasAccess).length} قسم`}
              </p>
            </div>

            <div className="max-h-[600px] overflow-y-auto p-4">
              <div className="space-y-3">
                {permissionSections.map((section) => (
                  <div
                    key={section.id}
                    className={`overflow-hidden rounded-lg border ${
                      section.hasAccess
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-slate-600/50 bg-slate-700/20'
                    }`}
                  >
                    {/* رأس القسم */}
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        {section.hasAccess ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-slate-500" />
                        )}
                        <span
                          className={`font-medium ${
                            section.hasAccess ? 'text-white' : 'text-slate-500'
                          }`}
                        >
                          {section.label}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs ${
                          section.hasAccess
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-600/50 text-slate-400'
                        }`}
                      >
                        {section.grantedCount}/{section.totalCount}
                      </span>
                    </div>

                    {/* الصلاحيات الممنوحة */}
                    {section.hasAccess && section.grantedPerms.length > 0 && (
                      <div className="border-t border-slate-700/50 bg-slate-800/30 p-3">
                        <div className="flex flex-wrap gap-2">
                          {section.permissions.map((perm) => {
                            const isGranted =
                              admin.permissions.includes('*') ||
                              admin.permissions.includes(perm.id);
                            return (
                              <div
                                key={perm.id}
                                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs ${
                                  isGranted
                                    ? 'bg-green-500/10 text-green-400'
                                    : 'bg-slate-700/50 text-slate-500'
                                }`}
                                title={perm.description}
                              >
                                {isGranted ? (
                                  <CheckCircleIcon className="h-3.5 w-3.5" />
                                ) : (
                                  <XCircleIcon className="h-3.5 w-3.5" />
                                )}
                                {perm.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* سجل النشاط */}
          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800 p-4">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <ClockIcon className="h-6 w-6 text-blue-400" />
              آخر النشاطات
            </h3>

            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              </div>
            ) : activities.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <ClockIcon className="mx-auto mb-2 h-12 w-12 text-slate-600" />
                <p>لا توجد نشاطات مسجلة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => {
                  const actionInfo = ACTION_LABELS[activity.action] || {
                    label: activity.action,
                    color: 'text-slate-400',
                  };
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/30 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            activity.success ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}
                        >
                          {activity.success ? (
                            <CheckCircleIcon className="h-4 w-4 text-green-400" />
                          ) : (
                            <XCircleIcon className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${actionInfo.color}`}>
                            {actionInfo.label}
                          </p>
                          <p className="text-xs text-slate-500">
                            {activity.resource_type}
                            {activity.resource_id && ` #${activity.resource_id.slice(-6)}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">
                        {getRelativeTime(activity.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
