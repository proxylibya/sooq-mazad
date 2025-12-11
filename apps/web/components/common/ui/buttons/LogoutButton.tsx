import React, { useState } from 'react';
import SimpleSpinner from '../../../ui/SimpleSpinner';
import { useRouter } from 'next/router';
import ArrowRightOnRectangleIcon from '@heroicons/react/24/outline/ArrowRightOnRectangleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import { logoutUser, getCurrentUser } from '../../../../utils/authUtils';

interface LogoutButtonProps {
  className?: string;
  showText?: boolean;
  variant?: 'button' | 'link' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  confirmLogout?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  className = '',
  showText = true,
  variant = 'button',
  size = 'md',
  confirmLogout = true,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const currentUser = getCurrentUser();

  const handleLogout = async () => {
    if (confirmLogout && !showConfirmDialog) {
      setShowConfirmDialog(true);
      return;
    }

    setIsLoading(true);
    setShowConfirmDialog(false);

    try {
      await logoutUser();
      // سيتم إعادة التوجيه تلقائياً بواسطة logoutUser
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
      // حتى في حالة الخطأ، امسح الجلسة المحلية
      localStorage.clear();
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelLogout = () => {
    setShowConfirmDialog(false);
  };

  // إذا لم يكن المستخدم مسجل دخول، لا تعرض الزر
  if (!currentUser) {
    return null;
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'link':
        return 'text-red-600 hover:text-red-800 underline';
      case 'icon':
        return 'p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full';
      default:
        return 'bg-red-600 text-white hover:bg-red-700 rounded-md border border-transparent';
    }
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <>
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`inline-flex items-center justify-center ${getSizeClasses()} ${getVariantClasses()} ${isLoading ? 'cursor-not-allowed opacity-50' : 'hover:opacity-90'} transition-all duration-200 ${className} `}
        title="تسجيل الخروج"
      >
        {isLoading ? (
          <>
            <SimpleSpinner size={size === 'lg' ? 'md' : 'sm'} color={variant === 'button' ? 'white' : 'gray'} />
            {showText && <span className={variant === 'icon' ? 'sr-only' : 'sr-only'}>جاري تسجيل الخروج</span>}
          </>
        ) : (
          <>
            <ArrowRightOnRectangleIcon className={iconSize} />
            {showText && <span className={variant === 'icon' ? 'sr-only' : 'mr-2'}>تسجيل الخروج</span>}
          </>
        )}
      </button>

      {/* نافذة تأكيد تسجيل الخروج */}
      {showConfirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          dir="rtl"
        >
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center">
              <ExclamationTriangleIcon className="ml-3 h-6 w-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">تأكيد تسجيل الخروج</h3>
            </div>

            <p className="mb-6 text-gray-600">هل أنت متأكد من أنك تريد تسجيل الخروج من حسابك؟</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelLogout}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleLogout}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogoutButton;
