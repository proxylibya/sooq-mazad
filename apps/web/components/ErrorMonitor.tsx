/**
 * مكون مراقبة الأخطاء
 * يعرض تقارير الأخطاء ويساعد في تشخيص المشاكل
 */

import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import React, { useEffect, useState } from 'react';
import {
  ErrorType,
  clearErrorReports,
  generateErrorReport,
  getErrorReports,
} from '../utils/errorPrevention';

interface ErrorMonitorProps {
  showInProduction?: boolean;
  maxErrors?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const ErrorMonitor: React.FC<ErrorMonitorProps> = ({
  showInProduction = false,
  maxErrors = 50,
  autoRefresh = true,
  refreshInterval = 5000,
}) => {
  const [errors, setErrors] = useState(getErrorReports());
  const [isVisible, setIsVisible] = useState(false);
  const [selectedError, setSelectedError] = useState<any>(null);
  const [filter, setFilter] = useState<ErrorType | 'ALL'>('ALL');

  // إخفاء المراقب في الإنتاج إلا إذا تم تفعيله صراحة
  const shouldShow = process.env.NODE_ENV === 'development' || showInProduction;

  useEffect(() => {
    if (!shouldShow) return;

    const updateErrors = () => {
      const currentErrors = getErrorReports();
      setErrors(currentErrors.slice(-maxErrors));
    };

    updateErrors();

    if (autoRefresh) {
      const interval = setInterval(updateErrors, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [shouldShow, maxErrors, autoRefresh, refreshInterval]);

  // تصفية الأخطاء حسب النوع
  const filteredErrors =
    filter === 'ALL' ? errors : errors.filter((error) => error.type === filter);

  // إحصائيات الأخطاء
  const errorStats = {
    total: errors.length,
    byType: {} as Record<string, number>,
    recent: errors.filter((e) => new Date().getTime() - e.timestamp.getTime() < 60000).length,
  };

  errors.forEach((error) => {
    errorStats.byType[error.type] = (errorStats.byType[error.type] || 0) + 1;
  });

  const handleClearErrors = () => {
    clearErrorReports();
    setErrors([]);
    setSelectedError(null);
  };

  const handleDownloadReport = () => {
    const report = generateErrorReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getErrorColor = (type: ErrorType) => {
    switch (type) {
      case ErrorType.NULL_REFERENCE:
        return 'text-red-600 bg-red-50';
      case ErrorType.UNDEFINED_PROPERTY:
        return 'text-orange-600 bg-orange-50';
      case ErrorType.INVALID_ARRAY:
        return 'text-yellow-600 bg-yellow-50';
      case ErrorType.INVALID_TYPE:
        return 'text-purple-600 bg-purple-50';
      case ErrorType.MISSING_DATA:
        return 'text-blue-600 bg-blue-50';
      case ErrorType.API_ERROR:
        return 'text-red-600 bg-red-50';
      case ErrorType.VALIDATION_ERROR:
        return 'text-pink-600 bg-pink-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      {/* زر فتح المراقب */}
      {!isVisible && errors.length > 0 && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed bottom-4 left-4 z-50 rounded-full bg-red-500 p-3 text-white shadow-lg transition-colors hover:bg-red-600"
          title={`${errors.length} أخطاء مكتشفة`}
        >
          <ExclamationTriangleIcon className="h-6 w-6" />
          <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold leading-none text-red-500">
            {errors.length}
          </span>
        </button>
      )}

      {/* نافذة المراقب */}
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
            {/* رأس النافذة */}
            <div className="flex items-center justify-between border-b border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                <h2 className="text-lg font-semibold text-red-800">مراقب الأخطاء</h2>
                <span className="rounded-full bg-red-100 px-2 py-1 text-sm text-red-800">
                  {errorStats.total} خطأ
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadReport}
                  className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                >
                  <DocumentTextIcon className="mr-1 inline h-4 w-4" />
                  تحميل التقرير
                </button>
                <button
                  onClick={handleClearErrors}
                  className="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
                >
                  مسح الكل
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* الإحصائيات */}
            <div className="border-b bg-gray-50 p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-800">{errorStats.total}</div>
                  <div className="text-sm text-gray-600">إجمالي الأخطاء</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{errorStats.recent}</div>
                  <div className="text-sm text-gray-600">أخطاء حديثة (دقيقة واحدة)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.keys(errorStats.byType).length}
                  </div>
                  <div className="text-sm text-gray-600">أنواع مختلفة</div>
                </div>
              </div>
            </div>

            {/* فلتر الأخطاء */}
            <div className="border-b p-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as ErrorType | 'ALL')}
                className="rounded border px-3 py-2 text-sm"
              >
                <option value="ALL">جميع الأخطاء</option>
                {Object.values(ErrorType).map((type) => (
                  <option key={type} value={type}>
                    {type} ({errorStats.byType[type] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* قائمة الأخطاء */}
            <div className="flex-1 overflow-hidden">
              <div className="h-96 overflow-y-auto">
                {filteredErrors.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <InformationCircleIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <p>لا توجد أخطاء للعرض</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredErrors.map((error, index) => (
                      <div
                        key={index}
                        className="cursor-pointer p-4 hover:bg-gray-50"
                        onClick={() => setSelectedError(error)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <span
                                className={`rounded px-2 py-1 text-xs font-medium ${getErrorColor(error.type)}`}
                              >
                                {error.type}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <ClockIcon className="h-3 w-3" />
                                {error.timestamp.toLocaleTimeString('en-US')}
                              </span>
                            </div>
                            <p className="mb-1 text-sm text-gray-800">{error.message}</p>
                            <p className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPinIcon className="h-3 w-3" />
                              {error.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تفاصيل الخطأ */}
      {selectedError && (
        <div className="z-60 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b bg-gray-50 p-4">
              <h3 className="text-lg font-semibold">تفاصيل الخطأ</h3>
              <button
                onClick={() => setSelectedError(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto p-4">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">النوع</label>
                  <span
                    className={`rounded px-2 py-1 text-sm ${getErrorColor(selectedError.type)}`}
                  >
                    {selectedError.type}
                  </span>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">الرسالة</label>
                  <p className="text-sm text-gray-800">{selectedError.message}</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">الموقع</label>
                  <p className="text-sm text-gray-600">{selectedError.location}</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">الوقت</label>
                  <p className="text-sm text-gray-600">
                    {selectedError.timestamp.toLocaleString('en-US')}
                  </p>
                </div>
                {selectedError.data && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">البيانات</label>
                    <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-xs">
                      {JSON.stringify(selectedError.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ErrorMonitor;
