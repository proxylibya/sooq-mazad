import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React from 'react';
import { cn } from '../lib/utils';
import UserAvatar from './UserAvatar';
import RatingCard from './common/RatingCard';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface ImprovedSellerData {
  id?: string;
  name: string;
  phone: string;
  profileImage?: string;
  verified?: boolean;
  accountType?: string;
  rating?: number;
  reviewsCount?: number;
  city?: string;
  activeListings?: number;
}

interface ImprovedSellerInfoCardProps {
  seller: ImprovedSellerData;
  className?: string;
  showActions?: boolean;
  clickable?: boolean;
  onContact?: () => void;
  onMessage?: () => void;
  onViewProfile?: () => void;
  onPhoneClick?: () => void;
}

const ImprovedSellerInfoCard: React.FC<ImprovedSellerInfoCardProps> = ({
  seller,
  className = '',
  showActions = true,
  clickable = false,
  onContact: _onContact,
  onMessage,
  onViewProfile,
  onPhoneClick: _onPhoneClick,
}) => {
  // معالجة الرسائل
  const handleMessage = () => {
    if (onMessage) {
      onMessage();
      return;
    }
  };

  // معالجة عرض الملف الشخصي
  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile();
      return;
    }
    if (seller.id) {
      // ترميز الاسم للتعامل مع الأحرف العربية والمسافات في URL
      const sellerIdentifier = seller.name ? encodeURIComponent(seller.name) : seller.id;
      window.location.href = `/seller/${sellerIdentifier}`;
    }
  };

  // تنسيق التقييم المحسن - بدون أرقام صفر غير مرغوب فيها
  const renderRating = (rating?: number, reviewsCount?: number) => {
    // إذا لم يكن هناك تقييم أو كان صفر، لا تعرض شيئاً
    if (!rating || rating === 0) return null;

    const stars: React.ReactElement[] = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarSolid key={i} className="h-4 w-4 text-yellow-400" />);
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-gray-300" />);
      }
    }

    return (
      <div className="flex items-center gap-1">
        <div className="flex">{stars}</div>
        <span className="text-sm text-gray-600">
          ({rating.toFixed(1)}){reviewsCount && reviewsCount > 0 && ` • ${reviewsCount} تقييم`}
        </span>
      </div>
    );
  };

  return (
    <Card
      className={cn(
        'seller-info-card p-6 transition-all duration-200',
        clickable && 'cursor-pointer hover:scale-[1.02] hover:border-blue-300 hover:shadow-lg',
        className,
      )}
      onClick={clickable ? handleViewProfile : undefined}
      role="button"
      tabIndex={clickable ? 0 : -1}
      aria-label={`عرض ملف البائع ${seller.name}`}
    >
      <div className="space-y-4">
        {/* معلومات البائع الأساسية */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <UserAvatar
              src={seller.profileImage}
              alt={seller.name}
              size="lg"
              accountType={seller.accountType}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-gray-900">{seller.name}</h3>
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

            {/* عرض التقييم */}
            {seller.rating && seller.rating > 0 ? (
              <div className="mb-2">{renderRating(seller.rating, seller.reviewsCount)}</div>
            ) : seller.id ? (
              <div className="mb-2">
                <RatingCard
                  userId={seller.id}
                  itemId={seller.id}
                  itemType="company"
                  size="sm"
                  showText
                />
              </div>
            ) : null}

            <div className="flex items-center gap-4 text-sm text-gray-600">
              {seller.city && (
                <div className="flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <span>{seller.city}</span>
                </div>
              )}

              {/* عرض عدد الإعلانات فقط إذا كان أكبر من صفر */}
              {seller.activeListings !== undefined && seller.activeListings > 0 && (
                <div className="flex items-center gap-1">
                  <BuildingStorefrontIcon className="h-4 w-4 text-gray-400" />
                  <span>{seller.activeListings} إعلان نشط</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        {showActions && (
          <div className="flex gap-3 pt-2">
            <Button
              size="sm"
              onClick={handleMessage}
              className="seller-action-button flex-1 px-4 py-2.5"
              title="إرسال رسالة"
              aria-label={`إرسال رسالة إلى البائع ${seller.name}`}
            >
              <ChatBubbleLeftRightIcon className="ml-2 h-4 w-4" />
              رسالة
            </Button>

            <Link href={`/seller/${encodeURIComponent(seller.name)}`}>
              <Button
                variant="outline"
                size="sm"
                className="seller-action-button px-4 py-2.5"
                title="عرض الملف الشخصي"
                aria-label={`عرض ملف البائع ${seller.name}`}
              >
                عرض الملف
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ImprovedSellerInfoCard;
