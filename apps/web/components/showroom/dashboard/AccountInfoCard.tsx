import React from 'react';
import Link from 'next/link';
import { quickDecodeName } from '../../../utils/universalNameDecoder';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import WalletIcon from '@heroicons/react/24/outline/WalletIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import UserAvatar from '../../UserAvatar';

interface UserData {
  id: string;
  name: string;
  phone?: string;
  verified: boolean;
  accountType: string;
  profileImage?: string;
  rating?: number;
  totalReviews?: number;
  memberSince?: string;
}

interface AccountInfoCardProps {
  user: UserData;
  onRefresh: () => void;
  refreshing?: boolean;
  className?: string;
}

const AccountInfoCard: React.FC<AccountInfoCardProps> = ({
  user,
  onRefresh,
  refreshing = false,
  className = '',
}) => {
  const formatMemberSince = (dateString?: string) => {
    if (!dateString) return 'غير محدد';

    const date = new Date(dateString);
    return date.toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getAccountTypeText = (accountType: string) => {
    switch (accountType) {
      case 'SHOWROOM':
        return 'معرض سيارات';
      case 'COMPANY':
        return 'شركة';
      case 'TRANSPORT_OWNER':
        return 'مالك نقل';
      default:
        return 'مستخدم عادي';
    }
  };

  return (
    <div
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg ${className}`}
    >
      {/* خلفية متدرجة */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* صورة المستخدم */}
            <div className="relative">
              <UserAvatar
                src={user.profileImage}
                alt="صورة الملف الشخصي"
                size="lg"
                accountType={user.accountType}
                className="ring-4 ring-white ring-opacity-20"
              />

              {/* علامة التحقق */}
              {user.verified && (
                <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1">
                  <CheckCircleIcon className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* معلومات المستخدم الأساسية */}
            <div className="text-white">
              <h2 className="mb-1 text-xl font-bold">{quickDecodeName(user.name)}</h2>
              <div className="mb-2 flex items-center gap-2">
                <BuildingStorefrontIcon className="h-4 w-4 text-blue-200" />
                <span className="text-sm text-blue-100">
                  {getAccountTypeText(user.accountType)}
                </span>
              </div>

              {/* التقييم */}
              {user.rating && user.rating > 0 && (
                <div className="flex items-center gap-1">
                  <StarSolid className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-white">{user.rating.toFixed(1)}</span>
                  {user.totalReviews && (
                    <span className="text-xs text-blue-200">({user.totalReviews} تقييم)</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* أزرار الإجراءات السريعة */}
          <div className="flex items-center gap-2">
            {/* زر تحديث الصفحة */}
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="rounded-lg bg-white bg-opacity-20 p-2 transition-colors hover:bg-opacity-30 disabled:opacity-50"
              title="تحديث الصفحة"
            >
              <ArrowPathIcon className={`h-5 w-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* زر المحفظة */}
            <Link
              href="/wallet"
              className="rounded-lg bg-white bg-opacity-20 p-2 transition-colors hover:bg-opacity-30"
              title="المحفظة"
            >
              <WalletIcon className="h-5 w-5 text-white" />
            </Link>

            {/* زر صفحة المعارض */}
            <Link
              href="/showrooms"
              className="rounded-lg bg-white bg-opacity-20 p-2 transition-colors hover:bg-opacity-30"
              title="صفحة المعارض"
            >
              <BuildingStorefrontIcon className="h-5 w-5 text-white" />
            </Link>
          </div>
        </div>
      </div>

      {/* المعلومات التفصيلية */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* رقم الهاتف */}
          {user.phone && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <PhoneIcon className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="mb-1 text-xs text-gray-500">رقم الهاتف</p>
                <p className="text-sm font-medium text-gray-900">{user.phone}</p>
              </div>
            </div>
          )}

          {/* تاريخ الانضمام */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <UserIcon className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500">عضو منذ</p>
              <p className="text-sm font-medium text-gray-900">
                {formatMemberSince(user.memberSince)}
              </p>
            </div>
          </div>

          {/* حالة التحقق */}
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                user.verified ? 'bg-green-100' : 'bg-yellow-100'
              }`}
            >
              <CheckCircleIcon
                className={`h-5 w-5 ${user.verified ? 'text-green-600' : 'text-yellow-600'}`}
              />
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500">حالة التحقق</p>
              <p
                className={`text-sm font-medium ${
                  user.verified ? 'text-green-600' : 'text-yellow-600'
                }`}
              >
                {user.verified ? 'محقق' : 'غير محقق'}
              </p>
            </div>
          </div>

          {/* رابط الإعدادات */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <CogIcon className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500">إعدادات الحساب</p>
              <Link
                href="/my-account"
                className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                تعديل الملف الشخصي
              </Link>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات الرئيسية */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/wallet"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700"
          >
            <WalletIcon className="h-5 w-5" />
            <span>المحفظة</span>
          </Link>

          <Link
            href="/showrooms"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            <BuildingStorefrontIcon className="h-5 w-5" />
            <span>صفحة المعارض</span>
          </Link>

          <Link
            href="/my-account"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <CogIcon className="h-5 w-5" />
            <span>الإعدادات</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountInfoCard;
