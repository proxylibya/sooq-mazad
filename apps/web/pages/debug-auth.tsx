/**
 * صفحة تشخيص المصادقة
 * /debug-auth
 */

import { useEffect, useState } from 'react';

interface DebugResult {
  timestamp: string;
  localStorage: {
    hasToken: boolean;
    tokenLength: number;
    hasUser: boolean;
    user: any;
  };
  apiVerification: any;
  error: string | null;
}

export default function DebugAuthPage() {
  const [result, setResult] = useState<DebugResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const debugResult: DebugResult = {
        timestamp: new Date().toISOString(),
        localStorage: {
          hasToken: false,
          tokenLength: 0,
          hasUser: false,
          user: null,
        },
        apiVerification: null,
        error: null,
      };

      try {
        // 1. فحص localStorage
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        debugResult.localStorage = {
          hasToken: !!token,
          tokenLength: token?.length || 0,
          hasUser: !!userStr,
          user: userStr ? JSON.parse(userStr) : null,
        };

        // 2. استدعاء API التشخيص
        if (token) {
          const res = await fetch('/api/debug/verify-token', {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
          });
          debugResult.apiVerification = await res.json();
        } else {
          debugResult.apiVerification = { error: 'No token in localStorage' };
        }
      } catch (err: any) {
        debugResult.error = err.message;
      }

      setResult(debugResult);
      setLoading(false);
    };

    runDiagnostics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-8">
        <div className="text-xl">جاري التشخيص...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8" dir="rtl">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">تشخيص نظام المصادقة</h1>

        {/* localStorage */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-blue-600">1. localStorage</h2>
          <div className="space-y-2">
            <div
              className={`flex items-center gap-2 ${result?.localStorage.hasToken ? 'text-green-600' : 'text-red-600'}`}
            >
              <span>{result?.localStorage.hasToken ? '✅' : '❌'}</span>
              <span>
                Token:{' '}
                {result?.localStorage.hasToken
                  ? `موجود (${result.localStorage.tokenLength} حرف)`
                  : 'غير موجود'}
              </span>
            </div>
            <div
              className={`flex items-center gap-2 ${result?.localStorage.hasUser ? 'text-green-600' : 'text-red-600'}`}
            >
              <span>{result?.localStorage.hasUser ? '✅' : '❌'}</span>
              <span>User: {result?.localStorage.hasUser ? 'موجود' : 'غير موجود'}</span>
            </div>
            {result?.localStorage.user && (
              <pre className="mt-2 overflow-auto rounded bg-gray-100 p-4 text-sm">
                {JSON.stringify(result.localStorage.user, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* API Verification */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-blue-600">2. التحقق من API</h2>
          {result?.apiVerification && (
            <>
              {/* Summary */}
              {result.apiVerification.summary && (
                <div className="mb-4 rounded bg-gray-50 p-4">
                  <h3 className="mb-2 font-semibold">ملخص:</h3>
                  <div
                    className={`flex items-center gap-2 ${result.apiVerification.summary.tokenValid ? 'text-green-600' : 'text-red-600'}`}
                  >
                    <span>{result.apiVerification.summary.tokenValid ? '✅' : '❌'}</span>
                    <span>
                      Token صالح: {result.apiVerification.summary.tokenValid ? 'نعم' : 'لا'}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${result.apiVerification.summary.userExists ? 'text-green-600' : 'text-red-600'}`}
                  >
                    <span>{result.apiVerification.summary.userExists ? '✅' : '❌'}</span>
                    <span>
                      المستخدم موجود: {result.apiVerification.summary.userExists ? 'نعم' : 'لا'}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${result.apiVerification.summary.canAuthenticate ? 'text-green-600' : 'text-red-600'}`}
                  >
                    <span>{result.apiVerification.summary.canAuthenticate ? '✅' : '❌'}</span>
                    <span>
                      يمكن المصادقة: {result.apiVerification.summary.canAuthenticate ? 'نعم' : 'لا'}
                    </span>
                  </div>
                </div>
              )}

              {/* Errors */}
              {result.apiVerification.errors?.length > 0 && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 p-4">
                  <h3 className="mb-2 font-semibold text-red-700">الأخطاء:</h3>
                  <ul className="list-inside list-disc text-red-600">
                    {result.apiVerification.errors.map((err: string, i: number) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full Response */}
              <details className="mt-4">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                  عرض الاستجابة الكاملة
                </summary>
                <pre className="mt-2 max-h-96 overflow-auto rounded bg-gray-100 p-4 text-sm">
                  {JSON.stringify(result.apiVerification, null, 2)}
                </pre>
              </details>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-blue-600">3. إجراءات</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              إعادة الفحص
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              مسح localStorage
            </button>
            <a
              href="/login"
              className="inline-block rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
              تسجيل الدخول
            </a>
            <a
              href="/messages"
              className="inline-block rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
            >
              صفحة الرسائل
            </a>
          </div>
        </div>

        {/* Timestamp */}
        <div className="mt-8 text-center text-gray-500">آخر فحص: {result?.timestamp}</div>
      </div>
    </div>
  );
}
