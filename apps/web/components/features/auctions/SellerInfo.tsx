import { handlePhoneClickUnified } from '@/utils/phoneActions';
import { maskLibyanPhoneFirst7Xxx } from '@/utils/phoneUtils';
import {
  BuildingOfficeIcon,
  CheckBadgeIcon,
  PhoneIcon,
  StarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

interface SellerInfoProps {
  seller: {
    id: string;
    name: string;
    phone?: string;
    verified?: boolean;
    profileImage?: string;
    accountType?: string;
    rating?: number;
  };
  showroom?: {
    id: string;
    name: string;
    verified?: boolean;
    rating?: number;
  };
}

export default function SellerInfo({ seller, showroom }: SellerInfoProps) {
  if (!seller) return null;

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <h3 className="mb-4 text-xl font-bold text-gray-900">معلومات البائع</h3>

      <div className="flex items-start gap-4">
        {/* صورة البائع */}
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
          {seller.profileImage ? (
            <Image
              src={seller.profileImage}
              alt={seller.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <UserIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* معلومات البائع */}
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Link
              href={`/profile/${seller.id}`}
              className="text-lg font-bold text-gray-900 hover:text-blue-600"
            >
              {seller.name}
            </Link>
            {seller.verified && <CheckBadgeIcon className="h-5 w-5 text-blue-500" title="موثق" />}
          </div>

          {/* نوع الحساب */}
          {seller.accountType && seller.accountType !== 'REGULAR_USER' && (
            <div className="mb-2 flex items-center gap-1 text-sm text-gray-600">
              <BuildingOfficeIcon className="h-4 w-4" />
              <span>
                {seller.accountType === 'COMPANY' && 'شركة'}
                {seller.accountType === 'SHOWROOM' && 'معرض'}
                {seller.accountType === 'TRANSPORT_OWNER' && 'مالك نقل'}
              </span>
            </div>
          )}

          {/* التقييم */}
          {seller.rating && seller.rating > 0 && (
            <div className="mb-2 flex items-center gap-1">
              <StarIcon className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">{seller.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-600">/5</span>
            </div>
          )}

          {/* رقم الهاتف */}
          {seller.phone && (
            <a
              href={`tel:${seller.phone}`}
              onClick={(e) => {
                e.preventDefault();
                handlePhoneClickUnified({ phone: seller.phone as string });
              }}
              className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-green-700 transition-colors hover:bg-green-100"
            >
              <PhoneIcon className="h-5 w-5" />
              <span className="font-medium" dir="ltr">
                {maskLibyanPhoneFirst7Xxx(seller.phone)}
              </span>
            </a>
          )}
        </div>
      </div>

      {/* معلومات المعرض */}
      {showroom && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="mb-2 text-sm font-medium text-gray-600">المعرض</p>
          <Link
            href={`/showrooms/${showroom.id}`}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <BuildingOfficeIcon className="h-5 w-5" />
            <span className="font-semibold">{showroom.name}</span>
            {showroom.verified && <CheckBadgeIcon className="h-5 w-5" />}
          </Link>
          {showroom.rating && showroom.rating > 0 && (
            <div className="mt-2 flex items-center gap-1">
              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-gray-900">
                {showroom.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
