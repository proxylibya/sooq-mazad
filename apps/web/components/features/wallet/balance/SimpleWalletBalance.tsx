import React from 'react';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';

interface SimpleWalletBalanceProps {
  balance: number;
  currency: string;
  isLoading?: boolean;
}

const SimpleWalletBalance: React.FC<SimpleWalletBalanceProps> = ({
  balance,
  currency,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="mb-4 h-6 rounded bg-gray-200"></div>
            <div className="mb-4 h-12 rounded bg-gray-200"></div>
            <div className="h-4 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-gray-700">رصيدك الحالي</h2>
        <div className="mb-4 text-4xl font-bold text-blue-600">
          {balance?.toLocaleString('ar-LY') || '0'} {currency || 'LYD'}
        </div>
        <p className="text-sm text-gray-500">آخر تحديث: {new Date().toLocaleString('ar-LY')}</p>
      </div>
    </div>
  );
};

export default SimpleWalletBalance;
