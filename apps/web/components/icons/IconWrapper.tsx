/**
 * مكون غلاف للأيقونات مع معايير موحدة
 * يضمن الاستخدام الصحيح للأيقونات عبر المشروع
 */

import React from 'react';
import { cn } from '@/lib/utils';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IconColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'gray'
  | 'current';

interface IconWrapperProps {
  /** مكون الأيقونة من Heroicons */
  icon: React.ComponentType<{ className?: string }>;
  /** حجم الأيقونة */
  size?: IconSize;
  /** لون الأيقونة */
  color?: IconColor;
  /** فئات CSS إضافية */
  className?: string;
  /** نص بديل للوصول */
  ariaLabel?: string;
  /** هل الأيقونة قابلة للنقر */
  clickable?: boolean;
  /** دالة عند النقر */
  onClick?: () => void;
}

// خريطة الأحجام
const sizeMap: Record<IconSize, string> = {
  xs: 'w-3 h-3', // 12px
  sm: 'w-4 h-4', // 16px
  md: 'w-5 h-5', // 20px
  lg: 'w-6 h-6', // 24px
  xl: 'w-8 h-8', // 32px
  '2xl': 'w-12 h-12', // 48px
};

// خريطة الألوان
const colorMap: Record<IconColor, string> = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  success: 'text-green-600',
  danger: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-cyan-600',
  gray: 'text-gray-400',
  current: 'text-current',
};

/**
 * مكون غلاف للأيقونات مع معايير موحدة
 *
 * @example
 * ```tsx
 * import { UserIcon } from '@heroicons/react/24/outline';
 *
 * <IconWrapper
 *   icon={UserIcon}
 *   size="md"
 *   color="primary"
 *   ariaLabel="ملف المستخدم"
 * />
 * ```
 */
export const IconWrapper: React.FC<IconWrapperProps> = ({
  icon: Icon,
  size = 'lg',
  color = 'current',
  className,
  ariaLabel,
  clickable = false,
  onClick,
}) => {
  const iconClasses = cn(
    sizeMap[size],
    colorMap[color],
    clickable && 'cursor-pointer hover:opacity-80 transition-opacity',
    className,
  );

  const iconElement = (
    <Icon className={iconClasses} aria-label={ariaLabel} aria-hidden={!ariaLabel} />
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center justify-center rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={ariaLabel}
      >
        {iconElement}
      </button>
    );
  }

  return iconElement;
};

/**
 * مكون زر مع أيقونة
 */
interface IconButtonProps extends IconWrapperProps {
  /** نص الزر */
  label?: string;
  /** موضع الأيقونة */
  iconPosition?: 'left' | 'right';
  /** نوع الزر */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** حجم الزر */
  buttonSize?: 'sm' | 'md' | 'lg';
  /** هل الزر معطل */
  disabled?: boolean;
}

const buttonVariants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  label,
  iconPosition = 'left',
  variant = 'primary',
  buttonSize = 'md',
  size = 'md',
  disabled = false,
  onClick,
  ariaLabel,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || label}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        buttonVariants[variant],
        buttonSizes[buttonSize],
        className,
      )}
    >
      {iconPosition === 'left' && <Icon className={sizeMap[size]} aria-hidden="true" />}
      {label && <span>{label}</span>}
      {iconPosition === 'right' && <Icon className={sizeMap[size]} aria-hidden="true" />}
    </button>
  );
};

/**
 * مكون بطاقة مع أيقونة
 */
interface IconCardProps {
  /** مكون الأيقونة */
  icon: React.ComponentType<{ className?: string }>;
  /** عنوان البطاقة */
  title: string;
  /** وصف البطاقة */
  description?: string;
  /** لون الأيقونة */
  iconColor?: IconColor;
  /** لون الخلفية */
  bgColor?: string;
  /** فئات CSS إضافية */
  className?: string;
  /** دالة عند النقر */
  onClick?: () => void;
}

export const IconCard: React.FC<IconCardProps> = ({
  icon: Icon,
  title,
  description,
  iconColor = 'primary',
  bgColor = 'bg-blue-100',
  className,
  onClick,
}) => {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg border border-gray-200 p-4',
        isClickable && 'cursor-pointer transition-all hover:border-blue-500 hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', bgColor)}>
          <Icon className={cn('h-6 w-6', colorMap[iconColor])} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 font-bold text-gray-900">{title}</h3>
          {description && <p className="line-clamp-2 text-sm text-gray-600">{description}</p>}
        </div>
      </div>
    </div>
  );
};

/**
 * مكون قائمة مع أيقونات
 */
interface IconListItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
}

interface IconListProps {
  items: IconListItem[];
  className?: string;
}

export const IconList: React.FC<IconListProps> = ({ items, className }) => {
  return (
    <nav className={cn('space-y-1', className)}>
      {items.map((item, index) => {
        const ItemIcon = item.icon;
        const isClickable = !!(item.onClick || item.href);

        const content = (
          <>
            <ItemIcon className="h-5 w-5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {item.badge}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="mt-0.5 text-xs text-gray-500">{item.description}</p>
              )}
            </div>
          </>
        );

        if (item.href) {
          return (
            <a
              key={index}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2',
                'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                'transition-colors',
              )}
            >
              {content}
            </a>
          );
        }

        return (
          <button
            key={index}
            onClick={item.onClick}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-right',
              'text-gray-700',
              isClickable && 'transition-colors hover:bg-gray-100 hover:text-gray-900',
            )}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
};

export default IconWrapper;
