/**
 * 🔔 مكون الإشعارات الموحد
 * Unified Toast Component
 */

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { TOAST_CONFIG, type ToastConfig, type ToastType } from '../../lib/unified-admin-system';

// ================== Toast Component ==================

interface ToastProps extends ToastConfig {
  id: string;
  onClose: () => void;
}

const TOAST_ICONS: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

function Toast({ message, type, onClose }: ToastProps) {
  const Icon = TOAST_ICONS[type];
  const config = TOAST_CONFIG[type];

  return (
    <div
      className={`flex items-center gap-3 rounded-lg ${config.bg} animate-in slide-in-from-top px-4 py-3 text-white shadow-lg duration-300`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="rounded p-1 transition-colors hover:bg-white/20">
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

// ================== Toast Container ==================

interface ToastContainerProps {
  toasts: (ToastConfig & { id: string })[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

const POSITION_CLASSES = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
};

export function ToastContainer({ toasts, onClose, position = 'top-left' }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className={`fixed z-50 flex flex-col gap-2 ${POSITION_CLASSES[position]}`}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </div>
  );
}

// ================== Toast Context ==================

interface ToastContextValue {
  showToast: (config: ToastConfig) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastContainerProps['position'];
}

export function ToastProvider({ children, position = 'top-left' }: ToastProviderProps) {
  const [toasts, setToasts] = useState<(ToastConfig & { id: string })[]>([]);

  const showToast = useCallback((config: ToastConfig) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = config.duration ?? 4000;

    setToasts((prev) => [...prev, { ...config, id }]);

    // إزالة تلقائية بعد المدة المحددة
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message: string) => showToast({ message, type: 'success' }),
    [showToast],
  );

  const showError = useCallback(
    (message: string) => showToast({ message, type: 'error' }),
    [showToast],
  );

  const showWarning = useCallback(
    (message: string) => showToast({ message, type: 'warning' }),
    [showToast],
  );

  const showInfo = useCallback(
    (message: string) => showToast({ message, type: 'info' }),
    [showToast],
  );

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showWarning, showInfo, hideToast }}
    >
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} position={position} />
    </ToastContext.Provider>
  );
}

// ================== Hook ==================

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// ================== Simple Toast (Standalone) ==================

interface SimpleToastProps {
  message: string | null;
  type?: ToastType;
  onClose?: () => void;
}

export function SimpleToast({ message, type = 'info', onClose }: SimpleToastProps) {
  if (!message) return null;

  const Icon = TOAST_ICONS[type];
  const config = TOAST_CONFIG[type];

  return (
    <div
      className={`fixed left-4 top-4 z-50 flex items-center gap-3 rounded-lg ${config.bg} animate-in slide-in-from-top px-4 py-3 text-white shadow-lg duration-300`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="mr-2 rounded p-1 transition-colors hover:bg-white/20">
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default Toast;
