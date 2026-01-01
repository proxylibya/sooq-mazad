import React, { forwardRef } from 'react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, leftIcon, rightIcon, helperText, className = '', ...props }, ref) => {
    return (
      <div className="auth-field">
        <label className="auth-label" htmlFor={props.id}>
          {label}
        </label>
        <div className="relative">
          {rightIcon && <div className="auth-icon-right">{rightIcon}</div>}
          <input
            ref={ref}
            className={`auth-input text-right ${
              rightIcon ? 'auth-input-with-icon' : ''
            } ${leftIcon ? 'auth-input-with-icon-left' : ''} ${
              error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            } ${className}`}
            dir="rtl"
            {...props}
          />
          {leftIcon && <div className="auth-icon-left">{leftIcon}</div>}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  },
);

AuthInput.displayName = 'AuthInput';

export default AuthInput;
