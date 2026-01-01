import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React from 'react';
import { cn } from '../lib/utils';
import { quickDecodeName } from '../utils/universalNameDecoder';
import UserAvatar from './UserAvatar';
import RatingCard from './common/RatingCard';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface SimpleSellerData {
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

interface SellerInfoSimpleProps {
  seller: SimpleSellerData;
  className?: string;
  showActions?: boolean;
  onContact?: () => void;
  onMessage?: () => void;
  onViewProfile?: () => void;
  onPhoneClick?: () => void;
  clickable?: boolean;
}

const SellerInfoSimple: React.FC<SellerInfoSimpleProps> = ({
  seller,
  className = '',
  showActions = true,
  onContact,
  onMessage,
  onViewProfile,
  onPhoneClick: _onPhoneClick,
  clickable = true,
}) => {
  // معالجة الاتصال
  const handleContact = () => {
    if (onContact) {
      onContact();
      return;
    }

    if (seller.phone) {
      window.open(`tel:${seller.phone}`, '_self');
    }
  };

  // معالجة الرسائل
  const handleMessage = () => {
    if (onMessage) {
      onMessage();
      return;
    }

    // يمكن إضافة منطق إرسال الرسائل هنا
  };

  // تمت إزالة معالج النقر على رقم الهاتف بعد حذف قسم معلومات التواصل

  // معالجة عرض الملف الشخصي
  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile();
      return;
    }

    if (seller.id) {
      // ترميز الاسم للتعامل مع الأحرف العربية والمسافات في URL
      const sellerIdentifier = seller.name
        ? encodeURIComponent(quickDecodeName(seller.name))
        : seller.id;
      window.location.href = `/seller/${sellerIdentifier}`;
    }
  };

  // تنسيق التقييم
  const renderRating = (rating: number = 0, reviewsCount: number = 0) => {
    if (!rating || rating === 0) return null;

    const stars = [];
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
          ({rating.toFixed(1)}) {reviewsCount > 0 && `• ${reviewsCount} تقييم`}
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
      aria-label={`عرض ملف البائع ${quickDecodeName(seller.name)}`}
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
              isVerified={seller.verified || false}
              accountType={seller.accountType}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-gray-900">
                {quickDecodeName(seller.name)}
              </h3>
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
            ) : seller.id ? (
              <div className="mb-2">
                <RatingCard
                  userId={seller.id}
                  itemId={seller.id || ''}
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

              {seller.activeListings !== undefined && (
                <span>{seller.activeListings} إعلان نشط</span>
              )}
            </div>
          </div>
        </div>

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
              aria-label={`اتصال بالبائع ${quickDecodeName(seller.name)}`}
            >
              <PhoneIcon className="ml-2 h-4 w-4" />
              اتصال
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleMessage();
              }}
              className="seller-action-button flex-1"
              title="إرسال رسالة"
              aria-label={`إرسال رسالة إلى البائع ${quickDecodeName(seller.name)}`}
            >
              <ChatBubbleLeftRightIcon className="ml-2 h-4 w-4" />
              رسالة
            </Button>

            {seller.id && (
              <Link
                href={`/seller/${seller.name ? encodeURIComponent(quickDecodeName(seller.name)) : seller.id}`}
              >
                <Button
                  onClick={(e) => e.stopPropagation()}
                  variant="outline"
                  className="seller-action-button px-4"
                  title="عرض الملف الشخصي"
                  aria-label={`عرض ملف البائع ${quickDecodeName(seller.name)}`}
                >
                  عرض الملف
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default SellerInfoSimple;
