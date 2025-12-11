'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'info' | 'success' | 'warning';
}

const variantClasses: Record<NonNullable<AlertProps['variant']>, string> = {
  default: 'bg-white border-gray-200 text-gray-900',
  destructive: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, children, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative w-full rounded-lg border p-4 text-sm',
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Alert.displayName = 'Alert';

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export default Alert;
