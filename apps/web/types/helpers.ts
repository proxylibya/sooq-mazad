// ملف الأنواع المساعدة
// Helper Types File

export interface DropdownOption {
  value: string;
  label: string;
}

export interface SafeResponseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  [key: string]: any;
}

export interface UserAvatarProps {
  userId?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  showVerified?: boolean;
  className?: string;
}

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface NavigationArrowsProps {
  onPrevious: () => void;
  onNext: () => void;
  show: boolean;
}

export interface UserAccountIconProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

// إضافة أنواع أخرى حسب الحاجة
export type AnyObject = Record<string, any>;
export type EmptyObject = Record<string, never>;
