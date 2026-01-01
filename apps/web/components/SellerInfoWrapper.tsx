import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';

import React from 'react';
import SellerInfoCard from './SellerInfoCard';
import useSellerData from '../hooks/useSellerData';
import { Card } from './ui/card';
import { cn } from '../lib/utils';

interface SellerInfoWrapperProps {
  sellerId: string;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  showStats?: boolean;
  onContact?: () => void;
  onMessage?: () => void;
  onViewProfile?: () => void;
}

const SellerInfoWrapper: React.FC<SellerInfoWrapperProps> = ({
  sellerId,
  className = '',
  variant = 'default',
  showActions = true,
  showStats = true,
  onContact,
  onMessage,
  onViewProfile,
}) => {
  const { seller, loading, error, refetch } = useSellerData(sellerId);

  // حالة التحميل
  if (loading) {
    return (
      <Card className={cn('animate-pulse p-6', className)}>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200"></div>
              <div className="h-3 w-2/3 rounded bg-gray-200"></div>
            </div>
          </div>

          {variant === 'detailed' && (
            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 py-4">
              <div className="h-3 rounded bg-gray-200"></div>
              <div className="h-3 rounded bg-gray-200"></div>
              <div className="h-3 rounded bg-gray-200"></div>
              <div className="h-3 rounded bg-gray-200"></div>
            </div>
          )}

          <div className="rounded-lg bg-gray-100 p-4">
            <div className="mb-2 h-3 w-1/3 rounded bg-gray-200"></div>
            <div className="mb-2 h-4 w-2/3 rounded bg-gray-200"></div>
            <div className="h-2 w-1/2 rounded bg-gray-200"></div>
          </div>

          {showActions && (
            <div className="flex gap-3 pt-2">
              <div className="h-10 flex-1 rounded bg-gray-200"></div>
              <div className="h-10 flex-1 rounded bg-gray-200"></div>
              <div className="h-10 w-16 rounded bg-gray-200"></div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // حالة الخطأ
  if (error) {
    return (
      <Card className={cn('border-red-200 bg-red-50 p-6', className)}>
        <div className="text-center">
          <div className="mb-4 text-4xl text-red-400">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-red-800">خطأ في تحميل بيانات البائع</h3>
          <p className="mb-4 text-sm text-red-600">{error}</p>
          <button
            onClick={refetch}
            className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </Card>
    );
  }

  // عدم وجود بيانات
  if (!seller) {
    return (
      <Card className={cn('border-gray-200 bg-gray-50 p-6', className)}>
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center text-gray-400">
            <UserIcon className="h-10 w-10" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-800">البائع غير موجود</h3>
          <p className="text-sm text-gray-600">لم يتم العثور على بيانات البائع المطلوب</p>
        </div>
      </Card>
    );
  }

  // عرض المكون مع البيانات
  return (
    <SellerInfoCard
      seller={seller}
      className={className}
      variant={variant}
      showActions={showActions}
      showStats={showStats}
      onContact={onContact}
      onMessage={onMessage}
      onViewProfile={onViewProfile}
    />
  );
};

export default SellerInfoWrapper;
