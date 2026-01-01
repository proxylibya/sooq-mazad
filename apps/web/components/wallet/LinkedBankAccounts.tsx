import React, { useState, useEffect } from 'react';
// // import { useSession } from 'next-auth/react'; // تم تعطيل نظام المصادقة مؤقتاً // تم تعطيل نظام المصادقة مؤقتاً
import Link from 'next/link';
import BanknotesIcon from '@heroicons/react/24/outline/BanknotesIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import BankCard from '../features/wallet/deposit/BankCard';

interface LinkedAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isVerified: boolean;
  linkedAt: string;
  bankLogo: string;
  bankColor: string;
  bankBgColor: string;
}

interface LinkedBankAccountsProps {
  onAccountSelect?: (account: LinkedAccount) => void;
  showLinkButton?: boolean;
}

const LinkedBankAccounts: React.FC<LinkedBankAccountsProps> = ({
  onAccountSelect,
  showLinkButton = true,
}) => {
  // const { data: session } = useSession(); // تم تعطيل نظام المصادقة مؤقتاً
  const session = null; // مؤقتاً
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchLinkedAccounts();
    }
  }, [session?.user?.id]);

  const fetchLinkedAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wallet/linked-accounts');
      const data = await response.json();

      if (data.success) {
        setLinkedAccounts(data.linkedAccounts);
      } else {
        setError(data.error || 'حدث خطأ في تحميل الحسابات');
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (account: LinkedAccount) => {
    if (onAccountSelect) {
      onAccountSelect(account);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحساب البنكي؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/wallet/linked-accounts/${accountId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLinkedAccounts((prev) => prev.filter((account) => account.id !== accountId));
      } else {
        alert('حدث خطأ في حذف الحساب');
      }
    } catch (error) {
      alert('حدث خطأ في الاتصال');
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3 text-red-600">
          <ExclamationTriangleIcon className="h-6 w-6" />
          <span className="font-medium">خطأ في التحميل</span>
        </div>
        <p className="mb-4 text-gray-600">{error}</p>
        <button
          onClick={fetchLinkedAccounts}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* عنوان القسم */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BanknotesIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">الحسابات البنكية المرتبطة</h3>
        </div>
        {showLinkButton && (
          <button
            onClick={() => (window.location.href = '/wallet/link-bank-account')}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
          >
            <PlusIcon className="h-4 w-4" />
            <span>ربط حساب بنكي</span>
          </button>
        )}
      </div>

      {/* قائمة الحسابات */}
      {linkedAccounts.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <BanknotesIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h4 className="mb-2 text-lg font-medium text-gray-900">لا توجد حسابات بنكية مرتبطة</h4>
          <p className="mb-6 text-gray-600">قم بربط حسابك البنكي لتتمكن من إيداع الأموال بسهولة</p>
          {showLinkButton && (
            <button
              onClick={() => (window.location.href = '/wallet/link-bank-account')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5" />
              <span>ربط حساب بنكي جديد</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {linkedAccounts.map((account) => (
            <div
              key={account.id}
              className={`cursor-pointer rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${account.bankBgColor}`}
              onClick={() => handleAccountSelect(account)}
            >
              {/* رأس البطاقة */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <BankCard
                    bankName={account.bankName}
                    bankInfo={{
                      color: account.bankColor,
                      bgColor: account.bankBgColor,
                      description: '',
                    }}
                    size="small"
                    asLink={false}
                  />
                  {account.isVerified && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
                </div>

                {/* أزرار الإدارة */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // يمكن إضافة منطق التعديل هنا
                    }}
                    className="p-1 text-gray-400 transition-colors hover:text-blue-600"
                    title="تعديل"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAccount(account.id);
                    }}
                    className="p-1 text-gray-400 transition-colors hover:text-red-600"
                    title="حذف"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* تفاصيل الحساب */}
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">رقم الحساب</p>
                  <p className="font-medium text-gray-900">{account.accountNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">صاحب الحساب</p>
                  <p className="font-medium text-gray-900">{account.accountHolderName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">تاريخ الربط</p>
                  <p className="text-sm text-gray-600">
                    {new Date(account.linkedAt).toLocaleDateString('ar-LY')}
                  </p>
                </div>
              </div>

              {/* حالة التحقق */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2">
                  {account.isVerified ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">حساب محقق</span>
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-600">في انتظار التحقق</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkedBankAccounts;
