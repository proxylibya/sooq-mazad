import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Check if this is a Chrome extension error
    if (error.stack && error.stack.includes('chrome-extension://')) {
      // console.warn('Chrome extension error caught by ErrorBoundary:', error);
      // Reset the error state for extension errors
      this.setState({ hasError: false, error: undefined });
      return;
    }

    // Log other errors normally
    // console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Check if it's an extension error before showing fallback
      if (this.state.error.stack && this.state.error.stack.includes('chrome-extension://')) {
        return this.props.children;
      }

      // Show fallback UI for actual application errors
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center bg-gray-50" dir="rtl">
            <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
              <div className="mb-4 text-6xl text-red-500">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900">حدث خطأ غير متوقع</h2>
              <p className="mb-4 text-gray-600">
                نعتذر، حدث خطأ في التطبيق. يرجى إعادة تحميل الصفحة أو المحاولة مرة أخرى.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                إعادة تحميل الصفحة
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
