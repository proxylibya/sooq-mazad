/**
 * صفحة الملف الشخصي للمسؤول
 * Admin Profile Page
 */
import {
  CameraIcon,
  CheckBadgeIcon,
  EnvelopeIcon,
  KeyIcon,
  PencilIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  createdAt: string;
  lastLogin: string;
  permissions: string[];
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<AdminProfile>({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'super_admin',
    avatar: '',
    createdAt: '',
    lastLogin: '',
    permissions: [],
    isEmailVerified: true,
    isPhoneVerified: true,
    twoFactorEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<AdminProfile>>({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditedProfile(data);
      } else {
        // بيانات افتراضية للعرض
        setProfile({
          id: '1',
          name: 'مسؤول النظام',
          email: 'admin@sooq-mazad.com',
          phone: '0912345678',
          role: 'super_admin',
          avatar: '/images/default-avatar.png',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          permissions: ['users', 'auctions', 'transport', 'wallets', 'settings'],
          isEmailVerified: true,
          isPhoneVerified: true,
          twoFactorEnabled: false,
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedProfile),
      });
      if (res.ok) {
        setProfile({ ...profile, ...editedProfile });
        setEditing(false);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('كلمات المرور غير متطابقة');
      return;
    }
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      if (res.ok) {
        alert('تم تغيير كلمة المرور بنجاح');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await res.json();
        alert(error.message || 'حدث خطأ أثناء تغيير كلمة المرور');
      }
    } catch (err) {
      console.error('Failed to change password:', err);
      alert('حدث خطأ أثناء تغيير كلمة المرور');
    }
  };

  const getRoleName = (role: string) => {
    const roles: { [key: string]: string } = {
      super_admin: 'مسؤول رئيسي',
      admin: 'مسؤول',
      moderator: 'مشرف',
      support: 'دعم فني',
    };
    return roles[role] || role;
  };

  const getPermissionName = (permission: string) => {
    const permissions: { [key: string]: string } = {
      users: 'إدارة المستخدمين',
      auctions: 'إدارة المزادات',
      transport: 'إدارة النقل',
      wallets: 'إدارة المحافظ',
      settings: 'الإعدادات',
      reports: 'التقارير',
      admins: 'إدارة المسؤولين',
    };
    return permissions[permission] || permission;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleDateString('ar-LY', {
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

  if (loading) {
    return (
      <AdminLayout title="الملف الشخصي">
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="الملف الشخصي">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Profile Header Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.3)_0%,_transparent_50%)]" />
          </div>

          <div className="relative p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="group relative">
                <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-slate-600 bg-slate-700 shadow-xl ring-4 ring-blue-500/20">
                  {profile.avatar ? (
                    <Image src={profile.avatar} alt={profile.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                      <UserIcon className="h-16 w-16 text-white/80" />
                    </div>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 rounded-full border-4 border-slate-800 bg-blue-600 p-2 text-white transition-transform hover:scale-110">
                  <CameraIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-right">
                <div className="flex items-center justify-center gap-3 sm:justify-start">
                  <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                  {profile.role === 'super_admin' && (
                    <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-medium text-white">
                      <ShieldCheckIcon className="h-4 w-4" />
                      {getRoleName(profile.role)}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2 text-slate-400">
                  <div className="flex items-center justify-center gap-2 sm:justify-start">
                    <EnvelopeIcon className="h-5 w-5" />
                    <span>{profile.email}</span>
                    {profile.isEmailVerified && (
                      <CheckBadgeIcon className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 sm:justify-start">
                    <PhoneIcon className="h-5 w-5" />
                    <span dir="ltr">{profile.phone}</span>
                    {profile.isPhoneVerified && (
                      <CheckBadgeIcon className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-slate-500 sm:justify-start">
                  <span>آخر تسجيل دخول: {formatDate(profile.lastLogin)}</span>
                  <span>•</span>
                  <span>تاريخ الانضمام: {formatDate(profile.createdAt)}</span>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setEditing(!editing)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  editing
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                }`}
              >
                <PencilIcon className="h-4 w-4" />
                {editing ? 'إلغاء' : 'تعديل'}
              </button>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h2 className="mb-6 text-lg font-semibold text-white">تعديل البيانات</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">الاسم</label>
                <input
                  type="text"
                  value={editedProfile.name || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={editedProfile.email || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">رقم الهاتف</label>
                <input
                  type="tel"
                  value={editedProfile.phone || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                  dir="ltr"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditing(false);
                  setEditedProfile(profile);
                }}
                className="rounded-lg border border-slate-600 bg-slate-700 px-6 py-2 text-slate-300 transition-colors hover:bg-slate-600"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ التغييرات'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Permissions Card */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
            الصلاحيات
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.permissions.map((permission) => (
              <span
                key={permission}
                className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-300"
              >
                <CheckBadgeIcon className="h-4 w-4 text-green-500" />
                {getPermissionName(permission)}
              </span>
            ))}
          </div>
        </div>

        {/* Security Card */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <KeyIcon className="h-5 w-5 text-amber-400" />
            الأمان
          </h2>
          <div className="space-y-4">
            {/* Change Password */}
            <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
              <div>
                <p className="font-medium text-white">كلمة المرور</p>
                <p className="text-sm text-slate-400">تغيير كلمة المرور الخاصة بحسابك</p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/30"
              >
                تغيير كلمة المرور
              </button>
            </div>

            {/* Two Factor Auth */}
            <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
              <div>
                <p className="font-medium text-white">المصادقة الثنائية</p>
                <p className="text-sm text-slate-400">تفعيل طبقة إضافية من الحماية لحسابك</p>
              </div>
              <button
                onClick={() =>
                  setProfile({ ...profile, twoFactorEnabled: !profile.twoFactorEnabled })
                }
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  profile.twoFactorEnabled ? 'bg-green-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    profile.twoFactorEnabled ? 'right-0.5' : 'right-5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-6">
            <h3 className="mb-6 text-lg font-semibold text-white">تغيير كلمة المرور</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  كلمة المرور الحالية
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
                className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-slate-300 transition-colors hover:bg-slate-600"
              >
                إلغاء
              </button>
              <button
                onClick={handlePasswordChange}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                تغيير كلمة المرور
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
