/**
 * PageSkeleton - Skeletons للصفحات الكاملة
 * نظام التحميل العالمي الموحد - سوق مزاد
 *
 * @description مكونات Skeleton للصفحات المختلفة
 * @version 2.0.0
 */

import React from 'react';
import { AuctionsGridSkeleton, CarsGridSkeleton } from './GridSkeleton';
import SkeletonBase, {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonImage,
  SkeletonText,
  SkeletonTitle,
  SkeletonVariant,
} from './SkeletonBase';

// ============================================
// Types
// ============================================

export interface PageSkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}

// ============================================
// صفحة تفاصيل المزاد (Auction Details Skeleton)
// ============================================

export const AuctionDetailsSkeleton: React.FC<PageSkeletonProps> = ({
  variant = 'shimmer',
  className = '',
}) => (
  <div className={`container mx-auto px-4 py-6 ${className}`} dir="rtl">
    {/* شريط التنقل */}
    <div className="mb-6 flex items-center gap-2">
      <SkeletonBase width={60} height={20} variant={variant} />
      <SkeletonBase width={20} height={20} variant={variant} />
      <SkeletonBase width={80} height={20} variant={variant} />
      <SkeletonBase width={20} height={20} variant={variant} />
      <SkeletonBase width={120} height={20} variant={variant} />
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* العمود الأيسر - المحتوى الرئيسي */}
      <div className="space-y-6 lg:col-span-2">
        {/* معرض الصور */}
        <div className="overflow-hidden rounded-xl">
          <SkeletonImage height={400} variant={variant} />
          <div className="mt-4 flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonImage key={i} width={80} height={60} variant={variant} />
            ))}
          </div>
        </div>

        {/* تفاصيل السيارة */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <SkeletonTitle width="70%" size="xl" variant={variant} />
          <div className="mt-4 space-y-4">
            <SkeletonText lines={3} variant={variant} />

            {/* المواصفات */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-lg bg-gray-50 p-3">
                  <SkeletonBase width="60%" height={14} variant={variant} />
                  <SkeletonBase width="80%" height={20} variant={variant} className="mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* معلومات البائع */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <SkeletonAvatar size={64} variant={variant} />
            <div className="flex-1 space-y-2">
              <SkeletonTitle width="40%" size="md" variant={variant} />
              <SkeletonBase width={100} height={20} variant={variant} />
            </div>
            <SkeletonButton width={120} height={44} variant={variant} />
          </div>
        </div>
      </div>

      {/* العمود الأيمن - العداد والمزايدة */}
      <div className="space-y-4">
        {/* عداد المزاد */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* الدائرة */}
            <div className="relative h-56 w-56">
              <SkeletonBase width={224} height={224} shape="circle" variant={variant} />
            </div>

            {/* معلومات المزايدة */}
            <div className="w-full space-y-3 rounded-lg border border-gray-100 p-4">
              <div className="grid grid-cols-2 gap-2">
                <SkeletonBase height={50} variant={variant} />
                <SkeletonBase height={50} variant={variant} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <SkeletonButton height={40} variant={variant} />
                <SkeletonButton height={40} variant={variant} />
                <SkeletonButton height={40} variant={variant} />
              </div>
              <SkeletonBase height={44} variant={variant} />
              <div className="grid grid-cols-2 gap-2">
                <SkeletonButton height={44} variant={variant} />
                <SkeletonButton height={44} variant={variant} />
              </div>
            </div>
          </div>
        </div>

        {/* قائمة المزايدين */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <SkeletonTitle width="40%" size="sm" variant={variant} className="mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonAvatar size={36} variant={variant} />
                <div className="flex-1">
                  <SkeletonBase width="60%" height={16} variant={variant} />
                  <SkeletonBase width="40%" height={14} variant={variant} className="mt-1" />
                </div>
                <SkeletonBase width={70} height={20} variant={variant} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// صفحة قائمة المزادات (Auctions List Skeleton)
// ============================================

export const AuctionsListPageSkeleton: React.FC<PageSkeletonProps> = ({
  variant = 'shimmer',
  className = '',
}) => (
  <div className={`container mx-auto px-4 py-6 ${className}`} dir="rtl">
    {/* العنوان والفلاتر */}
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <SkeletonTitle width={200} size="xl" variant={variant} />
      <div className="flex gap-2">
        <SkeletonButton width={100} height={40} variant={variant} />
        <SkeletonButton width={100} height={40} variant={variant} />
        <SkeletonButton width={120} height={40} variant={variant} />
      </div>
    </div>

    {/* شريط الفلاتر */}
    <div className="mb-6 flex flex-wrap gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonBase key={i} width={120} height={40} shape="rounded" variant={variant} />
      ))}
    </div>

    {/* شبكة المزادات */}
    <AuctionsGridSkeleton count={9} columns={3} variant={variant} />

    {/* الترقيم */}
    <div className="mt-8 flex justify-center gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonBase key={i} width={40} height={40} shape="rounded" variant={variant} />
      ))}
    </div>
  </div>
);

