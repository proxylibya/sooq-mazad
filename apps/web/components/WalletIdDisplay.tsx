import { ClipboardDocumentIcon, CheckIcon, WalletIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { formatPublicId, copyPublicIdToClipboard } from '@/utils/advancedPublicIdHelpers';

interface WalletIdDisplayProps {
  publicId: number | null;
  balance?: number;
  currency?: string;
  variant?: 'card' | 'inline';
}

/**
 * مكون عرض رقم المحفظة - بدون فواصل
 * مثال: 340567891
 */
export default function WalletIdDisplay({ 
  publicId, 
  balance,
  currency = 'LYD',
  variant = 'card'
}: WalletIdDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!publicId) return;
    const success = await copyPublicIdToClipboard(publicId);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!publicId) {
    return (
      <div className="rounded-lg bg-gray-100 p-4 text-center">
        <p className="text-gray-500">المحفظة غير مفعلة</p>
      </div>
    );
  }

  // عرض مضمن بسيط
  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="font-mono text-lg font-bold text-gray-900">
          {formatPublicId(publicId)}
        </span>
        <button
          onClick={handleCopy}
          className="rounded p-1 hover:bg-gray-100"
          title="نسخ"
        >
          {copied ? (
            <CheckIcon className="h-4 w-4 text-green-600" />
          ) : (
            <ClipboardDocumentIcon className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>
    );
  }

  // عرض بطاقة كاملة
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white shadow-xl">
      {/* أيقونة خلفية */}
      <div className="absolute -right-4 -top-4 opacity-10">
        <WalletIcon className="h-32 w-32" />
      </div>

      {/* المحتوى */}
      <div className="relative z-10">
        {/* العنوان */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium opacity-90">محفظتك</p>
          <WalletIcon className="h-6 w-6 opacity-75" />
        </div>

        {/* رقم المحفظة */}
        <div className="mt-4">
          <p className="text-xs opacity-75">رقم المحفظة</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="font-mono text-3xl font-bold tracking-wider">
              {formatPublicId(publicId)}
            </span>
            <button
              onClick={handleCopy}
              className="rounded-lg bg-white/20 p-2 backdrop-blur-sm transition-all hover:bg-white/30 active:scale-95"
              title="نسخ الرقم"
            >
              {copied ? (
                <CheckIcon className="h-5 w-5" />
              ) : (
                <ClipboardDocumentIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* الرصيد */}
        {balance !== undefined && (
          <div className="mt-6 border-t border-white/20 pt-4">
            <p className="text-sm opacity-75">الرصيد المتاح</p>
            <p className="mt-1 text-2xl font-bold">
              {balance.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} {currency}
            </p>
          </div>
        )}

        {/* تلميح */}
        <p className="mt-4 text-xs opacity-75">
          شارك هذا الرقم مع الآخرين لاستقبال التحويلات
        </p>
      </div>
    </div>
  );
}
