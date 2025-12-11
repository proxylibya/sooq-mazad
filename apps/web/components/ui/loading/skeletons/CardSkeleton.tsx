/**
 * CardSkeleton - Skeletons للبطاقات
 * نظام التحميل العالمي الموحد - سوق مزاد
 *
 * @description مكونات Skeleton لمختلف أنواع البطاقات
 * @version 2.0.0
 */

import React from 'react';
import SkeletonBase, {
  SkeletonAvatar,
  SkeletonBadge,
  SkeletonButton,
  SkeletonImage,
  SkeletonText,
  SkeletonTitle,
  SkeletonVariant,
} from './SkeletonBase';

// ============================================
// Types
// ============================================

export interface CardSkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}

// ============================================
// بطاقة مزاد (Auction Card Skeleton)
// ============================================

export const AuctionCardSkeleton: React.FC<CardSkeletonProps> = ({
  variant = 'shimmer',
  className = '',
}) => (
  <div
    className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
    dir="rtl"
  >
    {/* قسم الصورة */}
    <div className="relative">
      <SkeletonImage height={200} variant={variant} className="rounded-t-xl" />

      {/* شارة الحالة */}
      <div className="absolute right-3 top-3">
        <SkeletonBadge width={80} variant={variant} />
      </div>

      {/* عداد الصور */}
      <div className="absolute bottom-3 left-3">
        <SkeletonBase width={50} height={24} shape="pill" variant={variant} />
      </div>
    </div>

    {/* قسم المحتوى */}
    <div className="space-y-4 p-4">
      {/* العنوان */}
      <SkeletonTitle width="85%" size="md" variant={variant} />

      {/* معلومات السيارة */}
      <div className="flex flex-wrap gap-2">
        <SkeletonBase width={60} height={20} shape="rounded" variant={variant} />
        <SkeletonBase width={50} height={20} shape="rounded" variant={variant} />
        <SkeletonBase width={70} height={20} shape="rounded" variant={variant} />
      </div>

      {/* الموقع */}
      <div className="flex items-center gap-2">
        <SkeletonBase width={16} height={16} shape="circle" variant={variant} />
        <SkeletonBase width={100} height={16} variant={variant} />
      </div>

      {/* قسم السعر */}
      <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
        <div className="space-y-2 text-center">
          <SkeletonBase width={80} height={14} variant={variant} className="mx-auto" />
          <SkeletonBase width={120} height={32} variant={variant} className="mx-auto" />
          <SkeletonBase width={60} height={14} variant={variant} className="mx-auto" />
        </div>
      </div>

      {/* أزرار التفاعل */}
      <div className="flex gap-2 border-t border-gray-100 pt-4">
        <SkeletonButton width="25%" height={40} variant={variant} />
        <SkeletonButton width="25%" height={40} variant={variant} />
        <SkeletonButton width="25%" height={40} variant={variant} />
        <SkeletonButton width="25%" height={40} variant={variant} />
      </div>
    </div>
  </div>
);

// ============================================
// بطاقة سيارة (Car Card Skeleton)
// ============================================

