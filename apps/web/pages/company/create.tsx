import Head from 'next/head';
import { OpensooqNavbar } from '../../components/common';
import BuildingOfficeIcon from '@heroicons/react/24/outline/BuildingOfficeIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { LoadingButton } from '../../components/ui';

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  accountType: string;
  verified: boolean;
}

const CompanyCreatePage = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    website: '',
    city: '',
    area: '',
    description: '',
  });

  // دالة لفحص حالة المصادقة وتوفير معلومات تشخيصية
  const checkAuthState = () => {
    const authState = {
      cookieToken: null as string | null,
      localStorageToken: null as string | null,
      sessionStorageToken: null as string | null,
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
    };

    try {
      if (typeof window !== 'undefined') {
        // فحص الكوكيز
        const cookieMatch = document.cookie.split('; ').find((row) => row.startsWith('token='));
        authState.cookieToken = cookieMatch
          ? cookieMatch.split('=')[1].substring(0, 20) + '...'
          : null;

        // فحص localStorage
        const localToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
        authState.localStorageToken = localToken ? localToken.substring(0, 20) + '...' : null;

        // فحص sessionStorage
        const sessionToken =
          sessionStorage.getItem('token') || sessionStorage.getItem('auth_token');
        authState.sessionStorageToken = sessionToken ? sessionToken.substring(0, 20) + '...' : null;
      }
    } catch (e) {
      console.warn('فشل في فحص حالة المصادقة:', e);
    }

    return authState;
  };

  // دالة لإعادة محاولة المصادقة بطريقة مختلفة
  const retryAuthentication = async () => {
    try {
      // محاولة فحص الجلسة مباشرة
      const sessionRes = await fetch('/api/auth/session-simple', {
        method: 'GET',
        credentials: 'include',
      });

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData.authenticated && sessionData.user) {
          setUser(sessionData.user);
          setLoading(false);
          return true;
        }
      }
      return false;
    } catch (e) {
      console.warn('فشل في فحص الجلسة المباشر:', e);
      return false;
    }
  };

  // تحقق من المصادقة عند تحميل الصفحة
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      setLoading(true);
      setAuthError(null);

      // فحص حالة المصادقة وطباعة المعلومات
      checkAuthState();

      // فحص التوكن من مصادر متعددة
      let token = null;

      // 1. فحص الكوكيز أولاً
      try {
        token = document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1];
      } catch (e) {
        console.warn('فشل في قراءة الكوكيز:', e);
      }

      // 2. فحص localStorage كبديل
      if (!token) {
        try {
          token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        } catch (e) {
          console.warn('فشل في قراءة localStorage:', e);
        }
      }

      // 3. فحص sessionStorage كبديل آخر
      if (!token) {
        try {
          token = sessionStorage.getItem('token') || sessionStorage.getItem('auth_token');
        } catch (e) {
          console.warn('فشل في قراءة sessionStorage:', e);
        }
      }

      console.log(
        'Token source:',
        document.cookie.includes('token=')
          ? 'Cookie'
          : localStorage.getItem('token')
            ? 'localStorage'
            : sessionStorage.getItem('token')
              ? 'sessionStorage'
              : 'None',
      );

      if (!token) {
        // محاولة استخدام API التشخيصي للحصول على معلومات إضافية
        try {
          const debugRes = await fetch('/api/debug/auth-company', {
            method: 'GET',
            credentials: 'include',
          });

          const debugData = await debugRes.json();

          if (debugData.debug?.error) {
            setAuthError(`يتطلب تسجيل دخول للوصول لهذه الصفحة. التشخيص: ${debugData.debug.error}`);
          } else {
            setAuthError('يتطلب تسجيل دخول للوصول لهذه الصفحة. يرجى تسجيل الدخول أولاً.');
          }
        } catch (debugError) {
          console.warn('فشل في استخدام API التشخيصي:', debugError);
          setAuthError('يتطلب تسجيل دخول للوصول لهذه الصفحة. يرجى تسجيل الدخول أولاً.');
        }

        setLoading(false);
        return;
      }

      // التحقق من صحة التوكن وجلب بيانات المستخدم
      const res = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!res.ok) {
        console.error('Verify API failed:', res.status, res.statusText);

        // في حالة 401، محاولة فحص الجلسة مباشرة
        if (res.status === 401) {
          const retrySuccess = await retryAuthentication();

          if (retrySuccess) {
            // تم العثور على جلسة صالحة، لا حاجة لإظهار خطأ
            return;
          }
        }

        // في حالة فشل التحقق، نحاول مسح التوكن المخزن
        try {
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
          localStorage.removeItem('token');
          localStorage.removeItem('auth_token');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('auth_token');
        } catch (e) {
          console.warn('فشل في مسح التوكن:', e);
        }

        setAuthError('فشل في التحقق من الجلسة. يرجى تسجيل الدخول مرة أخرى.');
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (!data.success) {
        console.error('API returned success=false:', data);
        setAuthError(data.error || 'جلسة غير صالحة. يرجى تسجيل الدخول مرة أخرى.');
        setLoading(false);
        return;
      }

      if (!data.user) {
        console.error('API returned no user data:', data);
        setAuthError('لم يتم العثور على بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.');
        setLoading(false);
        return;
      }

      // التحقق من نوع الحساب - قبول COMPANY أو REGULAR_USER مع إمكانية التحويل
      if (data.user.accountType !== 'COMPANY') {
        // إذا كان المستخدم من نوع REGULAR_USER، نعرض رسالة مختلفة
        if (data.user.accountType === 'REGULAR_USER') {
          setAuthError(
            `يجب تحويل حسابك إلى نوع "شركة" للوصول لهذه الصفحة. نوع حسابك الحالي: "${data.user.accountType}". يمكنك تحديث نوع حسابك من إعدادات الحساب.`,
          );
        } else {
          setAuthError(
            `هذه الصفحة متاحة فقط لحسابات الشركات. نوع حسابك الحالي: "${data.user.accountType}". يرجى تحديث نوع حسابك إلى "شركة" من إعدادات الحساب أولاً.`,
          );
        }
        setLoading(false);
        return;
      }

      setUser(data.user);
      setLoading(false);
    } catch (error) {
      console.error('خطأ في التحقق من المصادقة:', error);

      // تحسين رسالة الخطأ بناءً على نوع الخطأ
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setAuthError('فشل في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
      } else if (error instanceof SyntaxError) {
        setAuthError('خطأ في تحليل الاستجابة من الخادم. يرجى المحاولة مرة أخرى.');
      } else {
        setAuthError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }

      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert('فشل إنشاء الشركة: ' + (data?.error || res.statusText));
        setSubmitting(false);
        return;
      }

      alert('تم إنشاء الشركة بنجاح!');
      router.push('/company/dashboard');
    } catch (error) {
      console.error('خطأ في إنشاء الشركة:', error);
      alert('حدث خطأ أثناء إنشاء الشركة. يرجى المحاولة مرة أخرى.');
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/company/dashboard');
  };

  console.log('CompanyCreatePage render:', {
    loading,
    authError: !!authError,
    user: !!user,
  });

  // إضافة debug info مرئي في الHTML
  if (typeof window !== 'undefined') {
    (window as any).debugCompanyPage = { loading, authError, user };
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Head>
        <title>إنشاء/إعداد الشركة | موقع مزاد السيارات</title>
      </Head>

      <OpensooqNavbar />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Debug info */}
        <div className="mb-4 rounded bg-blue-50 p-2 text-xs">
          <div className="mb-1 font-semibold text-blue-800">معلومات التشخيص:</div>
          <div>
            الحالة: loading={loading.toString()}, authError=
            {authError ? 'yes' : 'no'}, user=
            {user ? 'yes' : 'no'}
          </div>
          <div>
            بيانات المستخدم:{' '}
            {user
              ? JSON.stringify({
                  name: user.name,
                  accountType: user.accountType,
                  verified: user.verified,
                })
              : 'null'}
          </div>
          <div>رسالة الخطأ: {authError || 'null'}</div>
          <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
            <div
              className={`rounded px-2 py-1 ${
                typeof window !== 'undefined' && document.cookie.includes('token=')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              Cookie Token:{' '}
              {typeof window !== 'undefined' && document.cookie.includes('token=')
                ? '✓ موجود'
                : '✗ غير موجود'}
            </div>
            <div
              className={`rounded px-2 py-1 ${
                typeof window !== 'undefined' && localStorage.getItem('token')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              LocalStorage:{' '}
              {typeof window !== 'undefined' && localStorage.getItem('token')
                ? '✓ موجود'
                : '✗ غير موجود'}
            </div>
          </div>
          <div>
            المسار الحالي: {typeof window !== 'undefined' ? window.location.pathname : 'غير محدد'}
          </div>
          <div>الوقت: {new Date().toLocaleString('ar-LY')}</div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                setAuthError(null);
                setLoading(true);
                checkAuthentication();
              }}
              className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
            >
              إعادة فحص المصادقة
            </button>
            <button
              onClick={() => {
                checkAuthState();
                // استدعاء debug API
                fetch('/api/debug/auth-company', {
                  method: 'GET',
                  credentials: 'include',
                })
                  .then((res) => res.json())
                  .then((data) => {
                    alert('تم طباعة معلومات التشخيص في console.log');
                  })
                  .catch((err) => console.error('Debug API Error:', err));
              }}
              className="rounded bg-gray-600 px-2 py-1 text-xs text-white hover:bg-gray-700"
            >
              فحص تشخيصي
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
              <p className="mt-2 text-sm text-gray-600">جارٍ التحقق من الجلسة...</p>
            </div>
          </div>
        )}

        {authError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                <XMarkIcon className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-bold text-red-800">خطأ في المصادقة</h3>
                <p className="mb-4 text-sm leading-relaxed text-red-700">{authError}</p>

                <div className="space-y-2">
                  {authError.includes('يتطلب تسجيل دخول') && (
                    <>
                      <p className="text-xs font-medium text-red-600">الخطوات المطلوبة:</p>
                      <ol className="mr-4 list-inside list-decimal space-y-1 text-xs text-red-600">
                        <li>تسجيل الدخول بحسابك</li>
                        <li>التأكد من أن نوع الحساب هو &quot;شركة&quot;</li>
                        <li>العودة لهذه الصفحة</li>
                      </ol>
                    </>
                  )}

                  {authError.includes('يجب تحويل حسابك') && (
                    <div className="rounded-lg bg-yellow-100 p-3">
                      <p className="mb-2 text-xs font-medium text-yellow-800">
                        يمكنك تحويل حسابك إلى نوع &quot;شركة&quot;:
                      </p>
                      <ol className="list-inside list-decimal space-y-1 text-xs text-yellow-700">
                        <li>الذهاب إلى إعدادات الحساب</li>
                        <li>تغيير نوع الحساب إلى &quot;شركة&quot;</li>
                        <li>حفظ التغييرات</li>
                        <li>العودة لهذه الصفحة</li>
                      </ol>
                    </div>
                  )}

                  {authError.includes('نوع حسابك الحالي') && (
                    <div className="rounded-lg bg-red-100 p-3">
                      <p className="mb-2 text-xs font-medium text-red-800">
                        خطوات تغيير نوع الحساب:
                      </p>
                      <ol className="list-inside list-decimal space-y-1 text-xs text-red-700">
                        <li>الذهاب إلى إعدادات الحساب</li>
                        <li>تغيير نوع الحساب إلى &quot;شركة&quot;</li>
                        <li>حفظ التغييرات</li>
                        <li>العودة لهذه الصفحة</li>
                      </ol>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => router.push('/login')}
                    className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  >
                    تسجيل الدخول
                  </button>

                  {(authError.includes('يجب تحويل') || authError.includes('نوع حسابك الحالي')) && (
                    <button
                      onClick={() => router.push('/settings/account')}
                      className="inline-flex items-center rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-100"
                    >
                      إعدادات الحساب
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setAuthError(null);
                      checkAuthentication();
                    }}
                    className="inline-flex items-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                  >
                    إعادة المحاولة
                  </button>

                  <button
                    onClick={() => (window.location.href = '/dashboard')}
                    className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    اللوحة الرئيسية
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !authError && user && (
          <>
            <div className="mb-6 rounded-xl bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 p-4 shadow-md lg:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 shadow-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">إنشاء/إعداد الشركة</h1>
                  <p className="text-sm text-gray-600">أدخل معلومات شركتك الأساسية</p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">اسم الشركة</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="اسم الشركة"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">الهاتف</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="0XXXXXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">المدينة</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="طرابلس"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">المنطقة</label>
                  <input
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="سوق الجمعة"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  نبذة عن الشركة
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="وصف مختصر عن أنشطة وخدمات الشركة"
                />
              </div>

              <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 text-sm font-bold text-gray-800">خيارات</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      البريد الإلكتروني (اختياري)
                    </label>
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      type="email"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="example@company.ly"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      اختياري: لتمكين تواصل العملاء عبر البريد.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      الموقع الإلكتروني (اختياري)
                    </label>
                    <input
                      name="website"
                      value={form.website}
                      onChange={handleChange}
                      type="url"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="https://company.ly"
                    />
                    <p className="mt-1 text-xs text-gray-500">اختياري: لعرض رابط موقع الشركة.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 pt-6 sm:flex-row sm:justify-between">
                <div className="flex gap-3">
                  <LoadingButton
                    type="submit"
                    isLoading={submitting}
                    loadingText="جارٍ الحفظ..."
                    className="bg-emerald-600 px-6 py-2.5 text-sm font-medium hover:bg-emerald-700"
                  >
                    <CheckCircleIcon className="ml-2 h-4 w-4" />
                    حفظ الشركة
                  </LoadingButton>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                </div>

                <div className="text-center text-xs text-gray-500 sm:text-right">
                  <p>سيتم مراجعة الشركة وتفعيلها في أسرع وقت</p>
                </div>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default CompanyCreatePage;