// ============================================
// صفحة السوق (Marketplace Skeleton)
// ============================================

export const MarketplacePageSkeleton: React.FC<PageSkeletonProps> = ({
  variant = 'shimmer',
  className = '',
}) => (
  <div className={`container mx-auto px-4 py-6 ${className}`} dir="rtl">
    {/* شريط البحث */}
    <div className="mb-6">
      <SkeletonBase height={50} variant={variant} className="rounded-xl" />
    </div>

    {/* الفلاتر */}
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonBase key={i} height={44} variant={variant} className="rounded-lg" />
      ))}
    </div>

    {/* العنوان وعدد النتائج */}
    <div className="mb-4 flex items-center justify-between">
      <SkeletonTitle width={150} size="lg" variant={variant} />
      <SkeletonBase width={100} height={24} variant={variant} />
    </div>

    {/* شبكة السيارات */}
    <CarsGridSkeleton count={12} columns={4} variant={variant} />

    {/* تحميل المزيد */}
    <div className="mt-8 flex justify-center">
      <SkeletonButton width={150} height={44} variant={variant} />
    </div>
  </div>
);

// ============================================
// صفحة الملف الشخصي (Profile Skeleton)
// ============================================

export const ProfilePageSkeleton: React.FC<PageSkeletonProps> = ({
  variant = 'shimmer',
  className = '',
}) => (
  <div className={`container mx-auto px-4 py-6 ${className}`} dir="rtl">
    {/* غلاف الملف الشخصي */}
    <div className="relative mb-20 h-48 overflow-hidden rounded-xl md:h-64">
      <SkeletonImage height="100%" variant={variant} />

      {/* الصورة الشخصية */}
      <div className="absolute -bottom-16 right-6">
        <SkeletonAvatar size={128} variant={variant} className="border-4 border-white" />
      </div>
    </div>

    {/* معلومات المستخدم */}
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <SkeletonTitle width={200} size="xl" variant={variant} />
        <SkeletonText lines={2} variant={variant} />
        <div className="flex gap-4">
          <SkeletonBase width={100} height={20} variant={variant} />
          <SkeletonBase width={120} height={20} variant={variant} />
        </div>
      </div>
      <div className="flex gap-2">
        <SkeletonButton width={120} height={44} variant={variant} />
        <SkeletonButton width={120} height={44} variant={variant} />
      </div>
    </div>

    {/* الإحصائيات */}
    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <SkeletonBase width={50} height={32} variant={variant} className="mx-auto" />
          <SkeletonBase width={80} height={16} variant={variant} className="mx-auto mt-2" />
        </div>
      ))}
    </div>

    {/* التبويبات */}
    <div className="mb-6 flex gap-4 border-b border-gray-200">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonBase key={i} width={80} height={40} variant={variant} />
      ))}
    </div>

    {/* المحتوى */}
    <CarsGridSkeleton count={8} columns={4} variant={variant} />
  </div>
);

// ============================================
// صفحة الرسائل (Messages Page Skeleton)
// ============================================

