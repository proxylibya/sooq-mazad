import React from 'react';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  loading = false,
  loadingText = 'جاري التحميل...',
  leftIcon,
  rightIcon,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'auth-button';

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'bg-transparent hover:bg-gray-50 text-gray-700 border border-gray-300',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="auth-loading h-4 w-4 rounded-full border-2 border-white border-t-transparent"></div>
          {loadingText}
        </>
      ) : (
        <>
          {rightIcon && rightIcon}
          {children}
          {leftIcon && leftIcon}
        </>
      )}
    </button>
  );
};

export default AuthButton;
