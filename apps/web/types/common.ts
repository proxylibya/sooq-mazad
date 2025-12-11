/**
 * أنواع البيانات المشتركة في المشروع
 * Common types used across the project
 */

// أنواع الاستجابة العامة
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// أنواع الأخطاء
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: string;
  statusCode?: number;
}

// أنواع الفلاتر العامة
export interface FilterOptions {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// أنواع المزادات
export interface AuctionFilter extends FilterOptions {
  status?: 'ACTIVE' | 'ENDED' | 'PENDING' | 'CANCELLED';
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  year?: number;
  city?: string;
}

// أنواع السيارات
export interface CarFilter extends FilterOptions {
  brand?: string;
  model?: string;
  year?: number;
  condition?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  minPrice?: number;
  maxPrice?: number;
}

// أنواع المستخدمين
import type { AccountType } from './account';
export interface UserFilter extends FilterOptions {
  accountType?: AccountType;
  verified?: boolean;
  city?: string;
}

// أنواع الأحداث
export interface EventHandler<T = Event> {
  (event: T): void;
}

export interface ChangeHandler<T = string | number> {
  (value: T): void;
}

export interface SubmitHandler<T = FormData> {
  (data: T): void | Promise<void>;
}

// أنواع النماذج
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string | number; label: string; }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
}

export interface FormData {
  [key: string]: string | number | boolean | null | undefined;
}

// أنواع الصور
export interface ImageData {
  id?: string;
  url: string;
  fileName?: string;
  alt?: string;
  isPrimary?: boolean;
  size?: number;
  width?: number;
  height?: number;
}

// أنواع الموقع
export interface LocationData {
  city?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// أنواع الدفع
export interface PaymentMethod {
  id: string;
  type: 'CARD' | 'BANK_TRANSFER' | 'WALLET' | 'CASH';
  name: string;
  details?: {
    cardNumber?: string;
    bankName?: string;
    accountNumber?: string;
  };
}

// أنواع الإشعارات
export interface NotificationData {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  title: string;
  message: string;
  timestamp: Date;
  read?: boolean;
  actionUrl?: string;
}

// أنواع التحميل
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

// أنواع البحث
export interface SearchResult<T = unknown> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// أنواع التحقق
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// أنواع الحالة
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: Date;
}

// أنواع المكونات المشتركة
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: EventHandler<React.MouseEvent>;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends ComponentProps {
  name: string;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: ChangeHandler<string>;
  onBlur?: EventHandler<React.FocusEvent>;
  error?: string;
}

// أنواع التكوين
export interface AppConfig {
  apiUrl: string;
  uploadUrl: string;
  maxFileSize: number;
  supportedImageTypes: string[];
  pagination: {
    defaultLimit: number;
    maxLimit: number;
  };
  cache: {
    ttl: number;
    maxSize: number;
  };
}

// أنواع السياق (Context)

export interface AuthContextType {
  user: object | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string; }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// أنواع الخطافات (Hooks)
export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

export interface UseFormOptions {
  initialValues?: FormData;
  validationSchema?: object;
  onSubmit: SubmitHandler<FormData>;
}

// ملاحظة: جميع الأنواع مصدرة تلقائياً عبر export interface/type أعلاه
