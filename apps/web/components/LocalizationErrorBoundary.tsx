/**
 * مكون معالجة أخطاء التوطين
 * يتعامل مع الأخطاء المتعلقة بنظام التوطين بشكل أنيق
 */

import React, { Component, ReactNode } from 'react';
import { countries, localizationManager } from '../utils/localizationSystem';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class LocalizationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // console.error('خطأ في نظام التوطين:', error);
    // console.error('معلومات الخطأ:', errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // إرسال تقرير الخطأ (في التطبيق الحقيقي)
    this.reportError(error, errorInfo);
  }

  private reportError(error: Error, errorInfo: any) {
    // يمكن إرسال التقرير إلى خدمة مراقبة الأخطاء
    console.warn('تقرير خطأ التوطين:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  private handleRetry = () => {
    // إعادة تعيين الحالة
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // محاولة إعادة تحميل الصفحة
    window.location.reload();
  };

  private handleReset = () => {
    try {
      // مسح البيانات المحفوظة
      localStorage.removeItem('selectedCountry');
      localStorage.removeItem('localizationData');

      // إعادة تعيين الحالة
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });

      // إعادة تحميل الصفحة
      window.location.reload();
    } catch (error) {
      // console.error('خطأ في إعادة تعيين البيانات:', error);
      // إعادة تحميل قسرية
      window.location.href = window.location.href;
    }
  };

  render() {
    if (this.state.hasError) {
      // عرض واجهة الخطأ المخصصة
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4" dir="rtl">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
            {/* أيقونة الخطأ */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            {/* عنوان الخطأ */}
            <h1 className="mb-2 text-xl font-bold text-gray-900">خطأ في تحميل بيانات البلد</h1>

            {/* وصف الخطأ */}
            <p className="mb-6 text-gray-600">
              حدث خطأ أثناء تحميل بيانات التوطين. يرجى المحاولة مرة أخرى.
            </p>

            {/* معلومات الخطأ للمطورين */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-4 rounded bg-gray-100 p-3 text-left text-xs">
                <strong>خطأ:</strong> {this.state.error.message}
              </div>
            )}

            {/* أزرار الإجراءات */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
              >
                إعادة المحاولة
              </button>

              <button
                onClick={this.handleReset}
                className="w-full rounded-lg bg-gray-600 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-700"
              >
                إعادة تعيين البيانات
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="w-full rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
              >
                العودة للصفحة الرئيسية
              </button>
            </div>

            {/* معلومات إضافية */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">إذا استمر الخطأ، يرجى الاتصال بالدعم الفني</p>
              <div className="mt-2 text-xs text-gray-400">
                البلدان المدعومة: {countries.length} بلد
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// مكون مبسط لمعالجة أخطاء التوطين
export const LocalizationFallback: React.FC<{ error?: string }> = ({ error }) => (
  <div className="m-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
    <div className="flex items-center">
      <svg
        className="ml-2 h-5 w-5 text-yellow-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <div>
        <h3 className="text-sm font-medium text-yellow-800">تحذير: مشكلة في بيانات التوطين</h3>
        <p className="mt-1 text-sm text-yellow-700">
          {error || 'يتم استخدام البيانات الافتراضية حالياً'}
        </p>
      </div>
    </div>
  </div>
);

// مكون للتحقق من صحة البيانات
export const LocalizationValidator: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isValid, setIsValid] = React.useState(true);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // التحقق من صحة البيانات الأساسية - ليبيا فقط
    try {
      // التحقق من إعدادات ليبيا
      const libyaConfig = localizationManager.getCurrentLocalization();
      if (!libyaConfig) {
        console.warn('إعدادات ليبيا غير متاحة');
      }

      setIsValid(true);
      setValidationError(null);
    } catch (error) {
      console.error('خطأ في التحقق من صحة بيانات التوطين:', error);
      setIsValid(false);
      setValidationError(error instanceof Error ? error.message : 'خطأ غير معروف');
    }
  }, []);

  if (!isValid) {
    return <LocalizationFallback error={validationError || undefined} />;
  }

  return <>{children}</>;
};

export default LocalizationErrorBoundary;
