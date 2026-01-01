/**
 * صفحة إضافة مدير جديد
 * نظام موحد وعالمي للصلاحيات
 */
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import StickyActionBar from '../../../components/ui/StickyActionBar';
import {
  ADMIN_SECTIONS,
  getDefaultPermissionsByRole,
} from '../../../lib/permissions/admin-permissions-system';

interface AdminFormData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: string;
  permissions: string[];
}

// أدوار المديرين
const ADMIN_ROLES = [
  { id: 'SUPER_ADMIN', label: 'مدير أعلى', description: 'صلاحيات كاملة على النظام', color: 'red' },
  { id: 'ADMIN', label: 'مدير', description: 'صلاحيات إدارية واسعة', color: 'blue' },
  { id: 'MODERATOR', label: 'مشرف', description: 'صلاحيات الإشراف والمراجعة', color: 'amber' },
  { id: 'SUPPORT', label: 'دعم فني', description: 'صلاحيات الدعم والمساعدة', color: 'green' },
  {
    id: 'FINANCE',
    label: 'مالي',
    description: 'صلاحيات المحافظ والتقارير المالية',
    color: 'purple',
  },
  { id: 'VIEWER', label: 'مشاهد', description: 'صلاحيات العرض فقط', color: 'slate' },
];

export default function AddAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const [formData, setFormData] = useState<AdminFormData>({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'MODERATOR',
    permissions: getDefaultPermissionsByRole('MODERATOR'),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // عند تغيير الدور، تحديث الصلاحيات الافتراضية
  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      role,
      permissions: getDefaultPermissionsByRole(role),
    }));
  };

  const handlePermissionChange = (permId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId],
    }));
  };

  // تحديد/إلغاء جميع صلاحيات قسم
  const toggleSectionPermissions = (sectionId: string) => {
    const section = ADMIN_SECTIONS.find((s) => s.id === sectionId);
    if (!section) return;

    const sectionPermIds = section.permissions.map((p) => p.id);
    const allSelected = sectionPermIds.every((id) => formData.permissions.includes(id));

    setFormData((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !sectionPermIds.includes(p))
        : [...new Set([...prev.permissions, ...sectionPermIds])],
    }));
  };

  // توسيع/طي قسم
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    );
  };

  // تحديد الكل
  const selectAllPermissions = () => {
    const allPermIds = ADMIN_SECTIONS.flatMap((s) => s.permissions.map((p) => p.id));
    setFormData((prev) => ({ ...prev, permissions: allPermIds }));
  };

  // إلغاء الكل
  const deselectAllPermissions = () => {
    setFormData((prev) => ({ ...prev, permissions: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // التحقق من الحقول المطلوبة
    if (!formData.firstName.trim()) {
      setError('الرجاء إدخال الاسم الأول');
      return;
    }

    if (!formData.lastName.trim()) {
      setError('الرجاء إدخال اللقب');
      return;
    }

    if (!formData.username.trim()) {
      setError('الرجاء إدخال اسم المستخدم');
      return;
    }

    if (formData.username.length < 3) {
      setError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    if (!formData.password) {
      setError('الرجاء إدخال كلمة المرور');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    if (formData.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    if (formData.permissions.length === 0) {
      setError('الرجاء تحديد صلاحية واحدة على الأقل');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert('تم إنشاء المدير بنجاح');
        router.push('/admin/admins');
      } else {
        setError(data.message || 'حدث خطأ أثناء إنشاء المدير');
      }
    } catch (err) {
      console.error('Error creating admin:', err);
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="إضافة مدير جديد">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/admins"
          className="flex items-center gap-2 text-slate-400 hover:text-white"
        >
          <ArrowRightIcon className="h-5 w-5" />
          العودة للمديرين
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/20 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* معلومات المدير الأساسية */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
            <UserIcon className="h-6 w-6 text-blue-400" />
            معلومات المدير
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* الاسم الأول */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                الاسم الأول <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="محمد"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* اللقب */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                اللقب <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="الأحمد"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* اسم المستخدم */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                اسم المستخدم <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="admin"
                dir="ltr"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-400">
                يُستخدم لتسجيل الدخول - أحرف إنجليزية وأرقام فقط
              </p>
            </div>
          </div>
        </div>

        {/* كلمة المرور */}
        <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
            <KeyIcon className="h-6 w-6 text-yellow-400" />
            كلمة المرور
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                كلمة المرور <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="8 أحرف على الأقل"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                تأكيد كلمة المرور <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="أعد إدخال كلمة المرور"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* الدور والصلاحيات */}
        <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
            <ShieldCheckIcon className="h-6 w-6 text-green-400" />
            الدور والصلاحيات
          </h2>

          {/* اختيار الدور */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-slate-300">الدور</label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {ADMIN_ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleChange(role.id)}
                  className={`rounded-lg border p-3 text-right transition-all ${
                    formData.role === role.id
                      ? `border-${role.color}-500 bg-${role.color}-500/20 ring-1 ring-${role.color}-500`
                      : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                  }`}
                >
                  <p
                    className={`font-medium ${formData.role === role.id ? `text-${role.color}-400` : 'text-white'}`}
                  >
                    {role.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{role.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* الصلاحيات */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">
                الصلاحيات ({formData.permissions.length} محددة)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllPermissions}
                  className="rounded-lg bg-blue-600/20 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-600/30"
                >
                  تحديد الكل
                </button>
                <button
                  type="button"
                  onClick={deselectAllPermissions}
                  className="rounded-lg bg-slate-600/50 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-600"
                >
                  إلغاء الكل
                </button>
              </div>
            </div>

            {/* أقسام الصلاحيات */}
            <div className="space-y-3">
              {ADMIN_SECTIONS.map((section) => {
                const sectionPermIds = section.permissions.map((p) => p.id);
                const selectedCount = sectionPermIds.filter((id) =>
                  formData.permissions.includes(id),
                ).length;
                const allSelected = selectedCount === sectionPermIds.length;
                const someSelected = selectedCount > 0 && selectedCount < sectionPermIds.length;
                const isExpanded = expandedSections.includes(section.id);

                return (
                  <div
                    key={section.id}
                    className="overflow-hidden rounded-lg border border-slate-600 bg-slate-700/30"
                  >
                    {/* رأس القسم */}
                    <div
                      className="flex cursor-pointer items-center justify-between p-3 hover:bg-slate-700/50"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = someSelected;
                          }}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSectionPermissions(section.id);
                          }}
                          className="h-4 w-4 rounded border-slate-500 bg-slate-600 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="font-medium text-white">{section.label}</span>
                        <span className="rounded-full bg-slate-600 px-2 py-0.5 text-xs text-slate-300">
                          {selectedCount}/{sectionPermIds.length}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUpIcon className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                      )}
                    </div>

                    {/* صلاحيات القسم */}
                    {isExpanded && (
                      <div className="border-t border-slate-600 bg-slate-800/50 p-3">
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {section.permissions.map((perm) => (
                            <label
                              key={perm.id}
                              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${
                                formData.permissions.includes(perm.id)
                                  ? 'border-blue-500/50 bg-blue-500/10'
                                  : 'border-slate-600/50 hover:bg-slate-700/50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(perm.id)}
                                onChange={() => handlePermissionChange(perm.id)}
                                className="mt-0.5 h-4 w-4 rounded border-slate-500 bg-slate-600 text-blue-500 focus:ring-blue-500"
                              />
                              <div>
                                <p className="text-sm font-medium text-slate-200">{perm.label}</p>
                                <p className="text-xs text-slate-400">{perm.description}</p>
                              </div>
                              {formData.permissions.includes(perm.id) && (
                                <CheckCircleIcon className="mr-auto h-5 w-5 text-blue-400" />
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </form>

      {/* شريط الأزرار الثابت */}
      <StickyActionBar
        leftButton={{
          label: 'إلغاء',
          onClick: () => router.push('/admin/admins'),
          variant: 'secondary',
        }}
        rightButton={{
          label: 'إنشاء المدير',
          onClick: () => {
            const form = document.querySelector('form');
            if (form) form.requestSubmit();
          },
          variant: 'primary',
          disabled: loading,
          loading: loading,
          loadingText: 'جاري الإنشاء...',
        }}
      />
    </AdminLayout>
  );
}
