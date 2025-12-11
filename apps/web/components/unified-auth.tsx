/**
 * مكونات المصادقة الموحدة
 */

import React, { useState } from 'react';

export interface UnifiedAuthProps {
  mode?: 'login' | 'register' | 'forgot';
  onSuccess?: (user: unknown) => void;
  onClose?: () => void;
  redirectTo?: string;
}

export function UnifiedAuth({ mode: initialMode = 'login', onSuccess, onClose }: UnifiedAuthProps) {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());

      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        onSuccess?.(result.user);
      } else {
        const error = await response.json();
        setError(error.message || 'حدث خطأ');
      }
    } catch {
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {mode === 'login'
            ? 'تسجيل الدخول'
            : mode === 'register'
              ? 'إنشاء حساب'
              : 'استعادة كلمة المرور'}
        </h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        )}
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="mb-1 block text-sm font-medium">الاسم</label>
            <input
              name="name"
              type="text"
              required
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل اسمك"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">
            {mode === 'login' ? 'البريد أو رقم الهاتف' : 'البريد الإلكتروني'}
          </label>
          <input
            name="email"
            type={mode === 'login' ? 'text' : 'email'}
            required
            className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder={mode === 'login' ? 'أدخل البريد أو الهاتف' : 'أدخل بريدك الإلكتروني'}
          />
        </div>

        {mode !== 'forgot' && (
          <div>
            <label className="mb-1 block text-sm font-medium">كلمة المرور</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل كلمة المرور"
            />
          </div>
        )}

        {mode === 'register' && (
          <div>
            <label className="mb-1 block text-sm font-medium">رقم الهاتف</label>
            <input
              name="phone"
              type="tel"
              required
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="09XXXXXXXX"
              dir="ltr"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? 'جاري التحميل...'
            : mode === 'login'
              ? 'دخول'
              : mode === 'register'
                ? 'إنشاء حساب'
                : 'إرسال'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        {mode === 'login' ? (
          <>
            <button onClick={() => setMode('forgot')} className="text-blue-600 hover:underline">
              نسيت كلمة المرور؟
            </button>
            <span className="mx-2">|</span>
            <button onClick={() => setMode('register')} className="text-blue-600 hover:underline">
              إنشاء حساب جديد
            </button>
          </>
        ) : (
          <button onClick={() => setMode('login')} className="text-blue-600 hover:underline">
            لديك حساب؟ تسجيل الدخول
          </button>
        )}
      </div>
    </div>
  );
}

export default UnifiedAuth;