export const MessagesPageSkeleton: React.FC<PageSkeletonProps> = ({
  variant = 'shimmer',
  className = '',
}) => (
  <div className={`flex h-[calc(100vh-64px)] ${className}`} dir="rtl">
    {/* قائمة المحادثات */}
    <div className="w-full border-l border-gray-200 bg-white md:w-80 lg:w-96">
      {/* البحث */}
      <div className="border-b border-gray-200 p-4">
        <SkeletonBase height={44} variant={variant} className="rounded-lg" />
      </div>

      {/* قائمة المحادثات */}
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <SkeletonAvatar size={48} variant={variant} />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <SkeletonBase width="60%" height={16} variant={variant} />
                <SkeletonBase width={40} height={12} variant={variant} />
              </div>
              <SkeletonBase width="80%" height={14} variant={variant} />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* منطقة المحادثة */}
    <div className="hidden flex-1 flex-col bg-gray-50 md:flex">
      {/* رأس المحادثة */}
      <div className="flex items-center gap-4 border-b border-gray-200 bg-white p-4">
        <SkeletonAvatar size={44} variant={variant} />
        <div className="flex-1 space-y-1">
          <SkeletonBase width={150} height={18} variant={variant} />
          <SkeletonBase width={80} height={14} variant={variant} />
        </div>
        <div className="flex gap-2">
          <SkeletonBase width={40} height={40} shape="circle" variant={variant} />
          <SkeletonBase width={40} height={40} shape="circle" variant={variant} />
        </div>
      </div>

      {/* الرسائل */}
      <div className="flex-1 space-y-4 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[70%] ${i % 2 === 0 ? '' : ''}`}>
              <SkeletonBase
                width={Math.random() * 150 + 100}
                height={50}
                shape="rounded"
                variant={variant}
              />
            </div>
          </div>
        ))}
      </div>

      {/* حقل الإدخال */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <SkeletonBase width={40} height={40} shape="circle" variant={variant} />
          <SkeletonBase height={44} variant={variant} className="flex-1 rounded-full" />
          <SkeletonBase width={44} height={44} shape="circle" variant={variant} />
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// صفحة المحفظة (Wallet Page Skeleton)
// ============================================

export const WalletPageSkeleton: React.FC<PageSkeletonProps> = ({
  variant = 'shimmer',
  className = '',
}) => (
  <div className={`container mx-auto px-4 py-6 ${className}`} dir="rtl">
    {/* الرصيد */}
    <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
      <SkeletonBase width={100} height={20} variant="pulse" className="bg-white/20" />
      <SkeletonBase width={180} height={48} variant="pulse" className="mt-2 bg-white/20" />
      <div className="mt-4 flex gap-3">
        <SkeletonButton width={120} height={44} variant="pulse" className="bg-white/20" />
        <SkeletonButton width={120} height={44} variant="pulse" className="bg-white/20" />
      </div>
    </div>

    {/* الإحصائيات */}
    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
          <SkeletonBase width={40} height={40} shape="rounded" variant={variant} />
          <SkeletonBase width="60%" height={24} variant={variant} className="mt-3" />
          <SkeletonBase width="40%" height={14} variant={variant} className="mt-1" />
        </div>
      ))}
    </div>

    {/* سجل المعاملات */}
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <SkeletonTitle width={150} size="md" variant={variant} />
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <SkeletonBase width={44} height={44} shape="rounded" variant={variant} />
              <div className="space-y-1">
                <SkeletonBase width={120} height={16} variant={variant} />
                <SkeletonBase width={80} height={14} variant={variant} />
              </div>
            </div>
            <div className="text-left">
              <SkeletonBase width={80} height={20} variant={variant} />
              <SkeletonBase width={60} height={14} variant={variant} className="mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ============================================
// تصدير افتراضي
// ============================================

export default {
  AuctionDetails: AuctionDetailsSkeleton,
  AuctionsList: AuctionsListPageSkeleton,
  Marketplace: MarketplacePageSkeleton,
  Profile: ProfilePageSkeleton,
  Messages: MessagesPageSkeleton,
  Wallet: WalletPageSkeleton,
};
