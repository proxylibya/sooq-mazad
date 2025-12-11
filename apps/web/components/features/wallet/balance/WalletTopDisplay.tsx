import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import GlobeAltIcon from '@heroicons/react/24/outline/GlobeAltIcon';
import WalletIcon from '@heroicons/react/24/outline/WalletIcon';
import Link from 'next/link';
import React from 'react';
import { useAuth } from '../../../../hooks/useAuthProtection';
import { useMultiWalletBalance } from '../../../../hooks/useMultiWalletBalance';
import { formatNumber } from '../../../../utils/numberUtils';

interface WalletTopDisplayProps {
  className?: string;
}

const WalletTopDisplay: React.FC<WalletTopDisplayProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { walletData, isLoading } = useMultiWalletBalance(user?.id);

  // تنسيق الرصيد بنظام 00.00
  const formatBalanceDecimal = (amount: number, label: string): string => {
    // دائمًا منزلتين عشريتين
    const formatted = formatNumber(Number(amount).toFixed(2));
    return `${formatted} ${label}`;
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="wallet-label text-base font-medium text-gray-600">المحفظة :</span>
        <div className="flex items-center gap-1 rounded-md bg-gray-50 px-3 py-0.5 shadow-sm">
          <WalletIcon className="h-4 w-4 animate-pulse text-green-400" />
          
        </div>
        <div className="flex items-center gap-1 rounded-md bg-gray-50 px-3 py-0.5 shadow-sm">
          <CurrencyDollarIcon className="h-4 w-4 animate-pulse text-blue-400" />
          
        </div>
        <div className="flex items-center gap-1 rounded-md bg-gray-50 px-3 py-0.5 shadow-sm">
          <GlobeAltIcon className="h-4 w-4 animate-pulse text-purple-400" />
          
        </div>
      </div>
    );
  }

  return (
    <Link
      href="/wallet"
      className={`flex items-center gap-2 transition-opacity hover:opacity-80 ${className}`}
      title="انقر لفتح المحفظة"
    >
      <span className="wallet-label mr-1 text-sm font-medium text-gray-600">المحفظة :</span>

      {/* المحفظة المحلية - الدينار الليبي */}
      <div className="flex items-center gap-1 rounded-md bg-gray-50 px-3 py-0.5 shadow-sm">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white">
          <WalletIcon className="h-4 w-4 text-green-400" />
        </span>
        <span className="whitespace-nowrap text-base font-medium text-gray-700">
          {formatBalanceDecimal(walletData.local.balance, 'دينار')}
        </span>
      </div>

      {/* المحفظة العالمية - الدولار الأمريكي */}
      <div className="flex items-center gap-1 rounded-md bg-gray-50 px-3 py-0.5 shadow-sm">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white">
          <CurrencyDollarIcon className="h-4 w-4 text-blue-400" />
        </span>
        <span className="whitespace-nowrap text-base font-medium text-gray-700">
          {formatBalanceDecimal(walletData.global.balance, 'دولار')}
        </span>
      </div>

      {/* محفظة العملة الرقمية - USDT */}
      <div className="flex items-center gap-1 rounded-md bg-gray-50 px-3 py-0.5 shadow-sm">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white">
          <GlobeAltIcon className="h-4 w-4 text-purple-400" />
        </span>
        <span className="whitespace-nowrap text-base font-medium text-gray-700">
          {formatBalanceDecimal(walletData.crypto.balance, 'USDT')}
        </span>
      </div>
    </Link>
  );
};

export default WalletTopDisplay;
