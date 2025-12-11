import React from 'react';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';

interface SaveStatusIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  loading?: boolean;
  onSave?: () => void;
  className?: string;
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  status,
  loading = false,
  onSave,
  className = '',
}) => {
  const getButtonContent = () => {
    switch (status) {
      case 'saving':
        return (
          <>
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
            جاري الحفظ...
          </>
        );
      case 'saved':
        return (
          <>
            <CheckCircleIcon className="h-4 w-4" />
            تم الحفظ
          </>
        );
      case 'error':
        return (
          <>
            <ExclamationTriangleIcon className="h-4 w-4" />
            خطأ في الحفظ
          </>
        );
      default:
        return 'حفظ التغييرات';
    }
  };

  const getButtonStyles = () => {
    const baseStyles = 'px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2';

    switch (status) {
      case 'saving':
        return `${baseStyles} bg-blue-400 text-white cursor-not-allowed`;
      case 'saved':
        return `${baseStyles} bg-green-600 text-white`;
      case 'error':
        return `${baseStyles} bg-red-600 text-white hover:bg-red-700`;
      default:
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700`;
    }
  };

  return (
    <button
      onClick={onSave}
      disabled={loading || status === 'saving'}
      className={`${getButtonStyles()} ${className} ${
        loading || status === 'saving' ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      {getButtonContent()}
    </button>
  );
};

export default SaveStatusIndicator;
