/**
 * Bidding Panel Component
 * مكون لوحة المزايدة
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CurrencyDollarIcon,
  PlusIcon,
  MinusIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { LoadingButton } from '../ui';
import { AuctionState } from '../../types/socket';
import { formatCurrency } from '../../utils/formatters';
import { MINIMUM_BID_AMOUNT, QUICK_BID_OPTIONS } from '../../config/auction-constants';

interface BiddingPanelProps {
  auction: AuctionState;
  minimumBid: number;
  isPlacingBid: boolean;
  isJoined: boolean;
  lastBidError: string | null;
  onBidSubmit: (amount: number) => Promise<void>;
  onClearError: () => void;
}

interface QuickBidOption {
  label: string;
  amount: number;
}

const BiddingPanel: React.FC<BiddingPanelProps> = ({
  auction,
  minimumBid,
  isPlacingBid,
  isJoined,
  lastBidError,
  onBidSubmit,
  onClearError,
}) => {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [selectedQuickBid, setSelectedQuickBid] = useState<number | null>(null);
  const [isCustomBid, setIsCustomBid] = useState(false);

  // Update bid amount when minimum bid changes
  useEffect(() => {
    if (!isCustomBid && minimumBid > 0) {
      setBidAmount(minimumBid.toString());
      setSelectedQuickBid(null);
    }
  }, [minimumBid, isCustomBid]);

  // Parse bid amount
  const parsedBidAmount = useMemo(() => {
    const amount = parseFloat(bidAmount);
    return isNaN(amount) ? 0 : amount;
  }, [bidAmount]);

  // Validation
  const validation = useMemo(() => {
    if (parsedBidAmount <= 0) {
      return { isValid: false, message: 'أدخل مبلغ صحيح' };
    }

    // التأكد من الحد الأدنى الثابت
    const actualMinimum = Math.max(minimumBid, MINIMUM_BID_AMOUNT);
    if (parsedBidAmount < actualMinimum) {
      return {
        isValid: false,
        message: `الحد الأدنى ${formatCurrency(actualMinimum)} (${MINIMUM_BID_AMOUNT} دينار ليبي كحد أدنى)`,
      };
    }

    if (parsedBidAmount > 10000000) {
      // 10 million limit
      return {
        isValid: false,
        message: 'المبلغ أكبر من الحد المسموح',
      };
    }

    return { isValid: true, message: '' };
  }, [parsedBidAmount, minimumBid]);

  // Quick bid handlers
  const handleQuickBid = useCallback(
    (option: QuickBidOption) => {
      const newAmount = auction.currentPrice + option.amount;
      setBidAmount(newAmount.toString());
      setSelectedQuickBid(option.amount);
      setIsCustomBid(false);
    },
    [auction.currentPrice],
  );

  const handleMinimumBid = useCallback(() => {
    setBidAmount(minimumBid.toString());
    setSelectedQuickBid(null);
    setIsCustomBid(false);
  }, [minimumBid]);

  const handleCustomBidChange = useCallback((value: string) => {
    setBidAmount(value);
    setSelectedQuickBid(null);
    setIsCustomBid(true);
  }, []);

  const handleIncrement = useCallback(
    (amount: number) => {
      const newAmount = Math.max(0, parsedBidAmount + amount);
      setBidAmount(newAmount.toString());
      setIsCustomBid(true);
      setSelectedQuickBid(null);
    },
    [parsedBidAmount],
  );

  // Submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validation.isValid || !isJoined || isPlacingBid) {
        return;
      }

      await onBidSubmit(parsedBidAmount);
    },
    [validation.isValid, isJoined, isPlacingBid, parsedBidAmount, onBidSubmit],
  );

  // Disable conditions
  const isDisabled = auction.status === 'ENDED' || !isJoined || isPlacingBid;

  return (
    <div className="rounded-lg border bg-white p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
        <h3 className="text-lg font-bold text-gray-900">تقديم عرض</h3>
      </div>

      {/* Current Price */}
      <div className="mb-6 rounded-lg bg-gray-50 p-4">
        <div className="text-center">
          <p className="mb-1 text-sm text-gray-600">السعر الحالي</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(auction.currentPrice)}</p>
          {auction.lastBidder && (
            <p className="mt-1 text-sm text-gray-500">آخر مزايد: {auction.lastBidder.name}</p>
          )}
        </div>
      </div>

      {/* Error Display */}
      {lastBidError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-start gap-2">
            <XCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{lastBidError}</p>
            </div>
            <button onClick={onClearError} className="text-red-500 hover:text-red-700">
              <XCircleIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {!isJoined && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
            <p className="text-sm text-yellow-800">يجب الانضمام للمزاد أولاً لتتمكن من المزايدة</p>
          </div>
        </div>
      )}

      {auction.status === 'ENDED' && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-gray-500" />
            <p className="text-sm text-gray-700">انتهى المزاد</p>
          </div>
        </div>
      )}

      {/* Quick Bid Buttons */}
      {!isDisabled && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-gray-700">عروض سريعة:</p>
          <div className="mb-2 grid grid-cols-2 gap-2">
            <button
              onClick={handleMinimumBid}
              disabled={isDisabled}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                selectedQuickBid === null && !isCustomBid
                  ? 'border-blue-300 bg-blue-100 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              } ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              الحد الأدنى
              <div className="text-xs text-gray-500">{formatCurrency(minimumBid)}</div>
            </button>

            {QUICK_BID_OPTIONS.map((option) => (
              <button
                key={option.amount}
                onClick={() => handleQuickBid(option)}
                disabled={isDisabled}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  selectedQuickBid === option.amount
                    ? 'border-blue-300 bg-blue-100 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                } ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                {option.label}
                <div className="text-xs text-gray-500">
                  {formatCurrency(auction.currentPrice + option.amount)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Bid Input */}
      {!isDisabled && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              أو أدخل مبلغ مخصص:
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center">
                <button
                  type="button"
                  onClick={() => handleIncrement(-100)}
                  disabled={isDisabled || parsedBidAmount <= 100}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
              </div>

              <input
                type="number"
                value={bidAmount}
                onChange={(e) => handleCustomBidChange(e.target.value)}
                disabled={isDisabled}
                placeholder="أدخل المبلغ"
                className={`w-full rounded-lg border px-12 py-3 text-center text-lg font-medium transition-colors ${
                  !validation.isValid && bidAmount
                    ? 'border-red-300 bg-red-50 text-red-900'
                    : 'border-gray-300 bg-white text-gray-900'
                } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''} focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
                min={minimumBid}
                step="1"
              />

              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  type="button"
                  onClick={() => handleIncrement(100)}
                  disabled={isDisabled}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Validation Message */}
            {!validation.isValid && bidAmount && (
              <p className="mt-1 text-sm text-red-600">{validation.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <LoadingButton
            type="submit"
            disabled={!validation.isValid || isDisabled}
            isLoading={isPlacingBid}
            loadingText="جاري تقديم العرض..."
            className={`w-full rounded-lg px-4 py-3 text-lg font-medium transition-all ${
              validation.isValid && !isDisabled
                ? 'transform bg-green-600 text-white shadow-lg hover:scale-105 hover:bg-green-700 hover:shadow-xl'
                : 'cursor-not-allowed bg-gray-300 text-gray-500'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BanknotesIcon className="h-5 w-5" />
              <span>تقديم عرض {formatCurrency(parsedBidAmount)}</span>
            </div>
          </LoadingButton>
        </form>
      )}

      {/* Info */}
      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
        <div className="flex items-start gap-2">
          <CurrencyDollarIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
          <div className="text-xs text-blue-700">
            <p className="mb-1 font-medium">معلومات مهمة:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>الحد الأدنى للمزايدة: {formatCurrency(MINIMUM_BID_AMOUNT)} (ثابت)</li>
              <li>العروض ملزمة ولا يمكن إلغاؤها</li>
              <li>تأكد من رصيد المحفظة قبل المزايدة</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiddingPanel;
