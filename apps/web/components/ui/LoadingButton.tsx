import React from 'react';
import SimpleSpinner from './SimpleSpinner';
import { cn } from '../../lib/utils';
import { Button, ButtonProps } from './button';

export interface LoadingButtonProps extends Omit<ButtonProps, 'children'> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  spinnerClassName?: string;
}

/**
 * مكون زر محسن مع حالة التحميل والسبينر
 * يحل مشكلة التصاق السبينر بالنص ويوفر تجربة أفضل للمستخدم
 */
export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    { isLoading = false, loadingText, children, disabled, spinnerClassName, className, ...props },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn('relative', isLoading && 'cursor-not-allowed', className)}
        {...props}
      >
        {isLoading && (
          <div className="flex items-center justify-center gap-2">
            <SimpleSpinner size="sm" color="white" />
            <span className="sr-only">{loadingText || 'جاري التحميل'}</span>
          </div>
        )}
        {!isLoading && children}
      </Button>
    );
  },
);

LoadingButton.displayName = 'LoadingButton';
