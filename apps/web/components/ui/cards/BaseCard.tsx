import React from 'react';

export interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'elevated' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  onClick?: () => void;
  as?: 'div' | 'article' | 'section';
}

/**
 * مكون Card أساسي موحد
 * يوفر أنماط أساسية قابلة للتخصيص لجميع أنواع البطاقات
 */
export const BaseCard: React.FC<BaseCardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  rounded = 'lg',
  shadow = 'md',
  hover = false,
  onClick,
  as: Component = 'div',
}) => {
  // أنماط الـ variant
  const variantStyles = {
    default: 'bg-white border border-gray-200',
    bordered: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white',
    flat: 'bg-gray-50',
  };

  // أنماط الـ padding
  const paddingStyles = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  // أنماط الـ rounded
  const roundedStyles = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  // أنماط الـ shadow
  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  // أنماط الـ hover
  const hoverStyles = hover
    ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer'
    : '';

  const combinedClassName = [
    variantStyles[variant],
    paddingStyles[padding],
    roundedStyles[rounded],
    shadowStyles[shadow],
    hoverStyles,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={combinedClassName} onClick={onClick}>
      {children}
    </Component>
  );
};

export default BaseCard;
