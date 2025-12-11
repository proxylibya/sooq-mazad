// @ts-nocheck
/**
 * ============================================
 * ⚛️ React Error Boundary Component
 * مكون حماية الأخطاء لـ React
 * ============================================
 */

import React, { Component, ReactNode } from 'react';
import { captureException, errorHandler, logger } from './index';

// ============================================
// Types
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
  level?: 'page' | 'section' | 'component';
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// ============================================
// Error Boundary Class
// ============================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log to unified system
    captureException(error, errorInfo.componentStack);

    // Call custom handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, level = 'component', showDetails } = this.props;

    if (hasError && error) {
      // Custom fallback
      if (typeof fallback === 'function') {
        return fallback(error, this.handleReset);
      }

      if (fallback) {
        return fallback;
      }

      // Default fallback based on level
      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          level={level}
          showDetails={showDetails}
          onReset={this.handleReset}
        />
      );
    }

    return children;
  }
}

// ============================================
// Default Error Fallback Component
// ============================================

interface DefaultErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo | null;
  level: 'page' | 'section' | 'component';
  showDetails?: boolean;
  onReset: () => void;
}

function DefaultErrorFallback({
  error,
  errorInfo,
  level,
  showDetails,
  onReset,
}: DefaultErrorFallbackProps) {
  const isDevelopment = (process as any).env.NODE_ENV === 'development';
  const showStack = showDetails || isDevelopment;

  // Styles based on level
  const containerStyles: Record<string, React.CSSProperties> = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: '#f8f9fa',
    },
    section: {
      padding: '2rem',
      margin: '1rem 0',
      backgroundColor: '#fff',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
    },
    component: {
      padding: '1rem',
      backgroundColor: '#fff5f5',
      borderRadius: '4px',
      border: '1px solid #fed7d7',
    },
  };

  return (
    <div style={containerStyles[level]} dir="rtl">
      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        {/* Icon */}
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          {level === 'page' ? '😔' : '⚠️'}
        </div>

        {/* Title */}
        <h2
          style={{
            color: '#c53030',
            marginBottom: '0.5rem',
            fontSize: level === 'page' ? '1.5rem' : '1.25rem',
          }}
        >
          {level === 'page' ? 'حدث خطأ غير متوقع' : 'حدث خطأ'}
        </h2>

        {/* Message */}
        <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
          {level === 'page'
            ? 'نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.'
            : 'تعذر تحميل هذا المحتوى'}
        </p>

        {/* Error details (development) */}
        {showStack && (
          <div
            style={{
              textAlign: 'left',
              direction: 'ltr',
              padding: '1rem',
              backgroundColor: '#2d3748',
              color: '#e2e8f0',
              borderRadius: '4px',
              marginBottom: '1.5rem',
              overflow: 'auto',
              maxHeight: '200px',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
            }}
          >
            <strong style={{ color: '#fc8181' }}>{error.name}:</strong> {error.message}
            {errorInfo?.componentStack && (
              <pre style={{ margin: '0.5rem 0 0', whiteSpace: 'pre-wrap' }}>
                {errorInfo.componentStack}
              </pre>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={onReset}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            إعادة المحاولة
          </button>

          {level === 'page' && (
            <button
              onClick={() => (window.location.href = '/')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#e2e8f0',
                color: '#4a5568',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              الصفحة الرئيسية
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// HOC Version
// ============================================

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<ErrorBoundaryProps, 'children'> = {},
): React.FC<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...options}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  return WithErrorBoundary;
}

// ============================================
// Hook Version
// ============================================

interface UseErrorHandlerReturn {
  error: Error | null;
  showError: (error: Error) => void;
  clearError: () => void;
  handleError: (error: unknown, context?: string) => void;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = React.useState<Error | null>(null);

  const showError = React.useCallback((err: Error) => {
    logger.error('UI Error', err);
    setError(err);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((err: unknown, context?: string) => {
    const { error: appError } = errorHandler.handle(err, context || 'UI');
    setError(new Error(appError.messageAr));
  }, []);

  return { error, showError, clearError, handleError };
}

// ============================================
// Async Error Handler Hook
// ============================================

interface UseAsyncErrorReturn<T> {
  execute: () => Promise<T | undefined>;
  data: T | undefined;
  error: Error | null;
  loading: boolean;
  reset: () => void;
}

export function useAsyncError<T>(
  asyncFn: () => Promise<T>,
  options: {
    immediate?: boolean;
    onError?: (error: Error) => void;
    retries?: number;
  } = {},
): UseAsyncErrorReturn<T> {
  const [data, setData] = React.useState<T>();
  const [error, setError] = React.useState<Error | null>(null);
  const [loading, setLoading] = React.useState(options.immediate || false);

  const execute = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = options.retries
        ? await errorHandler.handleWithRetry(asyncFn, 'async-operation', options.retries)
        : await asyncFn();

      setData(result);
      return result;
    } catch (err) {
      const appError = errorHandler.parseError(err);
      const jsError = new Error(appError.messageAr);
      setError(jsError);
      options.onError?.(jsError);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, options.retries, options.onError]);

  const reset = React.useCallback(() => {
    setData(undefined);
    setError(null);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, []);

  return { execute, data, error, loading, reset };
}

// ============================================
// Export
// ============================================

export default ErrorBoundary;
