/**
 * GridSkeleton - Skeletons للشبكات والقوائم
 * نظام التحميل العالمي الموحد - سوق مزاد
 *
 * @description مكونات Skeleton للشبكات والقوائم المختلفة
 * @version 2.0.0
 */

import React from 'react';
import {
  AuctionCardSkeleton,
  CarCardSkeleton,
  MessageCardSkeleton,
  NotificationCardSkeleton,
  ShowroomCardSkeleton,
  TransportCardSkeleton,
  UserCardSkeleton,
} from './CardSkeleton';
import { SkeletonVariant } from './SkeletonBase';

// ============================================
// Types
// ============================================

export interface GridSkeletonProps {
  /** عدد العناصر */
  count?: number;
  /** عدد الأعمدة */
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  /** نوع التأثير */
  variant?: SkeletonVariant;
  /** كلاسات إضافية */
  className?: string;
  /** فجوة بين العناصر */
  gap?: 2 | 3 | 4 | 5 | 6 | 8;
}

// ============================================
// شبكة مزادات (Auctions Grid Skeleton)
// ============================================

export const AuctionsGridSkeleton: React.FC<GridSkeletonProps> = ({
  count = 6,
  columns = 3,
  variant = 'shimmer',
  className = '',
  gap = 4,
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  };

  return (
    <div className={`grid ${columnClasses[columns]} gap-${gap} ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <AuctionCardSkeleton key={index} variant={variant} />
      ))}
    </div>
  );
};

// ============================================
// شبكة سيارات (Cars Grid Skeleton)
// ============================================

export const CarsGridSkeleton: React.FC<GridSkeletonProps> = ({
  count = 8,
  columns = 4,
  variant = 'shimmer',
  className = '',
  gap = 4,
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  };

  return (
    <div className={`grid ${columnClasses[columns]} gap-${gap} ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <CarCardSkeleton key={index} variant={variant} />
      ))}
    </div>
  );
};

// ============================================
// شبكة معارض (Showrooms Grid Skeleton)
// ============================================

export const ShowroomsGridSkeleton: React.FC<GridSkeletonProps> = ({
  count = 4,
  columns = 4,
  variant = 'shimmer',
  className = '',
  gap = 4,
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  };

  return (
    <div className={`grid ${columnClasses[columns]} gap-${gap} ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <ShowroomCardSkeleton key={index} variant={variant} />
      ))}
    </div>
  );
};

// ============================================
// قائمة رسائل (Messages List Skeleton)
// ============================================

export const MessagesListSkeleton: React.FC<{
  count?: number;
  variant?: SkeletonVariant;
  className?: string;
}> = ({ count = 5, variant = 'shimmer', className = '' }) => (
  <div className={`divide-y divide-gray-100 ${className}`}>
    {Array.from({ length: count }).map((_, index) => (
      <MessageCardSkeleton key={index} variant={variant} />
    ))}
  </div>
);

// ============================================
// قائمة إشعارات (Notifications List Skeleton)
// ============================================

export const NotificationsListSkeleton: React.FC<{
  count?: number;
  variant?: SkeletonVariant;
  className?: string;
}> = ({ count = 4, variant = 'shimmer', className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: count }).map((_, index) => (
      <NotificationCardSkeleton key={index} variant={variant} />
    ))}
  </div>
);

// ============================================
// قائمة مستخدمين (Users List Skeleton)
// ============================================

export const UsersListSkeleton: React.FC<{
  count?: number;
  variant?: SkeletonVariant;
  className?: string;
}> = ({ count = 5, variant = 'shimmer', className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: count }).map((_, index) => (
      <UserCardSkeleton key={index} variant={variant} />
    ))}
  </div>
);

// ============================================
// شبكة خدمات النقل (Transport Grid Skeleton)
// ============================================

export const TransportGridSkeleton: React.FC<GridSkeletonProps> = ({
  count = 4,
  columns = 4,
  variant = 'shimmer',
  className = '',
  gap = 4,
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  };

  return (
    <div className={`grid ${columnClasses[columns]} gap-${gap} ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <TransportCardSkeleton key={index} variant={variant} />
      ))}
    </div>
  );
};

// ============================================
// تصدير افتراضي
// ============================================

export default {
  Auctions: AuctionsGridSkeleton,
  Cars: CarsGridSkeleton,
  Showrooms: ShowroomsGridSkeleton,
  Messages: MessagesListSkeleton,
  Notifications: NotificationsListSkeleton,
  Users: UsersListSkeleton,
  Transport: TransportGridSkeleton,
};
