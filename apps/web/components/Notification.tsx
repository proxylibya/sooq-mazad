import React, { useEffect } from 'react';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationCircleIcon from '@heroicons/react/24/outline/ExclamationCircleIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';

interface NotificationProps {
  show: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  show,
  type,
  title,
  message,
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="fixed right-4 top-4 z-50 w-full max-w-sm">
      <div className={`rounded-lg border p-4 shadow-lg ${getBackgroundColor()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="mr-3 flex-1">
            <h3 className={`text-sm font-medium ${getTextColor()}`}>{title}</h3>
            {message && <p className={`mt-1 text-sm ${getTextColor()} opacity-90`}>{message}</p>}
          </div>
          <div className="mr-1 flex-shrink-0">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                type === 'success'
                  ? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                  : type === 'error'
                    ? 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                    : type === 'warning'
                      ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600'
                      : 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
              }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
