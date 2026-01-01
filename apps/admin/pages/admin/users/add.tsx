/**
 * صفحة إضافة مستخدم جديد
 * Add New User Page
 */

import {
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminPhoneInput, { type WorldCountry } from '../../../components/ui/AdminPhoneInput';
import StickyActionBar from '../../../components/ui/StickyActionBar';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  countryDialCode: string;
  password: string;
  confirmPassword: string;
  accountType: string;
  status: string;
}

export default function AddUser() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    countryDialCode: '+218',
    password: '',
    confirmPassword: '',
    accountType: 'REGULAR_USER',
    status: 'ACTIVE',
  });

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleCountryChange = (country: WorldCountry) => {
    setFormData((prev) => ({ ...prev, countryDialCode: country.code }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePhone = (phone: string): boolean => {
    // التحقق من وجود رقم هاتف
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 7 && cleaned.length <= 15;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (!formData.firstName.trim()) {
      setMessage({ type: 'error', text: 'الرجاء إدخال الاسم الأول' });
      return;
    }

    if (!formData.lastName.trim()) {
      setMessage({ type: 'error', text: 'الرجاء إدخال اللقب' });
      return;
    }

    if (!formData.phone.trim()) {
      setMessage({ type: 'error', text: 'الرجاء إدخال رقم الهاتف' });
      return;
    }

    if (!validatePhone(formData.phone)) {
      setMessage({ type: 'error', text: 'رقم الهاتف غير صحيح. يجب أن يكون رقم ليبي صحيح' });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setMessage({ type: 'error', text: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'كلمتا المرور غير متطابقتين' });
      return;
    }

    setLoading(true);
    try {
      console.log('[AddUser] إرسال طلب إنشاء مستخدم...');

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // مهم جداً لإرسال الـ cookies
        body: JSON.stringify({
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          phone: `${formData.countryDialCode}${formData.phone}`,
          password: formData.password || undefined,
          accountType: formData.accountType,
          status: formData.status,
        }),
      });

      console.log('[AddUser] Response status:', res.status);
      const data = await res.json();
      console.log('[AddUser] Response data:', data);

      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'تم إنشاء المستخدم بنجاح' });
        setTimeout(() => {
          router.push('/admin/users');
        }, 1500);
      } else {
        // رسالة خطأ أوضح
        let errorText = data.message || 'فشل إنشاء المستخدم';
        if (res.status === 401) {
          errorText = 'يرجى تسجيل الدخول أولاً كمدير';
        }
        setMessage({ type: 'error', text: errorText });
      }
    } catch (err) {
      console.error('[AddUser] Error:', err);
      setMessage({ type: 'error', text: 'حدث خطأ في الاتصال. تأكد من تسجيل الدخول.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="إضافة مستخدم جديد">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/admin/users" className="hover:text-white">
          المستخدمون
        </Link>
        <ArrowRightIcon className="h-4 w-4 rotate-180" />
        <span className="text-white">إضافة مستخدم</span>
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
            معلومات المستخدم
          </h2>

          <div className="space-y-5">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  الاسم الأول <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="مثال: محمد"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  اللقب <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="مثال: الأحمد"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            {/* Phone */}
            <AdminPhoneInput
              value={formData.phone}
              onChange={handlePhoneChange}
              onCountryChange={handleCountryChange}
              label="رقم الهاتف"
              required
              error={undefined}
              showExample
            />

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">كلمة المرور</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="اتركها فارغة لعدم تعيين كلمة مرور"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* Confirm Password */}
            {formData.password && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="أعد إدخال كلمة المرور"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            )}

            {/* Account Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">نوع الحساب</label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="REGULAR_USER">مستخدم عادي - بائع / مشتري</option>
                <option value="TRANSPORT_OWNER">خدمة نقل - ساحبة</option>
                <option value="SHOWROOM">معرض سيارات</option>
                <option value="COMPANY">شركة</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">حدد نوع الحساب حسب نشاط المستخدم</p>
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
          </div>
        </div>
      </form>

      {/* شريط الأزرار الثابت */}
      <StickyActionBar
        leftButton={{
          label: 'إلغاء',
          onClick: () => router.push('/admin/users'),
          variant: 'secondary',
        }}
        rightButton={{
          label: 'إنشاء المستخدم',
          onClick: () => {
            const form = document.querySelector('form');
            if (form) form.requestSubmit();
          },
          icon: <CheckCircleIcon className="h-5 w-5" />,
          variant: 'primary',
          disabled: loading,
          loading: loading,
          loadingText: 'جاري الإنشاء...',
        }}
      />
    </AdminLayout>
  );
}
