/**
 * PageContentWrapper - مكون غلاف موحد لمحتوى الصفحات
 * نظام التحميل العالمي الموحد - سوق مزاد
 *
 * @description مكون يوفر حالات التحميل والخطأ والفراغ بشكل موحد
 * @version 1.0.0
 */

import React, { ReactNode } from 'react';
import {
  AuctionsGridSkeleton,
  CarsGridSkeleton,
  MessagesListSkeleton,
  NotificationsListSkeleton,
  ShowroomsGridSkeleton,
  TransportGridSkeleton,
  UsersListSkeleton,
} from './skeletons/GridSkeleton';

// ============================================
// Types
// ============================================

export type ContentType =
  | 'auctions'
  | 'cars'
  | 'marketplace'
  | 'showrooms'
  | 'transport'
  | 'messages'
  | 'notifications'
  | 'users'
  | 'favorites'
  | 'yards'
  | 'companies'
  | 'custom';

export interface PageContentWrapperProps {
  /** هل التحميل جاري */
  isLoading: boolean;
  /** هل حدث خطأ */
  isError?: boolean;
  /** رسالة الخطأ */
  errorMessage?: string;
  /** هل البيانات فارغة */
  isEmpty?: boolean;
  /** رسالة البيانات الفارغة */
  emptyMessage?: string;
  /** أيقونة البيانات الفارغة */
  emptyIcon?: ReactNode;
  /** نوع المحتوى لاختيار skeleton مناسب */
  contentType?: ContentType;
  /** عدد عناصر skeleton */
  skeletonCount?: number;
  /** عدد الأعمدة في الشبكة */
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  /** skeleton مخصص */
  customSkeleton?: ReactNode;
  /** المحتوى الفعلي */
  children: ReactNode;
  /** كلاسات إضافية */
  className?: string;
  /** إظهار زر إعادة المحاولة عند الخطأ */
  showRetry?: boolean;
  /** دالة إعادة المحاولة */
  onRetry?: () => void;
}

// ============================================
// Empty State Component
// ============================================

const EmptyState: React.FC<{
  message: string;
  icon?: ReactNode;
  onAction?: () => void;
  actionLabel?: string;
}> = ({ message, icon, onAction, actionLabel }) => (
  <div
    className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center"
    dir="rtl"
  >
    {icon && (
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        {icon}
      </div>
    )}
    <p className="text-lg font-medium text-gray-600">{message}</p>
    {onAction && actionLabel && (
      <button
        onClick={onAction}
        className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

// ============================================
// Error State Component
// ============================================

const ErrorState: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => (
  <div
    className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8 text-center"
    dir="rtl"
  >
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>
    <p className="text-lg font-medium text-red-600">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 rounded-lg bg-red-600 px-6 py-2 text-white transition-colors hover:bg-red-700"
      >
        إعادة المحاولة
      </button>
    )}
  </div>
);

// ============================================
// Grid Skeleton Renderer
// ============================================

const renderGridSkeleton = (
  contentType: ContentType,
  count: number,
  columns: 1 | 2 | 3 | 4 | 5 | 6,
): ReactNode => {
  switch (contentType) {
    case 'auctions':
      return <AuctionsGridSkeleton count={count} columns={columns} />;
    case 'cars':
    case 'marketplace':
    case 'favorites':
      return <CarsGridSkeleton count={count} columns={columns} />;
    case 'showrooms':
      return <ShowroomsGridSkeleton count={count} columns={columns} />;
    case 'transport':
      return <TransportGridSkeleton count={count} columns={columns} />;
    case 'messages':
      return <MessagesListSkeleton count={count} />;
    case 'notifications':
      return <NotificationsListSkeleton count={count} />;
    case 'users':
      return <UsersListSkeleton count={count} />;
    case 'yards':
    case 'companies':
      return <ShowroomsGridSkeleton count={count} columns={columns} />;
    default:
      return <CarsGridSkeleton count={count} columns={columns} />;
  }
};

// ============================================
// Default Empty Messages
// ============================================

const defaultEmptyMessages: Record<ContentType, string> = {
  auctions: 'لا توجد مزادات متاحة حالياً',
  cars: 'لا توجد سيارات متاحة حالياً',
  marketplace: 'لا توجد إعلانات متاحة حالياً',
  showrooms: 'لا توجد معارض متاحة حالياً',
  transport: 'لا توجد خدمات نقل متاحة حالياً',
  messages: 'لا توجد رسائل',
  notifications: 'لا توجد إشعارات',
  users: 'لا يوجد مستخدمين',
  favorites: 'لا توجد عناصر في المفضلة',
  yards: 'لا توجد ساحات متاحة حالياً',
  companies: 'لا توجد شركات متاحة حالياً',
  custom: 'لا توجد بيانات',
};

// ============================================
// Default Empty Icons
// ============================================

const defaultEmptyIcons: Record<ContentType, ReactNode> = {
  auctions: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  cars: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  ),
  marketplace: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  ),
  showrooms: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  ),
  transport: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  ),
  messages: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  ),
  notifications: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  ),
  users: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  favorites: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  ),
  yards: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  ),
  companies: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  ),
  custom: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  ),
};

// ============================================
// Main Component
// ============================================

export const PageContentWrapper: React.FC<PageContentWrapperProps> = ({
  isLoading,
  isError = false,
  errorMessage = 'حدث خطأ أثناء تحميل البيانات',
  isEmpty = false,
  emptyMessage,
  emptyIcon,
  contentType = 'custom',
  skeletonCount = 6,
  columns = 4,
  customSkeleton,
  children,
  className = '',
  showRetry = true,
  onRetry,
}) => {
  // حالة التحميل
  if (isLoading) {
    if (customSkeleton) {
      return <div className={className}>{customSkeleton}</div>;
    }
    return (
      <div className={className}>{renderGridSkeleton(contentType, skeletonCount, columns)}</div>
    );
  }

  // حالة الخطأ
  if (isError) {
    return (
      <div className={className}>
        <ErrorState message={errorMessage} onRetry={showRetry ? onRetry : undefined} />
      </div>
    );
  }

  // حالة البيانات الفارغة
  if (isEmpty) {
    return (
      <div className={className}>
        <EmptyState
          message={emptyMessage || defaultEmptyMessages[contentType]}
          icon={emptyIcon || defaultEmptyIcons[contentType]}
        />
      </div>
    );
  }

  // المحتوى العادي
  return <div className={className}>{children}</div>;
};

// ============================================
// Exports
// ============================================

export { EmptyState, ErrorState };
export default PageContentWrapper;
