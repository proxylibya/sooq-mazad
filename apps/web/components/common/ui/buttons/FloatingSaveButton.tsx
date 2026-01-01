import React from 'react';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';

interface FloatingSaveButtonProps {
  isVisible: boolean;
  onSave: () => void;
  isLoading: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  buttonText?: string;
  loadingText?: string;
  savedText?: string;
  errorText?: string;
  statusMessage?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  disabled?: boolean;
}

const FloatingSaveButton: React.FC<FloatingSaveButtonProps> = ({
  isVisible,
  onSave,
  isLoading,
  saveStatus,
  buttonText = 'حفظ التغييرات',
  loadingText = 'جاري الحفظ...',
  savedText = 'تم الحفظ بنجاح',
  errorText = 'إعادة المحاولة',
  statusMessage,
  icon: Icon = CheckCircleIcon,
  className = '',
  disabled = false,
}) => {
  if (!isVisible) return null;

  const getStatusMessage = () => {
    if (statusMessage) return statusMessage;

    switch (saveStatus) {
      case 'saved':
        return 'تم حفظ جميع التغييرات بنجاح';
      case 'error':
        return 'حدث خطأ أثناء الحفظ';
      default:
        return 'لديك تغييرات غير محفوظة';
    }
  };

  const getStatusColor = () => {
    switch (saveStatus) {
      case 'saved':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-orange-500';
    }
  };

  const getButtonText = () => {
    if (isLoading) return loadingText;

    switch (saveStatus) {
      case 'saved':
        return savedText;
      case 'error':
        return errorText;
      default:
        return buttonText;
    }
  };

  const getButtonIcon = () => {
    if (isLoading) {
      return <ArrowPathIcon className="h-6 w-6" />;
    }

    switch (saveStatus) {
      case 'saved':
        return <CheckCircleIcon className="h-6 w-6" />;
      case 'error':
        return <XMarkIcon className="h-6 w-6" />;
      default:
        return <Icon className="h-6 w-6" />;
    }
  };

  const getButtonStyle = () => {
    const baseStyle =
      'flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed';

    switch (saveStatus) {
      case 'saved':
        return `${baseStyle} bg-gradient-to-r from-green-500 to-green-600 text-white`;
      case 'error':
        return `${baseStyle} bg-gradient-to-r from-red-500 to-red-600 text-white`;
      default:
        return `${baseStyle} bg-gradient-to-r from-blue-600 to-blue-700 text-white`;
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200/50 bg-white/95 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${getStatusColor()}`}></div>
            <span className="text-sm font-medium text-gray-700">{getStatusMessage()}</span>
          </div>

          <button onClick={onSave} disabled={disabled || isLoading} className={getButtonStyle()}>
            {getButtonIcon()}
            <span>{getButtonText()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingSaveButton;
