/**
 * مكون Skeleton Loader للتوافقية العكسية
 * ⚠️ هذا الملف هو wrapper للتوافقية العكسية
 * يُرجى استخدام المكونات من '@/components/ui/loading' مباشرة
 *
 * @deprecated استخدم الاستيراد من '@/components/ui/loading' بدلاً من هذا الملف
 */

import React from 'react';
import { CarCardSkeleton } from './loading/skeletons/CardSkeleton';
import { SkeletonAvatar, SkeletonText, SkeletonTitle } from './loading/skeletons/SkeletonBase';

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'profile' | 'dashboard' | 'form';
  lines?: number;
  className?: string;
}

/**
 * مكون Skeleton Loader - يستخدم النظام الموحد داخلياً
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'text',
  lines = 3,
  className = '',
}) => {
  switch (type) {
    case 'profile':
      return (
        <div className={`space-y-4 ${className}`} dir="rtl">
          <div className="flex items-center gap-4">
            <SkeletonAvatar size={48} />
            <div className="space-y-2">
              <SkeletonTitle width="6rem" size="sm" />
              <SkeletonText lines={1} />
            </div>
          </div>
          <SkeletonText lines={2} />
        </div>
      );

    case 'card':
      return (
        <div className={className}>
          <CarCardSkeleton />
        </div>
      );

    case 'dashboard':
      return (
        <div className={`space-y-6 ${className}`} dir="rtl">
          <SkeletonTitle width="12rem" size="lg" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border bg-white p-6">
                <SkeletonTitle width="5rem" size="sm" className="mb-2" />
                <SkeletonTitle width="4rem" size="md" />
              </div>
            ))}
          </div>
          <div className="rounded-lg border bg-white">
            <div className="border-b p-4">
              <SkeletonTitle width="8rem" size="sm" />
            </div>
            <div className="divide-y">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <SkeletonAvatar size={32} />
                    <div className="space-y-1">
                      <SkeletonTitle width="6rem" size="sm" />
                      <SkeletonText lines={1} />
                    </div>
                  </div>
                  <SkeletonTitle width="5rem" size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'form':
      return (
        <div className={`space-y-4 ${className}`} dir="rtl">
          <SkeletonTitle width="8rem" size="md" />
          <div className="space-y-4">
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} className="space-y-2">
                <SkeletonTitle width="5rem" size="sm" />
                <div className="h-10 w-full animate-pulse rounded-md border bg-gray-200" />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <div className="h-10 w-20 animate-pulse rounded-md bg-gray-200" />
            <div className="h-10 w-16 animate-pulse rounded-md bg-gray-200" />
          </div>
        </div>
      );

    case 'text':
    default:
      return (
        <div className={className} dir="rtl">
          <SkeletonText lines={lines} />
        </div>
      );
  }
};

/**
 * مكونات Skeleton مخصصة للاستخدام السريع
 */
export const AdminDashboardSkeleton: React.FC = () => (
  <SkeletonLoader type="dashboard" className="p-6" />
);

export const AdminProfileSkeleton: React.FC = () => (
  <SkeletonLoader type="profile" className="rounded-lg bg-white p-6 shadow" />
);

export default SkeletonLoader;