export const CarCardSkeleton: React.FC<CardSkeletonProps> = ({
  variant = 'shimmer',
  className = '',
}) => (
  <div
    className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
    dir="rtl"
  >
    {/* قسم الصورة */}
    <div className="relative">
      <SkeletonImage height={180} variant={variant} />

      {/* شارة مميز */}
      <div className="absolute left-3 top-3">
        <SkeletonBadge width={60} variant={variant} />
      </div>
    </div>

    {/* قسم المحتوى */}
    <div className="space-y-3 p-4">
      {/* العنوان */}
      <SkeletonTitle width="80%" size="md" variant={variant} />

      {/* السعر */}
      <div className="flex items-center gap-2">
        <SkeletonBase width={100} height={28} variant={variant} />
        <SkeletonBase width={40} height={20} variant={variant} />
      </div>

      {/* المواصفات */}
      <div className="flex flex-wrap gap-2">
        <SkeletonBase width={70} height={24} shape="pill" variant={variant} />
        <SkeletonBase width={60} height={24} shape="pill" variant={variant} />
        <SkeletonBase width={80} height={24} shape="pill" variant={variant} />
      </div>

      {/* الموقع والتاريخ */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <SkeletonBase width={14} height={14} shape="circle" variant={variant} />
          <SkeletonBase width={80} height={14} variant={variant} />
        </div>
        <SkeletonBase width={60} height={14} variant={variant} />
      </div>

      {/* أزرار */}
      <div className="flex gap-2 pt-2">
        <SkeletonButton width="50%" height={36} variant={variant} />
        <SkeletonButton width="50%" height={36} variant={variant} />
      </div>
    </div>
  </div>
);

// ============================================
// بطاقة مستخدم (User Card Skeleton)
// ============================================

export const UserCardSkeleton: React.FC<CardSkeletonProps> = ({
  variant = 'shimmer',
  className = '',
}) => (
  <div
    className={`flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}
    dir="rtl"
  >
    <SkeletonAvatar size={56} variant={variant} />
    <div className="flex-1 space-y-2">
      <SkeletonTitle width="60%" size="sm" variant={variant} />
      <SkeletonText lines={1} variant={variant} />
      <div className="flex gap-2">
        <SkeletonBadge width={50} variant={variant} />
        <SkeletonBadge width={70} variant={variant} />
      </div>
    </div>
  </div>
);

// ============================================
// بطاقة معرض (Showroom Card Skeleton)
// ============================================

export const ShowroomCardSkeleton: React.FC<CardSkeletonProps> = ({
  variant = 'shimmer',
  className = '',
}) => (
  <div
    className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
    dir="rtl"
  >
    {/* صورة الغلاف */}
    <SkeletonImage height={120} variant={variant} />

    {/* المحتوى */}
    <div className="relative px-4 pb-4">
      {/* صورة المعرض */}
      <div className="-mt-10 mb-3">
        <SkeletonAvatar size={80} variant={variant} className="border-4 border-white" />
      </div>

      {/* الاسم والتقييم */}
      <div className="space-y-2">
        <SkeletonTitle width="70%" size="md" variant={variant} />
        <div className="flex items-center gap-2">
          <SkeletonBase width={80} height={20} variant={variant} />
          <SkeletonBase width={40} height={20} variant={variant} />
        </div>
        <SkeletonText lines={2} variant={variant} />
      </div>

      {/* الإحصائيات */}
      <div className="mt-4 flex justify-around border-t border-gray-100 pt-4">
        <div className="text-center">
          <SkeletonBase width={30} height={24} variant={variant} className="mx-auto" />
          <SkeletonBase width={50} height={14} variant={variant} className="mx-auto mt-1" />
        </div>
        <div className="text-center">
          <SkeletonBase width={30} height={24} variant={variant} className="mx-auto" />
          <SkeletonBase width={50} height={14} variant={variant} className="mx-auto mt-1" />
        </div>
        <div className="text-center">
          <SkeletonBase width={30} height={24} variant={variant} className="mx-auto" />
          <SkeletonBase width={50} height={14} variant={variant} className="mx-auto mt-1" />
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// بطاقة رسالة (Message Card Skeleton)
// ============================================

export const MessageCardSkeleton: React.FC<CardSkeletonProps> = ({
  variant = 'shimmer',
  className = '',
}) => (
  <div
    className={`flex items-start gap-3 rounded-lg border-b border-gray-100 p-4 ${className}`}
    dir="rtl"
  >
    <SkeletonAvatar size={48} variant={variant} />
    <div className="flex-1 space-y-2">
      <div className="flex items-center justify-between">
        <SkeletonTitle width="40%" size="sm" variant={variant} />
        <SkeletonBase width={50} height={14} variant={variant} />
      </div>
      <SkeletonText lines={2} variant={variant} />
    </div>
  </div>
);

// ============================================
// بطاقة إشعار (Notification Card Skeleton)
// ============================================

export const NotificationCardSkeleton: React.FC<CardSkeletonProps> = ({
  variant = 'shimmer',
  className = '',
}) => (
  <div className={`flex items-start gap-3 rounded-lg bg-gray-50 p-3 ${className}`} dir="rtl">
    <SkeletonBase width={40} height={40} shape="rounded" variant={variant} />
    <div className="flex-1 space-y-2">
      <SkeletonTitle width="70%" size="sm" variant={variant} />
      <SkeletonText lines={1} variant={variant} />
      <SkeletonBase width={80} height={12} variant={variant} />
    </div>
  </div>
);

// ============================================
// بطاقة نقل (Transport Card Skeleton)
// ============================================

export const TransportCardSkeleton: React.FC<CardSkeletonProps> = ({
  variant = 'shimmer',
  className = '',
}) => (
  <div
    className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
    dir="rtl"
  >
    <SkeletonImage height={160} variant={variant} />
    <div className="space-y-3 p-4">
      <SkeletonTitle width="75%" size="md" variant={variant} />
      <div className="flex items-center gap-2">
        <SkeletonBase width={16} height={16} shape="circle" variant={variant} />
        <SkeletonBase width={120} height={16} variant={variant} />
      </div>
      <div className="flex flex-wrap gap-2">
        <SkeletonBadge width={70} variant={variant} />
        <SkeletonBadge width={60} variant={variant} />
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <SkeletonBase width={80} height={24} variant={variant} />
        <SkeletonButton width={100} height={36} variant={variant} />
      </div>
    </div>
  </div>
);

// ============================================
// تصدير افتراضي
// ============================================

export default {
  Auction: AuctionCardSkeleton,
  Car: CarCardSkeleton,
  User: UserCardSkeleton,
  Showroom: ShowroomCardSkeleton,
  Message: MessageCardSkeleton,
  Notification: NotificationCardSkeleton,
  Transport: TransportCardSkeleton,
};
