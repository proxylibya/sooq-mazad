import { NextPageContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';

interface ErrorProps {
  statusCode?: number;
  hasGetInitialProps?: boolean;
  err?: Error;
}

function Error({ statusCode, hasGetInitialProps, err }: ErrorProps) {
  return (
    <>
      <Head>
        <title>
          {statusCode
            ? `خطأ ${statusCode} - موقع مزاد السيارات`
            : 'خطأ في العميل - موقع مزاد السيارات'}
        </title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              {/* رمز الخطأ */}
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              {/* رسالة الخطأ */}
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                {statusCode ? `خطأ ${statusCode}` : 'حدث خطأ في التطبيق'}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                {statusCode === 404
                  ? 'الصفحة التي تبحث عنها غير موجودة'
                  : statusCode === 500
                    ? 'حدث خطأ في الخادم، يرجى المحاولة مرة أخرى'
                    : statusCode
                      ? 'حدث خطأ غير متوقع'
                      : 'حدث خطأ في المتصفح'}
              </p>

              {/* معلومات إضافية في بيئة التطوير */}
              {process.env.NODE_ENV === 'development' && err && (
                <div className="mt-4 rounded-md bg-red-50 p-4 text-left">
                  <h3 className="text-sm font-medium text-red-800">تفاصيل الخطأ (بيئة التطوير):</h3>
                  <pre className="mt-2 whitespace-pre-wrap text-xs text-red-700">
                    {err.stack || err.message}
                  </pre>
                </div>
              )}

              {/* أزرار التنقل */}
              <div className="mt-6 flex flex-col space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  إعادة تحميل الصفحة
                </button>

                <Link
                  href="/"
                  className="flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  العودة للصفحة الرئيسية
                </Link>

                <button
                  onClick={() => window.history.back()}
                  className="flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  العودة للصفحة السابقة
                </button>
              </div>

              {/* معلومات الاتصال */}
              <div className="mt-6 text-xs text-gray-500">
                <p>إذا استمر الخطأ، يرجى الاتصال بالدعم الفني</p>
                <p className="mt-1">كود الخطأ: {statusCode || 'CLIENT_ERROR'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
