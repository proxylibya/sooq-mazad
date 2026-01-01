import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Card } from './ui/card';
import { Button } from './ui/button';
import UserAvatar from './UserAvatar';
import { useSellerActions } from '../hooks/useSellerActions';
import { quickDecodeName } from '../utils/universalNameDecoder';
import { cn } from '../lib/utils';
import {
  UserIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { convertSpecificText } from '../utils/numberConverter';
// تم إزالة عرض رقم الهاتف الثابت من البطاقة
import RatingCard from './common/RatingCard';

interface SellerStats {
  totalListings?: number;
  activeListings?: number;
  totalViews?: number;
  successfulDeals?: number;
  responseRate?: string;
  avgResponseTime?: string;
}

interface SellerData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  profileImage?: string;
  verified: boolean;
  accountType?: string;
  rating?: number;
  reviewsCount?: number;
  city?: string;
  memberSince?: string;
  createdAt?: string;
  stats?: SellerStats;
  description?: string;
  isOnline?: boolean;
}

interface SellerInfoCardProps {
  seller: SellerData;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  showStats?: boolean;
  onContact?: () => void;
  onMessage?: () => void;
  onViewProfile?: () => void;
}

const SellerInfoCard: React.FC<SellerInfoCardProps> = ({
  seller,
  className = '',
  variant = 'default',
  showActions = true,
  showStats: _showStats = true,
  onContact,
  onMessage,
  onViewProfile,
}) => {
  const _router = useRouter();
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ show: false, message: '', type: 'info' });

  // استخدام hook للتعامل مع إجراءات البائع
  const {
    isLoading,
    handleContact: defaultHandleContact,
    handleMessage: defaultHandleMessage,
    handleViewProfile: defaultHandleViewProfile,
  } = useSellerActions({
    sellerId: seller.id,
    sellerName: quickDecodeName(seller.name),
    sellerPhone: seller.phone,
    onContactSuccess: () => {
      setNotification({
        show: true,
        message: 'تم فتح تطبيق الهاتف',
        type: 'success',
      });
      setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 3000);
    },
    onContactError: (error) => {
      setNotification({
        show: true,
        message: error,
        type: 'error',
      });
      setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 3000);
    },
    onMessageSuccess: () => {
      setNotification({
        show: true,
        message: 'تم فتح المحادثة',
        type: 'success',
      });
      setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 3000);
    },
    onMessageError: (error) => {
      setNotification({
        show: true,
        message: error,
        type: 'error',
      });
      setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 3000);
    },
  });

  // تنسيق تاريخ الانضمام
  const formatMemberSince = (date: string | undefined) => {
    if (!date) return 'غير محدد';
    try {
      const memberDate = new Date(date);
      const year = memberDate.getFullYear().toString();
      const monthNames = [
        'يناير',
        'فبراير',
        'مارس',
        'أبريل',
        'مايو',
        'يونيو',
        'يوليو',
        'أغسطس',
        'سبتمبر',
        'أكتوبر',
        'نوفمبر',
        'ديسمبر',
      ];
      const month = monthNames[memberDate.getMonth()];
      const result = `${month} ${year}`;
      // تطبيق تحويل الأرقام الهندية إلى عادية
      return convertSpecificText(result);
    } catch {
      return convertSpecificText(date || 'غير محدد');
    }
  };

  // تنسيق التقييم
  const renderRating = (rating: number = 0, reviewsCount: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarSolid key={i} className="h-4 w-4 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="h-4 w-4 text-gray-300" />
            <StarSolid className="clip-path-half absolute inset-0 h-4 w-4 text-yellow-400" />
          </div>,
        );
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-gray-300" />);
      }
    }

    return (
      <div className="flex items-center gap-1">
        <div className="flex">{stars}</div>
        <span className="text-sm text-gray-600">
          ({rating.toFixed(1)}) {reviewsCount > 0 && `• ${reviewsCount} تقييم`}
        </span>
      </div>
    );
  };

  // معالجة الاتصال
  const handleContact = async () => {
    if (onContact) {
      onContact();
      return;
    }
    defaultHandleContact();
  };

  // معالجة الرسائل
  const handleMessage = async () => {
    if (onMessage) {
      onMessage();
      return;
    }
    await defaultHandleMessage();
  };

  // معالجة عرض الملف الشخصي
  const handleViewProfile = async () => {
    if (onViewProfile) {
      onViewProfile();
      return;
    }
    await defaultHandleViewProfile();
  };

  // التصميم المضغوط
  if (variant === 'compact') {
    return (
      <div className="relative">
        {/* إشعار */}
        {notification.show && (
          <div
            className={`fixed left-1/2 top-20 z-50 -translate-x-1/2 transform rounded-lg px-6 py-3 shadow-lg ${
              notification.type === 'success'
                ? 'bg-green-500 text-white'
                : notification.type === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-blue-500 text-white'
            }`}
          >
            {notification.message}
          </div>
        )}

        <Card
          className={cn(
            'seller-info-card cursor-pointer p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg',
            className,
          )}
          onClick={handleViewProfile}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <UserAvatar
                src={seller.profileImage}
                alt={quickDecodeName(seller.name)}
                size="md"
                showVerificationBadge={true}
                isVerified={seller.verified}
                accountType={seller.accountType}
              />
              {seller.isOnline && (
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500 shadow-sm"></div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-semibold text-gray-900">{quickDecodeName(seller.name)}</h3>
                {seller.verified && (
                  <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-green-600" />
                )}
              </div>

              {seller.rating && seller.rating > 0 && (
                <div className="mt-1 flex items-center gap-1">
                  <StarSolid className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs text-gray-600">
                    {seller.rating.toFixed(1)}{' '}
                    {(seller.reviewsCount || 0) > 0 && `(${seller.reviewsCount || 0})`}
                  </span>
                </div>
              )}
            </div>

            {showActions && (
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContact();
                  }}
                  className="seller-action-button p-2"
                  title="اتصال"
                >
                  <PhoneIcon className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMessage();
                  }}
                  disabled={isLoading}
                  className="seller-action-button p-2"
                  title="رسالة"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // التصميم الافتراضي والمفصل
  return (
    <div className="relative">
      {/* إشعار */}
      {notification.show && (
        <div
          className={`fixed left-1/2 top-20 z-50 -translate-x-1/2 transform rounded-lg px-6 py-3 shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : notification.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      <Card
        className={cn(
          'seller-info-card cursor-pointer p-6 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg',
          className,
        )}
        onClick={handleViewProfile}
      >
        <div className="space-y-4">
          {/* رأس البطاقة */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <UserAvatar
                src={seller.profileImage}
                alt={quickDecodeName(seller.name)}
                size="lg"
                showVerificationBadge={true}
                isVerified={seller.verified}
                accountType={seller.accountType}
              />
              {seller.isOnline && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 shadow-sm"></div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h3 className="truncate text-lg font-semibold text-gray-900">{quickDecodeName(seller.name)}</h3>
                {seller.verified && (
                  <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 shadow-sm">
                    <CheckCircleIcon className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-800">موثق</span>
                  </div>
                )}
              </div>

              <div className="mb-2 text-sm text-gray-500">
                {seller.accountType === 'DEALER' ? 'تاجر معتمد في المنصة' : 'بائع في المنصة'}
              </div>

              {seller.rating && seller.rating > 0 ? (
                <div className="mb-2">{renderRating(seller.rating, seller.reviewsCount)}</div>
              ) : (
                <div className="mb-2">
                  <RatingCard userId={seller.id} itemId={seller.id} itemType="company" size="sm" showText />
                </div>
              )}

              {seller.city && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <span>{seller.city}</span>
                </div>
              )}
            </div>
          </div>

          {/* معلومات إضافية */}
          {variant === 'detailed' && (
            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 py-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  عضو منذ {formatMemberSince(seller.createdAt || seller.memberSince)}
                </span>
              </div>

              {seller.stats?.responseRate && (
                <div className="flex items-center gap-2 text-sm">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">معدل الرد: {seller.stats.responseRate}</span>
                </div>
              )}

              {seller.stats?.activeListings !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <BuildingStorefrontIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{seller.stats.activeListings} إعلان نشط</span>
                </div>
              )}

              {seller.stats?.totalViews && (
                <div className="flex items-center gap-2 text-sm">
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {seller.stats.totalViews.toLocaleString()} مشاهدة
                  </span>
                </div>
              )}
            </div>
          )}

          {/* تمت إزالة قسم معلومات التواصل لتوحيد البطاقات */}

          {/* أزرار الإجراءات */}
          {showActions && (
            <div className="flex gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContact();
                }}
                className="seller-action-button flex-1"
                variant="outline"
                title="اتصال بالبائع"
              >
                <PhoneIcon className="ml-2 h-4 w-4" />
                اتصال
              </Button>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMessage();
                }}
                disabled={isLoading}
                className="seller-action-button flex-1"
                title="إرسال رسالة"
              >
                <ChatBubbleLeftRightIcon className="ml-2 h-4 w-4" />
                رسالة
              </Button>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewProfile();
                }}
                disabled={isLoading}
                variant="outline"
                className="seller-action-button px-4"
                title="عرض الملف الشخصي"
              >
                <UserIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SellerInfoCard;
