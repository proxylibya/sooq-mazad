/**
 * مكون ErrorBoundary محسن
 * Enhanced Error Boundary Component
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import {
  ClientErrorType,
  ErrorSeverity,
  clientErrorHandler,
} from '../../lib/error-handling/client-error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  enableReporting?: boolean;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
  retryCount: number;
}

class EnhancedErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // تجاهل أخطاء Chrome extensions
    if (error.stack && error.stack.includes('chrome-extension://')) {
      this.setState({ hasError: false, error: undefined });
      return;
    }

    // تسجيل الخطأ
    const errorId = this.logError(error, errorInfo);

    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // استدعاء callback المخصص
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logError(error: Error, errorInfo: ErrorInfo): string {
    const clientError = {
      id: this.generateErrorId(),
      type: ClientErrorType.UNKNOWN,
      severity: ErrorSeverity.HIGH,
      message: error.message,
      userMessage: 'حدث خطأ في عرض هذا الجزء من التطبيق',
      timestamp: new Date().toISOString(),
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundary: this.props.componentName || 'EnhancedErrorBoundary',
        stack: error.stack,
        retryCount: this.state.retryCount,
      },
      suggestions: ['إعادة المحاولة', 'إعادة تحميل الصفحة', 'مسح ذاكرة التخزين المؤقت'],
      retryable: true,
    };

    // إرسال إلى معالج أخطاء العميل
    if (this.props.enableReporting !== false) {
      clientErrorHandler.createError(ClientErrorType.CLIENT, error.message, {
        severity: ErrorSeverity.CRITICAL,
      });
    }

    console.error('🚨 ErrorBoundary caught an error:', {
      error: error.message,
      componentStack: errorInfo.componentStack,
      errorId: clientError.id,
    });

    return clientError.id;
  }

  private generateErrorId(): string {
    return `boundary_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        errorId: undefined,
        retryCount: this.state.retryCount + 1,
      });
    } else {
      // إعادة تحميل الصفحة بعد استنفاد المحاولات
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private renderErrorDetails() {
    if (!this.props.showDetails || !this.state.error) {
      return null;
    }

    return (
      <details className="mt-4 rounded-lg bg-gray-100 p-4">
        <summary className="mb-2 cursor-pointer font-medium text-gray-700">
          تفاصيل الخطأ التقنية
        </summary>
        <div className="space-y-2 text-sm text-gray-600">
          <div>
            <strong>رسالة الخطأ:</strong>
            <pre className="mt-1 overflow-x-auto rounded bg-white p-2 text-xs">
              {this.state.error.message}
            </pre>
          </div>

          {this.state.errorId && (
            <div>
              <strong>معرف الخطأ:</strong>
              <code className="ml-2 rounded bg-white px-2 py-1 text-xs">{this.state.errorId}</code>
            </div>
          )}

          <div>
            <strong>عدد المحاولات:</strong>
            <span className="mr-2">
              {this.state.retryCount} / {this.maxRetries}
            </span>
          </div>

          {this.state.error.stack && (
            <div>
              <strong>Stack Trace:</strong>
              <pre className="mt-1 max-h-32 overflow-x-auto rounded bg-white p-2 text-xs">
                {this.state.error.stack}
              </pre>
            </div>
          )}

          {this.state.errorInfo?.componentStack && (
            <div>
              <strong>Component Stack:</strong>
              <pre className="mt-1 max-h-32 overflow-x-auto rounded bg-white p-2 text-xs">
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
        </div>
      </details>
    );
  }

  private renderDefaultFallback() {
    const canRetry = this.state.retryCount < this.maxRetries;

    return (
      <div
        className="flex min-h-[400px] items-center justify-center rounded-lg bg-gray-50"
        dir="rtl"
      >
        <div className="w-full max-w-md p-6 text-center">
          {/* أيقونة الخطأ */}
          <div className="mb-4 text-6xl">
            {this.state.retryCount === 0
              ? '<ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />'
              : this.state.retryCount < this.maxRetries
                ? '<ArrowPathIcon className="w-5 h-5" />'
                : '💥'}
          </div>

          {/* العنوان */}
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            {this.state.retryCount === 0
              ? 'حدث خطأ غير متوقع'
              : this.state.retryCount < this.maxRetries
                ? 'لا يزال هناك خطأ'
                : 'فشل في حل المشكلة'}
          </h2>

          {/* الوصف */}
          <p className="mb-6 text-gray-600">
            {this.state.retryCount === 0
              ? 'نعتذر، حدث خطأ في عرض هذا الجزء من التطبيق.'
              : this.state.retryCount < this.maxRetries
                ? `تمت المحاولة ${this.state.retryCount} مرة. يمكنك المحاولة مرة أخرى.`
                : 'تم استنفاد جميع المحاولات. يرجى إعادة تحميل الصفحة.'}
          </p>

          {/* الأزرار */}
          <div className="space-y-3">
            {canRetry ? (
              <button
                onClick={this.handleRetry}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                إعادة المحاولة ({this.maxRetries - this.state.retryCount} متبقية)
              </button>
            ) : (
              <button
                onClick={this.handleReload}
                className="w-full rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
              >
                إعادة تحميل الصفحة
              </button>
            )}

            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={this.handleReload}
                className="flex-1 rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
              >
                إعادة التحميل
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex-1 rounded-lg bg-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-400"
              >
                الصفحة الرئيسية
              </button>
            </div>
          </div>

          {/* تفاصيل الخطأ */}
          {this.renderErrorDetails()}

          {/* معلومات إضافية */}
          <div className="mt-6 text-xs text-gray-500">
            <p>إذا استمرت المشكلة، يرجى الاتصال بالدعم الفني</p>
            {this.state.errorId && (
              <p className="mt-1">
                معرف الخطأ: <code>{this.state.errorId}</code>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      // عرض fallback مخصص أو الافتراضي
      return this.props.fallback || this.renderDefaultFallback();
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
