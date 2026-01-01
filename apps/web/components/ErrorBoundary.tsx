import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  // قائمة شاملة للكلمات المفتاحية لأخطاء المحافظ الرقمية
  private static readonly WALLET_KEYWORDS = [
    'metamask',
    'ethereum',
    'web3',
    'wallet',
    'inpage.js',
    'chrome-extension://',
    'moz-extension://',
    'failed to connect',
    'extension not found',
    'provider',
    'ethers',
    'web3modal',
    'walletconnect',
    'injected connector',
    'nkbihfbeogaeaoehlefnkodbefgpgknn', // MetaMask extension ID
    'request rejected',
    'user rejected',
    'disconnected',
    'chain mismatch',
    'unsupported chain',
    'no ethereum provider',
  ];

  // دالة للتحقق من أخطاء إضافات المحفظة
  private static isWalletExtensionError(error: Error): boolean {
    const msg = (error?.message || '').toLowerCase();
    const stack = (error?.stack || '').toLowerCase();
    const name = (error?.name || '').toLowerCase();

    return ErrorBoundary.WALLET_KEYWORDS.some(
      (k) => msg.includes(k) || stack.includes(k) || name.includes(k),
    );
  }

  public static getDerivedStateFromError(error: Error): State {
    // تجاهل أخطاء إضافات المحفظة - لا نعرض واجهة الخطأ
    if (ErrorBoundary.isWalletExtensionError(error)) {
      return { hasError: false };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // تجاهل أخطاء إضافات المحفظة
    if (ErrorBoundary.isWalletExtensionError(error)) {
      return;
    }

    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Check if this is the specific React child error
    if (error.message.includes('Objects are not valid as a React child')) {
      console.error('🚨 React Child Error Details:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });

      // Try to identify the problematic component
      const componentMatch = errorInfo.componentStack.match(/in (\w+)/);
      if (componentMatch) {
        console.error(`🎯 Problematic component might be: ${componentMatch[1]}`);
      }
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      // Fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50" dir="rtl">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-red-400"
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
              <div className="mr-3">
                <h3 className="text-lg font-medium text-gray-900">حدث خطأ في التطبيق</h3>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                عذراً، حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة أو المحاولة مرة أخرى.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 p-3">
                <h4 className="mb-2 text-sm font-medium text-red-800">
                  تفاصيل الخطأ (وضع التطوير):
                </h4>
                <p className="break-all font-mono text-xs text-red-700">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-red-600">عرض المزيد</summary>
                    <pre className="mt-1 whitespace-pre-wrap text-xs text-red-600">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                إعادة تحميل الصفحة
              </button>
              <button
                onClick={() => window.history.back()}
                className="flex-1 rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-400"
              >
                العودة للخلف
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
