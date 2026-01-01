import { useEffect, useState } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface DatabaseStatus {
  connected: boolean;
  error?: string;
  checking: boolean;
}

export default function DatabaseConnectionCheck() {
  const [status, setStatus] = useState<DatabaseStatus>({
    connected: false,
    error: undefined,
    checking: true,
  });

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      setStatus((prev) => ({ ...prev, checking: true }));

      const response = await fetch('/api/health/database', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({
          connected: data.connected,
          error: data.connected ? undefined : data.error,
          checking: false,
        });
      } else {
        setStatus({
          connected: false,
          error: 'فشل في الاتصال بقاعدة البيانات',
          checking: false,
        });
      }
    } catch (error) {
      setStatus({
        connected: false,
        error: error instanceof Error ? error.message : 'خطأ غير معروف',
        checking: false,
      });
    }
  };

  // لا نعرض شيئاً إذا كان الاتصال يعمل بشكل طبيعي
  if (status.connected && !status.checking) {
    return null;
  }

  // عرض تحميل
  if (status.checking) {
    return (
      <div className="fixed right-4 top-4 z-50 rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-lg">
        <div className="flex items-center">
          <div className="ml-2 h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="text-sm text-blue-800">فحص اتصال قاعدة البيانات...</span>
        </div>
      </div>
    );
  }

  // عرض خطأ الاتصال
  if (!status.connected && status.error) {
    return (
      <div className="fixed right-4 top-4 z-50 max-w-md rounded-lg border border-red-200 bg-red-50 p-4 shadow-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="mr-3">
            <h3 className="text-sm font-medium text-red-800">مشكلة في اتصال قاعدة البيانات</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{status.error}</p>
            </div>
            <div className="mt-3 flex">
              <button
                onClick={checkDatabaseConnection}
                className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
