import React from 'react';
import SimpleSpinner from '../ui/SimpleSpinner';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string; // سيُستخدم كنص مخفي لأغراض الوصول فقط
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  className = '',
}) => {
  const mapSize = (s: LoadingSpinnerProps['size']): 'sm' | 'md' | 'lg' => {
    switch (s) {
      case 'small':
        return 'sm';
      case 'large':
        return 'lg';
      case 'medium':
      default:
        return 'md';
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-live="polite" aria-busy="true">
      <SimpleSpinner size={mapSize(size)} color="blue" />
      <span className="sr-only">{message || 'جاري التحميل'}</span>
    </div>
  );
};

export default LoadingSpinner;
