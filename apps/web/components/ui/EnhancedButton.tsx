/**
 * زر محسن مع تأثيرات متقدمة
 */

import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface EnhancedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
}

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};

const sizeClasses = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      rounded = false,
      disabled,
      className = '',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantClasses[variant]} ${sizeClasses[size]} ${rounded ? 'rounded-full' : 'rounded-lg'} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className} `}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {loadingText || children}
          </>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  },
);

EnhancedButton.displayName = 'EnhancedButton';

// أنواع الأزرار المختلفة
export const PrimaryButton = forwardRef<HTMLButtonElement, Omit<EnhancedButtonProps, 'variant'>>(
  (props, ref) => <EnhancedButton ref={ref} variant="primary" {...props} />,
);
PrimaryButton.displayName = 'PrimaryButton';

export const SecondaryButton = forwardRef<HTMLButtonElement, Omit<EnhancedButtonProps, 'variant'>>(
  (props, ref) => <EnhancedButton ref={ref} variant="secondary" {...props} />,
);
SecondaryButton.displayName = 'SecondaryButton';

export const DangerButton = forwardRef<HTMLButtonElement, Omit<EnhancedButtonProps, 'variant'>>(
  (props, ref) => <EnhancedButton ref={ref} variant="danger" {...props} />,
);
DangerButton.displayName = 'DangerButton';

export const SuccessButton = forwardRef<HTMLButtonElement, Omit<EnhancedButtonProps, 'variant'>>(
  (props, ref) => <EnhancedButton ref={ref} variant="primary" {...props} />,
);
SuccessButton.displayName = 'SuccessButton';

export const GhostButton = forwardRef<HTMLButtonElement, Omit<EnhancedButtonProps, 'variant'>>(
  (props, ref) => <EnhancedButton ref={ref} variant="ghost" {...props} />,
);
GhostButton.displayName = 'GhostButton';

export const OutlineButton = forwardRef<HTMLButtonElement, Omit<EnhancedButtonProps, 'variant'>>(
  (props, ref) => <EnhancedButton ref={ref} variant="outline" {...props} />,
);
OutlineButton.displayName = 'OutlineButton';

export default EnhancedButton;
